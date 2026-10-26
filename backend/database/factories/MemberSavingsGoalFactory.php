<?php

namespace Database\Factories;

use App\Models\MemberSavingsGoal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberSavingsGoal>
 */
class MemberSavingsGoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'member_id' => MemberFactory::new(),
            'name' => 'Emergency fund',
            'icon_id' => 'emergency',
            'target_amount' => '1000.00',
            'balance' => '0.00',
            'currency' => 'PHP',
            'version' => 1,
        ];
    }
}
