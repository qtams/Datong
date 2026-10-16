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
            'member_cash_accounts',
            function (
                Blueprint $table
            ) {
                $table->id();

                /* =============================================
                   OWNER

                   One on-hand cash account per member.
                ============================================= */

                $table
                    ->foreignId(
                        'member_id'
                    )
                    ->unique()
                    ->constrained(
                        'members'
                    )
                    ->restrictOnDelete();

                /* =============================================
                   DISPLAY NAME
                ============================================= */

                $table
                    ->string(
                        'name',
                        100
                    )
                    ->default(
                        'On-hand Cash'
                    );

                /* =============================================
                   BALANCE
                ============================================= */

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
            'member_cash_accounts'
        );
    }
};