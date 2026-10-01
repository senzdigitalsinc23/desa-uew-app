<?php

namespace Database\Migrations;

use Database\Migration;

class CreateCoordinatorsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS coordinators (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                title VARCHAR(100) NULL,
                phone VARCHAR(30) NOT NULL,
                email VARCHAR(255) NOT NULL,
                office VARCHAR(255) NULL,
                office_hours TEXT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_coordinators_email (email),
                INDEX idx_coordinators_name (first_name, last_name),
                INDEX idx_coordinators_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS coordinators");
    }
}
