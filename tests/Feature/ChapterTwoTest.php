<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterTwoTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_and_user_without_chapter_one_cannot_open_chapter_two(): void
    {
        $this->get(route('chapter.two'))->assertRedirect(route('login'));

        $user = User::factory()->create();
        $this->actingAs($user)->get(route('chapter.two'))->assertRedirect(route('adventure'));
        $this->postJson(route('chapter.two.complete'), ['answers' => [1, 2, 3, 0, 2]])->assertForbidden();
        $this->assertSame(0, $user->fresh()->completedAdventureChapters());
    }

    public function test_unlocked_chapter_two_displays_all_module_missions_without_completing_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);

        $this->actingAs($user)->get(route('chapter.two'))
            ->assertOk()
            ->assertSeeText('Pengalamatan IP, VLAN dan DHCP')
            ->assertSeeText('vlan1-siswa')
            ->assertSeeText('ether1-internet')
            ->assertSeeText('192.168.40.1/24')
            ->assertSeeText('Addresses to Give Out')
            ->assertSeeText('PC Guru')
            ->assertSeeText('EVALUASI PEMAHAMAN');

        $this->assertSame(1, $user->fresh()->completedAdventureChapters());
    }

    public function test_five_correct_answers_complete_chapter_two_without_regressing_later_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $answers = [1, 2, 3, 0, 2];

        $this->actingAs($user)->postJson(route('chapter.two.complete'), ['answers' => $answers])
            ->assertOk()->assertJsonPath('completedChapters', 2);
        $this->assertSame(2, $user->fresh()->completedAdventureChapters());

        $user->completed_adventure_chapters = 3;
        $user->save();
        $this->postJson(route('chapter.two.complete'), ['answers' => $answers])
            ->assertOk()->assertJsonPath('completedChapters', 3);
    }

    public function test_incorrect_or_incomplete_answers_do_not_complete_chapter_two(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);

        $this->actingAs($user)->postJson(route('chapter.two.complete'), ['answers' => [0, 0, 0, 0, 0]])
            ->assertUnprocessable()->assertJsonPath('score', 1);
        $this->postJson(route('chapter.two.complete'), ['answers' => [1, 2]])
            ->assertUnprocessable()->assertJsonValidationErrors('answers');
        $this->assertSame(1, $user->fresh()->completedAdventureChapters());
    }

    public function test_reset_adventure_progress_locks_chapter_two_again(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);

        $this->actingAs($user)->postJson(route('chapter.one.reset'))->assertOk();
        $this->get(route('chapter.two'))->assertRedirect(route('adventure'));
    }
}
