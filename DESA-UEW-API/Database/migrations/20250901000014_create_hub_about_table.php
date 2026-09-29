<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubAboutTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_about (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255) NULL,
                content LONGTEXT NULL,
                mission TEXT NULL,
                vision TEXT NULL,
                 `values` TEXT NULL,
                established_year INT NULL,
                logo_url VARCHAR(500) NULL,
                hero_image_url VARCHAR(500) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_hub_about_id (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_about");
    }
}
