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

    public function test_all_chapters_share_navigation_without_a_play_timer(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);

        foreach (['chapter.one', 'chapter.two', 'chapter.three'] as $route) {
            $response = $this->actingAs($user)->get(route($route))->assertOk();
            $document = new \DOMDocument;
            $previousErrorMode = libxml_use_internal_errors(true);
            $document->loadHTML($response->getContent());
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrorMode);
            $xpath = new \DOMXPath($document);
            $header = '//header[contains(@class, "chapter-navbar")]';

            $this->assertSame(1, $xpath->query($header)->length);
            $this->assertSame(1, $xpath->query($header.'/button[@data-step-back]')->length);
            $this->assertSame(1, $xpath->query($header.'/button[@data-save and @data-save-progress]/svg')->length);
            $this->assertSame(1, $xpath->query($header.'/a[@aria-label="Kembali ke beranda chapter"]')->length);
            $this->assertSame(0, $xpath->query('//*[@data-time]')->length);
            $this->assertGreaterThan(1, $xpath->query('//*[@data-step-back]')->length);
            $response->assertDontSeeText('WAKTU BERMAIN')->assertSee('js/chapter-navbar.js', false);
        }
    }

    public function test_winbox_loader_has_simple_mode_controls_and_an_editable_connection_address(): void
    {
        $response = $this->actingAs(User::factory()->create())->get(route('chapter.one'))->assertOk();
        $document = new \DOMDocument;
        $previousErrorMode = libxml_use_internal_errors(true);
        $document->loadHTML($response->getContent());
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrorMode);
        $xpath = new \DOMXPath($document);

        $this->assertSame(1, $xpath->query('//input[@data-connect-to and not(@readonly)]')->length);
        $this->assertSame(2, $xpath->query('//button[@data-loader-tab and @role="tab"]')->length);
        $this->assertSame(1, $xpath->query('//button[@data-loader-add]')->length);
        $this->assertSame(1, $xpath->query('//input[@data-loader-find]')->length);
        $this->assertSame(6, $xpath->query('//button[@data-neighbor-row]/span')->length);
        $response->assertSeeText('Connect To RoMON')->assertSeeText('Uptime');
    }

    public function test_chapters_share_physical_interface_columns_and_unused_rows(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 1]);
        $tables = [];
        foreach (['chapter.one', 'chapter.two'] as $route) {
            $response = $this->actingAs($user)->get(route($route))->assertOk();
            $document = new \DOMDocument;
            $previousErrorMode = libxml_use_internal_errors(true);
            $document->loadHTML($response->getContent());
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrorMode);
            $xpath = new \DOMXPath($document);
            $table = '//*[@data-physical-interface-list]';
            $this->assertSame(3, $xpath->query($table.'/button[@data-edit-interface]')->length);
            $headers = [];
            foreach ($xpath->query($table.'/div[1]/span') as $cell) {
                $headers[] = trim($cell->textContent);
            }
            $rows = [];
            foreach ($xpath->query($table.'/div[contains(@class, "interface-list__static")]') as $row) {
                $cells = [];
                foreach ($row->childNodes as $cell) {
                    if ($cell instanceof \DOMElement) {
                        $cells[] = trim($cell->textContent);
                    }
                }
                $rows[] = $cells;
            }
            $tables[] = [$headers, $rows];
        }
        $this->assertSame($tables[0], $tables[1]);
        $this->assertCount(11, $tables[0][0]);
        $this->assertCount(2, $tables[0][1]);
    }

    public function test_configuration_material_is_presented_in_learning_dialog_templates(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('chapter.one'))
            ->assertOk()
            ->assertSee('data-configuration-learning', false)
            ->assertSee('data-configuration-concept="identity"', false)
            ->assertSee('data-configuration-concept="interfaces"', false)
            ->assertSee('data-start-configuration-practice', false)
            ->assertSeeText('Apa itu Identity router?')
            ->assertSeeText('Mengapa port perlu diberi nama?')
            ->assertSeeText('Apa tujuannya untuk langkah berikutnya?');
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
