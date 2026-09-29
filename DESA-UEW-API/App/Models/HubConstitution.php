<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubConstitution extends Model
{
    protected static string $table = 'hub_constitution';
    protected array $fillable = [
        'title', 'preamble', 'version', 'adopted_date', 'document_url', 'is_active'
    ];

    public function articles(): \Database\ORM\Relation
    {
        return $this->hasMany(HubConstitutionArticle::class, 'constitution_id');
    }
}
