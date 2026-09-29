<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class DesaMember extends Model
{
    protected static string $table = 'desa_members';
    protected array $fillable = [
        'student_no', 'first_name', 'last_name', 'email', 'phone',
        'region_id', 'center_id', 'program_id', 'level', 'academic_year',
        'gender', 'status', 'membership_year', 'is_executive', 'executive_role'
    ];

    public function region(): \Database\ORM\Relation
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function center(): \Database\ORM\Relation
    {
        return $this->belongsTo(StudyCenter::class, 'center_id');
    }

    public function program(): \Database\ORM\Relation
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }
}
