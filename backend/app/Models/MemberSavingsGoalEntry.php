<?php

namespace App\Models;

use App\Support\DecimalMoney;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberSavingsGoalEntry extends Model
{
    protected $fillable = [
        'member_id', 'member_savings_goal_id', 'member_cash_account_id',
        'type', 'amount', 'goal_balance_after', 'wallet_balance_after',
    ];

    protected function casts(): array
    {
        return [
            'amount' => DecimalMoney::class,
            'goal_balance_after' => DecimalMoney::class,
            'wallet_balance_after' => DecimalMoney::class,
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(MemberSavingsGoal::class, 'member_savings_goal_id')->withTrashed();
    }

    public function cashAccount(): BelongsTo
    {
        return $this->belongsTo(MemberCashAccount::class, 'member_cash_account_id');
    }
}
