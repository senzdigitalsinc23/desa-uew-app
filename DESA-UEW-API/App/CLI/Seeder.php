<?php
declare(strict_types=1);

namespace App\CLI;

use App\Services\Database\SeederRunner;

class Seeder extends Command
{
    public string $name = 'db:seed';
    public string $description = 'Seed the database with sample data';

    public function handle(array $args): void
    {
        // Load env before config so env() helper resolves correctly
        $projectRoot = getcwd();
        $envFile = $projectRoot . '/.env';
        // Directly parse .env to override framework's immutable Dotenv values
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

        $driver  = \App\Core\Config::get('database.driver', 'mysql');
        $host    = \App\Core\Config::get('database.host', '127.0.0.1');
        $dbname  = \App\Core\Config::get('database.dbname', '');
        $user    = \App\Core\Config::get('database.username', 'root');
        $pass    = \App\Core\Config::get('database.password', '');
        $charset = \App\Core\Config::get('database.charset', 'utf8mb4');

        if (empty($dbname)) {
            $this->error('DB_NAME not set in .env or config/database.php. Aborting.');
            exit(1);
        }

        switch ($driver) {
            case 'mysql':
            case 'mysqli':
                $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
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
            $pdo = new \PDO($dsn, $user, $pass, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
            // Wrap in App\Core\Database so seeders can use fetchSingle/insert/update/delete
            $logger = new \App\Core\Logger($projectRoot . '/storage/logs/db.log');
            $db = new \App\Core\Database(['driver' => $driver, 'host' => $host, 'dbname' => $dbname, 'username' => $user, 'password' => $pass, 'charset' => $charset], $logger);
        } catch (\PDOException $e) {
            $this->error("Database connection failed: " . $e->getMessage());
            return;
        }

        $seedersPath = $projectRoot . '/Database/Seeders';

        $seederClass = $args[0] ?? null;

        // Load the requested seeder file directly (bypasses framework autoloader
        // which may not know about project-specific seeders).
        if ($seederClass) {
            $seederFile = $seedersPath . '/' . basename(str_replace('\\', '/', $seederClass)) . '.php';
            if (is_file($seederFile)) {
                require_once $seederFile;
            }
        }

        try {
            $this->info("Running database seeders...");

            if ($seederClass) {
                // Prepend namespace if not already fully qualified
                if (!str_contains($seederClass, '\\')) {
                    $seederClass = 'Database\\Seeders\\' . $seederClass;
                }
                // Use class_exists with autoload disabled — we already require'd the file above.
                if (!class_exists($seederClass, false)) {
                    throw new \Exception("Seeder class {$seederClass} not found in {$seedersPath}");
                }
                $seeder = new $seederClass($db);
                if (!method_exists($seeder, 'run')) {
                    throw new \Exception("Seeder {$seederClass} has no run() method.");
                }
                $seeder->run();
            } else {
                // Auto-discover and run all seeders
                $files = glob($seedersPath . '/*.php');
                if (empty($files)) {
                    echo "No seeders found.\n";
                } else {
                    sort($files);
                    foreach ($files as $file) {
                        require_once $file;
                        $className = basename($file, '.php');
                        $fullClass = 'Database\\Seeders\\' . $className;
                        if (class_exists($fullClass, false) && is_subclass_of($fullClass, \Database\Seeder::class)) {
                            $seeder = new $fullClass($db);
                            $seeder->run();
                        }
                    }
                }
            }

            $this->success("Database seeding completed successfully.");
        } catch (\Throwable $e) {
            $this->error("Seeding failed: " . $e->getMessage());
        }
    }
}
