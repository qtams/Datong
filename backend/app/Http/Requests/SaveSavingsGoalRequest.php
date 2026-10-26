<?php

namespace App\Http\Requests;

use App\Models\Member;
use App\Models\MemberSavingsGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSavingsGoalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->attributes->get('member') instanceof Member;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('name'))) {
            $this->merge(['name' => trim($this->input('name'))]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:25'],
            'icon_id' => ['required', Rule::in(MemberSavingsGoal::ICON_IDS)],
            'target_amount' => ['required', 'numeric', 'min:0.01', 'max:9999999999999.99', 'regex:/^\d{1,13}(?:\.\d{1,2})?$/'],
            'current_amount' => ['required', 'numeric', 'min:0', 'max:9999999999999.99', 'regex:/^\d{1,13}(?:\.\d{1,2})?$/'],
            'target_date' => ['nullable', 'date_format:Y-m-d'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=2048,max_height=2048'],
            'remove_image' => ['sometimes', 'boolean', Rule::prohibitedIf($this->hasFile('image'))],
            'version' => [$this->route('savingsGoalId') === null ? 'prohibited' : 'required', 'integer', 'min:1'],
        ];
    }
}
