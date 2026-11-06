<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterFiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_switch_uses_one_pc_cable_and_requires_identity_before_native_switch_configuration(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 4]);

        $this->actingAs($user)->get(route('chapter.five'))
            ->assertOk()
            ->assertSeeText('Berpindah dari hAP ke MikroTik hEX')
            ->assertSeeText('Pindahkan kabel PC ke ether5 hEX')
            ->assertSee('data-ch5-stage="connect-switch"', false)
            ->assertDontSee('data-ch5-stage="connect-pc"', false)
            ->assertDontSee('data-task-client=', false)
            ->assertDontSee('data-ch5-unplug-hap', false)
            ->assertSee('data-save-identity', false)
            ->assertSee('data-open-switch', false)
            ->assertSee('data-ch5-patch-panel', false)
            ->assertSee('data-ch5-login', false)
            ->assertSee('data-ch5-connect-hex', false)
            ->assertSee('data-ch5-exit', false)
            ->assertSee('lab-pc-desktop.css', false)
            ->assertSee('class="lab-pc-shortcut"', false)
            ->assertSee('class="lab-pc-command"', false)
            ->assertSee('class="lab-pc-console"', false)
            ->assertSee('class="lab-pc-task-cmd-icon"', false)
            ->assertDontSee('class="ch5-client-desktop"', false)
            ->assertDontSee('class="ch5-client-terminal"', false)
            ->assertSee('hex-lite-front-v2.png', false)
            ->assertDontSee('class="ch5-inherited-bar"', false);

        $this->assertSame(4, $user->fresh()->completedAdventureChapters());
    }

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
