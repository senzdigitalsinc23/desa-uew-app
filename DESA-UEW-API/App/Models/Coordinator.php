<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class Coordinator extends Model
{
    protected static string $table = 'coordinators';
    protected array $fillable = ['first_name', 'last_name', 'title', 'phone', 'email', 'office', 'office_hours', 'is_active'];
}
