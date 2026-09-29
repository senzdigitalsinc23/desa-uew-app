<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubGalleryImagesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_gallery_images (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NULL,
                description TEXT NULL,
                url VARCHAR(500) NOT NULL,
                thumbnail_url VARCHAR(500) NULL,
                event_name VARCHAR(200) NULL,
                event_date DATE NULL,
                photographer VARCHAR(150) NULL,
                tags VARCHAR(500) NULL,
                sort_order INT NOT NULL DEFAULT 0,
                is_featured TINYINT(1) NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                view_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_gallery_event (event_name),
                INDEX idx_gallery_featured (is_featured),
                INDEX idx_gallery_active (is_active),
                INDEX idx_gallery_sort (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_gallery_images");
    }
}
