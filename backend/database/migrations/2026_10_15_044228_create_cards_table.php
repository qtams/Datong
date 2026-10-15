<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /* =========================================================
       UP
    ========================================================= */

    public function up(): void
    {
        Schema::create(
            'cards',
            function (Blueprint $table) {
                $table->id();

                /* =============================================
                   CARD INFORMATION
                ============================================= */

                $table
                    ->string(
                        'name',
                        100
                    )
                    ->unique();

                $table
                    ->string(
                        'slug',
                        120
                    )
                    ->unique();

                $table
                    ->string(
                        'type',
                        50
                    )
                    ->index();

                $table
                    ->string(
                        'status',
                        20
                    )
                    ->default('active')
                    ->index();

                /* =============================================
                   LANDSCAPE IMAGE
                ============================================= */

                $table->text(
                    'landscape_image_url'
                );

                $table->string(
                    'landscape_public_id'
                );

                /* =============================================
                   PORTRAIT IMAGE
                ============================================= */

                $table->text(
                    'portrait_image_url'
                );

                $table->string(
                    'portrait_public_id'
                );

                /* =============================================
                   TIMESTAMPS
                ============================================= */

                $table->timestamps();
            }
        );
    }

    /* =========================================================
       DOWN
    ========================================================= */

    public function down(): void
    {
        Schema::dropIfExists(
            'cards'
        );
    }
};