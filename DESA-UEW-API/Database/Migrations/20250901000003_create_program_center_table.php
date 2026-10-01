<?php

namespace Database\Migrations;

use Database\Migration;

class CreateProgramCenterTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS program_center (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                program_id INT UNSIGNED NOT NULL,
                center_id INT UNSIGNED NOT NULL,
                cohort_start_year INT NULL,
                cohort_end_year INT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_program_center (program_id, center_id),
                INDEX idx_pc_program (program_id),
                INDEX idx_pc_center (center_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE program_center
            ADD CONSTRAINT fk_pc_program
            FOREIGN KEY (program_id) REFERENCES academic_programs(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT fk_pc_center
            FOREIGN KEY (center_id) REFERENCES study_centers(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS program_center; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
