<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Kreait\Laravel\Firebase\Facades\Firebase;

class MemberAuthController extends Controller
{
    /* =========================================================
       VERIFY FIREBASE REQUEST
    ========================================================= */

    private function firebaseUser(Request $request): array
    {
        $idToken = $request->bearerToken();

        if (!$idToken) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Firebase authentication token is required.',
                ], 401)
            );
        }

        try {
            $auth = Firebase::auth();

            $verifiedToken =
                $auth->verifyIdToken(
                    $idToken
                );

            $firebaseUid =
                (string) $verifiedToken
                    ->claims()
                    ->get('sub');

            $firebaseUser =
                $auth->getUser(
                    $firebaseUid
                );

            return [
                $firebaseUid,
                $firebaseUser,
            ];
        } catch (FailedToVerifyToken $error) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Firebase authentication token is invalid or expired.',
                ], 401)
            );
        } catch (\Throwable $error) {
            report($error);

            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Unable to verify Firebase authentication.',
                ], 500)
            );
        }
    }

    /* =========================================================
       PROVIDERS
    ========================================================= */

    private function getProviderIds($firebaseUser): array
    {
        return collect(
            $firebaseUser->providerData ?? []
        )
            ->map(
                function ($provider) {
                    return $provider->providerId
                        ?? null;
                }
            )
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /* =========================================================
       MEMBER RESPONSE
    ========================================================= */

    private function memberResponse(Member $member): array
    {
        $verification =
            $member->verificationProgress();

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
                $member->password_set,

            'email_verified' =>
                $member->email_verified,

            'auth_provider' =>
                $member->auth_provider,

            'verified_at' =>
                optional(
                    $member->verified_at
                )->toISOString(),

            'registered_at' =>
                optional(
                    $member->registered_at
                )->toISOString(),

            'last_login_at' =>
                optional(
                    $member->last_login_at
                )->toISOString(),

            'verification' =>
                $verification,

            'status' =>
                $verification['verified']
                    ? 'Verified'
                    : 'Incomplete',
        ];
    }

    /* =========================================================
       SYNC FIREBASE MEMBER
    ========================================================= */

    public function sync(Request $request)
    {
        [
            $firebaseUid,
            $firebaseUser,
        ] = $this->firebaseUser(
            $request
        );

        /* =====================================================
           FIND EXISTING MEMBER
        ===================================================== */

        $member =
            Member::where(
                'firebase_uid',
                $firebaseUid
            )->first();

        /* =====================================================
           VALIDATE PROFILE

           Email is NOT accepted from the browser.
           Laravel trusts the verified Firebase account email.
        ===================================================== */

        $validator =
            Validator::make(
                $request->all(),
                [
                    'fullname' => [
                        'nullable',
                        'string',
                        'max:255',
                    ],

                    'nickname' => [
                        'nullable',
                        'string',
                        'max:50',
                    ],

                    'username' => [
                        'nullable',
                        'string',
                        'min:3',
                        'max:50',
                        'regex:/^[a-z0-9._-]+$/',

                        Rule::unique(
                            'members',
                            'username'
                        )->ignore(
                            $member?->id
                        ),
                    ],
                ],
                [
                    'username.regex' =>
                        'Username may only contain letters, numbers, dots, underscores and dashes.',
                ]
            );

        $validated =
            $validator->validate();

        /* =====================================================
           FIREBASE EMAIL
        ===================================================== */

        $firebaseEmail =
            strtolower(
                trim(
                    (string) (
                        $firebaseUser->email
                        ?? ''
                    )
                )
            );

        if (!$firebaseEmail) {
            return response()->json([
                'success' => false,

                'message' =>
                    'The Firebase account does not have an email address.',
            ], 422);
        }

        /* =====================================================
           PREVENT EMAIL COLLISION
        ===================================================== */

        $emailOwner =
            Member::where(
                'email',
                $firebaseEmail
            )
                ->when(
                    $member,
                    fn ($query) =>
                        $query->where(
                            'id',
                            '!=',
                            $member->id
                        )
                )
                ->first();

        if ($emailOwner) {
            return response()->json([
                'success' => false,

                'message' =>
                    'This email address is already connected to another member.',
            ], 409);
        }

        /* =====================================================
           CREATE MEMBER
        ===================================================== */

        if (!$member) {
            $member = new Member();

            $member->firebase_uid =
                $firebaseUid;

            $member->registered_at =
                now();
        }

        /* =====================================================
           PROVIDERS

           password   = Firebase email/password
           google.com = Google
        ===================================================== */

        $providerIds =
            $this->getProviderIds(
                $firebaseUser
            );

        $member->password_set =
            in_array(
                'password',
                $providerIds,
                true
            );

        $member->auth_provider =
            collect(
                $providerIds
            )
                ->map(
                    function ($provider) {
                        if (
                            $provider ===
                            'google.com'
                        ) {
                            return 'google';
                        }

                        return $provider;
                    }
                )
                ->implode(',');

        /* =====================================================
           FIREBASE DATA
        ===================================================== */

        $member->email =
            $firebaseEmail;

        $member->email_verified =
            (bool) (
                $firebaseUser
                    ->emailVerified
                ?? false
            );

        /* =====================================================
           FULL NAME

           Registration form has priority.
           Otherwise use Google/Firebase display name.
        ===================================================== */

        if (
            array_key_exists(
                'fullname',
                $validated
            ) &&
            filled(
                $validated['fullname']
            )
        ) {
            $member->fullname =
                trim(
                    $validated[
                        'fullname'
                    ]
                );
        } elseif (
            !$member->fullname &&
            filled(
                $firebaseUser
                    ->displayName
            )
        ) {
            $member->fullname =
                trim(
                    $firebaseUser
                        ->displayName
                );
        }

        /* =====================================================
           NICKNAME
        ===================================================== */

        if (
            array_key_exists(
                'nickname',
                $validated
            ) &&
            filled(
                $validated['nickname']
            )
        ) {
            $member->nickname =
                trim(
                    $validated[
                        'nickname'
                    ]
                );
        }

        /* =====================================================
           USERNAME
        ===================================================== */

        if (
            array_key_exists(
                'username',
                $validated
            ) &&
            filled(
                $validated['username']
            )
        ) {
            $member->username =
                strtolower(
                    trim(
                        $validated[
                            'username'
                        ]
                    )
                );
        }

        /* =====================================================
           ACTIVITY
        ===================================================== */

        $member->last_login_at =
            now();

        $member->save();

        $member->refresh();

        return response()->json([
            'success' => true,

            'member' =>
                $this->memberResponse(
                    $member
                ),
        ]);
    }

    /* =========================================================
       CURRENT FIREBASE MEMBER
    ========================================================= */

    public function me(Request $request)
    {
        [
            $firebaseUid,
        ] = $this->firebaseUser(
            $request
        );

        $member =
            Member::where(
                'firebase_uid',
                $firebaseUid
            )->first();

        if (!$member) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Member profile has not been created yet.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'member' =>
                $this->memberResponse(
                    $member
                ),
        ]);
    }
}