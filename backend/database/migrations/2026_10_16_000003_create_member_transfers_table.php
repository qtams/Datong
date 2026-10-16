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
            'member_transfers',
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
                   FROM
                ============================================= */

                $table->string(
                    'from_type',
                    20
                );

                $table
                    ->foreignId(
                        'from_member_card_id'
                    )
                    ->nullable()
                    ->constrained(
                        'member_cards'
                    )
                    ->restrictOnDelete();

                $table
                    ->foreignId(
                        'from_cash_account_id'
                    )
                    ->nullable()
                    ->constrained(
                        'member_cash_accounts'
                    )
                    ->restrictOnDelete();

                /* =============================================
                   TO
                ============================================= */

                $table->string(
                    'to_type',
                    20
                );

                $table
                    ->foreignId(
                        'to_member_card_id'
                    )
                    ->nullable()
                    ->constrained(
                        'member_cards'
                    )
                    ->restrictOnDelete();

                $table
                    ->foreignId(
                        'to_cash_account_id'
                    )
                    ->nullable()
                    ->constrained(
                        'member_cash_accounts'
                    )
                    ->restrictOnDelete();

                /* =============================================
                   AMOUNT
                ============================================= */

                $table->decimal(
                    'amount',
                    15,
                    2
                );

                /* =============================================
                   OPTIONAL NOTE
                ============================================= */

                $table
                    ->string(
                        'note',
                        255
                    )
                    ->nullable();

                /* =============================================
                   TIMESTAMPS
                ============================================= */

                $table->timestamps();

                /* =============================================
                   INDEX
                ============================================= */

                $table->index([
                    'member_id',
                    'created_at',
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
            'member_transfers'
        );
    }
};