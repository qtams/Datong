<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' =>
                    'admin@datong.local',
            ],
            [
                'fullname' =>
                    'Datong Administrator',

                'nickname' =>
                    'Admin',

                'username' =>
                    'admin',

                'birthday' =>
                    '1990-01-01',

                'role' =>
                    'Admin',

                'password' =>
                    'DATONG01011990',

                'must_change_password' =>
                    true,

                'last_login_at' =>
                    null,
            ]
        );
    }
}