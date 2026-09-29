<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Region extends Model
{
    protected static string $table = 'regions';
    protected array $fillable = ['slug', 'name', 'short_name', 'code', 'capital', 'description', 'is_active', 'sort_order'];

    public function centers(): \Database\ORM\Relation
    {
        return $this->hasMany(StudyCenter::class, 'region_id');
    }

    public function members(): \Database\ORM\Relation
    {
        return $this->hasMany(DesaMember::class, 'region_id');
    }
}
