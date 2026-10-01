<?php

namespace Database\Migrations;

use Database\Migration;

class CreateAcademicsTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS academics (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(200) NOT NULL,
                title VARCHAR(255) NOT NULL,
                category ENUM('peer_ppt', 'academic_vault', 'study_material', 'past_questions', 'lecture_notes', 'syllabus', 'reading_list') NOT NULL,
                program_id INT UNSIGNED NULL,
                level INT NULL,
                course_code VARCHAR(20) NULL,
                course_title VARCHAR(255) NULL,
                description TEXT NULL,
                file_url VARCHAR(500) NOT NULL,
                file_type VARCHAR(20) NOT NULL DEFAULT 'PDF',
                file_size VARCHAR(50) NULL,
                author VARCHAR(200) NULL,
                academic_year VARCHAR(20) NULL,
                semester ENUM('1', '2', 'both') NULL,
                uploaded_by INT UNSIGNED NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                public TINYINT(1) NOT NULL DEFAULT 1,
                download_count INT UNSIGNED NOT NULL DEFAULT 0,
                view_count INT UNSIGNED NOT NULL DEFAULT 0,
                tags VARCHAR(500) NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_academics_slug (slug),
                INDEX idx_academics_category (category),
                INDEX idx_academics_program (program_id),
                INDEX idx_academics_level (level),
                INDEX idx_academics_public (public),
                INDEX idx_academics_active (is_active),
                FULLTEXT INDEX ft_academics_search (title, description, course_code, course_title, tags, slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        $this->execute("DROP TABLE IF EXISTS academics");
    }
}
