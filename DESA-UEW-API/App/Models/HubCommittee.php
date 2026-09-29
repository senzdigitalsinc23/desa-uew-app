<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubCommittee extends Model
{
    protected static string $table = 'hub_committees';
    protected array $fillable = [
        'name', 'slug', 'description', 'chair_name', 'chair_email',
        'chair_phone', 'member_count', 'formed_year', 'dissolved_year',
        'is_active', 'sort_order'
    ];
}
