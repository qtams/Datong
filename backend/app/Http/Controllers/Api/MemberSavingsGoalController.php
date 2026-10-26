<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveSavingsGoalRequest;
use App\Http\Requests\TransferSavingsGoalRequest;
use App\Models\Member;
use App\Models\MemberCashAccount;
use App\Models\MemberSavingsGoal;
use App\Models\MemberSavingsGoalEntry;
use App\Services\CloudinaryService;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class MemberSavingsGoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = MemberSavingsGoal::query()
            ->where('member_id', $this->member($request)->id)
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $goals->map(fn (MemberSavingsGoal $goal): array => $this->goalResponse($goal)),
            'meta' => ['max_goals' => MemberSavingsGoal::MAX_GOALS],
        ]);
    }

    public function show(Request $request, int $savingsGoalId): JsonResponse
    {
        $goal = MemberSavingsGoal::query()
            ->where('member_id', $this->member($request)->id)
            ->whereKey($savingsGoalId)
            ->firstOrFail();

        return response()->json(['data' => $this->goalResponse($goal)]);
    }

    public function store(SaveSavingsGoalRequest $request): JsonResponse
    {
        return $this->persist($request);
    }

    public function entries(Request $request, int $savingsGoalId): JsonResponse
    {
        $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);
        $member = $this->member($request);
        $goal = MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($savingsGoalId)->firstOrFail();
        $entries = $goal->entries()->where('member_id', $member->id)->latest('id')->simplePaginate(20);

        return response()->json([
            'data' => $entries->getCollection()->map(fn (MemberSavingsGoalEntry $entry): array => $this->entryResponse($entry)),
            'meta' => ['current_page' => $entries->currentPage(), 'has_more' => $entries->hasMorePages()],
        ]);
    }

    public function transfer(TransferSavingsGoalRequest $request, int $savingsGoalId): JsonResponse
    {
        $member = $this->member($request);
        $values = $request->validated();
        MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($savingsGoalId)->firstOrFail();
        $amount = Money::toCents($values['amount']);

        $result = DB::transaction(function () use ($member, $savingsGoalId, $values, $amount): array {
            Member::query()->whereKey($member->id)->lockForUpdate()->firstOrFail();
            $cash = $this->lockedWallet($member);
            $goal = MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($savingsGoalId)->lockForUpdate()->firstOrFail();
            $this->assertVersion($goal, (int) $values['version']);

            $walletBalance = Money::toCents($cash->balance);
            $goalBalance = Money::toCents($goal->balance);
            $incoming = $values['direction'] === 'in';

            if ($incoming && $amount > $walletBalance) {
                throw ValidationException::withMessages(['amount' => ['The amount exceeds your Datong Wallet balance.']]);
            }

            if (! $incoming && $amount > $goalBalance) {
                throw ValidationException::withMessages(['amount' => ['The amount exceeds this savings goal balance.']]);
            }

            $nextGoalBalance = $incoming ? $goalBalance + $amount : $goalBalance - $amount;
            $nextWalletBalance = $incoming ? $walletBalance - $amount : $walletBalance + $amount;

            if ($nextGoalBalance > MemberSavingsGoal::MAX_BALANCE_CENTS) {
                throw ValidationException::withMessages(['amount' => ['This would exceed the savings goal balance limit.']]);
            }

            $this->assertWalletCapacity($nextWalletBalance, 'amount');
            $goal->balance = Money::fromCents($nextGoalBalance);
            $goal->version++;
            $goal->save();
            $cash->balance = Money::fromCents($nextWalletBalance);
            $cash->save();
            $entry = $this->recordEntry($goal, $cash, $incoming ? 'deposit' : 'withdrawal', $amount);

            return ['goal' => $goal, 'wallet' => $cash, 'entry' => $entry];
        });

        return response()->json([
            'message' => $values['direction'] === 'in' ? 'Money transferred into your goal.' : 'Money returned to your Datong Wallet.',
            'data' => [
                'goal' => $this->goalResponse($result['goal']),
                'wallet' => $this->walletResponse($result['wallet']),
                'entry' => $this->entryResponse($result['entry']),
            ],
        ]);
    }

    public function update(SaveSavingsGoalRequest $request, int $savingsGoalId): JsonResponse
    {
        return $this->persist($request, $savingsGoalId);
    }

    private function persist(SaveSavingsGoalRequest $request, ?int $goalId = null): JsonResponse
    {
        $member = $this->member($request);
        $values = $request->validated();

        if ($goalId !== null) {
            $existingGoal = MemberSavingsGoal::query()
                ->where('member_id', $member->id)
                ->whereKey($goalId)
                ->firstOrFail();
            $this->assertVersion($existingGoal, (int) $values['version']);
        }

        $image = null;

        try {
            if ($request->hasFile('image')) {
                $image = $this->uploadImage($request->file('image'), $member);
            }

            $result = DB::transaction(function () use ($member, $values, $goalId, $image): array {
                // Serialize the goal limit and use the same member -> wallet -> goal lock order for every mutation.
                Member::query()->whereKey($member->id)->lockForUpdate()->firstOrFail();

                if ($goalId === null && MemberSavingsGoal::query()->where('member_id', $member->id)->count() >= MemberSavingsGoal::MAX_GOALS) {
                    throw ValidationException::withMessages(['name' => ['You can create up to 6 savings goals.']]);
                }

                $cash = $this->lockedWallet($member);
                $goal = $goalId === null
                    ? new MemberSavingsGoal(['member_id' => $member->id])
                    : MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($goalId)->lockForUpdate()->firstOrFail();

                if ($goal->exists) {
                    $this->assertVersion($goal, (int) $values['version']);
                }

                $previousBalance = Money::toCents($goal->balance ?? '0.00');
                $nextBalance = Money::toCents($values['current_amount']);
                $difference = $nextBalance - $previousBalance;
                $walletBalance = Money::toCents($cash->balance);

                if ($difference > $walletBalance) {
                    throw ValidationException::withMessages(['current_amount' => ['The amount exceeds your current Datong Wallet balance.']]);
                }

                $nextWalletBalance = $walletBalance - $difference;
                $this->assertWalletCapacity($nextWalletBalance);

                $oldImageId = $goal->image_public_id;
                $goal->fill([
                    'name' => $values['name'],
                    'icon_id' => $values['icon_id'],
                    'target_amount' => Money::fromCents(Money::toCents($values['target_amount'])),
                    'balance' => Money::fromCents($nextBalance),
                    'currency' => 'PHP',
                    'target_date' => $values['target_date'] ?? null,
                    'version' => $goal->exists ? $goal->version + 1 : 1,
                ]);

                if ($image !== null) {
                    $goal->image_public_id = $image['public_id'];
                    $goal->image_url = $image['secure_url'];
                } elseif ($values['remove_image'] ?? false) {
                    $goal->image_public_id = null;
                    $goal->image_url = null;
                }

                $goal->save();

                if ($difference !== 0) {
                    $cash->balance = Money::fromCents($nextWalletBalance);
                    $cash->save();
                    $this->recordEntry($goal, $cash, $difference > 0 ? 'deposit' : 'withdrawal', abs($difference));
                }

                return ['goal' => $goal, 'wallet' => $cash, 'old_image_id' => $oldImageId];
            });
        } catch (Throwable $error) {
            $this->deleteImage($image['public_id'] ?? null);
            throw $error;
        }

        if ($result['old_image_id'] !== $result['goal']->image_public_id) {
            $this->deleteImage($result['old_image_id']);
        }

        return response()->json([
            'message' => $goalId === null ? 'Savings goal opened.' : 'Savings goal updated.',
            'data' => [
                'goal' => $this->goalResponse($result['goal']),
                'wallet' => $this->walletResponse($result['wallet']),
            ],
        ], $goalId === null ? 201 : 200);
    }

    public function destroy(Request $request, int $savingsGoalId): JsonResponse
    {
        $member = $this->member($request);
        MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($savingsGoalId)->firstOrFail();
        $values = $request->validate(['version' => ['required', 'integer', 'min:1']]);

        $result = DB::transaction(function () use ($member, $savingsGoalId, $values): array {
            Member::query()->whereKey($member->id)->lockForUpdate()->firstOrFail();
            $cash = $this->lockedWallet($member);
            $goal = MemberSavingsGoal::query()->where('member_id', $member->id)->whereKey($savingsGoalId)->lockForUpdate()->firstOrFail();
            $this->assertVersion($goal, (int) $values['version']);

            $refund = Money::toCents($goal->balance);
            $walletBalance = Money::toCents($cash->balance) + $refund;
            $this->assertWalletCapacity($walletBalance);

            $goal->balance = '0.00';
            $goal->version++;
            $goal->save();

            if ($refund > 0) {
                $cash->balance = Money::fromCents($walletBalance);
                $cash->save();
                $this->recordEntry($goal, $cash, 'refund', $refund);
            }

            $goal->delete();

            return ['wallet' => $cash, 'image_id' => $goal->image_public_id];
        });

        $this->deleteImage($result['image_id']);

        return response()->json([
            'message' => 'Savings goal deleted. Its saved amount was returned to your Datong Wallet.',
            'data' => ['wallet' => $this->walletResponse($result['wallet'])],
        ]);
    }

    private function member(Request $request): Member
    {
        return $request->attributes->get('member');
    }

    private function lockedWallet(Member $member): MemberCashAccount
    {
        $cash = MemberCashAccount::firstOrCreate(
            ['member_id' => $member->id],
            ['name' => 'On-hand Cash', 'balance' => '0.00', 'currency' => 'PHP'],
        );

        $cash = MemberCashAccount::query()->whereKey($cash->id)->lockForUpdate()->firstOrFail();

        if ($cash->currency !== 'PHP') {
            throw ValidationException::withMessages(['current_amount' => ['Savings goals require a PHP wallet.']]);
        }

        return $cash;
    }

    private function assertVersion(MemberSavingsGoal $goal, int $version): void
    {
        abort_if($goal->version !== $version, 409, 'This goal was changed in another session. Reload your goals before trying again.');
    }

    private function assertWalletCapacity(int $balance, string $field = 'current_amount'): void
    {
        if ($balance > MemberSavingsGoal::MAX_BALANCE_CENTS) {
            throw ValidationException::withMessages([$field => ['Returning this amount would exceed your wallet balance limit.']]);
        }
    }

    private function recordEntry(MemberSavingsGoal $goal, MemberCashAccount $cash, string $type, int $amount): MemberSavingsGoalEntry
    {
        return $goal->entries()->create([
            'member_id' => $goal->member_id,
            'member_cash_account_id' => $cash->id,
            'type' => $type,
            'amount' => Money::fromCents($amount),
            'goal_balance_after' => $goal->balance,
            'wallet_balance_after' => $cash->balance,
        ]);
    }

    /** @return array<string, mixed> */
    private function entryResponse(MemberSavingsGoalEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'type' => $entry->type,
            'amount' => $entry->amount,
            'goal_balance_after' => $entry->goal_balance_after,
            'wallet_balance_after' => $entry->wallet_balance_after,
            'created_at' => $entry->created_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function goalResponse(MemberSavingsGoal $goal): array
    {
        return [
            'id' => $goal->id,
            'name' => $goal->name,
            'icon_id' => $goal->icon_id,
            'image_url' => $goal->image_url,
            'target_amount' => $goal->target_amount,
            'current_amount' => $goal->balance,
            'target_date' => $goal->target_date?->format('Y-m-d'),
            'currency' => $goal->currency,
            'version' => $goal->version,
            'created_at' => $goal->created_at?->toISOString(),
            'updated_at' => $goal->updated_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function walletResponse(MemberCashAccount $cash): array
    {
        return [
            'id' => $cash->id,
            'name' => $cash->name,
            'balance' => $cash->balance,
            'currency' => $cash->currency,
            'updated_at' => $cash->updated_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function uploadImage(UploadedFile $file, Member $member): array
    {
        try {
            return app(CloudinaryService::class)->uploadImage($file, 'datong/savings-goals/'.$member->id);
        } catch (Throwable $error) {
            report($error);
            abort(502, 'Unable to upload the goal photo. Try again.');
        }
    }

    private function deleteImage(?string $publicId): void
    {
        if ($publicId === null) {
            return;
        }

        try {
            if (! app(CloudinaryService::class)->deleteImage($publicId)) {
                report(new \RuntimeException('Unable to clean up a savings goal photo.'));
            }
        } catch (Throwable $error) {
            report($error);
        }
    }
}
