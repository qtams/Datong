<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveCardRequest;
use App\Models\Card;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class CardController extends Controller
{
    /* =========================================================
       LIST CARD CATALOG
    ========================================================= */

    public function index(): JsonResponse
    {
        $cards = Card::query()
            ->orderBy(
                'status'
            )
            ->orderBy(
                'name'
            )
            ->get()
            ->map(
                fn (Card $card) =>
                    $this->transformCard(
                        $card
                    )
            )
            ->values();

        return response()->json([
            'data' => $cards,
        ]);
    }

    /* =========================================================
       SHOW CARD
    ========================================================= */

    public function show(
        Card $card
    ): JsonResponse {
        return response()->json([
            'data' =>
                $this->transformCard(
                    $card
                ),
        ]);
    }

    /* =========================================================
       CREATE CARD

       A new card receives permanent Cloudinary public IDs.

       Example:

       datong/cards/gcash-landscape-abc123
       datong/cards/gcash-portrait-def456

       These IDs remain attached to the card even if the
       images are replaced later.
    ========================================================= */

    public function store(
        SaveCardRequest $request,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $validated =
            $request->validated();

        $slug =
            $this->generateUniqueSlug(
                $validated['name']
            );

        $uploadedPublicIds = [];

        try {
            /* =============================================
               LANDSCAPE
            ============================================= */

            $landscape =
                $cloudinary->uploadImage(
                    $request->file(
                        'landscape_image'
                    ),
                    null,
                    $this->makePublicId(
                        $slug,
                        'landscape'
                    )
                );

            $uploadedPublicIds[] =
                $landscape[
                    'public_id'
                ];

            /* =============================================
               PORTRAIT
            ============================================= */

            $portrait =
                $cloudinary->uploadImage(
                    $request->file(
                        'portrait_image'
                    ),
                    null,
                    $this->makePublicId(
                        $slug,
                        'portrait'
                    )
                );

            $uploadedPublicIds[] =
                $portrait[
                    'public_id'
                ];

            /* =============================================
               DATABASE
            ============================================= */

            $card = Card::create([
                'name' =>
                    $validated[
                        'name'
                    ],

                'slug' =>
                    $slug,

                'type' =>
                    $validated[
                        'type'
                    ],

                'status' =>
                    $validated[
                        'status'
                    ],

                'landscape_image_url' =>
                    $landscape[
                        'secure_url'
                    ],

                'landscape_public_id' =>
                    $landscape[
                        'public_id'
                    ],

                'portrait_image_url' =>
                    $portrait[
                        'secure_url'
                    ],

                'portrait_public_id' =>
                    $portrait[
                        'public_id'
                    ],
            ]);

            return response()->json([
                'message' =>
                    'Card created successfully.',

                'data' =>
                    $this->transformCard(
                        $card
                    ),
            ], 201);
        } catch (Throwable $error) {
            /*
             * If one upload succeeded but the second upload
             * or database insert failed, clean up the already
             * uploaded Cloudinary assets.
             */

            foreach (
                $uploadedPublicIds
                as $publicId
            ) {
                $this->safeDeleteCloudinaryImage(
                    $cloudinary,
                    $publicId
                );
            }

            report(
                $error
            );

            return response()->json([
                'message' =>
                    'Unable to create the card. Please try again.',
            ], 500);
        }
    }

    /* =========================================================
       UPDATE CARD

       IMPORTANT:

       Editing a card DOES NOT create another permanent
       Cloudinary asset.

       Existing:

       landscape_public_id
       portrait_public_id

       are reused.

       If a new image is uploaded:

       OLD IMAGE
           ↓
       SAME PUBLIC ID
           ↓
       overwrite=true
           ↓
       NEW IMAGE

       This avoids filling Cloudinary storage with old images.
    ========================================================= */

    public function update(
        SaveCardRequest $request,
        Card $card,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $validated =
            $request->validated();

        try {
            /* =============================================
               REPLACE LANDSCAPE

               Only runs when the admin selected a new
               landscape image.
            ============================================= */

            if (
                $request->hasFile(
                    'landscape_image'
                )
            ) {
                $landscape =
                    $cloudinary->replaceImage(
                        $request->file(
                            'landscape_image'
                        ),
                        $card->landscape_public_id
                    );

                /*
                 * Public ID remains the same.
                 *
                 * Store returned URL because Cloudinary may
                 * return an updated URL/version/format.
                 */

                $card->landscape_image_url =
                    $landscape[
                        'secure_url'
                    ];

                $card->landscape_public_id =
                    $landscape[
                        'public_id'
                    ];
            }

            /* =============================================
               REPLACE PORTRAIT

               Only runs when the admin selected a new
               portrait image.
            ============================================= */

            if (
                $request->hasFile(
                    'portrait_image'
                )
            ) {
                $portrait =
                    $cloudinary->replaceImage(
                        $request->file(
                            'portrait_image'
                        ),
                        $card->portrait_public_id
                    );

                $card->portrait_image_url =
                    $portrait[
                        'secure_url'
                    ];

                $card->portrait_public_id =
                    $portrait[
                        'public_id'
                    ];
            }

            /* =============================================
               CARD INFORMATION

               Card name can change without changing the
               permanent Cloudinary public IDs.
            ============================================= */

            $card->name =
                $validated[
                    'name'
                ];

            $card->slug =
                $this->generateUniqueSlug(
                    $validated[
                        'name'
                    ],
                    $card->id
                );

            $card->type =
                $validated[
                    'type'
                ];

            $card->status =
                $validated[
                    'status'
                ];

            $card->save();

            $card->refresh();

            return response()->json([
                'message' =>
                    'Card updated successfully.',

                'data' =>
                    $this->transformCard(
                        $card
                    ),
            ]);
        } catch (Throwable $error) {
            report(
                $error
            );

            return response()->json([
                'message' =>
                    'Unable to update the card. Please try again.',
            ], 500);
        }
    }

    /* =========================================================
       DELETE CARD

       Flow:

       1. Capture Cloudinary public IDs.
       2. Delete the database record.
       3. Delete landscape asset from Cloudinary.
       4. Delete portrait asset from Cloudinary.

       This prevents deleted cards from continuing to consume
       normal Cloudinary asset storage.
    ========================================================= */

    public function destroy(
        Card $card,
        CloudinaryService $cloudinary
    ): Response|JsonResponse {
        $landscapePublicId =
            $card->landscape_public_id;

        $portraitPublicId =
            $card->portrait_public_id;

        try {
            /* =============================================
               DATABASE
            ============================================= */

            $card->delete();
        } catch (Throwable $error) {
            report(
                $error
            );

            return response()->json([
                'message' =>
                    'Unable to delete the card.',
            ], 500);
        }

        /* =================================================
           CLOUDINARY LANDSCAPE
        ================================================= */

        $this->safeDeleteCloudinaryImage(
            $cloudinary,
            $landscapePublicId
        );

        /* =================================================
           CLOUDINARY PORTRAIT
        ================================================= */

        $this->safeDeleteCloudinaryImage(
            $cloudinary,
            $portraitPublicId
        );

        return response()->noContent();
    }

    /* =========================================================
       UNIQUE SLUG
    ========================================================= */

    private function generateUniqueSlug(
        string $name,
        ?int $ignoreId = null
    ): string {
        $baseSlug =
            Str::slug(
                $name
            );

        if (!$baseSlug) {
            $baseSlug =
                'card';
        }

        $slug =
            $baseSlug;

        $counter =
            2;

        while (
            $this->slugExists(
                $slug,
                $ignoreId
            )
        ) {
            $slug =
                $baseSlug
                . '-'
                . $counter;

            $counter++;
        }

        return $slug;
    }

    /* =========================================================
       SLUG EXISTS
    ========================================================= */

    private function slugExists(
        string $slug,
        ?int $ignoreId = null
    ): bool {
        $query =
            Card::query()
                ->where(
                    'slug',
                    $slug
                );

        if ($ignoreId) {
            $query->where(
                'id',
                '!=',
                $ignoreId
            );
        }

        return $query->exists();
    }

    /* =========================================================
       CLOUDINARY PUBLIC ID

       Only used during initial card creation.

       Once created, the resulting Cloudinary public ID is
       permanent for that card image and is reused during edit.
    ========================================================= */

    private function makePublicId(
        string $slug,
        string $orientation
    ): string {
        return sprintf(
            '%s-%s-%s',
            $slug,
            $orientation,
            Str::lower(
                Str::random(
                    10
                )
            )
        );
    }

    /* =========================================================
       SAFE CLOUDINARY DELETE

       Used when:

       - Card creation partially fails
       - Card is permanently deleted

       Cloudinary cleanup errors are logged so we can identify
       orphaned assets without crashing the API response.
    ========================================================= */

    private function safeDeleteCloudinaryImage(
        CloudinaryService $cloudinary,
        ?string $publicId
    ): void {
        if (!$publicId) {
            return;
        }

        try {
            $cloudinary->deleteImage(
                $publicId
            );
        } catch (Throwable $error) {
            Log::warning(
                'Unable to delete Cloudinary card image.',
                [
                    'public_id' =>
                        $publicId,

                    'message' =>
                        $error->getMessage(),
                ]
            );
        }
    }

    /* =========================================================
       API RESPONSE

       Public IDs are intentionally NOT exposed to frontend.

       React only needs the delivery URLs.
    ========================================================= */

    private function transformCard(
        Card $card
    ): array {
        return [
            'id' =>
                $card->id,

            'name' =>
                $card->name,

            'slug' =>
                $card->slug,

            'type' =>
                $card->type,

            'status' =>
                $card->status,

            'landscape_image_url' =>
                $card->landscape_image_url,

            'portrait_image_url' =>
                $card->portrait_image_url,

            'created_at' =>
                $card->created_at
                    ?->toISOString(),

            'updated_at' =>
                $card->updated_at
                    ?->toISOString(),
        ];
    }
}