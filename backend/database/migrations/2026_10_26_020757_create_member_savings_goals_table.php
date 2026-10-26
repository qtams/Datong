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
        Schema::create('member_savings_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->restrictOnDelete();
            $table->string('name', 25);
            $table->string('icon_id', 30)->default('emergency');
            $table->text('image_url')->nullable();
            $table->string('image_public_id')->nullable();
            $table->decimal('target_amount', 15, 2);
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('currency', 3)->default('PHP');
            $table->date('target_date')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['member_id', 'deleted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_savings_goals');
    }
};
