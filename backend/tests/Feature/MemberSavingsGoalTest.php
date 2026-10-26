<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MemberCashAccount;
use App\Models\MemberSavingsGoal;
use App\Models\MemberSavingsGoalEntry;
use App\Models\User;
use App\Services\CloudinaryService;
use Database\Factories\MemberFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Kreait\Firebase\Contract\Auth;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Lcobucci\JWT\Token\DataSet;
use Lcobucci\JWT\UnencryptedToken;
use LogicException;
use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class MemberSavingsGoalTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/member-finance/savings-goals';

    private Member $member;

    private MemberCashAccount $wallet;

    private Auth&MockInterface $firebaseAuth;

    protected function beforeRefreshingDatabase(): void
    {
        if (! $this->app->environment('testing')
            || config('database.default') !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
            || ! empty(config('database.connections.sqlite.url'))) {
            throw new LogicException('These financial tests require an isolated in-memory SQLite database.');
        }
    }

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.debug' => false]);

        $this->member = MemberFactory::new()->create();
        $this->wallet = MemberCashAccount::query()->create([
            'member_id' => $this->member->id,
            'name' => 'On-hand Cash',
            'balance' => '1000.00',
            'currency' => 'PHP',
        ]);

        $token = Mockery::mock(UnencryptedToken::class);
        $token->shouldReceive('claims')->andReturn(new DataSet(['sub' => $this->member->firebase_uid], ''));
        $this->firebaseAuth = Mockery::mock(Auth::class);
        $this->firebaseAuth->shouldReceive('verifyIdToken')->with('valid-member-token')->andReturn($token);
        Firebase::shouldReceive('auth')->andReturn($this->firebaseAuth);
        $this->withToken('valid-member-token');
    }

    public function test_creation_funds_the_goal_and_preserves_total_money(): void
    {
        $other = MemberFactory::new()->create();
        $response = $this->postJson(self::ENDPOINT, $this->values(['member_id' => $other->id]));

        $response->assertCreated()
            ->assertJsonPath('data.goal.name', 'Emergency fund')
            ->assertJsonPath('data.goal.current_amount', '125.35')
            ->assertJsonPath('data.goal.target_amount', '2500.00')
            ->assertJsonPath('data.goal.target_date', '2030-12-01')
            ->assertJsonPath('data.goal.version', 1)
            ->assertJsonPath('data.wallet.balance', '874.65');

        $this->assertDatabaseHas('member_savings_goals', ['id' => $response->json('data.goal.id'), 'member_id' => $this->member->id]);
        $this->assertDatabaseHas('member_savings_goal_entries', [
            'member_id' => $this->member->id,
            'type' => 'deposit',
            'amount' => '125.35',
            'goal_balance_after' => '125.35',
            'wallet_balance_after' => '874.65',
        ]);
        $this->getJson('/api/member-finance/summary')->assertOk()
            ->assertJsonPath('data.savings', '125.35')
            ->assertJsonPath('data.actual_money', '874.65')
            ->assertJsonPath('data.total_money', '1000.00');
    }

    public function test_goal_can_start_from_zero_with_an_empty_wallet(): void
    {
        $this->wallet->update(['balance' => '0.00']);
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '0', 'target_date' => null]))
            ->assertCreated()->assertJsonPath('data.wallet.balance', '0.00')->assertJsonPath('data.goal.target_date', null);
        $this->assertDatabaseCount('member_savings_goal_entries', 0);
    }

    public function test_entire_wallet_can_be_reserved_without_rounding_loss(): void
    {
        $goal = $this->createGoal('1000.00');
        $this->assertSame('1000.00', $goal->balance);
        $this->assertSame('0.00', $this->wallet->fresh()->balance);
    }

    public function test_increasing_reducing_and_editing_a_goal_use_only_the_balance_difference(): void
    {
        $goal = $this->createGoal();
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['current_amount' => '200.10', 'version' => 1]))
            ->assertOk()->assertJsonPath('data.wallet.balance', '799.90')->assertJsonPath('data.goal.version', 2);
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['current_amount' => '40.05', 'version' => 2]))
            ->assertOk()->assertJsonPath('data.wallet.balance', '959.95')->assertJsonPath('data.goal.version', 3);
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['name' => 'Travel', 'current_amount' => '40.05', 'version' => 3]))
            ->assertOk()->assertJsonPath('data.wallet.balance', '959.95')->assertJsonPath('data.goal.name', 'Travel');
        $this->assertDatabaseCount('member_savings_goal_entries', 3);
        $this->assertDatabaseHas('member_savings_goal_entries', ['type' => 'withdrawal', 'amount' => '160.05']);
    }

    public function test_insufficient_funds_leave_creation_and_update_unchanged(): void
    {
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '1000.01']))
            ->assertUnprocessable()->assertJsonValidationErrors('current_amount');
        $this->assertDatabaseCount('member_savings_goals', 0);
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);

        $goal = $this->createGoal();
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['current_amount' => '1000.01', 'version' => 1]))
            ->assertUnprocessable()->assertJsonValidationErrors('current_amount');
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 1);
    }

    public function test_deletion_refunds_once_and_retains_financial_history(): void
    {
        $goal = $this->createGoal();
        $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])
            ->assertOk()->assertJsonPath('data.wallet.balance', '1000.00');
        $this->assertSoftDeleted($goal);
        $this->assertSame('0.00', $goal->fresh()->balance);
        $this->assertDatabaseHas('member_savings_goal_entries', ['type' => 'refund', 'amount' => '125.35']);
        $this->assertTrue(MemberSavingsGoalEntry::query()->firstOrFail()->goal->trashed());

        $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])->assertNotFound();
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 2);
        $this->getJson(self::ENDPOINT)->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/member-finance/summary')->assertOk()
            ->assertJsonPath('data.savings', '0.00')->assertJsonPath('data.total_money', '1000.00');
    }

    public function test_six_goal_limit_is_enforced_and_deleted_slots_can_be_reused(): void
    {
        $goals = MemberSavingsGoal::factory()->count(6)->create(['member_id' => $this->member->id]);
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '0']))
            ->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
        $this->deleteJson(self::ENDPOINT.'/'.$goals->first()->id, ['version' => 1])->assertOk();
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '0']))->assertCreated();
        $this->assertSame(6, MemberSavingsGoal::query()->where('member_id', $this->member->id)->count());
    }

    public function test_other_members_goals_are_not_listed_or_accessible(): void
    {
        $foreignGoal = MemberSavingsGoal::factory()->create();
        $this->getJson(self::ENDPOINT)->assertOk()->assertJsonCount(0, 'data');
        $this->getJson(self::ENDPOINT.'/'.$foreignGoal->id)->assertNotFound();
        $this->putJson(self::ENDPOINT.'/'.$foreignGoal->id, $this->values(['version' => 1]))->assertNotFound();
        $this->deleteJson(self::ENDPOINT.'/'.$foreignGoal->id, ['version' => 1])->assertNotFound();
        $this->assertSame('0.00', $foreignGoal->fresh()->balance);
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
    }

    public function test_stale_updates_and_deletes_cannot_overwrite_a_newer_balance(): void
    {
        $goal = $this->createGoal();
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['current_amount' => '200.00', 'version' => 1]))->assertOk();
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['current_amount' => '500.00', 'version' => 1]))->assertConflict();
        $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])->assertConflict();
        $this->assertSame('200.00', $goal->fresh()->balance);
        $this->assertSame('800.00', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 2);
    }

    public function test_updates_require_a_version(): void
    {
        $goal = $this->createGoal();
        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values())->assertUnprocessable()->assertJsonValidationErrors('version');
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
    }

    public function test_member_authentication_is_required_even_with_an_internal_session(): void
    {
        $this->withHeader('Authorization', '');
        $this->actingAs((new User)->forceFill(['id' => 123]));
        $this->getJson(self::ENDPOINT)->assertUnauthorized();
        $this->postJson(self::ENDPOINT, $this->values())->assertUnauthorized();
        $this->putJson(self::ENDPOINT.'/1', $this->values(['version' => 1]))->assertUnauthorized();
        $this->deleteJson(self::ENDPOINT.'/1', ['version' => 1])->assertUnauthorized();
        $this->assertDatabaseCount('member_savings_goals', 0);
    }

    public function test_invalid_firebase_tokens_are_rejected(): void
    {
        $this->firebaseAuth->shouldReceive('verifyIdToken')->with('invalid-token')->andThrow(new RuntimeException('Invalid token'));
        $this->withToken('invalid-token')->getJson(self::ENDPOINT)->assertUnauthorized();
    }

    public function test_a_failure_recording_history_rolls_back_goal_and_wallet_changes(): void
    {
        MemberSavingsGoalEntry::creating(static function (): void {
            throw new RuntimeException('History storage failed');
        });

        try {
            $this->postJson(self::ENDPOINT, $this->values())->assertInternalServerError();
        } finally {
            MemberSavingsGoalEntry::flushEventListeners();
        }

        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goals', 0);
        $this->assertDatabaseCount('member_savings_goal_entries', 0);
    }

    public function test_a_refund_history_failure_rolls_back_the_deletion(): void
    {
        $goal = $this->createGoal();
        MemberSavingsGoalEntry::creating(static function (): void {
            throw new RuntimeException('History storage failed');
        });

        try {
            $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])->assertInternalServerError();
        } finally {
            MemberSavingsGoalEntry::flushEventListeners();
        }

        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertFalse($goal->fresh()->trashed());
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 1);
    }

    public function test_a_refund_cannot_overflow_the_wallet(): void
    {
        $goal = $this->createGoal();
        $this->wallet->update(['balance' => '9999999999999.99']);

        $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('current_amount');
        $this->assertFalse($goal->fresh()->trashed());
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('9999999999999.99', $this->wallet->fresh()->balance);
    }

    public function test_large_wallet_and_goal_balances_retain_cents_through_funding_withdrawal_and_refund(): void
    {
        $maximum = '9999999999999.99';
        $this->wallet->update(['balance' => $maximum]);
        $response = $this->postJson(self::ENDPOINT, $this->values(['current_amount' => $maximum, 'target_amount' => $maximum]));
        $response->assertCreated()->assertJsonPath('data.wallet.balance', '0.00');
        $goalId = $response->json('data.goal.id');
        $this->getJson(self::ENDPOINT.'/'.$goalId)->assertOk()
            ->assertJsonPath('data.current_amount', $maximum)->assertJsonPath('data.target_amount', $maximum);
        $this->getJson('/api/member-finance/summary')->assertOk()->assertJsonPath('data.total_money', $maximum);

        $this->putJson(self::ENDPOINT.'/'.$goalId, $this->values(['current_amount' => '9999999999999.98', 'version' => 1]))
            ->assertOk()->assertJsonPath('data.wallet.balance', '0.01');
        $this->deleteJson(self::ENDPOINT.'/'.$goalId, ['version' => 2])
            ->assertOk()->assertJsonPath('data.wallet.balance', $maximum);
        $this->assertSame($maximum, $this->wallet->fresh()->balance);
        $this->assertSame($maximum, MemberSavingsGoalEntry::query()->latest('id')->firstOrFail()->wallet_balance_after);
    }

    public function test_multipart_creation_without_a_photo_matches_the_frontend_contract(): void
    {
        $this->post(self::ENDPOINT, $this->values(['remove_image' => '1', 'target_date' => '']), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.goal.image_url', null)->assertJsonPath('data.goal.target_date', null);
    }

    public function test_an_edit_that_becomes_stale_during_photo_upload_is_rechecked_before_money_moves(): void
    {
        $goal = $this->createGoal();
        $this->mock(CloudinaryService::class, function (MockInterface $mock) use ($goal): void {
            $mock->shouldReceive('uploadImage')->once()->andReturnUsing(function () use ($goal): array {
                $goal->increment('version');

                return ['public_id' => 'new-photo', 'secure_url' => 'https://example.com/new.jpg'];
            });
            $mock->shouldReceive('deleteImage')->once()->with('new-photo')->andReturnTrue();
        });

        $this->post(self::ENDPOINT.'/'.$goal->id, $this->values([
            '_method' => 'PUT', 'version' => 1, 'current_amount' => '200.00', 'image' => UploadedFile::fake()->image('new.jpg'),
        ]), ['Accept' => 'application/json'])->assertConflict();
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 1);
    }

    public function test_another_members_goal_count_does_not_use_this_members_slots(): void
    {
        $other = MemberFactory::new()->create();
        MemberSavingsGoal::factory()->count(6)->create(['member_id' => $other->id]);
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '0']))->assertCreated();
    }

    public function test_a_zero_balance_goal_can_create_the_members_first_wallet(): void
    {
        $this->wallet->delete();
        $this->postJson(self::ENDPOINT, $this->values(['current_amount' => '0']))
            ->assertCreated()->assertJsonPath('data.wallet.balance', '0.00');
        $this->assertDatabaseCount('member_cash_accounts', 1);
    }

    public function test_goal_photos_use_cloudinary_and_multipart_updates_keep_them_when_unchanged(): void
    {
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('uploadImage')->once()
                ->with(Mockery::type(UploadedFile::class), 'datong/savings-goals/'.$this->member->id)
                ->andReturn(['public_id' => 'goal-photo', 'secure_url' => 'https://example.com/goal.jpg']);
            $mock->shouldNotReceive('deleteImage');
        });

        $response = $this->post(self::ENDPOINT, $this->values(['image' => UploadedFile::fake()->image('goal.jpg')]), ['Accept' => 'application/json']);
        $response->assertCreated()->assertJsonPath('data.goal.image_url', 'https://example.com/goal.jpg');
        $goalId = $response->json('data.goal.id');

        $this->post(self::ENDPOINT.'/'.$goalId, $this->values(['_method' => 'PUT', 'version' => 1]), ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.goal.image_url', 'https://example.com/goal.jpg');
        $this->getJson(self::ENDPOINT.'/'.$goalId)->assertOk()->assertJsonPath('data.image_url', 'https://example.com/goal.jpg');
    }

    public function test_photo_replacement_updates_the_record_before_removing_the_old_asset(): void
    {
        $goal = $this->createGoal();
        $goal->update(['image_public_id' => 'old-photo', 'image_url' => 'https://example.com/old.jpg']);
        $this->mock(CloudinaryService::class, function (MockInterface $mock) use ($goal): void {
            $mock->shouldReceive('uploadImage')->once()->andReturn(['public_id' => 'new-photo', 'secure_url' => 'https://example.com/new.jpg']);
            $mock->shouldReceive('deleteImage')->once()->with('old-photo')->andReturnUsing(function () use ($goal): bool {
                $this->assertSame('new-photo', $goal->fresh()->image_public_id);

                return true;
            });
        });

        $this->post(self::ENDPOINT.'/'.$goal->id, $this->values([
            '_method' => 'PUT', 'version' => 1, 'image' => UploadedFile::fake()->image('new.jpg'),
        ]), ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.goal.image_url', 'https://example.com/new.jpg');
    }

    public function test_a_new_photo_is_cleaned_up_if_the_financial_update_is_rejected(): void
    {
        $goal = $this->createGoal();
        $goal->update(['image_public_id' => 'old-photo', 'image_url' => 'https://example.com/old.jpg']);
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('uploadImage')->once()->andReturn(['public_id' => 'new-photo', 'secure_url' => 'https://example.com/new.jpg']);
            $mock->shouldReceive('deleteImage')->once()->with('new-photo')->andReturnTrue();
        });

        $this->post(self::ENDPOINT.'/'.$goal->id, $this->values([
            '_method' => 'PUT', 'version' => 1, 'current_amount' => '1000.01', 'image' => UploadedFile::fake()->image('new.jpg'),
        ]), ['Accept' => 'application/json'])->assertUnprocessable();

        $this->assertSame('old-photo', $goal->fresh()->image_public_id);
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
    }

    public function test_photo_removal_preserves_the_goal_and_wallet_balances(): void
    {
        $goal = $this->createGoal();
        $goal->update(['image_public_id' => 'old-photo', 'image_url' => 'https://example.com/old.jpg']);
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('deleteImage')->once()->with('old-photo')->andReturnTrue();
            $mock->shouldNotReceive('uploadImage');
        });

        $this->putJson(self::ENDPOINT.'/'.$goal->id, $this->values(['version' => 1, 'remove_image' => true]))
            ->assertOk()->assertJsonPath('data.goal.image_url', null)->assertJsonPath('data.wallet.balance', '874.65');
    }

    public function test_failed_photo_uploads_do_not_move_money(): void
    {
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('uploadImage')->once()->andThrow(new RuntimeException('Storage unavailable'));
        });
        $this->post(self::ENDPOINT, $this->values(['image' => UploadedFile::fake()->image('goal.jpg')]), ['Accept' => 'application/json'])
            ->assertStatus(502);
        $this->assertDatabaseCount('member_savings_goals', 0);
        $this->assertDatabaseCount('member_savings_goal_entries', 0);
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
    }

    public function test_photo_cleanup_failure_does_not_fail_an_already_committed_refund(): void
    {
        $goal = $this->createGoal();
        $goal->update(['image_public_id' => 'old-photo']);
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('deleteImage')->once()->with('old-photo')->andThrow(new RuntimeException('Storage unavailable'));
        });

        $this->deleteJson(self::ENDPOINT.'/'.$goal->id, ['version' => 1])
            ->assertOk()->assertJsonPath('data.wallet.balance', '1000.00');
        $this->assertSoftDeleted($goal);
        $this->assertDatabaseHas('member_savings_goal_entries', ['type' => 'refund', 'amount' => '125.35']);
    }

    public function test_non_image_uploads_are_rejected_before_storage_is_called(): void
    {
        $this->mock(CloudinaryService::class, function (MockInterface $mock): void {
            $mock->shouldNotReceive('uploadImage');
        });
        $this->post(self::ENDPOINT, $this->values(['image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf')]), ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
    }

    #[DataProvider('invalidGoalValues')]
    public function test_invalid_goal_values_are_rejected(string $field, mixed $value): void
    {
        $this->postJson(self::ENDPOINT, $this->values([$field => $value]))
            ->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertDatabaseCount('member_savings_goals', 0);
        $this->assertDatabaseCount('member_savings_goal_entries', 0);
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
    }

    public static function invalidGoalValues(): array
    {
        return [
            'empty name' => ['name', '   '],
            'long name' => ['name', str_repeat('a', 26)],
            'unknown icon' => ['icon_id', 'unknown'],
            'zero target' => ['target_amount', '0'],
            'negative target' => ['target_amount', '-1.00'],
            'negative balance' => ['current_amount', '-0.01'],
            'excess precision' => ['current_amount', '0.001'],
            'exponent notation' => ['current_amount', '1e2'],
            'amount overflow' => ['current_amount', '10000000000000.00'],
            'target overflow' => ['target_amount', '10000000000000.00'],
            'invalid date' => ['target_date', '2030-02-31'],
        ];
    }

    public function test_explicit_transfers_move_money_in_both_directions_and_record_dates(): void
    {
        $goal = $this->createGoal();
        $url = self::ENDPOINT.'/'.$goal->id.'/transfers';
        $incoming = $this->postJson($url, ['direction' => 'in', 'amount' => '10.05', 'version' => 1]);
        $incoming->assertOk()->assertJsonPath('data.goal.current_amount', '135.40')
            ->assertJsonPath('data.wallet.balance', '864.60')->assertJsonPath('data.goal.version', 2)
            ->assertJsonPath('data.entry.type', 'deposit')->assertJsonPath('data.entry.amount', '10.05');
        $this->assertNotEmpty($incoming->json('data.entry.created_at'));

        $this->postJson($url, ['direction' => 'out', 'amount' => '35.39', 'version' => 2])->assertOk()
            ->assertJsonPath('data.goal.current_amount', '100.01')->assertJsonPath('data.wallet.balance', '899.99')
            ->assertJsonPath('data.entry.type', 'withdrawal')->assertJsonPath('data.entry.amount', '35.39');
        $this->getJson('/api/member-finance/summary')->assertOk()->assertJsonPath('data.total_money', '1000.00');
        $this->getJson(self::ENDPOINT.'/'.$goal->id.'/entries')->assertOk()->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.type', 'withdrawal')->assertJsonPath('data.0.goal_balance_after', '100.01')
            ->assertJsonPath('meta.has_more', false);
    }

    public function test_full_goal_and_wallet_balances_can_be_transferred(): void
    {
        $goal = $this->createGoal();
        $url = self::ENDPOINT.'/'.$goal->id.'/transfers';
        $this->postJson($url, ['direction' => 'out', 'amount' => '125.35', 'version' => 1])
            ->assertOk()->assertJsonPath('data.goal.current_amount', '0.00')->assertJsonPath('data.wallet.balance', '1000.00');
        $this->postJson($url, ['direction' => 'in', 'amount' => '1000.00', 'version' => 2])
            ->assertOk()->assertJsonPath('data.goal.current_amount', '1000.00')->assertJsonPath('data.wallet.balance', '0.00');
    }

    public function test_insufficient_funds_in_either_direction_do_not_change_balances(): void
    {
        $goal = $this->createGoal();
        $url = self::ENDPOINT.'/'.$goal->id.'/transfers';
        $this->postJson($url, ['direction' => 'in', 'amount' => '874.66', 'version' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->postJson($url, ['direction' => 'out', 'amount' => '125.36', 'version' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
        $this->assertSame(1, $goal->fresh()->version);
        $this->assertDatabaseCount('member_savings_goal_entries', 1);
    }

    public function test_replaying_a_transfer_with_the_same_version_cannot_debit_twice(): void
    {
        $goal = $this->createGoal();
        $url = self::ENDPOINT.'/'.$goal->id.'/transfers';
        $values = ['direction' => 'in', 'amount' => '10.00', 'version' => 1];
        $this->postJson($url, $values)->assertOk();
        $this->postJson($url, $values)->assertConflict();
        $this->assertSame('135.35', $goal->fresh()->balance);
        $this->assertSame('864.65', $this->wallet->fresh()->balance);
        $this->assertDatabaseCount('member_savings_goal_entries', 2);
    }

    public function test_transfer_history_failure_rolls_back_both_accounts_and_version(): void
    {
        $goal = $this->createGoal();
        MemberSavingsGoalEntry::creating(static function (): void {
            throw new RuntimeException('History storage failed');
        });
        try {
            $this->postJson(self::ENDPOINT.'/'.$goal->id.'/transfers', ['direction' => 'in', 'amount' => '10.00', 'version' => 1])
                ->assertInternalServerError();
        } finally {
            MemberSavingsGoalEntry::flushEventListeners();
        }
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
        $this->assertSame(1, $goal->fresh()->version);
        $this->assertDatabaseCount('member_savings_goal_entries', 1);
    }

    public function test_history_and_transfers_enforce_ownership_and_member_authentication(): void
    {
        $foreign = MemberSavingsGoal::factory()->create();
        $this->getJson(self::ENDPOINT.'/'.$foreign->id.'/entries')->assertNotFound();
        $this->postJson(self::ENDPOINT.'/'.$foreign->id.'/transfers', ['direction' => 'in', 'amount' => '10.00', 'version' => 1])->assertNotFound();
        $this->withHeader('Authorization', '');
        $this->getJson(self::ENDPOINT.'/'.$foreign->id.'/entries')->assertUnauthorized();
        $this->postJson(self::ENDPOINT.'/'.$foreign->id.'/transfers', ['direction' => 'out', 'amount' => '1.00', 'version' => 1])->assertUnauthorized();
        $this->assertSame('1000.00', $this->wallet->fresh()->balance);
    }

    public function test_activity_is_paginated_and_newest_first(): void
    {
        $goal = $this->createGoal();
        for ($version = 1; $version <= 21; $version++) {
            $this->postJson(self::ENDPOINT.'/'.$goal->id.'/transfers', ['direction' => 'in', 'amount' => '0.01', 'version' => $version])->assertOk();
        }
        $this->getJson(self::ENDPOINT.'/'.$goal->id.'/entries')->assertOk()->assertJsonCount(20, 'data')
            ->assertJsonPath('meta.current_page', 1)->assertJsonPath('meta.has_more', true);
        $this->getJson(self::ENDPOINT.'/'.$goal->id.'/entries?page=2')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.has_more', false)->assertJsonPath('data.1.amount', '125.35');
        $this->getJson(self::ENDPOINT.'/'.$goal->id.'/entries?page=0')->assertUnprocessable();
    }

    public function test_transfers_cannot_overflow_either_balance(): void
    {
        $goal = $this->createGoal();
        $this->wallet->update(['balance' => '9999999999999.99']);
        $this->postJson(self::ENDPOINT.'/'.$goal->id.'/transfers', ['direction' => 'out', 'amount' => '0.01', 'version' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->assertSame('125.35', $goal->fresh()->balance);

        $this->wallet->update(['balance' => '9999999999999.99']);
        $maximumGoal = $this->createGoal('9999999999999.99');
        $this->wallet->update(['balance' => '0.01']);
        $this->postJson(self::ENDPOINT.'/'.$maximumGoal->id.'/transfers', ['direction' => 'in', 'amount' => '0.01', 'version' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->assertSame('9999999999999.99', $maximumGoal->fresh()->balance);
        $this->assertSame('0.01', $this->wallet->fresh()->balance);
    }

    #[DataProvider('invalidTransferValues')]
    public function test_invalid_transfers_are_rejected(string $field, mixed $value): void
    {
        $goal = $this->createGoal();
        $this->postJson(self::ENDPOINT.'/'.$goal->id.'/transfers', array_replace([
            'direction' => 'in', 'amount' => '10.00', 'version' => 1,
        ], [$field => $value]))->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertSame('125.35', $goal->fresh()->balance);
        $this->assertSame('874.65', $this->wallet->fresh()->balance);
    }

    public static function invalidTransferValues(): array
    {
        return [
            'zero' => ['amount', '0'], 'negative' => ['amount', '-1'],
            'precision' => ['amount', '0.001'], 'exponent' => ['amount', '1e2'],
            'overflow' => ['amount', '10000000000000.00'], 'missing amount' => ['amount', null],
            'wrong direction' => ['direction', 'other'], 'missing version' => ['version', null],
        ];
    }

    /** @return array<string, mixed> */
    private function values(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Emergency fund',
            'icon_id' => 'emergency',
            'target_amount' => '2500.00',
            'current_amount' => '125.35',
            'target_date' => '2030-12-01',
        ], $overrides);
    }

    private function createGoal(string $amount = '125.35'): MemberSavingsGoal
    {
        $response = $this->postJson(self::ENDPOINT, $this->values(['current_amount' => $amount]));
        $response->assertCreated();

        return MemberSavingsGoal::query()->findOrFail($response->json('data.goal.id'));
    }
}
