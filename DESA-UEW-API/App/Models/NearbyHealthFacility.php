<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class NearbyHealthFacility extends Model
{
    protected static string $table = 'nearby_health_facilities';
    protected array $fillable = [
        'name', 'slug', 'type', 'address', 'distance',
        'phone', 'hours', 'services', 'is_24_7', 'is_active'
    ];

    public function centers(): \Database\ORM\Relation
    {
        return $this->belongsToMany(StudyCenter::class, 'health_center', 'facility_id', 'center_id');
    }
}
