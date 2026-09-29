<?php

namespace Database\Migrations;

use Database\Migration;

class CreateMediaFilesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS media_files (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                path VARCHAR(500) NOT NULL,
                url VARCHAR(1000) NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                extension VARCHAR(20) NOT NULL,
                size BIGINT NOT NULL DEFAULT 0,
                disk VARCHAR(50) NOT NULL DEFAULT 'local',
                category VARCHAR(50) NOT NULL DEFAULT 'general',
                description TEXT NULL,
                uploaded_by INT UNSIGNED NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_media_category (category),
                INDEX idx_media_disk (disk),
                INDEX idx_media_active (is_active),
                INDEX idx_media_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS media_files");
    }
}
