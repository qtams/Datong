<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\JsonResponse;

class MemberController extends Controller
{
    /* =========================================================
       LIST MEMBERS
    ========================================================= */

    public function index(): JsonResponse
    {
        $members = Member::query()
            ->orderByDesc('registered_at')
            ->orderByDesc('id')
            ->get()
            ->map(
                fn (Member $member) =>
                    $this->transformMember(
                        $member
                    )
            )
            ->values();

        return response()->json([
            'data' => $members,
        ]);
    }

    /* =========================================================
       MEMBER DETAILS
    ========================================================= */

    public function show(
        string $memberId
    ): JsonResponse {
        $member = Member::query()
            ->where(
                'member_id',
                $memberId
            )
            ->first();

        if (!$member) {
            return response()->json([
                'message' =>
                    'Member not found.',
            ], 404);
        }

        return response()->json([
            'data' =>
                $this->transformMember(
                    $member
                ),
        ]);
    }

    /* =========================================================
       TRANSFORM
    ========================================================= */

    private function transformMember(
        Member $member
    ): array {
        $verification =
            $member
                ->verificationProgress();

        return [
            'id' =>
                $member->id,

            'member_id' =>
                $member->member_id,

            'firebase_uid' =>
                $member->firebase_uid,

            'role' =>
                $member->role,

            'fullname' =>
                $member->fullname,

            'nickname' =>
                $member->nickname,

            'username' =>
                $member->username,

            'email' =>
                $member->email,

            'mobile_number' =>
                $member->mobile_number,

            'location' =>
                $member->location,

            'password_set' =>
                (bool)
                $member->password_set,

            'email_verified' =>
                (bool)
                $member->email_verified,

            'auth_provider' =>
                $member->auth_provider,

            'provider_label' =>
                $this->providerLabel(
                    $member->auth_provider
                ),

            'status' =>
                $verification['verified']
                    ? 'Verified'
                    : 'Incomplete',

            'verification' =>
                $verification,

            'registered_at' =>
                $member
                    ->registered_at
                    ?->toISOString()
                ??
                $member
                    ->created_at
                    ?->toISOString(),

            'last_login_at' =>
                $member
                    ->last_login_at
                    ?->toISOString(),

            'verified_at' =>
                $member
                    ->verified_at
                    ?->toISOString(),

            'created_at' =>
                $member
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $member
                    ->updated_at
                    ?->toISOString(),
        ];
    }

    /* =========================================================
       PROVIDER LABEL
    ========================================================= */

    private function providerLabel(
        ?string $value
    ): string {
        $providers =
            collect(
                explode(
                    ',',
                    strtolower(
                        (string) $value
                    )
                )
            )
                ->map(
                    fn ($provider) =>
                        trim($provider)
                )
                ->filter()
                ->unique()
                ->values();

        $hasGoogle =
            $providers->contains(
                fn ($provider) =>
                    in_array(
                        $provider,
                        [
                            'google',
                            'google.com',
                        ],
                        true
                    )
            );

        $hasPassword =
            $providers->contains(
                'password'
            );

        if (
            $hasGoogle &&
            $hasPassword
        ) {
            return 'Google + Email';
        }

        if ($hasGoogle) {
            return 'Google';
        }

        if ($hasPassword) {
            return 'Email';
        }

        if (
            $providers->isEmpty()
        ) {
            return 'Firebase';
        }

        return $providers
            ->map(
                fn ($provider) =>
                    ucfirst(
                        str_replace(
                            '.com',
                            '',
                            $provider
                        )
                    )
            )
            ->implode(' + ');
    }
}