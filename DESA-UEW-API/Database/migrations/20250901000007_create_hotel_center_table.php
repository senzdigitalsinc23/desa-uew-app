<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHotelCenterTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hotel_center (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                hotel_id INT UNSIGNED NOT NULL,
                center_id INT UNSIGNED NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_hotel_center (hotel_id, center_id),
                INDEX idx_hc_hotel (hotel_id),
                INDEX idx_hc_center (center_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE hotel_center
            ADD CONSTRAINT fk_hc_hotel
            FOREIGN KEY (hotel_id) REFERENCES nearby_hotels(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT fk_hc_center
            FOREIGN KEY (center_id) REFERENCES study_centers(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS hotel_center; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
