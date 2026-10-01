<?php

namespace Database\Migrations;

use Database\Migration;

class CreateOpportunitiesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS opportunities (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(200) NOT NULL,
                title VARCHAR(255) NOT NULL,
                category ENUM('opportunity_radar', 'internship', 'digital_board', 'supervisor_connection', 'welfare', 'alumni') NOT NULL,
                organization VARCHAR(200) NULL,
                location VARCHAR(200) NULL,
                stipend VARCHAR(100) NULL,
                deadline DATE NULL,
                description TEXT NULL,
                requirements TEXT NULL,
                application_link VARCHAR(500) NULL,
                contact_email VARCHAR(255) NULL,
                contact_phone VARCHAR(30) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                featured TINYINT(1) NOT NULL DEFAULT 0,
                view_count INT UNSIGNED NOT NULL DEFAULT 0,
                created_by INT UNSIGNED NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_opportunities_slug (slug),
                INDEX idx_opportunities_category (category),
                INDEX idx_opportunities_deadline (deadline),
                INDEX idx_opportunities_featured (featured),
                INDEX idx_opportunities_public (public),
                INDEX idx_opportunities_active (is_active),
                FULLTEXT INDEX ft_opportunities_search (title, description, organization, slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS opportunities");
    }
}
