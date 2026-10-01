<?php

namespace Database\Migrations;

use Database\Migration;

class CreateDesaMembersTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS desa_members (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                student_no VARCHAR(50) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                 full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                region_id INT UNSIGNED NULL,
                center_id INT UNSIGNED NULL,
                program_id INT UNSIGNED NULL,
                level INT NULL,
                academic_year VARCHAR(20) NULL,
                gender ENUM('male', 'female', 'other') NULL,
                status ENUM('active', 'inactive', 'graduated', 'suspended') NOT NULL DEFAULT 'active',
                membership_year YEAR NOT NULL,
                is_executive TINYINT(1) NOT NULL DEFAULT 0,
                executive_role VARCHAR(100) NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_desa_members_student_no (student_no),
                UNIQUE KEY uq_desa_members_email (email),
                INDEX idx_members_name (first_name, last_name),
                INDEX idx_members_region (region_id),
                INDEX idx_members_center (center_id),
                INDEX idx_members_status (status),
                INDEX idx_members_program (program_id),
                INDEX idx_members_active (status, membership_year)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS desa_members");
    }
}
