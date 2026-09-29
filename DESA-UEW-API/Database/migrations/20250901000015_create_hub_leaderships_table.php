<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubLeadershipsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_leaderships (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                role VARCHAR(100) NOT NULL,
                name VARCHAR(200) NOT NULL,
                term_start YEAR NOT NULL,
                term_end YEAR NULL,
                photo_url VARCHAR(500) NULL,
                bio TEXT NULL,
                email VARCHAR(255) NULL,
                phone VARCHAR(30) NULL,
                is_current TINYINT(1) NOT NULL DEFAULT 1,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_leaderships_role (role),
                INDEX idx_leaderships_current (is_current),
                INDEX idx_leaderships_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_leaderships");
    }
}
