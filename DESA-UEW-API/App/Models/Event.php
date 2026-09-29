<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Event extends Model
{
    protected static string $table = 'events';
    protected array $fillable = [
        'slug', 'title', 'excerpt', 'body', 'type', 'start_date',
        'end_date', 'start_time', 'end_time', 'venue', 'location',
        'thumbnail', 'capacity', 'registration_link', 'organizer',
        'is_active', 'public', 'created_by'
    ];
}
