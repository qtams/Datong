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
            'member_cards',
            function (
                Blueprint $table
            ) {
                $table->id();

                /* =============================================
                   OWNER
                ============================================= */

                $table
                    ->foreignId(
                        'member_id'
                    )
                    ->constrained(
                        'members'
                    )
                    ->restrictOnDelete();

                /* =============================================
                   CARD CATALOG PROVIDER

                   GCash
                   GoTyme
                   Maya
                   BPI
                   etc.
                ============================================= */

                $table
                    ->foreignId(
                        'card_id'
                    )
                    ->constrained(
                        'cards'
                    )
                    ->restrictOnDelete();

                /* =============================================
                   MEMBER CUSTOM NAME
                ============================================= */

                $table->string(
                    'name',
                    100
                );

                /* =============================================
                   MONEY
                ============================================= */

                $table
                    ->decimal(
                        'opening_balance',
                        15,
                        2
                    )
                    ->default(0);

                $table
                    ->decimal(
                        'balance',
                        15,
                        2
                    )
                    ->default(0);

                $table
                    ->string(
                        'currency',
                        3
                    )
                    ->default(
                        'PHP'
                    );

                /* =============================================
                   STATUS
                ============================================= */

                $table
                    ->string(
                        'status',
                        20
                    )
                    ->default(
                        'active'
                    )
                    ->index();

                /* =============================================
                   TIMESTAMPS
                ============================================= */

                $table->timestamps();

                /* =============================================
                   SOFT DELETE

                   Important for financial history.
                ============================================= */

                $table->softDeletes();

                /* =============================================
                   INDEX
                ============================================= */

                $table->index([
                    'member_id',
                    'status',
                ]);
            }
        );
    }

    /* =========================================================
       DOWN
    ========================================================= */

    public function down(): void
    {
        Schema::dropIfExists(
            'member_cards'
        );
    }
};