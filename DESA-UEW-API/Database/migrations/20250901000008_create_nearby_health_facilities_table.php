<?php

namespace Database\Migrations;

use Database\Migration;

class CreateNearbyHealthFacilitiesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS nearby_health_facilities (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(200) NOT NULL,
                type VARCHAR(100) NOT NULL,
                address VARCHAR(300) NULL,
                distance VARCHAR(50) NULL,
                phone VARCHAR(30) NULL,
                hours VARCHAR(100) NULL,
                services TEXT NULL,
                is_24_7 TINYINT(1) NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_health_facilities_slug (slug),
                INDEX idx_health_facilities_name (name),
                INDEX idx_health_facilities_type (type),
                INDEX idx_health_facilities_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS nearby_health_facilities");
    }
}
