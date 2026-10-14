<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    /* =========================================================
       MEMBER ROLE
    ========================================================= */

    public const ROLE_MEMBER = 'member';

    /* =========================================================
       FILLABLE

       role is intentionally NOT fillable.

       This prevents someone from registering and sending:

       role = admin
       role = staff

       Laravel will always force new public users to "member".
    ========================================================= */

    protected $fillable = [
        'member_id',
        'firebase_uid',

        'fullname',
        'nickname',
        'username',
        'email',
        'mobile_number',
        'location',

        'password_set',
        'email_verified',
        'auth_provider',

        'verified_at',

        'registered_at',
        'last_login_at',
    ];

    /* =========================================================
       CASTS
    ========================================================= */

    protected function casts(): array
    {
        return [
            'password_set' => 'boolean',

            'email_verified' => 'boolean',

            'verified_at' => 'datetime',

            'registered_at' => 'datetime',

            'last_login_at' => 'datetime',
        ];
    }

    /* =========================================================
       MODEL EVENTS
    ========================================================= */

    protected static function booted(): void
    {
        /* =====================================================
           FORCE ROLE = MEMBER
        ===================================================== */

        static::creating(function (Member $member) {
            $member->role =
                self::ROLE_MEMBER;

            if (!$member->registered_at) {
                $member->registered_at =
                    now();
            }
        });

        /* =====================================================
           GENERATE MEMBER ID

           Example:
           MBR-000001
           MBR-000002
        ===================================================== */

        static::created(function (Member $member) {
            if (!$member->member_id) {
                $member->member_id =
                    'MBR-' .
                    str_pad(
                        (string) $member->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    );

                $member->saveQuietly();
            }
        });

        /* =====================================================
           AUTOMATIC MEMBER VERIFICATION
        ===================================================== */

        static::saving(function (Member $member) {
            $member
                ->updateVerificationStatus();
        });
    }

    /* =========================================================
       VERIFICATION REQUIREMENTS

       User is verified only when all seven are complete.
    ========================================================= */

    public function verificationRequirements(): array
    {
        return [
            'fullname' => [
                'label' =>
                    'Full name',

                'completed' =>
                    filled(
                        $this->fullname
                    ),
            ],

            'nickname' => [
                'label' =>
                    'Nickname',

                'completed' =>
                    filled(
                        $this->nickname
                    ),
            ],

            'username' => [
                'label' =>
                    'Username',

                'completed' =>
                    filled(
                        $this->username
                    ),
            ],

            'password_set' => [
                'label' =>
                    'Password setup',

                'completed' =>
                    $this->password_set === true,
            ],

            'mobile_number' => [
                'label' =>
                    'Mobile number',

                'completed' =>
                    filled(
                        $this->mobile_number
                    ),
            ],

            'location' => [
                'label' =>
                    'Location',

                'completed' =>
                    filled(
                        $this->location
                    ),
            ],

            'email' => [
                'label' =>
                    'Email address',

                'completed' =>
                    filled(
                        $this->email
                    ),
            ],
        ];
    }

    /* =========================================================
       CHECK IF MEMBER IS VERIFIED
    ========================================================= */

    public function isVerified(): bool
    {
        foreach (
            $this->verificationRequirements()
            as $requirement
        ) {
            if (!$requirement['completed']) {
                return false;
            }
        }

        return true;
    }

    /* =========================================================
       VERIFICATION PROGRESS
    ========================================================= */

    public function verificationProgress(): array
    {
        $requirements =
            $this->verificationRequirements();

        $completed =
            collect($requirements)
                ->filter(
                    fn (array $requirement) =>
                        $requirement['completed']
                )
                ->count();

        $total =
            count($requirements);

        return [
            'completed' =>
                $completed,

            'total' =>
                $total,

            'percentage' =>
                $total > 0
                    ? (int) round(
                        (
                            $completed /
                            $total
                        ) * 100
                    )
                    : 0,

            'verified' =>
                $completed === $total,

            'requirements' =>
                $requirements,
        ];
    }

    /* =========================================================
       AUTOMATIC VERIFICATION STATUS
    ========================================================= */

    public function updateVerificationStatus(): void
    {
        if ($this->isVerified()) {
            if (!$this->verified_at) {
                $this->verified_at =
                    now();
            }

            return;
        }

        $this->verified_at =
            null;
    }
}