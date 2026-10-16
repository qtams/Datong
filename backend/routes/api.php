<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberCardController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MemberFinanceController;
use App\Http\Controllers\Api\MemberTransferController;
use App\Http\Controllers\Api\UserController;

use App\Http\Middleware\ResolveFirebaseMember;

use Illuminate\Support\Facades\Route;

/* =========================================================
   MEMBER AUTH

   PUBLIC MEMBER AUTHENTICATION

   Firebase performs authentication in React.

   Laravel receives:
   Authorization: Bearer <Firebase ID Token>
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
   MEMBER FINANCE

   Firebase authenticated members only.

   Cards = Savings
   Cash  = Actual Money
========================================================= */

Route::middleware(
    ResolveFirebaseMember::class
)
    ->prefix('member-finance')
    ->group(function () {
        /* =================================================
           SUMMARY

           GET /api/member-finance/summary
        ================================================= */

        Route::get(
            '/summary',
            [
                MemberFinanceController::class,
                'summary',
            ]
        );

        /* =================================================
           MEMBER CARD CATALOG

           Active providers only.

           GET /api/member-finance/card-catalog
        ================================================= */

        Route::get(
            '/card-catalog',
            [
                MemberFinanceController::class,
                'cardCatalog',
            ]
        );

        /* =================================================
           ON-HAND CASH

           GET /api/member-finance/cash
        ================================================= */

        Route::get(
            '/cash',
            [
                MemberFinanceController::class,
                'cash',
            ]
        );

        /* =================================================
           MEMBER CARDS / SAVINGS

           GET    /api/member-finance/cards
           POST   /api/member-finance/cards
           PUT    /api/member-finance/cards/{memberCardId}
           DELETE /api/member-finance/cards/{memberCardId}
        ================================================= */

        Route::get(
            '/cards',
            [
                MemberCardController::class,
                'index',
            ]
        );

        Route::post(
            '/cards',
            [
                MemberCardController::class,
                'store',
            ]
        );

        Route::put(
            '/cards/{memberCardId}',
            [
                MemberCardController::class,
                'update',
            ]
        );

        Route::delete(
            '/cards/{memberCardId}',
            [
                MemberCardController::class,
                'destroy',
            ]
        );

        /* =================================================
           TRANSFERS

           GET  /api/member-finance/transfers
           POST /api/member-finance/transfers
        ================================================= */

        Route::get(
            '/transfers',
            [
                MemberTransferController::class,
                'index',
            ]
        );

        Route::post(
            '/transfers',
            [
                MemberTransferController::class,
                'store',
            ]
        );
    });

/* =========================================================
   INTERNAL AUTH
========================================================= */

Route::middleware('web')
    ->prefix('auth')
    ->group(function () {
        Route::get(
            '/csrf',
            [
                AuthController::class,
                'csrf',
            ]
        );

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
       ADMIN CARD CATALOG
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