<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveUserRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /* =====================================================
       LIST USERS
    ===================================================== */

    public function index(): JsonResponse
    {
        $users = User::query()
            ->latest('created_at')
            ->get()
            ->map(
                fn (User $user) =>
                    $this->transformUser(
                        $user
                    )
            )
            ->values();

        return response()->json([
            'data' => $users,
        ]);
    }

    /* =====================================================
       CREATE USER
    ===================================================== */

    public function store(
        SaveUserRequest $request
    ): JsonResponse {
        $validated =
            $request->validated();

        $temporaryPassword =
            $this->generateDefaultPassword(
                $validated['birthday']
            );

        $user = DB::transaction(
            function () use (
                $validated,
                $temporaryPassword
            ) {
                return User::create([
                    'fullname' =>
                        trim(
                            $validated[
                                'fullname'
                            ]
                        ),

                    'nickname' =>
                        filled(
                            $validated[
                                'nickname'
                            ] ?? null
                        )
                            ? trim(
                                $validated[
                                    'nickname'
                                ]
                            )
                            : null,

                    'username' =>
                        Str::lower(
                            trim(
                                $validated[
                                    'username'
                                ]
                            )
                        ),

                    'email' =>
                        Str::lower(
                            trim(
                                $validated[
                                    'email'
                                ]
                            )
                        ),

                    'birthday' =>
                        $validated[
                            'birthday'
                        ],

                    'role' =>
                        $validated[
                            'role'
                        ],

                    /*
                     * Automatically hashed by
                     * User model cast.
                     */
                    'password' =>
                        $temporaryPassword,

                    'must_change_password' =>
                        true,

                    'last_login_at' =>
                        null,
                ]);
            }
        );

        return response()->json([
            'message' =>
                'User created successfully.',

            'data' =>
                $this->transformUser(
                    $user
                ),

            'temporary_password' =>
                $temporaryPassword,
        ], 201);
    }

    /* =====================================================
       UPDATE USER
    ===================================================== */

    public function update(
        SaveUserRequest $request,
        User $user
    ): JsonResponse {
        $validated =
            $request->validated();

        $user->update([
            'fullname' =>
                trim(
                    $validated[
                        'fullname'
                    ]
                ),

            'nickname' =>
                filled(
                    $validated[
                        'nickname'
                    ] ?? null
                )
                    ? trim(
                        $validated[
                            'nickname'
                        ]
                    )
                    : null,

            'username' =>
                Str::lower(
                    trim(
                        $validated[
                            'username'
                        ]
                    )
                ),

            'email' =>
                Str::lower(
                    trim(
                        $validated[
                            'email'
                        ]
                    )
                ),

            'birthday' =>
                $validated[
                    'birthday'
                ],

            'role' =>
                $validated[
                    'role'
                ],
        ]);

        $user->refresh();

        return response()->json([
            'message' =>
                'User updated successfully.',

            'data' =>
                $this->transformUser(
                    $user
                ),
        ]);
    }

    /* =====================================================
       DELETE USER
    ===================================================== */

    public function destroy(
        User $user
    ): Response {
        $user->delete();

        return response()
            ->noContent();
    }

    /* =====================================================
       DEFAULT PASSWORD

       DATONG + MMDDYYYY
    ===================================================== */

    private function generateDefaultPassword(
        string $birthday
    ): string {
        $date =
            Carbon::createFromFormat(
                'Y-m-d',
                $birthday
            );

        return 'DATONG'
            . $date->format(
                'mdY'
            );
    }

    /* =====================================================
       API USER
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

            'updated_at' =>
                $user
                    ->updated_at
                    ?->toISOString(),

            'last_login' =>
                $user
                    ->last_login_at
                    ?->toISOString(),
        ];
    }
}