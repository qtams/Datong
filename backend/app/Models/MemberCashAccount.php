<?php

namespace App\Models;

use App\Support\DecimalMoney;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberCashAccount extends Model
{
    /* =========================================================
       FILLABLE
    ========================================================= */

    protected $fillable = [
        'member_id',
        'name',
        'balance',
        'currency',
    ];

    /* =========================================================
       CASTS
    ========================================================= */

    protected function casts(): array
    {
        return [
            'balance' => DecimalMoney::class,
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
}
