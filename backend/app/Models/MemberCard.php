<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberCard extends Model
{
    use SoftDeletes;

    /* =========================================================
       FILLABLE
    ========================================================= */

    protected $fillable = [
        'member_id',
        'card_id',
        'name',
        'opening_balance',
        'balance',
        'currency',
        'status',
    ];

    /* =========================================================
       CASTS
    ========================================================= */

    protected function casts(): array
    {
        return [
            'opening_balance' =>
                'decimal:2',

            'balance' =>
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
       CATALOG CARD
    ========================================================= */

    public function card(): BelongsTo
    {
        return $this->belongsTo(
            Card::class
        );
    }
}