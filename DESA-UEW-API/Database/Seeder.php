<?php

namespace Database;

use PDO;

abstract class Seeder
{
    protected PDO|\App\Core\Database $db;

    public function __construct(PDO|\App\Core\Database $db)
    {
        $this->db = $db;
    }

    abstract public function run(): void;

    /**
     * Executes an SQL query, optionally with parameters for prepared statements.
     */
    public function execute(string $sql, array $params = []): void
    {
        if (empty($params)) {
            $this->db->exec($sql);
        } else {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
    }

    /**
     * Fetch a single row as an associative array.
     */
    public function fetchSingle(string $sql, array $params = []): ?array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Insert a row and return the last insert ID.
     */
    public function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');
        $sql = "INSERT INTO `{$table}` (" . implode(', ', array_map(fn($c) => "`{$c}`", $columns))
             . ") VALUES (" . implode(', ', $placeholders) . ")";
        $this->db->prepare($sql)->execute(array_values($data));
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update rows and return affected count.
     */
    public function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $sets = array_map(fn($k) => "`{$k}` = ?", array_keys($data));
        $sql = "UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE {$where}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_merge(array_values($data), $whereParams));
        return $stmt->rowCount();
    }

    /**
     * Delete rows and return affected count.
     */
    public function delete(string $table, string $where, array $params = []): int
    {
        $stmt = $this->db->prepare("DELETE FROM `{$table}` WHERE {$where}");
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}
