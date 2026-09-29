<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubConstitutionArticle extends Model
{
    protected static string $table = 'hub_constitution_articles';
    protected array $fillable = [
        'constitution_id', 'article_number', 'title', 'content', 'sort_order', 'is_active'
    ];

    public function constitution(): \Database\ORM\Relation
    {
        return $this->belongsTo(HubConstitution::class, 'constitution_id');
    }
}
