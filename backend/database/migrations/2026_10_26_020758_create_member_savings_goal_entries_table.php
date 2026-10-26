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
        Schema::create('member_savings_goal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->restrictOnDelete();
            $table->foreignId('member_savings_goal_id')->constrained('member_savings_goals')->restrictOnDelete();
            $table->foreignId('member_cash_account_id')->constrained('member_cash_accounts')->restrictOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 15, 2);
            $table->decimal('goal_balance_after', 15, 2);
            $table->decimal('wallet_balance_after', 15, 2);
            $table->timestamps();
            $table->index(['member_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_savings_goal_entries');
    }
};
