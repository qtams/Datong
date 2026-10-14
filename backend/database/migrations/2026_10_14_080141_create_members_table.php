<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();

            /* =================================================
               MEMBER IDENTITY
            ================================================= */

            $table
                ->string('member_id')
                ->nullable()
                ->unique();

            $table
                ->string('firebase_uid')
                ->unique();

            /* =================================================
               ROLE

               Every public Firebase registration is a member.
            ================================================= */

            $table
                ->string('role')
                ->default('member')
                ->index();

            /* =================================================
               PROFILE
            ================================================= */

            $table
                ->string('fullname')
                ->nullable();

            $table
                ->string('nickname')
                ->nullable();

            $table
                ->string('username')
                ->nullable()
                ->unique();

            $table
                ->string('email')
                ->nullable()
                ->unique();

            $table
                ->string('mobile_number')
                ->nullable();

            $table
                ->string('location')
                ->nullable();

            /* =================================================
               FIREBASE AUTH INFORMATION
            ================================================= */

            $table
                ->boolean('password_set')
                ->default(false);

            $table
                ->boolean('email_verified')
                ->default(false);

            $table
                ->string('auth_provider')
                ->nullable();

            /* =================================================
               MEMBER VERIFICATION
            ================================================= */

            $table
                ->timestamp('verified_at')
                ->nullable();

            /* =================================================
               ACTIVITY
            ================================================= */

            $table
                ->timestamp('registered_at')
                ->nullable();

            $table
                ->timestamp('last_login_at')
                ->nullable();

            /* =================================================
               LARAVEL TIMESTAMPS
            ================================================= */

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};