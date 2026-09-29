<?php

namespace Database\Migrations;

use Database\Migration;

class CreateRegionsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS regions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                short_name VARCHAR(50) NOT NULL,
                code VARCHAR(10) NOT NULL,
                capital VARCHAR(100) NOT NULL,
                description TEXT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_regions_slug (slug),
                UNIQUE KEY uq_regions_code (code),
                INDEX idx_regions_name (name),
                INDEX idx_regions_active (is_active),
                INDEX idx_regions_sort (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS regions");
    }
}
