<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class AuditLog extends Model
{
    protected static string $table = 'audit_logs';
    protected array $guarded = ['id'];
}
