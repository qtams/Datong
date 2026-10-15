<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    /* =========================================================
       TYPES
    ========================================================= */

    public const TYPE_BANK = 'bank';

    public const TYPE_E_WALLET = 'e_wallet';

    /* =========================================================
       STATUS
    ========================================================= */

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    /* =========================================================
       FILLABLE
    ========================================================= */

    protected $fillable = [
        'name',

        'slug',

        'type',

        'status',

        'landscape_image_url',

        'landscape_public_id',

        'portrait_image_url',

        'portrait_public_id',
    ];

    /* =========================================================
       ACTIVE SCOPE
    ========================================================= */

    public function scopeActive(
        $query
    ) {
        return $query->where(
            'status',
            self::STATUS_ACTIVE
        );
    }
}