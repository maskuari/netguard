<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'gender'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    public const int ADVENTURE_CHAPTER_COUNT = 5;

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'completed_adventure_chapters' => 'integer',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'practice_score' => 'integer',
            'certification_score' => 'integer',
        ];
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function profileAvatarPath(): string
    {
        $characterDirectory = $this->gender === 'wanita' ? 'cewe' : 'cowo';

        return 'images/asset/char/siswa/'.$characterDirectory.'/bicara_santai.png';
    }

    public function completedAdventureChapters(): int
    {
        return max(0, min(self::ADVENTURE_CHAPTER_COUNT, (int) $this->completed_adventure_chapters));
    }

    public function adventureProgressPercentage(): int
    {
        return (int) round($this->completedAdventureChapters() / self::ADVENTURE_CHAPTER_COUNT * 100);
    }

    public function isPracticeUnlocked(): bool
    {
        return $this->completedAdventureChapters() >= 3;
    }

    public function isCertificationUnlocked(): bool
    {
        return $this->completedAdventureChapters() === self::ADVENTURE_CHAPTER_COUNT;
    }
}
