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
            ->assertSeeText('System / Identity')
            ->assertSee('data-quiz-dialog', false)
            ->assertSee('data-finish-dialog', false)
            ->assertSeeText('Benar')
            ->assertSeeText('Salah');

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

    public function test_both_chapters_share_the_system_menu_and_keep_identity_available(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $menus = [];

        foreach ([
            ['chapter.one', '//*[@data-system-menu]', 'data-config-nav'],
            ['chapter.two', '//*[@data-ch2-submenu="system"]', 'data-open-window'],
        ] as [$route, $selector, $identityAttribute]) {
            $response = $this->actingAs($user)->get(route($route))->assertOk();
            $document = new \DOMDocument;
            $previousErrorMode = libxml_use_internal_errors(true);
            $document->loadHTML($response->getContent());
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrorMode);
            $xpath = new \DOMXPath($document);
            $items = [];

            foreach ($xpath->query($selector.'/*') as $item) {
                $items[] = trim($item->textContent);
            }

            $menus[] = $items;
            $this->assertSame(1, $xpath->query($selector.'/button[@'.$identityAttribute.'="identity"]')->length);
        }

        $this->assertSame($menus[0], $menus[1]);
        $this->assertGreaterThan(6, count($menus[0]));
        $this->assertContains('Reset Configuration', $menus[0]);
        $this->assertContains('Watchdog', $menus[0]);
    }

    public function test_correct_chapter_evaluation_saves_progress_once(): void
    {
        $user = User::factory()->create();
        $answers = [1, 2, 0, 3, 2];

        $this->actingAs($user)
            ->postJson(route('chapter.one.complete'), ['answers' => $answers])
            ->assertOk()
            ->assertJsonPath('completedChapters', 1)
            ->assertJsonPath('correctAnswers', 5)
            ->assertJsonPath('incorrectAnswers', 0)
            ->assertJsonPath('totalQuestions', 5);

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
            ->assertJsonPath('score', 1)
            ->assertJsonPath('correctAnswers', 1)
            ->assertJsonPath('incorrectAnswers', 4)
            ->assertJsonPath('totalQuestions', 5);

        $this->postJson(route('chapter.one.complete'), ['answers' => [1, 2, 0, 0, 0]])
            ->assertUnprocessable()
            ->assertJsonPath('correctAnswers', 3)
            ->assertJsonPath('incorrectAnswers', 2);

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
