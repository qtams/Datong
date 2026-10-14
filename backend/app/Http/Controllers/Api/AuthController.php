<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /* =====================================================
       CSRF
    ===================================================== */

    public function csrf(
        Request $request
    ): JsonResponse {
        return response()->json([
            'csrf_token' =>
                csrf_token(),
        ]);
    }

    /* =====================================================
       LOGIN

       Accepts either:
       - username
       - email
    ===================================================== */

    public function login(
        Request $request
    ): JsonResponse {
        $validated =
            $request->validate([
                'login' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'password' => [
                    'required',
                    'string',
                ],

                'remember' => [
                    'nullable',
                    'boolean',
                ],
            ], [
                'login.required' =>
                    'Email or username is required.',

                'password.required' =>
                    'Password is required.',
            ]);

        $identifier =
            strtolower(
                trim(
                    $validated[
                        'login'
                    ]
                )
            );

        $user = User::query()
            ->where(
                'email',
                $identifier
            )
            ->orWhere(
                'username',
                $identifier
            )
            ->first();

        if (
            !$user ||
            !Hash::check(
                $validated[
                    'password'
                ],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'login' => [
                    'The username/email or password is incorrect.',
                ],
            ]);
        }

        $remember =
            (bool) (
                $validated[
                    'remember'
                ] ?? false
            );

        Auth::guard(
            'web'
        )->login(
            $user,
            $remember
        );

        $request
            ->session()
            ->regenerate();

        $user->forceFill([
            'last_login_at' =>
                now(),
        ])->save();

        $user->refresh();

        return response()->json([
            'message' =>
                'Login successful.',

            'user' =>
                $this->transformUser(
                    $user
                ),
        ]);
    }

    /* =====================================================
       CURRENT USER
    ===================================================== */

    public function me(
        Request $request
    ): JsonResponse {
        /** @var User $user */
        $user =
            $request->user();

        return response()->json([
            'user' =>
                $this->transformUser(
                    $user
                ),
        ]);
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    public function logout(
        Request $request
    ): JsonResponse {
        Auth::guard(
            'web'
        )->logout();

        $request
            ->session()
            ->invalidate();

        $request
            ->session()
            ->regenerateToken();

        return response()->json([
            'message' =>
                'Logged out successfully.',
        ]);
    }

    /* =====================================================
       USER RESPONSE
    ===================================================== */

    private function transformUser(
        User $user
    ): array {
        return [
            'id' =>
                $user->id,

            'fullname' =>
                $user->fullname,

            'nickname' =>
                $user->nickname ?? '',

            'username' =>
                $user->username,

            'email' =>
                $user->email,

            'birthday' =>
                $user->birthday?->format(
                    'Y-m-d'
                ),

            'role' =>
                $user->role,

            'must_change_password' =>
                (bool)
                    $user
                        ->must_change_password,

            'created_at' =>
                $user
                    ->created_at
                    ?->toISOString(),

            'last_login' =>
                $user
                    ->last_login_at
                    ?->toISOString(),
        ];
    }
}