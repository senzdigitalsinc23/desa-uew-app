<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubGalleryImage extends Model
{
    protected static string $table = 'hub_gallery_images';
    protected array $fillable = [
        'title', 'description', 'url', 'thumbnail_url', 'event_name',
        'event_date', 'photographer', 'tags', 'sort_order', 'is_featured', 'is_active'
    ];
}
