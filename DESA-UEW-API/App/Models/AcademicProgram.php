<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class AcademicProgram extends Model
{
    protected static string $table = 'academic_programs';
    protected array $fillable = [
        'slug', 'code', 'title', 'department', 'faculty',
        'level_start', 'level_end', 'duration_years', 'mode',
        'description', 'fee_range', 'is_active', 'public'
    ];

    public function centers(): \Database\ORM\Relation
    {
        return $this->belongsToMany(StudyCenter::class, 'program_center', 'program_id', 'center_id');
    }

    public function members(): \Database\ORM\Relation
    {
        return $this->hasMany(DesaMember::class, 'program_id');
    }
}
