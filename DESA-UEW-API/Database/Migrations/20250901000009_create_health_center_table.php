<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHealthCenterTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS health_center (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                facility_id INT UNSIGNED NOT NULL,
                center_id INT UNSIGNED NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_health_center (facility_id, center_id),
                INDEX idx_hcf_facility (facility_id),
                INDEX idx_hcf_center (center_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE health_center
            ADD CONSTRAINT fk_hcf_facility
            FOREIGN KEY (facility_id) REFERENCES nearby_health_facilities(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT fk_hcf_center
            FOREIGN KEY (center_id) REFERENCES study_centers(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS health_center; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
