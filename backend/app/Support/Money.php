<?php

namespace App\Support;

use InvalidArgumentException;

class Money
{
    /* =========================================================
       TO CENTS

       15000.25 -> 1500025
    ========================================================= */

    public static function toCents(
        mixed $value
    ): int {
        $value = trim(
            (string) $value
        );

        if (
            !preg_match(
                '/^\d+(?:\.\d{1,2})?$/',
                $value
            )
        ) {
            throw new InvalidArgumentException(
                'Invalid money value.'
            );
        }

        $parts = explode(
            '.',
            $value,
            2
        );

        $whole =
            $parts[0] ?? '0';

        $decimal =
            $parts[1] ?? '';

        $decimal = str_pad(
            $decimal,
            2,
            '0'
        );

        $decimal = substr(
            $decimal,
            0,
            2
        );

        return
            ((int) $whole * 100)
            +
            (int) $decimal;
    }

    /* =========================================================
       FROM CENTS

       1500025 -> 15000.25
    ========================================================= */

    public static function fromCents(
        int $cents
    ): string {
        if ($cents < 0) {
            throw new InvalidArgumentException(
                'Money cannot be negative.'
            );
        }

        $whole = intdiv(
            $cents,
            100
        );

        $decimal =
            $cents % 100;

        return sprintf(
            '%d.%02d',
            $whole,
            $decimal
        );
    }
}