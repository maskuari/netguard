<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterFiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_incorrect_evaluation_returns_the_correct_option_for_each_question(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 4]);

        $this->actingAs($user)
            ->postJson(route('chapter.five.complete'), ['answers' => [1, 1, 1, 1, 1]])
            ->assertUnprocessable()
            ->assertJsonPath('correctAnswers', 0)
            ->assertJsonPath('incorrectAnswers', 5)
            ->assertJsonPath('correctOptionIndexes', [0, 0, 0, 0, 0]);

        $this->assertSame(4, $user->fresh()->completedAdventureChapters());
    }
}
