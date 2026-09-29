<?php
declare(strict_types=1);

namespace App\Models;

use Database\ORM\Model;

class User extends Model
{
    protected static string $table = 'users';
}
