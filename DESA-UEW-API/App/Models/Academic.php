<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Academic extends Model
{
    protected static string $table = 'academics';
    protected array $fillable = [
        'slug', 'title', 'category', 'program_id', 'level', 'course_code',
        'course_title', 'description', 'file_url', 'file_type', 'file_size',
        'author', 'academic_year', 'semester', 'uploaded_by', 'is_active', 'public', 'tags'
    ];

    public function program(): \Database\ORM\Relation
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }
}
