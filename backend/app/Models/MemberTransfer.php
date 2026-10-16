<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberTransfer extends Model
{
    /* =========================================================
       FILLABLE
    ========================================================= */

    protected $fillable = [
        'member_id',

        'from_type',
        'from_member_card_id',
        'from_cash_account_id',

        'to_type',
        'to_member_card_id',
        'to_cash_account_id',

        'amount',
        'note',
    ];

    /* =========================================================
       CASTS
    ========================================================= */

    protected function casts(): array
    {
        return [
            'amount' =>
                'decimal:2',
        ];
    }

    /* =========================================================
       MEMBER
    ========================================================= */

    public function member(): BelongsTo
    {
        return $this->belongsTo(
            Member::class
        );
    }

    /* =========================================================
       FROM CARD
    ========================================================= */

    public function fromMemberCard(): BelongsTo
    {
        return $this
            ->belongsTo(
                MemberCard::class,
                'from_member_card_id'
            )
            ->withTrashed();
    }

    /* =========================================================
       TO CARD
    ========================================================= */

    public function toMemberCard(): BelongsTo
    {
        return $this
            ->belongsTo(
                MemberCard::class,
                'to_member_card_id'
            )
            ->withTrashed();
    }

    /* =========================================================
       FROM CASH
    ========================================================= */

    public function fromCashAccount(): BelongsTo
    {
        return $this->belongsTo(
            MemberCashAccount::class,
            'from_cash_account_id'
        );
    }

    /* =========================================================
       TO CASH
    ========================================================= */

    public function toCashAccount(): BelongsTo
    {
        return $this->belongsTo(
            MemberCashAccount::class,
            'to_cash_account_id'
        );
    }
}