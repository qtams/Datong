<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /* =====================================================
       NORMALIZE INPUT
    ===================================================== */

    protected function prepareForValidation(): void
    {
        $this->merge([
            'fullname' =>
                trim(
                    (string) $this->input(
                        'fullname',
                        ''
                    )
                ),

            'nickname' =>
                trim(
                    (string) $this->input(
                        'nickname',
                        ''
                    )
                ),

            'username' =>
                strtolower(
                    trim(
                        (string) $this->input(
                            'username',
                            ''
                        )
                    )
                ),

            'email' =>
                strtolower(
                    trim(
                        (string) $this->input(
                            'email',
                            ''
                        )
                    )
                ),
        ]);
    }

    /* =====================================================
       RULES
    ===================================================== */

    public function rules(): array
    {
        $routeUser =
            $this->route('user');

        $userId =
            $routeUser instanceof User
                ? $routeUser->id
                : $routeUser;

        return [
            'fullname' => [
                'required',
                'string',
                'max:255',
            ],

            'nickname' => [
                'nullable',
                'string',
                'max:100',
            ],

            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',

                /*
                 * Lowercase letters,
                 * numbers,
                 * dot,
                 * underscore,
                 * dash.
                 */
                'regex:/^[a-z0-9._-]+$/',

                Rule::unique(
                    'users',
                    'username'
                )->ignore(
                    $userId
                ),
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',

                Rule::unique(
                    'users',
                    'email'
                )->ignore(
                    $userId
                ),
            ],

            'birthday' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'role' => [
                'required',

                Rule::in([
                    'Admin',
                    'Finance',
                    'Staff',
                    'Viewer',
                ]),
            ],
        ];
    }

    /* =====================================================
       MESSAGES
    ===================================================== */

    public function messages(): array
    {
        return [
            'fullname.required' =>
                'Full name is required.',

            'username.required' =>
                'Username is required.',

            'username.min' =>
                'Username must be at least 3 characters.',

            'username.max' =>
                'Username cannot exceed 50 characters.',

            'username.regex' =>
                'Username can only contain letters, numbers, dots, underscores and dashes.',

            'username.unique' =>
                'That username is already in use.',

            'email.required' =>
                'Email address is required.',

            'email.email' =>
                'Enter a valid email address.',

            'email.unique' =>
                'That email address is already in use.',

            'birthday.required' =>
                'Birthday is required.',

            'birthday.before_or_equal' =>
                'Birthday cannot be in the future.',

            'role.required' =>
                'Role is required.',

            'role.in' =>
                'The selected role is invalid.',
        ];
    }
}