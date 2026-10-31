<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterThreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_ip_menu_has_the_same_entries_and_order_in_all_chapters(): void
    {
        $student = User::factory()->create(['completed_adventure_chapters' => 2]);
        $expected = ['ARP', 'Addresses', 'Cloud', 'DHCP Client', 'DHCP Relay', 'DHCP Server', 'DNS', 'Firewall', 'Hotspot', 'IPsec', 'Kid Control', 'Neighbors', 'Packing', 'Pool', 'Routes', 'Services', 'Settings', 'SMB', 'SNMP', 'Socks', 'TFTP', 'Traffic Flow', 'UPnP', 'Web Proxy'];

        foreach (['chapter.one', 'chapter.two', 'chapter.three'] as $route) {
            $response = $this->actingAs($student)->get(route($route))->assertOk();
            $document = new \DOMDocument;
            $previous = libxml_use_internal_errors(true);
            $document->loadHTML($response->getContent());
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
            $xpath = new \DOMXPath($document);
            $items = [];
            foreach ($xpath->query('//*[@data-ip-item]') as $item) {
                $items[] = $item->getAttribute('data-ip-item');
                $this->assertSame($item->getAttribute('data-ip-item'), trim($item->textContent));
            }
            $this->assertSame($expected, $items, $route);
            $this->assertSame(1, $xpath->query('//*[@data-guide-list]')->length);
            $this->assertSame(0, $xpath->query('//*[@data-device-checklist or @data-device-panel]')->length);
            if ($route !== 'chapter.one') {
                $this->assertSame(1, $xpath->query('//*[@data-guide-scroll]//*[@data-guide-list]')->length);
                $this->assertSame(0, $xpath->query('//*[@data-guide-scroll]//*[@data-previous]')->length);
            }
            $this->assertSame(1, $xpath->query('//*[@data-pc-home]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-pc-network]')->length);
            $this->assertSame(1, $xpath->query('//script[contains(@src, "game-sound-data.js")][@defer]')->length);
            $this->assertSame(0, $xpath->query('//*[@data-sound-base]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-pc-task-winbox]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-pc-task-cmd]')->length);
            $this->assertSame(0, $xpath->query('//*[@data-pc-desktop]//*[@data-pc-toolbar]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-pc-desktop]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-pc-open-winbox]')->length);
            $this->assertGreaterThanOrEqual(1, $xpath->query('//*[@data-open-client-cmd="local"]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-client-command-form="local"]')->length);
            $this->assertSame(1, $xpath->query('//script[contains(@src, "lab-pc-desktop.js")][@defer]')->length);
            $this->assertSame(1, $xpath->query('//link[contains(@href, "chapter-step-guide.css")]')->length);
            $this->assertSame(1, $xpath->query('//script[contains(@src, "chapter-step-guide.js")][@defer]')->length);
            $scripts = array_map(fn ($script) => $script->getAttribute('src'), iterator_to_array($xpath->query('//script[@src]')));
            $guideScript = array_key_first(array_filter($scripts, fn ($source) => str_contains($source, 'chapter-step-guide.js')));
            $chapterScript = array_key_first(array_filter($scripts, fn ($source) => str_contains($source, match ($route) {
                'chapter.one' => 'chapter-one.js',
                'chapter.two' => 'chapter-two-workbench.js',
                'chapter.three' => 'chapter-three-workbench.js',
            })));
            $this->assertNotNull($guideScript);
            $this->assertNotNull($chapterScript);
            $this->assertLessThan($chapterScript, $guideScript);
            $this->assertSame(1, $xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " winbox-ip-menu ")][@hidden]')->length);
        }
    }

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
        $this->assertSame(1, $xpath->query('//*[@data-add-dns-server]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-dns-second][@hidden]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-firewall-tab="nat"]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-firewall-panel="nat"][@hidden]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-main-action]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-test-client]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-client-tests]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-select-device]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-pc-home]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-pc-open-winbox]')->length);
        foreach (['local'] as $group) {
            $this->assertSame(1, $xpath->query('//*[@data-client-cmd="'.$group.'"][@hidden]')->length);
            $this->assertSame(1, $xpath->query('//*[@data-client-command-form="'.$group.'"]')->length);
            $this->assertSame(0, $xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " routeros ")]//*[@data-client-command-form]')->length);
        }
        $this->assertSame(2, $xpath->query('//*[@data-inspect-wan]')->length);
        $this->assertSame(1, $xpath->query('//*[@data-window="wan"]//*[@data-inspect-wan="client"]')->length);
        $this->assertSame(0, $xpath->query('//*[@data-window="interfaces"]//*[@data-inspect-wan]')->length);
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
            ->assertUnprocessable()->assertJsonPath('correctAnswers', 3)->assertJsonPath('incorrectAnswers', 2)
            ->assertJsonPath('correctOptionIndexes', [0, 0, 0, 0, 0]);
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
