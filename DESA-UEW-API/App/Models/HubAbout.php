<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubAbout extends Model
{
    protected static string $table = 'hub_about';
    protected array $fillable = [
        'title', 'subtitle', 'content', 'mission', 'vision',
        'values', 'established_year', 'logo_url', 'hero_image_url', 'is_active'
    ];
}
