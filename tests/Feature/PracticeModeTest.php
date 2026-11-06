<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PracticeEvaluator;
use App\Services\PracticeScenario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PracticeModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_practice_requires_login_and_chapter_three_completion(): void
    {
        $this->get(route('practice'))->assertRedirect(route('login'));
        $user = User::factory()->create(['completed_adventure_chapters' => 2]);
        $this->actingAs($user)->get(route('practice'))->assertRedirect(route('homepage'));
        $this->postJson(route('practice.check', 'unknown'), ['state' => []])->assertForbidden();
    }

    public function test_opening_practice_creates_a_case_and_refresh_keeps_it_without_revealing_grading_rules(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $response = $this->actingAs($user)->get(route('practice'))->assertRedirect();
        $url = $response->headers->get('Location');
        $this->get($url)->assertOk()->assertSeeText('Selesaikan jawaban')->assertSeeText('PAK AMAT')->assertSee('practice-simulator.js', false)
            ->assertSee('data-practice-submit hidden', false)
            ->assertViewHas('scenario', fn (array $scenario): bool => ! isset($scenario['rules'], $scenario['owner']))
            ->assertViewHas('scenario', fn (array $scenario): bool => isset($scenario['briefing']['initial'], $scenario['briefing']['outcome']))
            ->assertSee('data-case-previous', false)->assertSee('ch2-dialogue-overlay__teacher', false)
            ->assertDontSee('data-briefing-student', false)
            ->assertDontSee('chapter-step-guide.js', false)->assertDontSee('data-step-back', false);
        $this->get($url)->assertOk();
        $this->assertCount(1, session('practice.attempts'));
        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
        $this->assertNull($user->fresh()->practice_score);
    }

    /** @return array<string, array{string}> */
    public static function caseTypes(): array
    {
        return array_combine(PracticeScenario::TYPES, array_map(fn (string $type): array => [$type], PracticeScenario::TYPES));
    }

    #[DataProvider('caseTypes')]
    public function test_every_case_explains_its_initial_state_task_and_exact_requirements(string $type): void
    {
        $generator = new PracticeScenario;
        $scenario = $generator->generate(type: $type);
        $briefing = $generator->briefing($scenario);

        foreach (['context', 'initial', 'assignment', 'outcome', 'submission'] as $section) {
            $this->assertNotEmpty($briefing[$section], $type.': '.$section);
        }
        $this->assertSame($scenario['description'], $briefing['assignment']);
        $this->assertSame($scenario['clues'], $briefing['requirements']);
        $this->assertStringContainsString('Selesaikan jawaban', $briefing['submission']);
        $this->assertArrayNotHasKey('rules', $briefing);
        if (in_array($type, ['identity', 'switch-identity'], true)) {
            $this->assertStringContainsString('Identity perangkat masih MikroTik', $briefing['initial']);
            $this->assertStringContainsString($scenario['initialState']['device'], $briefing['initial']);
        }
        if ($type === 'dhcp') {
            $this->assertStringContainsString($scenario['initialState']['tables']['addresses'][0]['address'], $briefing['initial']);
        }
    }

    #[DataProvider('caseTypes')]
    public function test_every_case_starts_unfinished_and_accepts_its_complete_solution(string $type): void
    {
        $generator = new PracticeScenario;
        $evaluator = new PracticeEvaluator;
        $scenario = $generator->generate(type: $type);
        $this->assertFalse($evaluator->evaluate($scenario, $scenario['initialState'])['correct'], $type.' must require work');
        $solution = $this->solution($scenario);
        $result = $evaluator->evaluate($scenario, $solution);
        $this->assertTrue($result['correct'], implode('\n', $result['errors']));
        $this->assertSame([], $result['errors']);
    }

    public function test_feedback_lists_all_mistakes_and_cannot_be_replaced_after_submission(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $scenario = (new PracticeScenario)->generate(type: 'dns');
        $scenario['owner'] = $user->id;
        $this->actingAs($user)->withSession(['practice' => ['attempts' => [$scenario['id'] => $scenario]]]);
        $response = $this->postJson(route('practice.check', $scenario['id']), ['state' => $scenario['initialState']])->assertOk()->assertJsonPath('correct', false);
        $response->assertJsonCount(2, 'errors');
        $this->assertStringContainsString('Servers DNS', $response->json('errors.0'));
        $this->assertStringContainsString('Allow Remote Requests', $response->json('errors.1'));
        $this->postJson(route('practice.check', $scenario['id']), ['state' => $this->solution($scenario)])->assertExactJson($response->json());
        $this->assertNull($user->fresh()->practice_score);
        $this->assertSame(3, $user->fresh()->completedAdventureChapters());
    }

    public function test_retry_guarantees_a_different_case_type_and_old_attempts_are_scoped_to_the_account(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $scenario = (new PracticeScenario)->generate(type: 'identity');
        $scenario['owner'] = $user->id;
        $this->actingAs($user)->withSession(['practice' => ['attempts' => [$scenario['id'] => $scenario]]]);
        $this->get(route('practice', ['previous' => $scenario['id']]))->assertRedirect();
        $attempts = session('practice.attempts');
        $next = end($attempts);
        $this->assertNotSame($scenario['id'], $next['id']);
        $this->assertNotSame($scenario['type'], $next['type']);
        $other = User::factory()->create(['completed_adventure_chapters' => 3]);
        $this->actingAs($other)->postJson(route('practice.check', $scenario['id']), ['state' => $scenario['initialState']])->assertNotFound();
        $this->get(route('practice', ['attempt' => $scenario['id']]))->assertRedirect();
    }

    public function test_edited_desktop_html_only_counts_after_uploading_it_and_login_form_must_remain(): void
    {
        $scenario = (new PracticeScenario)->generate(type: 'portal-page');
        $solution = $this->solution($scenario);
        $state = $scenario['initialState'];
        $state['files']['desktopHtml'] = $solution['files']['routerHtml'];
        $evaluator = new PracticeEvaluator;
        $this->assertFalse($evaluator->evaluate($scenario, $state)['correct']);
        $state['files']['routerHtml'] = $state['files']['desktopHtml'];
        $this->assertTrue($evaluator->evaluate($scenario, $state)['correct']);
        $state['files']['routerHtml'] = '<h1>'.$scenario['rules'][0]['heading'].'</h1>';
        $this->assertFalse($evaluator->evaluate($scenario, $state)['correct']);
    }

    public function test_disabled_entries_and_duplicate_vlan_members_do_not_pass(): void
    {
        $scenario = (new PracticeScenario)->generate(type: 'switch-vlan');
        $state = $this->solution($scenario);
        $state['tables']['switchVlans'][0]['disabled'] = true;
        $this->assertFalse((new PracticeEvaluator)->evaluate($scenario, $state)['correct']);
        $state['tables']['switchVlans'][0]['disabled'] = false;
        $state['tables']['switchVlans'][0]['ports'][] = 'ether1';
        $this->assertFalse((new PracticeEvaluator)->evaluate($scenario, $state)['correct']);
    }

    public function test_feedback_identifies_each_wrong_field_even_when_the_vlan_name_is_wrong(): void
    {
        $scenario = (new PracticeScenario)->generate(type: 'vlan');
        $state = $scenario['initialState'];
        $state['tables']['vlans'] = [['name' => 'vlan-salah', 'interface' => 'ether1', 'vlanId' => 10, 'disabled' => false]];
        $result = (new PracticeEvaluator)->evaluate($scenario, $state);
        $this->assertFalse($result['correct']);
        $this->assertCount(3, $result['errors']);
        $text = implode(' ', $result['errors']);
        $this->assertStringContainsString('Name:', $text);
        $this->assertStringContainsString('VLAN ID:', $text);
        $this->assertStringContainsString('Interface:', $text);
    }

    public function test_practice_card_links_directly_to_the_new_mode_and_retains_unlock_status(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 3]);
        $this->actingAs($user)->get(route('homepage'))->assertOk()->assertSee('data-practice-url="'.route('practice').'"', false);
    }

    /** @param array<string, mixed> $scenario
     * @return array<string, mixed>
     */
    private function solution(array $scenario): array
    {
        $state = $scenario['initialState'];
        foreach ($scenario['rules'] as $rule) {
            if (isset($rule['table'])) {
                if (isset($rule['absent'])) {
                    continue;
                }
                $index = null;
                foreach ($state['tables'][$rule['table']] as $key => $row) {
                    if (array_intersect_assoc($row, $rule['where']) === $rule['where']) {
                        $index = $key;
                        break;
                    }
                }
                $index ??= count($state['tables'][$rule['table']]);
                $state['tables'][$rule['table']][$index] = [...($state['tables'][$rule['table']][$index] ?? []), ...$rule['where'], ...$rule['fields']];
            } elseif (isset($rule['heading'])) {
                $state['files']['routerHtml'] = '<h1>'.$rule['heading'].'</h1>'.$state['files']['routerHtml'];
            } else {
                data_set($state, $rule['path'], $rule['expected']);
            }
        }
        if ($scenario['type'] === 'dhcp') {
            $state['tables']['dhcp'][0]['pool'] = 'practice-pool';
            $state['tables']['pools'][0]['name'] = 'practice-pool';
        }

        return $state;
    }
}
