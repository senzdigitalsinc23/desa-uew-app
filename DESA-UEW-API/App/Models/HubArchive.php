<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class HubArchive extends Model
{
    protected static string $table = 'hub_archives';
    protected array $fillable = [
        'title', 'year', 'doc_type', 'file_url', 'file_size',
        'description', 'uploaded_by', 'is_active'
    ];
}
