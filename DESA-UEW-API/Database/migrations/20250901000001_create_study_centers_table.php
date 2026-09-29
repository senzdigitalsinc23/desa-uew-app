<?php

namespace Database\Migrations;

use Database\Migration;

class CreateStudyCentersTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS study_centers (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                region_id INT UNSIGNED NOT NULL,
                slug VARCHAR(100) NOT NULL,
                name VARCHAR(200) NOT NULL,
                premises TEXT NOT NULL,
                city VARCHAR(150) NOT NULL,
                landmark VARCHAR(255) NULL,
                schedule TEXT NULL,
                address TEXT NULL,
                postal_address VARCHAR(255) NULL,
                latitude DECIMAL(10, 8) NULL,
                longitude DECIMAL(11, 8) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_study_centers_slug (slug),
                INDEX idx_study_centers_region (region_id),
                INDEX idx_study_centers_name (name),
                INDEX idx_study_centers_active (is_active),
                FULLTEXT INDEX ft_study_centers_search (name, premises, city, landmark, slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE study_centers
            ADD CONSTRAINT fk_study_centers_region
            FOREIGN KEY (region_id) REFERENCES regions(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS study_centers; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
