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
use Illuminate\Support\Facades\DB;

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
       CASH RESPONSE
    ========================================================= */

    private function cashResponse(
        MemberCashAccount $cash
    ): array {
        return [
            'id' =>
                $cash->id,

            'name' =>
                $cash->name,

            'balance' =>
                (string) $cash->balance,

            'currency' =>
                $cash->currency,

            'updated_at' =>
                $cash
                    ->updated_at
                    ?->toISOString(),
        ];
    }

    /* =========================================================
       SUMMARY

       Savings      = all member card balances
       Actual Money = on-hand cash
       Total Money  = savings + actual money
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
       ON-HAND CASH / DATONG WALLET
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
            'data' =>
                $this->cashResponse(
                    $cash
                ),
        ]);
    }

    /* =========================================================
       UPDATE WALLET BALANCE

       This is a MANUAL wallet balance adjustment.

       Example:
       {
           "amount": 15000
       }

       This SETS the wallet balance to 15000.
       It does not create a transfer record.
    ========================================================= */

    public function updateCash(
        Request $request
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $validated =
            $request->validate([
                'amount' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:9999999999999.99',
                ],
            ], [
                'amount.required' =>
                    'Wallet balance is required.',

                'amount.numeric' =>
                    'Wallet balance must be a valid amount.',

                'amount.min' =>
                    'Wallet balance cannot be negative.',
            ]);

        $balance =
            Money::fromCents(
                Money::toCents(
                    $validated[
                        'amount'
                    ]
                )
            );

        $cash =
            DB::transaction(
                function () use (
                    $member,
                    $balance
                ) {
                    /*
                     * Make sure an account exists before
                     * requesting the row lock.
                     */

                    $existing =
                        $this->cashAccount(
                            $member
                        );

                    $cash =
                        MemberCashAccount::query()
                            ->where(
                                'member_id',
                                $member->id
                            )
                            ->whereKey(
                                $existing->id
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    $cash->balance =
                        $balance;

                    $cash->save();

                    return $cash;
                }
            );

        $cash->refresh();

        return response()->json([
            'message' =>
                'Wallet balance updated successfully.',

            'data' =>
                $this->cashResponse(
                    $cash
                ),
        ]);
    }
}