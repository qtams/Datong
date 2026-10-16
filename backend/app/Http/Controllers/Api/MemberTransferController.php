<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Member;
use App\Models\MemberCard;
use App\Models\MemberCashAccount;
use App\Models\MemberTransfer;

use App\Support\Money;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MemberTransferController extends Controller
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

    private function ensureCashAccount(
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
       RESOLVE ACCOUNT

       type:
       card
       cash
    ========================================================= */

    private function resolveAccount(
        Member $member,
        string $type,
        ?int $id = null
    ): Model {
        /* =====================================================
           CARD
        ===================================================== */

        if ($type === 'card') {
            if (!$id) {
                throw ValidationException::withMessages([
                    'account' => [
                        'Card account is required.',
                    ],
                ]);
            }

            return MemberCard::query()
                ->where(
                    'member_id',
                    $member->id
                )
                ->whereKey(
                    $id
                )
                ->lockForUpdate()
                ->firstOrFail();
        }

        /* =====================================================
           CASH
        ===================================================== */

        $cash =
            $this->ensureCashAccount(
                $member
            );

        return MemberCashAccount::query()
            ->where(
                'member_id',
                $member->id
            )
            ->whereKey(
                $cash->id
            )
            ->lockForUpdate()
            ->firstOrFail();
    }

    /* =========================================================
       ACCOUNT RESPONSE
    ========================================================= */

    private function accountResponse(
        string $type,
        Model $account
    ): array {
        return [
            'type' =>
                $type,

            'id' =>
                $account->id,

            'name' =>
                $account->name,

            'balance' =>
                (string)
                $account->balance,

            'currency' =>
                $account->currency,
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

        $transfers =
            MemberTransfer::query()
                ->with([
                    'fromMemberCard',
                    'toMemberCard',

                    'fromCashAccount',
                    'toCashAccount',
                ])
                ->where(
                    'member_id',
                    $member->id
                )
                ->latest()
                ->limit(100)
                ->get();

        $data =
            $transfers->map(
                function (
                    MemberTransfer $transfer
                ) {
                    $fromName =
                        $transfer->from_type ===
                        'card'
                            ? $transfer
                                ->fromMemberCard
                                ?->name
                            : $transfer
                                ->fromCashAccount
                                ?->name;

                    $toName =
                        $transfer->to_type ===
                        'card'
                            ? $transfer
                                ->toMemberCard
                                ?->name
                            : $transfer
                                ->toCashAccount
                                ?->name;

                    return [
                        'id' =>
                            $transfer->id,

                        'from_type' =>
                            $transfer
                                ->from_type,

                        'from_name' =>
                            $fromName,

                        'to_type' =>
                            $transfer
                                ->to_type,

                        'to_name' =>
                            $toName,

                        'amount' =>
                            (string)
                            $transfer
                                ->amount,

                        'note' =>
                            $transfer
                                ->note,

                        'created_at' =>
                            $transfer
                                ->created_at
                                ?->toISOString(),
                    ];
                }
            );

        return response()->json([
            'data' =>
                $data,
        ]);
    }

    /* =========================================================
       STORE TRANSFER

       Examples:

       CARD -> CASH
       {
           "from_type": "card",
           "from_id": 1,
           "to_type": "cash",
           "amount": 10000
       }

       CASH -> CARD
       {
           "from_type": "cash",
           "to_type": "card",
           "to_id": 1,
           "amount": 5000
       }
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
                'from_type' => [
                    'required',
                    Rule::in([
                        'card',
                        'cash',
                    ]),
                ],

                'from_id' => [
                    'nullable',
                    'integer',
                ],

                'to_type' => [
                    'required',
                    Rule::in([
                        'card',
                        'cash',
                    ]),
                ],

                'to_id' => [
                    'nullable',
                    'integer',
                ],

                'amount' => [
                    'required',
                    'numeric',
                    'min:0.01',
                    'max:9999999999999.99',
                ],

                'note' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
            ]);

        /* =====================================================
           CARD IDS REQUIRED FOR CARD TYPE
        ===================================================== */

        if (
            $validated[
                'from_type'
            ] === 'card'
            &&
            empty(
                $validated[
                    'from_id'
                ]
            )
        ) {
            throw ValidationException::withMessages([
                'from_id' => [
                    'Source card is required.',
                ],
            ]);
        }

        if (
            $validated[
                'to_type'
            ] === 'card'
            &&
            empty(
                $validated[
                    'to_id'
                ]
            )
        ) {
            throw ValidationException::withMessages([
                'to_id' => [
                    'Destination card is required.',
                ],
            ]);
        }

        /* =====================================================
           SAME ACCOUNT
        ===================================================== */

        if (
            $validated[
                'from_type'
            ] ===
            $validated[
                'to_type'
            ]
        ) {
            if (
                $validated[
                    'from_type'
                ] === 'cash'
            ) {
                throw ValidationException::withMessages([
                    'to_type' => [
                        'Source and destination cannot be the same account.',
                    ],
                ]);
            }

            if (
                (int)
                $validated[
                    'from_id'
                ]
                ===
                (int)
                $validated[
                    'to_id'
                ]
            ) {
                throw ValidationException::withMessages([
                    'to_id' => [
                        'Source and destination cannot be the same card.',
                    ],
                ]);
            }
        }

        /* =====================================================
           AMOUNT
        ===================================================== */

        $amountCents =
            Money::toCents(
                $validated[
                    'amount'
                ]
            );

        /* =====================================================
           TRANSACTION
        ===================================================== */

        $result =
            DB::transaction(
                function () use (
                    $member,
                    $validated,
                    $amountCents
                ) {
                    /* =========================================
                       SOURCE
                    ========================================= */

                    $fromAccount =
                        $this->resolveAccount(
                            $member,
                            $validated[
                                'from_type'
                            ],
                            isset(
                                $validated[
                                    'from_id'
                                ]
                            )
                                ? (int)
                                $validated[
                                    'from_id'
                                ]
                                : null
                        );

                    /* =========================================
                       DESTINATION
                    ========================================= */

                    $toAccount =
                        $this->resolveAccount(
                            $member,
                            $validated[
                                'to_type'
                            ],
                            isset(
                                $validated[
                                    'to_id'
                                ]
                            )
                                ? (int)
                                $validated[
                                    'to_id'
                                ]
                                : null
                        );

                    /* =========================================
                       BALANCES
                    ========================================= */

                    $fromBalanceCents =
                        Money::toCents(
                            $fromAccount
                                ->balance
                        );

                    $toBalanceCents =
                        Money::toCents(
                            $toAccount
                                ->balance
                        );

                    /* =========================================
                       INSUFFICIENT MONEY
                    ========================================= */

                    if (
                        $fromBalanceCents
                        <
                        $amountCents
                    ) {
                        throw ValidationException::withMessages([
                            'amount' => [
                                'Insufficient balance.',
                            ],
                        ]);
                    }

                    /* =========================================
                       CALCULATE
                    ========================================= */

                    $newFromBalance =
                        $fromBalanceCents
                        -
                        $amountCents;

                    $newToBalance =
                        $toBalanceCents
                        +
                        $amountCents;

                    /* =========================================
                       SAVE SOURCE
                    ========================================= */

                    $fromAccount->balance =
                        Money::fromCents(
                            $newFromBalance
                        );

                    $fromAccount->save();

                    /* =========================================
                       SAVE DESTINATION
                    ========================================= */

                    $toAccount->balance =
                        Money::fromCents(
                            $newToBalance
                        );

                    $toAccount->save();

                    /* =========================================
                       TRANSFER HISTORY
                    ========================================= */

                    $transfer =
                        MemberTransfer::create([
                            'member_id' =>
                                $member->id,

                            'from_type' =>
                                $validated[
                                    'from_type'
                                ],

                            'from_member_card_id' =>
                                $validated[
                                    'from_type'
                                ] === 'card'
                                    ? $fromAccount
                                        ->id
                                    : null,

                            'from_cash_account_id' =>
                                $validated[
                                    'from_type'
                                ] === 'cash'
                                    ? $fromAccount
                                        ->id
                                    : null,

                            'to_type' =>
                                $validated[
                                    'to_type'
                                ],

                            'to_member_card_id' =>
                                $validated[
                                    'to_type'
                                ] === 'card'
                                    ? $toAccount
                                        ->id
                                    : null,

                            'to_cash_account_id' =>
                                $validated[
                                    'to_type'
                                ] === 'cash'
                                    ? $toAccount
                                        ->id
                                    : null,

                            'amount' =>
                                Money::fromCents(
                                    $amountCents
                                ),

                            'note' =>
                                isset(
                                    $validated[
                                        'note'
                                    ]
                                )
                                    ? trim(
                                        $validated[
                                            'note'
                                        ]
                                    )
                                    : null,
                        ]);

                    return [
                        'transfer' =>
                            $transfer,

                        'from' =>
                            $this->accountResponse(
                                $validated[
                                    'from_type'
                                ],
                                $fromAccount
                            ),

                        'to' =>
                            $this->accountResponse(
                                $validated[
                                    'to_type'
                                ],
                                $toAccount
                            ),
                    ];
                }
            );

        /* =====================================================
           RESPONSE
        ===================================================== */

        return response()->json([
            'message' =>
                'Transfer completed successfully.',

            'data' => [
                'transfer' => [
                    'id' =>
                        $result[
                            'transfer'
                        ]->id,

                    'amount' =>
                        (string)
                        $result[
                            'transfer'
                        ]->amount,

                    'note' =>
                        $result[
                            'transfer'
                        ]->note,

                    'created_at' =>
                        $result[
                            'transfer'
                        ]
                            ->created_at
                            ?->toISOString(),
                ],

                'from' =>
                    $result[
                        'from'
                    ],

                'to' =>
                    $result[
                        'to'
                    ],
            ],
        ], 201);
    }
}