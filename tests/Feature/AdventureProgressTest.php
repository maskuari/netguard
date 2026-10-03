<?php

namespace Tests\Feature;

use App\Models\User;
use DOMDocument;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdventureProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_user_starts_with_zero_progress_and_locked_modes(): void
    {
        $user = User::factory()->create()->fresh();

        $this->assertSame(0, $user->completedAdventureChapters());
        $this->assertSame(0, $user->adventureProgressPercentage());
        $this->assertFalse($user->isPracticeUnlocked());
        $this->assertFalse($user->isCertificationUnlocked());
    }

    #[DataProvider('progressBoundaries')]
    public function test_persisted_progress_unlocks_modes_at_the_required_chapters(
        int $completedChapters,
        int $percentage,
        bool $practiceUnlocked,
        bool $certificationUnlocked,
    ): void {
        $user = User::factory()->create();
        $user->completed_adventure_chapters = $completedChapters;
        $user->save();
        $user->refresh();

        $this->assertSame($completedChapters, $user->completedAdventureChapters());
        $this->assertSame($percentage, $user->adventureProgressPercentage());
        $this->assertSame($practiceUnlocked, $user->isPracticeUnlocked());
        $this->assertSame($certificationUnlocked, $user->isCertificationUnlocked());
    }

    /** @return array<string, array{int, int, bool, bool}> */
    public static function progressBoundaries(): array
    {
        return [
            'before adventure' => [0, 0, false, false],
            'chapter one complete' => [1, 20, false, false],
            'before practice unlock' => [2, 40, false, false],
            'practice unlock' => [3, 60, true, false],
            'before certification unlock' => [4, 80, true, false],
            'adventure finished' => [5, 100, true, true],
        ];
    }

    #[DataProvider('profileGenders')]
    public function test_profile_avatar_uses_the_selected_gender_or_existing_user_fallback(
        ?string $gender,
        string $characterDirectory,
    ): void {
        $user = User::factory()->create(['gender' => $gender])->fresh();

        $this->assertSame('images/asset/char/siswa/'.$characterDirectory.'/bicara_santai.png', $user->profileAvatarPath());
        $this->assertFileExists(public_path($user->profileAvatarPath()));
    }

    /** @return array<string, array{?string, string}> */
    public static function profileGenders(): array
    {
        return [
            'male profile' => ['pria', 'cowo'],
            'female profile' => ['wanita', 'cewe'],
            'existing account' => [null, 'cowo'],
        ];
    }

    public function test_opening_adventure_does_not_mark_chapters_complete(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('adventure'))->assertOk();

        $this->assertSame(0, $user->fresh()->completedAdventureChapters());
    }

    public function test_progress_is_not_mass_assignable(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($user->isFillable('completed_adventure_chapters'));
    }

    #[DataProvider('homepageProgressStates')]
    public function test_homepage_renders_saved_progress_mode_locks_and_female_avatar(
        int $completedChapters,
        int $percentage,
        string $practiceLocked,
        string $certificationLocked,
    ): void {
        $user = User::factory()->create(['gender' => 'wanita']);
        $user->completed_adventure_chapters = $completedChapters;
        $user->save();

        $response = $this->actingAs($user)->get(route('homepage'));

        $response->assertOk()->assertSeeText($completedChapters.' / 5 chapter selesai');

        $document = new DOMDocument;
        $document->loadHTML($response->getContent(), LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($document);
        $progress = $xpath->query('//progress[@aria-label="Progres Adventure Mode"]')->item(0);
        $practice = $xpath->query('//button[@data-home-panel="practice"]')->item(0);
        $certification = $xpath->query('//button[@data-home-panel="certification"]')->item(0);
        $avatar = $xpath->query('//span[@class="homepage-account__avatar"]/img')->item(0);

        $this->assertSame((string) $percentage, $progress->getAttribute('value'));
        $this->assertSame('100', $progress->getAttribute('max'));
        $this->assertSame($practiceLocked, $practice->getAttribute('data-mode-locked'));
        $this->assertSame($practiceLocked, $practice->getAttribute('aria-disabled'));
        $this->assertSame($certificationLocked, $certification->getAttribute('data-mode-locked'));
        $this->assertSame($certificationLocked, $certification->getAttribute('aria-disabled'));
        $this->assertSame(asset('images/asset/char/siswa/cewe/bicara_santai.png'), $avatar->getAttribute('src'));
    }

    /** @return array<string, array{int, int, string, string}> */
    public static function homepageProgressStates(): array
    {
        return [
            'both modes locked' => [0, 0, 'true', 'true'],
            'practice unlocked' => [3, 60, 'false', 'true'],
            'both modes unlocked' => [5, 100, 'false', 'false'],
        ];
    }
}
