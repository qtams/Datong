<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Card;
use App\Models\Member;
use App\Models\MemberCard;

use App\Support\Money;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MemberCardController extends Controller
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
       RESPONSE
    ========================================================= */

    private function cardResponse(
        MemberCard $memberCard
    ): array {
        $memberCard->loadMissing(
            'card'
        );

        return [
            'id' =>
                $memberCard->id,

            'name' =>
                $memberCard->name,

            'opening_balance' =>
                (string)
                $memberCard
                    ->opening_balance,

            'balance' =>
                (string)
                $memberCard
                    ->balance,

            'currency' =>
                $memberCard->currency,

            'status' =>
                $memberCard->status,

            'provider' => [
                'id' =>
                    $memberCard
                        ->card?->id,

                'name' =>
                    $memberCard
                        ->card?->name,

                'slug' =>
                    $memberCard
                        ->card?->slug,

                'type' =>
                    $memberCard
                        ->card?->type,

                'landscape_image_url' =>
                    $memberCard
                        ->card
                        ?->landscape_image_url,

                'portrait_image_url' =>
                    $memberCard
                        ->card
                        ?->portrait_image_url,
            ],

            'created_at' =>
                $memberCard
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $memberCard
                    ->updated_at
                    ?->toISOString(),
        ];
    }

    /* =========================================================
       INDEX
    ========================================================= */

    public function index(
        Request $request
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $cards =
            MemberCard::query()
                ->with(
                    'card'
                )
                ->where(
                    'member_id',
                    $member->id
                )
                ->orderBy(
                    'name'
                )
                ->get();

        return response()->json([
            'data' =>
                $cards
                    ->map(
                        fn (
                            MemberCard $card
                        ) =>
                            $this->cardResponse(
                                $card
                            )
                    )
                    ->values(),
        ]);
    }

    /* =========================================================
       STORE
    ========================================================= */

    public function store(
        Request $request
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $validated =
            $request->validate([
                'card_id' => [
                    'required',
                    'integer',
                    'exists:cards,id',
                ],

                'name' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'amount' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:9999999999999.99',
                ],
            ]);

        /* =====================================================
           PROVIDER MUST BE ACTIVE
        ===================================================== */

        $catalogCard =
            Card::query()
                ->whereKey(
                    $validated[
                        'card_id'
                    ]
                )
                ->where(
                    'status',
                    'active'
                )
                ->first();

        if (!$catalogCard) {
            throw ValidationException::withMessages([
                'card_id' => [
                    'This card provider is currently unavailable.',
                ],
            ]);
        }

        /* =====================================================
           NORMALIZE MONEY
        ===================================================== */

        $balance =
            Money::fromCents(
                Money::toCents(
                    $validated[
                        'amount'
                    ]
                )
            );

        /* =====================================================
           CREATE
        ===================================================== */

        $memberCard =
            MemberCard::create([
                'member_id' =>
                    $member->id,

                'card_id' =>
                    $catalogCard->id,

                'name' =>
                    trim(
                        $validated[
                            'name'
                        ]
                    ),

                'opening_balance' =>
                    $balance,

                'balance' =>
                    $balance,

                'currency' =>
                    'PHP',

                'status' =>
                    'active',
            ]);

        $memberCard->load(
            'card'
        );

        return response()->json([
            'message' =>
                'Card added successfully.',

            'data' =>
                $this->cardResponse(
                    $memberCard
                ),
        ], 201);
    }

    /* =========================================================
       UPDATE

       Balance is intentionally NOT directly editable.

       Money should change through transfers later.
    ========================================================= */

    public function update(
        Request $request,
        int $memberCardId
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        $memberCard =
            MemberCard::query()
                ->where(
                    'member_id',
                    $member->id
                )
                ->whereKey(
                    $memberCardId
                )
                ->firstOrFail();

        $validated =
            $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:100',
                ],

                'status' => [
                    'sometimes',
                    'required',
                    Rule::in([
                        'active',
                        'inactive',
                    ]),
                ],
            ]);

        if (
            array_key_exists(
                'name',
                $validated
            )
        ) {
            $memberCard->name =
                trim(
                    $validated[
                        'name'
                    ]
                );
        }

        if (
            array_key_exists(
                'status',
                $validated
            )
        ) {
            $memberCard->status =
                $validated[
                    'status'
                ];
        }

        $memberCard->save();

        $memberCard->load(
            'card'
        );

        return response()->json([
            'message' =>
                'Card updated successfully.',

            'data' =>
                $this->cardResponse(
                    $memberCard
                ),
        ]);
    }

    /* =========================================================
       DELETE

       A card can now be removed even when it still has money.

       Savings is calculated from the REMAINING cards
       (MemberFinanceController@summary), so the removed card's
       balance is subtracted from Savings automatically.

       The card is soft deleted, so transfer history that
       references it stays valid.
    ========================================================= */

    public function destroy(
        Request $request,
        int $memberCardId
    ): JsonResponse {
        $member =
            $this->member(
                $request
            );

        DB::transaction(
            function () use (
                $member,
                $memberCardId
            ) {
                $memberCard =
                    MemberCard::query()
                        ->where(
                            'member_id',
                            $member->id
                        )
                        ->whereKey(
                            $memberCardId
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                $memberCard->delete();
            }
        );

        return response()->json([
            'message' =>
                'Card removed. Its balance was subtracted from your savings.',
        ]);
    }
}