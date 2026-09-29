<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Opportunity extends Model
{
    protected static string $table = 'opportunities';
    protected array $fillable = [
        'slug', 'title', 'category', 'organization', 'location',
        'stipend', 'deadline', 'description', 'requirements',
        'application_link', 'contact_email', 'contact_phone',
        'is_active', 'public', 'featured', 'created_by'
    ];
}
