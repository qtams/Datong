<?php

namespace App\Models;

use App\Support\DecimalMoney;
use Database\Factories\MemberSavingsGoalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberSavingsGoal extends Model
{
    /** @use HasFactory<MemberSavingsGoalFactory> */
    use HasFactory;

    use SoftDeletes;

    public const MAX_GOALS = 6;

    public const MAX_BALANCE_CENTS = 999_999_999_999_999;

    public const ICON_IDS = [
        'emergency', 'travel', 'health', 'car', 'home', 'gift',
        'education', 'wedding', 'food', 'technology', 'pet',
        'entertainment', 'fitness', 'memories', 'general',
    ];

    protected $fillable = [
        'member_id', 'name', 'icon_id', 'image_url', 'image_public_id',
        'target_amount', 'balance', 'currency', 'target_date', 'version',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => DecimalMoney::class,
            'balance' => DecimalMoney::class,
            'target_date' => 'date',
            'version' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(MemberSavingsGoalEntry::class);
    }
}
