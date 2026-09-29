<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubAsset extends Model
{
    protected static string $table = 'hub_assets';
    protected array $fillable = [
        'item_name', 'description', 'quantity', 'unit', 'date_acquired',
        'supplier', 'cost', 'currency', 'condition', 'serial_number',
        'assigned_to', 'location', 'notes', 'photo_url', 'is_active'
    ];
}
