<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class NearbyRestaurant extends Model
{
    protected static string $table = 'nearby_restaurants';
    protected array $fillable = [
        'name', 'slug', 'address', 'distance', 'specialty',
        'open_hours', 'phone', 'cuisine_type', 'price_range', 'is_active'
    ];

    public function centers(): \Database\ORM\Relation
    {
        return $this->belongsToMany(StudyCenter::class, 'restaurant_center', 'restaurant_id', 'center_id');
    }
}
