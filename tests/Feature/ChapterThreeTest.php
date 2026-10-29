<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterThreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_chapter_three_requires_an_active_account_and_chapter_two(): void
    {
        $this->get(route('chapter.three'))->assertRedirect(route('login'));
        $this->postJson(route('chapter.three.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertUnauthorized();
        $this->actingAs(User::factory()->inactive()->create(['completed_adventure_chapters' => 2]))->get(route('chapter.three'))->assertRedirect(route('login'));
        foreach ([0, 1] as $completed) {
            $user = User::factory()->create(['completed_adventure_chapters' => $completed]);
            $this->actingAs($user)->get(route('chapter.three'))->assertRedirect(route('adventure'))->assertSessionHas('chapter_notice');
            $this->postJson(route('chapter.three.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertForbidden();
            $this->assertSame($completed, $user->fresh()->completedAdventureChapters());
        }
    }

    public function test_chapter_three_contains_the_module_missions_and_shared_evaluation(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);
        $response = $this->actingAs($user)->get(route('chapter.three'))->assertOk()
            ->assertSeeText('Lab Chapter 03')->assertSeeText('Akses Internet melalui Router')
            ->assertSeeText('DNS Settings')->assertSeeText('Allow Remote Requests')->assertSeeText('masquerade')
            ->assertSeeText('ether1-internet')->assertSeeText('0.0.0.0/0')->assertSeeText('New Terminal')
            ->assertSeeText('EVALUASI PEMAHAMAN')->assertSeeText('Benar')->assertSeeText('Salah');
        $document = new \DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $xpath = new \DOMXPath($document);
        $this->assertSame(1, $xpath->query('//*[@data-quiz-dialog]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-finish-dialog]')->length);
        $this->assertSame(5, $xpath->query('//*[@data-quiz-form]/fieldset')->length);
        $this->assertSame(2, $xpath->query('//*[@data-dns-server]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-window]//*[@data-window]')->length);
        foreach (['dns', 'firewall', 'nat-edit', 'routes', 'terminal', 'wan', 'ping'] as $window) {
            $this->assertSame(1, $xpath->query('//*[@data-window="'.$window.'" and @hidden]')->length);
        }
        $this->assertSame(2, $user->fresh()->completedAdventureChapters());
    }

    public function test_correct_evaluation_saves_chapter_three_and_preserves_later_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);
        $this->actingAs($user)->postJson(route('chapter.three.complete'), ['answers' => [0, 0, 0, 0, 0]])
            ->assertOk()->assertJsonPath('completedChapters', 3)->assertJsonPath('correctAnswers', 5)
            ->assertJsonPath('incorrectAnswers', 0)->assertJsonPath('totalQuestions', 5);
        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
        $this->assertTrue($user->fresh()->isPracticeUnlocked());
        $user->completed_adventure_chapters = 5;
        $user->save();
        $this->postJson(route('chapter.three.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertOk()->assertJsonPath('completedChapters', 5);
        $this->assertSame(5, $user->fresh()->completedAdventureChapters());
    }

    public function test_incorrect_and_invalid_answers_do_not_complete_chapter_three(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);
        $this->actingAs($user)->postJson(route('chapter.three.complete'), ['answers' => [0, 1, 0, 1, 0]])
            ->assertUnprocessable()->assertJsonPath('correctAnswers', 3)->assertJsonPath('incorrectAnswers', 2);
        $this->postJson(route('chapter.three.complete'), ['answers' => [1, 1, 1, 1, 1]])
            ->assertUnprocessable()->assertJsonPath('correctAnswers', 0)->assertJsonPath('incorrectAnswers', 5);
        foreach ([[0, 0], [0, 0, 0, 0, 4]] as $answers) {
            $this->postJson(route('chapter.three.complete'), ['answers' => $answers])->assertUnprocessable()->assertJsonValidationErrors(count($answers) === 2 ? 'answers' : 'answers.4');
        }
        $this->assertSame(2, $user->fresh()->completedAdventureChapters());
    }

    public function test_map_opens_chapter_three_only_after_chapter_two_and_reset_locks_it(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $this->actingAs($user)->get(route('adventure'))->assertOk()->assertDontSee('href="'.route('chapter.three').'"', false);
        $user->completed_adventure_chapters = 2;
        $user->save();
        $this->get(route('adventure'))->assertOk()->assertSee('href="'.route('chapter.three').'"', false);
        $this->postJson(route('chapter.one.reset'))->assertOk();
        $this->get(route('chapter.three'))->assertRedirect(route('adventure'));
    }
}
