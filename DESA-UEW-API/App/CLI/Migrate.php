<?php
declare(strict_types=1);

namespace App\CLI;

use App\Core\Container;
use Database\Migrator;

class Migrate extends Command
{
    public string $name = 'migrate';
    public string $description = 'Run pending database migrations';

    public function handle(array $args): void
    {
        // Load env BEFORE config so env() helper resolves correctly.
        $projectRoot = getcwd();
        $envFile = $projectRoot . '/.env';
        // Directly parse the project's .env to override any values already set
        // by the framework's safeLoad() (immutable Dotenv won't re-override).
        if (file_exists($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
                [$key, $value] = explode('=', $line, 2);
                $key   = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                if ($key) {
                    $_ENV[$key] = $value;
                    putenv("{$key}={$value}");
                }
            }
        }

        \App\Core\ConfigCache::setBasePath($projectRoot);
        \App\Core\Config::load($projectRoot . '/config');

        // Pass config values directly to avoid container resolution issues.
        $driver = \App\Core\Config::get('database.driver', 'mysql');
        $host   = \App\Core\Config::get('database.host', '127.0.0.1');
        $dbname = \App\Core\Config::get('database.dbname', '');
        $user   = \App\Core\Config::get('database.username', 'root');
        $pass   = \App\Core\Config::get('database.password', '');

        if (empty($dbname)) {
            $this->error('DB_NAME not set in .env or config/database.php. Aborting.');
            exit(1);
        }

        // Build DSN and create PDO directly (avoids container resolution of 'dsn')
        switch ($driver) {
            case 'mysql':
            case 'mysqli':
                $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
                break;
            case 'pgsql':
                $dsn = "pgsql:host={$host};dbname={$dbname}";
                break;
            case 'sqlite':
                $dsn = "sqlite:{$dbname}";
                break;
            case 'sqlsrv':
                $dsn = "sqlsrv:Server={$host};Database={$dbname}";
                break;
            default:
                $this->error("Unsupported driver: {$driver}");
                return;
        }

        try {
            $db = new \PDO($dsn, $user, $pass, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
        } catch (\PDOException $e) {
            $this->error("Database connection failed: " . $e->getMessage());
            $this->info("Run 'build:init --db' first to create the database.");
            return;
        }

        $migrationsPath = $projectRoot . '/Database/Migrations';

        $migrator = new Migrator($db, $migrationsPath);

        $action = $args[0] ?? 'migrate';

        if ($action === 'migrate') {
            $this->info("Starting migrations...");
            $migrator->migrate();
            $this->success("Migrations completed.");
        } elseif ($action === 'rollback') {
            $this->info("Starting rollback...");
            $migrator->rollback();
            $this->success("Rollback completed.");
        } else {
            $this->error("Unknown action: {$action}. Use 'migrate' or 'rollback'.");
        }
    }
}
