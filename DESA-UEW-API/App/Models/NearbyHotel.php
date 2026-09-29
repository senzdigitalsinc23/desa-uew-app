<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class NearbyHotel extends Model
{
    protected static string $table = 'nearby_hotels';
    protected array $fillable = [
        'name', 'slug', 'address', 'distance', 'rate_range',
        'phone', 'rating', 'amenities', 'website', 'is_active'
    ];

    public function centers(): \Database\ORM\Relation
    {
        return $this->belongsToMany(StudyCenter::class, 'hotel_center', 'hotel_id', 'center_id');
    }
}
