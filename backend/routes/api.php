<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\UserController;

use Illuminate\Support\Facades\Route;

/* =========================================================
   MEMBER AUTH

   PUBLIC MEMBER AUTHENTICATION

   Firebase performs authentication in React.

   Laravel receives:
   Authorization: Bearer <Firebase ID Token>

   MemberAuthController verifies the token before trusting
   the Firebase UID.
========================================================= */

Route::prefix('member-auth')
    ->group(function () {
        /* =================================================
           SYNC MEMBER

           Used after:
           - Email/password registration
           - Email/password login
           - Google login/signup
        ================================================= */

        Route::post(
            '/sync',
            [
                MemberAuthController::class,
                'sync',
            ]
        );

        /* =================================================
           CURRENT FIREBASE MEMBER
        ================================================= */

        Route::get(
            '/me',
            [
                MemberAuthController::class,
                'me',
            ]
        );
    });

/* =========================================================
   INTERNAL AUTH

   Existing Laravel session authentication for:

   - Admin
   - Finance
   - Staff
   - Viewer

   Firebase Members DO NOT authenticate through this route.
========================================================= */

Route::middleware('web')
    ->prefix('auth')
    ->group(function () {
        /* =================================================
           CSRF
        ================================================= */

        Route::get(
            '/csrf',
            [
                AuthController::class,
                'csrf',
            ]
        );

        /* =================================================
           INTERNAL LOGIN
        ================================================= */

        Route::post(
            '/login',
            [
                AuthController::class,
                'login',
            ]
        );
    });

/* =========================================================
   AUTHENTICATED INTERNAL API

   These routes require a logged-in Laravel internal user.

   Used by the Datong admin dashboard.
========================================================= */

Route::middleware([
    'web',
    'auth',
])->group(function () {
    /* =====================================================
       INTERNAL AUTH
    ===================================================== */

    Route::get(
        '/auth/me',
        [
            AuthController::class,
            'me',
        ]
    );

    Route::post(
        '/auth/logout',
        [
            AuthController::class,
            'logout',
        ]
    );

    /* =====================================================
       USERS

       Internal Datong users:
       - Admin
       - Finance
       - Staff
       - Viewer
    ===================================================== */

    Route::get(
        '/users',
        [
            UserController::class,
            'index',
        ]
    );

    Route::post(
        '/users',
        [
            UserController::class,
            'store',
        ]
    );

    Route::put(
        '/users/{user}',
        [
            UserController::class,
            'update',
        ]
    );

    Route::delete(
        '/users/{user}',
        [
            UserController::class,
            'destroy',
        ]
    );

    /* =====================================================
       MEMBERS

       Read-only member management for the admin dashboard.

       Data comes from the real Laravel members table.

       Firebase members are created/synced through:
       POST /api/member-auth/sync
    ===================================================== */

    Route::get(
        '/members',
        [
            MemberController::class,
            'index',
        ]
    );

    Route::get(
        '/members/{memberId}',
        [
            MemberController::class,
            'show',
        ]
    );
});