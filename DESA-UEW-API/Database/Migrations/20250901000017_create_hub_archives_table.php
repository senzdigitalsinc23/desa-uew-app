<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubArchivesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_archives (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                year VARCHAR(20) NOT NULL,
                doc_type VARCHAR(50) NOT NULL DEFAULT 'PDF',
                file_url VARCHAR(500) NOT NULL,
                file_size VARCHAR(50) NULL,
                description TEXT NULL,
                uploaded_by INT UNSIGNED NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                download_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_archives_year (year),
                INDEX idx_archives_type (doc_type),
                INDEX idx_archives_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_archives");
    }
}
