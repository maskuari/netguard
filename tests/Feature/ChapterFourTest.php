<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterFourTest extends TestCase
{
    use RefreshDatabase;

    public function test_requires_chapter_three_and_an_active_account(): void
    {
        $this->get(route('chapter.four'))->assertRedirect(route('login'));
        $this->postJson(route('chapter.four.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertUnauthorized();
        $this->actingAs(User::factory()->inactive()->create(['completed_adventure_chapters' => 3]))->get(route('chapter.four'))->assertRedirect(route('login'));
        foreach ([0, 1, 2] as $completed) {
            $user = User::factory()->create(['completed_adventure_chapters' => $completed]);
            $this->actingAs($user)->get(route('chapter.four'))->assertRedirect(route('adventure'));
            $this->postJson(route('chapter.four.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertForbidden();
        }
    }

    public function test_contains_manual_wireless_hotspot_phone_and_file_workflows(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $response = $this->actingAs($user)->get(route('chapter.four'))->assertOk()
            ->assertSeeText('Lab Chapter 04')->assertSeeText('WiFi Interfaces')->assertSeeText('Security Profiles')
            ->assertSeeText('WPA2 PSK')->assertSeeText('Hotspot Setup')->assertSeeText('User Profiles')
            ->assertSeeText('hotspot/login.html')->assertSeeText('Notepad')->assertSeeText('HP uji')
            ->assertSee('chapter-four-workbench.js')->assertSee('chapter-four-simulation.js');
        $document = new \DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $xpath = new \DOMXPath($document);
        foreach (['wireless', 'wireless-edit', 'security-edit', 'hotspot', 'hotspot-setup', 'profile-edit', 'user-edit', 'files'] as $name) {
            $this->assertSame(1, $xpath->query('//*[@data-window="'.$name.'"][@hidden]')->length, $name);
        }
        $this->assertSame(1, $xpath->query('//*[@data-guide-scroll]//*[@data-guide-list]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-area][@hidden]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-notepad][@hidden]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-wifi-connect]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-login]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-screen="home"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-screen="wifi"][@hidden]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-screen="browser"][@hidden]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-open-wifi]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-phone-wifi-toggle][@role="switch"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-upload-login]')->length);
        $this->assertSame(5, $xpath->query('//*[@data-quiz-form]/fieldset')->length);
        $this->assertSame(1, $xpath->query('//*[@data-open-window="wireless"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-open-window="hotspot"]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-main-action or @data-test-client]')->length);
        $this->assertSame(8, $xpath->query('//*[@data-wireless-tab]')->length);
        $this->assertSame(8, $xpath->query('//*[@data-wireless-panel]')->length);
        $this->assertSame(8, $xpath->query('//*[@data-radio-tab]')->length);
        $this->assertSame(8, $xpath->query('//*[@data-radio-panel]')->length);
        $this->assertSame(4, $xpath->query('//*[@data-security-tab]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-radio-option="band"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-radio-option="frequency"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-security-option="unicastAes"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-security-option="groupTkip"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-wireless-find]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-field="security"]/option')->length);
        $this->assertSame(0, $xpath->query('//*[@data-field="security"]/option[text()="user"]')->length);
        foreach (['interfaces', 'addresses', 'dhcp', 'pools', 'networks'] as $configuration) {
            $this->assertSame(1, $xpath->query('//*[@data-inherited-'.$configuration.']')->length);
            $this->assertSame(0, $xpath->query('//*[@data-inherited-'.$configuration.']/*')->length);
        }
        $this->assertSame(1, $xpath->query('//script[contains(@src, "router-configuration.js")]')->length);
        $this->assertSame(11, $xpath->query('//*[@data-hotspot-tab]')->length);
        $this->assertSame(11, $xpath->query('//*[@data-window="interfaces"]//*[@data-inherited-tab]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-native-interfaces][@data-inherited-interfaces]')->length);
        $this->assertSame(3, $xpath->query('//*[@data-profile-tab]')->length);
        $this->assertSame(3, $xpath->query('//*[@data-user-tab]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-profile-option="keepalive"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-profile-option="autorefresh"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-user-option="limitUptime"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-window="files"]//*[@data-upload-login]//*[@data-login-file]')->length);
        $this->assertSame(0, $xpath->query('//*[@class="ch4-upload"]')->length);
        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
    }

    public function test_evaluation_rejects_incorrect_or_invalid_answers_without_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $this->actingAs($user)->postJson(route('chapter.four.complete'), ['answers' => [1, 0, 0, 1, 0]])->assertUnprocessable()->assertJsonPath('correctAnswers', 3);
        $this->postJson(route('chapter.four.complete'), ['answers' => [0, 0]])->assertUnprocessable()->assertJsonValidationErrors('answers');
        $this->postJson(route('chapter.four.complete'), ['answers' => [0, 0, 0, 0, 4]])->assertUnprocessable()->assertJsonValidationErrors('answers.4');
        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
    }

    public function test_correct_evaluation_completes_four_and_preserves_later_progress(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $this->actingAs($user)->postJson(route('chapter.four.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertOk()->assertJsonPath('completedChapters', 4)->assertJsonPath('correctAnswers', 5);
        $this->assertSame(4, $user->fresh()->completedAdventureChapters());
        $user->completed_adventure_chapters = 5;
        $user->save();
        $this->postJson(route('chapter.four.complete'), ['answers' => [0, 0, 0, 0, 0]])->assertOk()->assertJsonPath('completedChapters', 5);
    }

    public function test_map_opens_four_after_three_and_reset_locks_it(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);
        $this->actingAs($user)->get(route('adventure'))->assertOk()->assertDontSee('href="'.route('chapter.four').'"', false);
        $user->completed_adventure_chapters = 3;
        $user->save();
        $this->get(route('adventure'))->assertOk()->assertSee('href="'.route('chapter.four').'"', false);
        $this->postJson(route('chapter.one.reset'))->assertOk();
        $this->get(route('chapter.four'))->assertRedirect(route('adventure'));
    }
}
