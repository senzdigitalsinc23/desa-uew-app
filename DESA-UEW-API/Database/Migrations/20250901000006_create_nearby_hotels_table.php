<?php

namespace Database\Migrations;

use Database\Migration;

class CreateNearbyHotelsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS nearby_hotels (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(200) NOT NULL,
                address VARCHAR(300) NULL,
                distance VARCHAR(50) NULL,
                rate_range VARCHAR(100) NULL,
                phone VARCHAR(30) NULL,
                rating DECIMAL(2, 1) NULL,
                amenities TEXT NULL,
                website VARCHAR(255) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_nearby_hotels_slug (slug),
                INDEX idx_nearby_hotels_name (name),
                INDEX idx_nearby_hotels_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS nearby_hotels");
    }
}
