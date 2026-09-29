<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Announcement extends Model
{
    protected static string $table = 'announcements';
    protected array $fillable = [
        'slug', 'title', 'excerpt', 'body', 'type', 'thumbnail',
        'published_at', 'expires_at', 'created_by', 'is_active', 'public'
    ];
}
