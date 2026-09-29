<?php
namespace Database;

use App\Core\Database;
use PDO;

class Migrator
{
    protected PDO $db;
    protected string $migrationsTable = 'migrations';
    protected string $migrationsPath;

    public function __construct(PDO $db, string $migrationsPath)
    {
        $this->db = $db;
        $this->migrationsPath = $migrationsPath;
        $this->createMigrationsTable();
    }

    protected function createMigrationsTable(): void
    {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS {$this->migrationsTable} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration VARCHAR(255) NOT NULL,
                batch INT NOT NULL,
                migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=INNODB;
        ");
    }

    public function getAppliedMigrations(): array
    {
        $stmt = $this->db->query("SELECT migration FROM {$this->migrationsTable}");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function migrate(): void
    {
        $applied = $this->getAppliedMigrations();
        $files = scandir($this->migrationsPath);        

        $newMigrations = array_filter($files, function($file) use ($applied) {
            return str_ends_with($file, '.php') && !in_array($file, $applied);
        });

        if (empty($newMigrations)) {
            echo "Nothing to migrate.\n";
            return;
        }

        $batch = $this->getCurrentBatch() + 1;

        foreach ($newMigrations as $file) {
            require_once $this->migrationsPath . DIRECTORY_SEPARATOR . $file;

            $className = $this->getClassNameFromFile($file);
            $fullClassName = 'Database\\Migrations\\' . $className;
            if (!class_exists($fullClassName)) {
                echo "Migration class {$fullClassName} not found in {$file}\n";
                continue;
            }

            /** @var Migration $migration */
            $migration = new $fullClassName($this->db);

            echo "Migrating: {$file} ...";
            $migration->up();
            $this->saveMigration($file, $batch);
            echo "Done.\n";
        }
    }

    protected function saveMigration(string $migration, int $batch): void
    {
        $stmt = $this->db->prepare("INSERT INTO {$this->migrationsTable} (migration, batch) VALUES (:migration, :batch)");
        $stmt->execute(['migration' => $migration, 'batch' => $batch]);
    }

    protected function getCurrentBatch(): int
    {
        $stmt = $this->db->query("SELECT MAX(batch) as max_batch FROM {$this->migrationsTable}");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['max_batch'];
    }

    protected function getClassNameFromFile(string $file): string
    {
        // Remove extension
        $name = pathinfo($file, PATHINFO_FILENAME);

        // Example: 20250811120000_create_users_table => CreateUsersTable
        if (preg_match('/^\d+_(.+)$/', $name, $matches)) {
            $classPart = $matches[1];
            $classPart = str_replace('_', ' ', $classPart);
            $classPart = ucwords($classPart);
            $classPart = str_replace(' ', '', $classPart);
            return $classPart;
        }

        // fallback, sanitize name
        return str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $name)));
    }


    public function rollback(): void
    {
        $batch = $this->getCurrentBatch();
        if ($batch === 0) {
            echo "Nothing to rollback.\n";
            return;
        }

        $stmt = $this->db->prepare("SELECT migration FROM {$this->migrationsTable} WHERE batch = :batch ORDER BY id DESC");
        $stmt->execute(['batch' => $batch]);
        $migrations = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($migrations as $migrationFile) {
            require_once $this->migrationsPath . DIRECTORY_SEPARATOR . $migrationFile;

            $className = $this->getClassNameFromFile($migrationFile);
            $fullClassName = 'Database\\Migrations\\' . $className;
            if (!class_exists($fullClassName)) {
                echo "Migration class {$fullClassName} not found in {$migrationFile}\n";
                continue;
            }

            /** @var Migration $migration */
            $migration = new $fullClassName();

            echo "Rolling back: {$migrationFile} ... ";
            $migration->down();
            $this->deleteMigration($migrationFile);
            echo "Done.\n";
        }
    }

    protected function deleteMigration(string $migration): void
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->migrationsTable} WHERE migration = :migration");
        $stmt->execute(['migration' => $migration]);
    }
}
