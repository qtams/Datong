<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CloudinaryService
{
    private string $cloudName;

    private string $apiKey;

    private string $apiSecret;

    private string $defaultFolder;

    /* =========================================================
       CONSTRUCTOR
    ========================================================= */

    public function __construct()
    {
        $this->cloudName = (string) config(
            'cloudinary.cloud_name'
        );

        $this->apiKey = (string) config(
            'cloudinary.api_key'
        );

        $this->apiSecret = (string) config(
            'cloudinary.api_secret'
        );

        $this->defaultFolder = (string) config(
            'cloudinary.folder',
            'datong/cards'
        );

        $this->ensureConfigured();
    }

    /* =========================================================
       CONFIG
    ========================================================= */

    private function ensureConfigured(): void
    {
        if (
            !$this->cloudName ||
            !$this->apiKey ||
            !$this->apiSecret
        ) {
            throw new RuntimeException(
                'Cloudinary credentials are not configured.'
            );
        }
    }

    /* =========================================================
       UPLOAD NEW IMAGE

       Used only when initially creating the card.

       overwrite = false prevents accidentally replacing
       another asset with the same public ID.
    ========================================================= */

    public function uploadImage(
        UploadedFile $file,
        ?string $folder = null,
        ?string $publicId = null
    ): array {
        $folder =
            $folder ?: $this->defaultFolder;

        $url = sprintf(
            'https://api.cloudinary.com/v1_1/%s/image/upload',
            $this->cloudName
        );

        $stream = fopen(
            $file->getRealPath(),
            'r'
        );

        if (!$stream) {
            throw new RuntimeException(
                'Unable to read uploaded image.'
            );
        }

        try {
            $request = Http::withBasicAuth(
                $this->apiKey,
                $this->apiSecret
            )
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(60)
                ->attach(
                    'file',
                    $stream,
                    $file->getClientOriginalName()
                );

            $payload = [
                'folder' =>
                    $folder,

                'overwrite' =>
                    'false',
            ];

            if ($publicId) {
                $payload['public_id'] =
                    $publicId;
            }

            $response = $request->post(
                $url,
                $payload
            );

            $response->throw();

            return $this->normalizeUploadResponse(
                $response->json()
            );
        } catch (RequestException $error) {
            $message =
                $error->response?->json(
                    'error.message'
                )
                ??
                'Cloudinary upload failed.';

            throw new RuntimeException(
                $message,
                previous: $error
            );
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }
    }

    /* =========================================================
       REPLACE EXISTING IMAGE

       IMPORTANT:

       Uses the EXISTING Cloudinary public_id.

       This means:
       - no new Cloudinary asset is created
       - old image is overwritten
       - database public_id stays exactly the same
       - CDN cache is invalidated
    ========================================================= */

    public function replaceImage(
        UploadedFile $file,
        string $publicId
    ): array {
        if (!$publicId) {
            throw new RuntimeException(
                'Cloudinary public ID is required for replacement.'
            );
        }

        $url = sprintf(
            'https://api.cloudinary.com/v1_1/%s/image/upload',
            $this->cloudName
        );

        $stream = fopen(
            $file->getRealPath(),
            'r'
        );

        if (!$stream) {
            throw new RuntimeException(
                'Unable to read uploaded image.'
            );
        }

        try {
            /*
             * Do NOT send folder here.
             *
             * public_id already identifies the existing
             * Cloudinary asset we want to overwrite.
             */

            $response = Http::withBasicAuth(
                $this->apiKey,
                $this->apiSecret
            )
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(60)
                ->attach(
                    'file',
                    $stream,
                    $file->getClientOriginalName()
                )
                ->post(
                    $url,
                    [
                        'public_id' =>
                            $publicId,

                        'overwrite' =>
                            'true',

                        'invalidate' =>
                            'true',
                    ]
                );

            $response->throw();

            return $this->normalizeUploadResponse(
                $response->json()
            );
        } catch (RequestException $error) {
            $message =
                $error->response?->json(
                    'error.message'
                )
                ??
                'Cloudinary image replacement failed.';

            throw new RuntimeException(
                $message,
                previous: $error
            );
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }
    }

    /* =========================================================
       DELETE IMAGE

       Permanently removes the Cloudinary asset.

       invalidate=true also clears the CDN cached copy.
    ========================================================= */

    public function deleteImage(
        ?string $publicId
    ): bool {
        if (!$publicId) {
            return true;
        }

        $url = sprintf(
            'https://api.cloudinary.com/v1_1/%s/image/destroy',
            $this->cloudName
        );

        try {
            $response = Http::withBasicAuth(
                $this->apiKey,
                $this->apiSecret
            )
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(30)
                ->post(
                    $url,
                    [
                        'public_id' =>
                            $publicId,

                        'invalidate' =>
                            'true',
                    ]
                );

            $response->throw();

            $result =
                $response->json(
                    'result'
                );

            return in_array(
                $result,
                [
                    'ok',
                    'not found',
                ],
                true
            );
        } catch (RequestException $error) {
            $message =
                $error->response?->json(
                    'error.message'
                )
                ??
                'Cloudinary image deletion failed.';

            throw new RuntimeException(
                $message,
                previous: $error
            );
        }
    }

    /* =========================================================
       NORMALIZE UPLOAD RESPONSE
    ========================================================= */

    private function normalizeUploadResponse(
        array $data
    ): array {
        $publicId =
            $data['public_id']
            ?? null;

        $secureUrl =
            $data['secure_url']
            ?? null;

        if (
            !$publicId ||
            !$secureUrl
        ) {
            throw new RuntimeException(
                'Cloudinary returned an incomplete upload response.'
            );
        }

        return [
            'asset_id' =>
                $data['asset_id']
                ?? null,

            'public_id' =>
                $publicId,

            'secure_url' =>
                $secureUrl,

            'version' =>
                $data['version']
                ?? null,

            'width' =>
                $data['width']
                ?? null,

            'height' =>
                $data['height']
                ?? null,

            'format' =>
                $data['format']
                ?? null,

            'bytes' =>
                $data['bytes']
                ?? null,
        ];
    }
}