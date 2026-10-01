<?php

namespace Database\Migrations;

use Database\Migration;

class CreateEventsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS events (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(200) NOT NULL,
                title VARCHAR(255) NOT NULL,
                excerpt TEXT NULL,
                body LONGTEXT NULL,
                type ENUM('event', 'conference', 'gala', 'meeting', 'deadline', 'social') NOT NULL DEFAULT 'event',
                start_date DATE NOT NULL,
                end_date DATE NULL,
                start_time TIME NULL,
                end_time TIME NULL,
                venue VARCHAR(255) NULL,
                location TEXT NULL,
                thumbnail VARCHAR(500) NULL,
                capacity INT NULL,
                registration_link VARCHAR(500) NULL,
                organizer VARCHAR(200) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                view_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_by INT UNSIGNED NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_events_slug (slug),
                INDEX idx_events_type (type),
                INDEX idx_events_start_date (start_date),
                INDEX idx_events_active (is_active),
                INDEX idx_events_public (public),
                FULLTEXT INDEX ft_events_search (title, excerpt, body, venue, slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS events");
    }
}
