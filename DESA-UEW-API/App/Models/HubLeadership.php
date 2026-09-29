<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubLeadership extends Model
{
    protected static string $table = 'hub_leaderships';
    protected array $fillable = [
        'role', 'name', 'term_start', 'term_end', 'photo_url',
        'bio', 'email', 'phone', 'is_current', 'is_active', 'sort_order'
    ];
}
