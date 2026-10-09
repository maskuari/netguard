<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterOneTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_signed_in_users_can_open_chapter_one(): void
    {
        $this->get(route('chapter.one'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->inactive()->create())
            ->get(route('chapter.one'))
            ->assertRedirect(route('login'));
    }

    public function test_chapter_one_displays_module_topics_without_marking_progress_complete(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('chapter.one'))
            ->assertOk()
            ->assertSeeText('Perangkat & Konfigurasi Awal Router')
            ->assertSeeText('MikroTik hEX')
            ->assertSeeText('LAN tester')
            ->assertSeeText('ether1-internet')
            ->assertSeeText('System / Identity');

        $this->assertSame(0, $user->fresh()->completedAdventureChapters());
    }

    public function test_mission_panels_are_not_nested_inside_other_missions(): void
    {
        $response = $this->actingAs(User::factory()->create())
            ->get(route('chapter.one'))
            ->assertOk();

        $document = new \DOMDocument;
        $previousErrorMode = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrorMode);
        $xpath = new \DOMXPath($document);

        $this->assertSame(0, $xpath->query('//*[@data-stage]//*[@data-stage]')->length);

        foreach (['pc', 'winbox', 'config', 'quiz', 'finish'] as $stage) {
            $panels = $xpath->query('//*[@data-stage="'.$stage.'"]');
            $this->assertSame(1, $panels->length);
            $this->assertSame('lab-board__body', $panels->item(0)->parentNode->getAttribute('class'));
        }
    }

    public function test_correct_chapter_evaluation_saves_progress_once(): void
    {
        $user = User::factory()->create();
        $answers = [1, 2, 0, 3, 2];

        $this->actingAs($user)
            ->postJson(route('chapter.one.complete'), ['answers' => $answers])
            ->assertOk()
            ->assertJsonPath('completedChapters', 1);

        $this->assertSame(1, $user->fresh()->completedAdventureChapters());

        $user->completed_adventure_chapters = 3;
        $user->save();

        $this->postJson(route('chapter.one.complete'), ['answers' => $answers])
            ->assertOk()
            ->assertJsonPath('completedChapters', 3);

        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
    }

    public function test_incorrect_or_incomplete_evaluation_does_not_save_progress(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('chapter.one.complete'), ['answers' => [0, 0, 0, 0, 0]])
            ->assertUnprocessable()
            ->assertJsonPath('score', 1);

        $this->postJson(route('chapter.one.complete'), ['answers' => [1, 2]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers');

        $this->assertSame(0, $user->fresh()->completedAdventureChapters());
    }

    public function test_reset_progress_clears_completed_adventure_chapters(): void
    {
        $user = User::factory()->create();
        $user->completed_adventure_chapters = 4;
        $user->save();

        $this->actingAs($user)
            ->postJson(route('chapter.one.reset'))
            ->assertOk()
            ->assertJsonPath('completedChapters', 0);

        $this->assertSame(0, $user->fresh()->completedAdventureChapters());
    }

    public function test_guest_cannot_reset_adventure_progress(): void
    {
        $this->postJson(route('chapter.one.reset'))
            ->assertUnauthorized();
    }

    public function test_guest_cannot_submit_chapter_result(): void
    {
        $this->postJson(route('chapter.one.complete'), ['answers' => [1, 2, 0, 3, 2]])
            ->assertUnauthorized();
    }
}
