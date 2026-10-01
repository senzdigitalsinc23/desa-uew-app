<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubAssetsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_assets (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(200) NOT NULL,
                description TEXT NULL,
                quantity INT NOT NULL DEFAULT 1,
                unit VARCHAR(50) NULL,
                date_acquired DATE NULL,
                supplier VARCHAR(200) NULL,
                cost DECIMAL(12, 2) NULL,
                currency VARCHAR(10) NULL DEFAULT 'GHS',
                 `condition` ENUM('new', 'good', 'fair', 'poor', 'damaged') NOT NULL DEFAULT 'good',
                serial_number VARCHAR(100) NULL,
                assigned_to VARCHAR(200) NULL,
                location VARCHAR(255) NULL,
                notes TEXT NULL,
                photo_url VARCHAR(500) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_assets_name (item_name),
                 INDEX idx_assets_condition (`condition`),
                INDEX idx_assets_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS hub_assets");
    }
}
