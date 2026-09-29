<?php

namespace Database\Migrations;

use Database\Migration;

class CreateAcademicProgramsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS academic_programs (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(100) NOT NULL,
                code VARCHAR(20) NOT NULL,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(200) NOT NULL,
                faculty VARCHAR(200) NULL,
                level_start INT NOT NULL DEFAULT 100,
                level_end INT NOT NULL DEFAULT 400,
                duration_years INT NOT NULL DEFAULT 4,
                mode ENUM('weekend', 'evening', 'full_time', 'part_time') NOT NULL DEFAULT 'weekend',
                description TEXT NULL,
                fee_range VARCHAR(100) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_academic_programs_slug (slug),
                UNIQUE KEY uq_academic_programs_code (code),
                INDEX idx_academic_programs_department (department),
                INDEX idx_academic_programs_active (is_active),
                FULLTEXT INDEX ft_academic_programs_search (title, department, slug, code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS academic_programs");
    }
}
