<?php

namespace Database\Migrations;

use Database\Migration;

class AddSubcategoryToMediaFiles extends Migration
{
    public function up(): void
    {
        $result = $this->db->query("
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE()
            AND table_name = 'media_files'
            AND column_name = 'subcategory'
        ");
        $exists = (int)$result->fetchColumn() === 0;

        if ($exists) {
            $this->execute("
                ALTER TABLE media_files
                ADD COLUMN subcategory VARCHAR(100) NULL DEFAULT '' AFTER category,
                ADD INDEX idx_media_subcategory (subcategory)
            ");
        }
    }

    public function down(): void
    {
        $this->execute("ALTER TABLE media_files DROP COLUMN subcategory");
    }
}
