<?php

namespace Database\Migrations;

use Database\Migration;

class CreateCoordinatorCenterTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS coordinator_center (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                coordinator_id INT UNSIGNED NOT NULL,
                center_id INT UNSIGNED NOT NULL,
                is_primary TINYINT(1) NOT NULL DEFAULT 0,
                assigned_from DATE NULL,
                assigned_to DATE NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_coordinator_center (coordinator_id, center_id),
                INDEX idx_cc_coordinator (coordinator_id),
                INDEX idx_cc_center (center_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE coordinator_center
            ADD CONSTRAINT fk_cc_coordinator
            FOREIGN KEY (coordinator_id) REFERENCES coordinators(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT fk_cc_center
            FOREIGN KEY (center_id) REFERENCES study_centers(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS coordinator_center; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
