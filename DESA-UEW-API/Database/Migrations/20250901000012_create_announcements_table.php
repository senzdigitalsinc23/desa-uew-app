<?php

namespace Database\Migrations;

use Database\Migration;

class CreateAnnouncementsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS announcements (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(200) NOT NULL,
                title VARCHAR(255) NOT NULL,
                excerpt TEXT NULL,
                body LONGTEXT NULL,
                type ENUM('announcement', 'notice', 'urgent', 'policy') NOT NULL DEFAULT 'announcement',
                thumbnail VARCHAR(500) NULL,
                published_at TIMESTAMP NULL DEFAULT NULL,
                expires_at TIMESTAMP NULL DEFAULT NULL,
                created_by INT UNSIGNED NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                view_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_announcements_slug (slug),
                INDEX idx_announcements_type (type),
                INDEX idx_announcements_active (is_active),
                INDEX idx_announcements_published (published_at),
                INDEX idx_announcements_public (public),
                FULLTEXT INDEX ft_announcements_search (title, excerpt, body, slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS announcements");
    }
}
