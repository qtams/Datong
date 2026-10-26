<?php

namespace App\Support;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Preserve two-decimal database values before integer-cent arithmetic.
 * SQLite PDO returns decimals as floats; a default string cast can drop
 * cents at large balances because of PHP's significant-digit precision.
 *
 * @implements CastsAttributes<string, string|int|float>
 */
class DecimalMoney implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        $decimal = is_float($value) ? sprintf('%.2F', $value) : $value;

        return Money::fromCents(Money::toCents($decimal));
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value;
    }
}
