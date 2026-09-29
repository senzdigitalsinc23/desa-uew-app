<?php

namespace Database\Migrations;

use Database\Migration;

class CreateNearbyRestaurantsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS nearby_restaurants (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(200) NOT NULL,
                address VARCHAR(300) NULL,
                distance VARCHAR(50) NULL,
                specialty TEXT NULL,
                open_hours VARCHAR(100) NULL,
                phone VARCHAR(30) NULL,
                cuisine_type VARCHAR(100) NULL,
                price_range VARCHAR(50) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_restaurants_slug (slug),
                INDEX idx_restaurants_name (name),
                INDEX idx_restaurants_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS nearby_restaurants");
    }
}
