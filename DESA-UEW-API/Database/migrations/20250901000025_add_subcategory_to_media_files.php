<?php

namespace Database\Migrations;

use Database\Migration;

class AddSubcategoryToMediaFiles extends Migration
{
    public function up(): void
    {
        $this->execute("
            ALTER TABLE media_files 
            ADD COLUMN subcategory VARCHAR(100) NULL DEFAULT '' AFTER category,
            ADD INDEX idx_media_subcategory (subcategory)
        ");
    }

    public function down(): void
    {
        $this->execute("ALTER TABLE media_files DROP COLUMN subcategory");
    }
}
