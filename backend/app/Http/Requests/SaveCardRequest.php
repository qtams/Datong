<?php

namespace App\Http\Requests;

use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCardRequest extends FormRequest
{
    /* =========================================================
       AUTHORIZE
    ========================================================= */

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /* =========================================================
       NORMALIZE INPUT
    ========================================================= */

    protected function prepareForValidation(): void
    {
        $values = [];

        if ($this->has('name')) {
            $values['name'] = trim(
                (string) $this->input(
                    'name'
                )
            );
        }

        if ($this->has('type')) {
            $values['type'] = strtolower(
                trim(
                    (string) $this->input(
                        'type'
                    )
                )
            );
        }

        if ($this->has('status')) {
            $values['status'] = strtolower(
                trim(
                    (string) $this->input(
                        'status'
                    )
                )
            );
        }

        if (!empty($values)) {
            $this->merge(
                $values
            );
        }
    }

    /* =========================================================
       RULES
    ========================================================= */

    public function rules(): array
    {
        $routeCard =
            $this->route(
                'card'
            );

        $cardId =
            $routeCard instanceof Card
                ? $routeCard->id
                : (
                    is_numeric(
                        $routeCard
                    )
                        ? (int) $routeCard
                        : null
                );

        /*
         * Store route has no {card}.
         *
         * Update route has {card}.
         *
         * Our update uses POST because multipart file uploads
         * are more reliable this way.
         */
        $creating =
            $routeCard === null;

        return [
            'name' => [
                'required',

                'string',

                'max:100',

                Rule::unique(
                    'cards',
                    'name'
                )->ignore(
                    $cardId
                ),
            ],

            'type' => [
                'required',

                'string',

                Rule::in([
                    Card::TYPE_BANK,

                    Card::TYPE_E_WALLET,
                ]),
            ],

            'status' => [
                'required',

                'string',

                Rule::in([
                    Card::STATUS_ACTIVE,

                    Card::STATUS_INACTIVE,
                ]),
            ],

            'landscape_image' => [
                $creating
                    ? 'required'
                    : 'nullable',

                'file',

                'image',

                'mimes:jpg,jpeg,png,webp',

                'max:5120',
            ],

            'portrait_image' => [
                $creating
                    ? 'required'
                    : 'nullable',

                'file',

                'image',

                'mimes:jpg,jpeg,png,webp',

                'max:5120',
            ],
        ];
    }

    /* =========================================================
       MESSAGES
    ========================================================= */

    public function messages(): array
    {
        return [
            'name.required' =>
                'Card name is required.',

            'name.unique' =>
                'A card with this name already exists.',

            'type.required' =>
                'Card type is required.',

            'type.in' =>
                'Card type must be Bank or E-Wallet.',

            'status.required' =>
                'Card status is required.',

            'status.in' =>
                'Card status must be Active or Inactive.',

            'landscape_image.required' =>
                'Landscape image is required.',

            'landscape_image.image' =>
                'Landscape file must be an image.',

            'landscape_image.mimes' =>
                'Landscape image must be JPG, PNG or WEBP.',

            'landscape_image.max' =>
                'Landscape image cannot exceed 5 MB.',

            'portrait_image.required' =>
                'Portrait image is required.',

            'portrait_image.image' =>
                'Portrait file must be an image.',

            'portrait_image.mimes' =>
                'Portrait image must be JPG, PNG or WEBP.',

            'portrait_image.max' =>
                'Portrait image cannot exceed 5 MB.',
        ];
    }
}