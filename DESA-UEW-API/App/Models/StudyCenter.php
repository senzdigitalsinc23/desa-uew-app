<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class StudyCenter extends Model
{
    protected static string $table = 'study_centers';
    protected array $fillable = [
        'region_id', 'slug', 'name', 'premises', 'city', 'landmark',
        'schedule', 'address', 'postal_address', 'latitude', 'longitude',
        'is_active', 'public'
    ];

    public function region(): \Database\ORM\Relation
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function programs(): \Database\ORM\Relation
    {
        return $this->belongsToMany(AcademicProgram::class, 'program_center', 'center_id', 'program_id');
    }

    public function coordinators(): \Database\ORM\Relation
    {
        return $this->belongsToMany(Coordinator::class, 'coordinator_center', 'center_id', 'coordinator_id');
    }

    public function hotels(): \Database\ORM\Relation
    {
        return $this->belongsToMany(NearbyHotel::class, 'hotel_center', 'center_id', 'hotel_id');
    }

    public function healthFacilities(): \Database\ORM\Relation
    {
        return $this->belongsToMany(NearbyHealthFacility::class, 'health_center', 'center_id', 'facility_id');
    }

    public function restaurants(): \Database\ORM\Relation
    {
        return $this->belongsToMany(NearbyRestaurant::class, 'restaurant_center', 'center_id', 'restaurant_id');
    }

    public function members(): \Database\ORM\Relation
    {
        return $this->hasMany(DesaMember::class, 'center_id');
    }
}
