<?php

namespace Database\Migrations;

use Database\Migration;

class CreateRestaurantCenterTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS restaurant_center (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT UNSIGNED NOT NULL,
                center_id INT UNSIGNED NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_restaurant_center (restaurant_id, center_id),
                INDEX idx_rc_restaurant (restaurant_id),
                INDEX idx_rc_center (center_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE restaurant_center
            ADD CONSTRAINT fk_rc_restaurant
            FOREIGN KEY (restaurant_id) REFERENCES nearby_restaurants(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT fk_rc_center
            FOREIGN KEY (center_id) REFERENCES study_centers(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS restaurant_center; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
