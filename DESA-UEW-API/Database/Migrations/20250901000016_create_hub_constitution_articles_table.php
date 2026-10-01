<?php

namespace Database\Migrations;

use Database\Migration;

class CreateHubConstitutionArticlesTable extends Migration
{
    public function up(): void
    {
        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_constitution (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                preamble LONGTEXT NULL,
                version VARCHAR(20) NOT NULL DEFAULT '1.0',
                adopted_date DATE NULL,
                document_url VARCHAR(500) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_hub_constitution_id (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            CREATE TABLE IF NOT EXISTS hub_constitution_articles (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                constitution_id INT UNSIGNED NOT NULL,
                article_number VARCHAR(20) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT NULL,
                sort_order INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY uq_article_constitution (constitution_id, article_number),
                INDEX idx_articles_constitution (constitution_id),
                INDEX idx_articles_sort (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->execute("
            ALTER TABLE hub_constitution_articles
            ADD CONSTRAINT fk_hca_constitution
            FOREIGN KEY (constitution_id) REFERENCES hub_constitution(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ");
    }

    public function down(): void
    {
        $this->execute("SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS hub_constitution_articles; DROP TABLE IF EXISTS hub_constitution; SET FOREIGN_KEY_CHECKS = 1;");
    }
}
