<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Card;
use App\Models\Member;
use App\Models\MemberCard;
use App\Models\MemberCashAccount;

use App\Support\Money;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberFinanceController extends Controller
{
    /* =========================================================
       MEMBER
    ========================================================= */

    private function member(
        Request $request
    ): Member {
        return $request
            ->attributes
            ->get(
                'member'
            );
    }

    /* =========================================================
       CASH ACCOUNT

       Automatically create the member's one on-hand cash
       account if it does not exist yet.
    ========================================================= */

    private function cashAccount(
        Member $member
    ): MemberCashAccount {
        return MemberCashAccount::firstOrCreate(
            [
                'member_id' =>
                    $member->id,
            ],
            [
                'name' =>
                    'On-hand Cash',

                'balance' =>
                    '0.00',

                'currency' =>
                    'PHP',
            ]
        );
    }

    /* =========================================================
       SUMMARY

       Savings     = all member card balances
       Actual Money = on-hand cash
       Total Money = savings + actual money
    ========================================================= */

    public function summary(
        Request $request
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $cards =
            MemberCard::query()
                ->where(
                    'member_id',
                    $member->id
                )
                ->get([
                    'balance',
                ]);

        $savingsCents = 0;

        foreach (
            $cards as $card
        ) {
            $savingsCents +=
                Money::toCents(
                    $card->balance
                );
        }

        $cash =
            $this->cashAccount(
                $member
            );

        $actualMoneyCents =
            Money::toCents(
                $cash->balance
            );

        $totalMoneyCents =
            $savingsCents
            +
            $actualMoneyCents;

        return response()->json([
            'data' => [
                'savings' =>
                    Money::fromCents(
                        $savingsCents
                    ),

                'actual_money' =>
                    Money::fromCents(
                        $actualMoneyCents
                    ),

                'total_money' =>
                    Money::fromCents(
                        $totalMoneyCents
                    ),

                'currency' =>
                    'PHP',
            ],
        ]);
    }

    /* =========================================================
       ACTIVE CARD CATALOG

       Member-facing list of providers.

       Only active catalog cards are returned.
    ========================================================= */

    public function cardCatalog(
        Request $request
    ): JsonResponse {
        $cards =
            Card::query()
                ->where(
                    'status',
                    'active'
                )
                ->orderBy(
                    'name'
                )
                ->get([
                    'id',
                    'name',
                    'slug',
                    'type',
                    'status',

                    'landscape_image_url',
                    'portrait_image_url',
                ]);

        return response()->json([
            'data' =>
                $cards,
        ]);
    }

    /* =========================================================
       ON-HAND CASH
    ========================================================= */

    public function cash(
        Request $request
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $cash =
            $this->cashAccount(
                $member
            );

        return response()->json([
            'data' => [
                'id' =>
                    $cash->id,

                'name' =>
                    $cash->name,

                'balance' =>
                    (string) $cash->balance,

                'currency' =>
                    $cash->currency,
            ],
        ]);
    }
}