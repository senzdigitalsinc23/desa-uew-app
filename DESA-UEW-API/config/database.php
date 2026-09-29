<?php

/**
 * Multi-Database Configuration
 *
 * Supports: mysql, pgsql, sqlite, sqlsrv
 *
 * Usage in .env:
 *   DB_DRIVER=mysql|pgsql|sqlite|sqlsrv
 *   DB_HOST=127.0.0.1
 *   DB_NAME=your_database
 *   DB_USER=username
 *   DB_PASS=password
 *   DB_CHARSET=utf8mb4        (MySQL/PostgreSQL)
 *
 * SQLite special:
 *   DB_DRIVER=sqlite
 *   DB_NAME=database.sqlite   (file path, relative to storage/)
 *
 * PostgreSQL special:
 *   DB_DRIVER=pgsql
 *   DB_PORT=5432              (optional, defaults to 5432)
 *
 * SQL Server special:
 *   DB_DRIVER=sqlsrv
 *   DB_HOST=localhost\SQLEXPRESS  (include instance name if applicable)
 */

$driver = env('DB_DRIVER', 'mysql');

// Common configuration
$credentials = [
    'driver' => $driver,
    'host'   => env('DB_HOST', '127.0.0.1'),
    'dbname' => env('DB_NAME', 'app_db'),
    'username' => env('DB_USER', 'root'),
    'password' => env('DB_PASS', ''),
];

// Driver-specific settings
switch ($driver) {
    case 'mysql':
    case 'mysqli':
        $credentials['charset'] = env('DB_CHARSET', 'utf8mb4');
        break;

    case 'pgsql':
    case 'postgresql':
        $credentials['port'] = (int) (env('DB_PORT', 5432));
        $credentials['charset'] = 'utf8';
        break;

    case 'sqlite':
        // SQLite ignores host/port, dbname is the file path
        unset($credentials['host']);
        unset($credentials['port']);
        if (!str_contains($credentials['dbname'], '/')) {
            $credentials['dbname'] = __DIR__ . '/../storage/' . $credentials['dbname'];
        }
        break;

    case 'sqlsrv':
    case 'mssql':
        $credentials['charset'] = env('DB_CHARSET', 'utf8');
        // SQL Server may use Windows auth
        if (empty($credentials['username']) && empty($credentials['password'])) {
            $credentials['trusted_connection'] = 'Yes';
        }
        break;

    default:
        throw new \InvalidArgumentException("Unsupported DB_DRIVER: {$driver}. Use mysql, pgsql, sqlite, or sqlsrv.");
}

return $credentials;
