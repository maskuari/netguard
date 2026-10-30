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
            ->assertSeeText('PC-Guru')
            ->assertSeeText('EVALUASI PEMAHAMAN')
            ->assertSee('data-quiz-dialog', false)
            ->assertSee('data-finish-dialog', false)
            ->assertSeeText('Benar')
            ->assertSeeText('Salah');

        $this->assertSame(1, $user->fresh()->completedAdventureChapters());
    }

    public function test_chapter_two_follows_four_interface_dhcp_setup_without_a_required_leases_mission(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $response = $this->actingAs($user)->get(route('chapter.two'))->assertOk();
        $document = new \DOMDocument;
        $previousErrorMode = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrorMode);
        $xpath = new \DOMXPath($document);
        $this->assertSame(4, $xpath->query('//*[@data-dhcp-task]')->length);
        $this->assertSame(4, $xpath->query('//*[@data-pool-row]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-request-ip or @data-client-checklist]')->length);
        $this->assertSame(0, $xpath->query('//template[@data-concept="verify"]')->length);
        $response->assertSeeText('Leases')->assertSeeText('ether3-local')->assertSeeText('wlan1');
    }

    public function test_dhcp_client_uses_a_list_and_native_style_settings_instead_of_a_custom_status_box(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $response = $this->actingAs($user)->get(route('chapter.two'))->assertOk();
        $document = new \DOMDocument;
        $previousErrorMode = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrorMode);
        $xpath = new \DOMXPath($document);

        $this->assertSame(1, $xpath->query('//*[@data-window="wan"]//button[@data-new-wan]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-window="wan"]//*[@data-wan-row and @hidden]')->length);
        $this->assertSame(3, $xpath->query('//*[@data-window="wan-edit"]//button[@data-wan-tab]')->length);
        $this->assertSame(2, $xpath->query('//*[@data-window="wan-edit"]//input[@type="checkbox" and @checked]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-window="wan"]//*[contains(@class, "ch2-window-status")]')->length);
        $response->assertSeeText('Use Peer DNS')->assertSeeText('Use Peer NTP')->assertSeeText('Add Default Route')->assertSeeText('Default Route Distance');
    }

    public function test_five_correct_answers_complete_chapter_two_without_regressing_later_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $answers = [1, 2, 3, 0, 2];

        $this->actingAs($user)->postJson(route('chapter.two.complete'), ['answers' => $answers])
            ->assertOk()->assertJsonPath('completedChapters', 2)
            ->assertJsonPath('correctAnswers', 5)
            ->assertJsonPath('incorrectAnswers', 0)
            ->assertJsonPath('totalQuestions', 5);
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
            ->assertUnprocessable()->assertJsonPath('score', 1)
            ->assertJsonPath('correctAnswers', 1)
            ->assertJsonPath('incorrectAnswers', 4)
            ->assertJsonPath('totalQuestions', 5);
        $this->postJson(route('chapter.two.complete'), ['answers' => [1, 2, 3, 1, 0]])
            ->assertUnprocessable()
            ->assertJsonPath('correctAnswers', 3)
            ->assertJsonPath('incorrectAnswers', 2);
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
