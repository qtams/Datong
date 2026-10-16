<?php

namespace App\Http\Middleware;

use App\Models\Member;

use Closure;

use Illuminate\Http\Request;

use Kreait\Laravel\Firebase\Facades\Firebase;

use Symfony\Component\HttpFoundation\Response;

class ResolveFirebaseMember
{
    /* =========================================================
       HANDLE
    ========================================================= */

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /* =====================================================
           TOKEN
        ===================================================== */

        $token =
            $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' =>
                    'Firebase authentication token is required.',
            ], 401);
        }

        /* =====================================================
           VERIFY FIREBASE TOKEN
        ===================================================== */

        try {
            $verifiedToken =
                Firebase::auth()
                    ->verifyIdToken(
                        $token
                    );

            $firebaseUid =
                $verifiedToken
                    ->claims()
                    ->get(
                        'sub'
                    );
        } catch (\Throwable $error) {
            return response()->json([
                'message' =>
                    'Invalid or expired Firebase authentication token.',
            ], 401);
        }

        if (!$firebaseUid) {
            return response()->json([
                'message' =>
                    'Firebase user ID was not found.',
            ], 401);
        }

        /* =====================================================
           FIND MEMBER
        ===================================================== */

        $member =
            Member::query()
                ->where(
                    'firebase_uid',
                    $firebaseUid
                )
                ->first();

        if (!$member) {
            return response()->json([
                'message' =>
                    'Member has not been synced with Datong yet.',
            ], 404);
        }

        /* =====================================================
           ATTACH MEMBER TO REQUEST
        ===================================================== */

        $request
            ->attributes
            ->set(
                'member',
                $member
            );

        return $next(
            $request
        );
    }
}