<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubCommitteesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_committees (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(200) NOT NULL,
                description TEXT NULL,
                chair_name VARCHAR(200) NULL,
                chair_email VARCHAR(255) NULL,
                chair_phone VARCHAR(30) NULL,
                member_count INT NOT NULL DEFAULT 0,
                formed_year YEAR NULL,
                dissolved_year YEAR NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_committees_slug (slug),
                INDEX idx_committees_name (name),
                INDEX idx_committees_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_committees");
    }
}
