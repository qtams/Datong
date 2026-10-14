<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'fullname',
        'nickname',
        'username',
        'email',
        'birthday',
        'role',
        'password',
        'must_change_password',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'birthday' => 'date:Y-m-d',

            'email_verified_at' => 'datetime',

            'last_login_at' => 'datetime',

            'must_change_password' => 'boolean',

            'password' => 'hashed',
        ];
    }
}