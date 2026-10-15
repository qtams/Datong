<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CardController;
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

   MemberAuthController verifies the Firebase token.
========================================================= */

Route::prefix('member-auth')
    ->group(function () {
        /* =================================================
           SYNC MEMBER
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

   Firebase Members DO NOT authenticate here.
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
       CARD CATALOG

       Internal users manage the available card templates.

       POST update is intentional because updates may contain
       multipart/form-data image files.

       GET    /api/card-catalog
       POST   /api/card-catalog
       GET    /api/card-catalog/{card}
       POST   /api/card-catalog/{card}
       DELETE /api/card-catalog/{card}
    ===================================================== */

    Route::get(
        '/card-catalog',
        [
            CardController::class,
            'index',
        ]
    );

    Route::post(
        '/card-catalog',
        [
            CardController::class,
            'store',
        ]
    );

    Route::get(
        '/card-catalog/{card}',
        [
            CardController::class,
            'show',
        ]
    );

    Route::post(
        '/card-catalog/{card}',
        [
            CardController::class,
            'update',
        ]
    );

    Route::delete(
        '/card-catalog/{card}',
        [
            CardController::class,
            'destroy',
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

       Internal dashboard read-only member management.
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