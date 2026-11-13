<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\CertificationEvaluator;
use App\Services\CertificationScenario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificationModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_certification_requires_login_and_all_adventure_chapters(): void
    {
        $this->get(route('certification'))->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create(['completed_adventure_chapters' => 4]))->get(route('certification'))->assertRedirect(route('homepage'));
        $this->postJson(route('certification.check', 'missing'), ['state' => []])->assertForbidden();
    }

    public function test_full_case_renders_with_empty_devices_and_no_right_hand_instructions(): void
    {
        $user = User::factory()->create(['completed_adventure_chapters' => 5]);
        $url = $this->actingAs($user)->get(route('certification'))->assertRedirect()->headers->get('Location');
        $response = $this->get($url)->assertOk()->assertSee('Detail Instruksi')->assertSee('Selesaikan konfigurasi')->assertSee('Kantor Nusantara')->assertSee('certification.css')->assertDontSee('aria-label="Petunjuk studi kasus"', false);
        $scenario = $response->viewData('scenario');
        $this->assertArrayNotHasKey('rules', $scenario);
        $this->assertArrayNotHasKey('owner', $scenario);
        foreach (['hap', 'hex'] as $key) {
            $this->assertEmpty($scenario['devices'][$key]['tables']['addresses']);
            $this->assertEmpty($scenario['devices'][$key]['tables']['dhcp']);
            $this->assertEmpty($scenario['devices'][$key]['tables']['hotspot']);
            $this->assertFalse($scenario['devices'][$key]['session']['connected']);
        }
        $this->assertEmpty($scenario['initialState']['physical']['wires']['a']);
        $this->assertSame(5, $user->fresh()->completedAdventureChapters());
        $this->actingAs($user)->get(route('homepage'))->assertSee(route('certification'));
    }

    public function test_complete_configuration_passes_case_insensitively_but_wrong_ip_and_vlan_fail(): void
    {
        $scenario = app(CertificationScenario::class)->generate();
        $state = $this->solution($scenario);
        $evaluator = app(CertificationEvaluator::class);
        $this->assertTrue($evaluator->evaluate($scenario, $state)['correct']);
        $state = $this->uppercase($state);
        $this->assertTrue($evaluator->evaluate($scenario, $state)['correct']);
        $state['devices']['hap']['tables']['addresses'][0]['address'] = '172.26.41.1/24';
        $state['devices']['hex']['tables']['switchVlans'][0]['vlanId'] = 111;
        $result = $evaluator->evaluate($scenario, $state);
        $this->assertFalse($result['correct']);
        $this->assertGreaterThanOrEqual(2, $result['errorCount']);
        $this->assertSame(count($result['errors']), $result['errorCount']);
    }

    public function test_wrong_wires_and_unused_dhcp_pool_are_reported_per_pin_and_service(): void
    {
        $scenario = app(CertificationScenario::class)->generate();
        $state = $this->solution($scenario);
        $state['physical']['wires']['a'][0] = 'biru';
        $state['physical']['wires']['b'][3] = 'oranye';
        $state['devices']['hap']['tables']['dhcp'][0]['pool'] = 'missing';
        $result = app(CertificationEvaluator::class)->evaluate($scenario, $state);
        $this->assertSame(3, $result['errorCount']);
        $this->assertStringContainsString('ujung A pin 1', implode(' ', $result['errors']));
        $this->assertStringContainsString('ujung B pin 4', implode(' ', $result['errors']));
        $this->assertStringContainsString('belum memakai pool', implode(' ', $result['errors']));
    }

    public function test_attempt_is_owned_by_account_and_first_result_cannot_be_replaced(): void
    {
        $owner = User::factory()->create(['completed_adventure_chapters' => 5]);
        $this->actingAs($owner)->get(route('certification'));
        $attempt = array_values(session('certification.attempts'))[0];
        $url = route('certification.check', $attempt['id']);
        $state = $this->solution($attempt);
        $this->actingAs(User::factory()->create(['completed_adventure_chapters' => 5]))->postJson($url, ['state' => $state])->assertNotFound();
        $this->actingAs($owner)->postJson($url, ['state' => $state])->assertOk()->assertJson(['correct' => true, 'errorCount' => 0]);
        $state['devices']['hap']['identity'] = 'wrong';
        $this->postJson($url, ['state' => $state])->assertOk()->assertJson(['correct' => true]);
        $this->assertSame(5, $owner->fresh()->completedAdventureChapters());
    }

    /** @param array<string, mixed> $scenario
     * @return array<string, mixed>
     */
    private function solution(array $scenario): array
    {
        $state = ['devices' => $scenario['devices'], 'physical' => $scenario['initialState']['physical']];
        foreach (['hap', 'hex'] as $key) {
            foreach ($scenario['rules'][$key] as $rule) {
                if (isset($rule['absent'])) {
                    continue;
                }
                if (isset($rule['table'])) {
                    $rows = &$state['devices'][$key]['tables'][$rule['table']];
                    $index = null;
                    foreach ($rows as $candidate => $row) {
                        if (array_intersect_assoc($row, $rule['where']) === $rule['where']) {
                            $index = $candidate;
                            break;
                        }
                    }
                    $index ??= count($rows);
                    $rows[$index] = [...($rows[$index] ?? []), ...$rule['where'], ...$rule['fields']];
                    unset($rows);
                } elseif (isset($rule['heading'])) {
                    data_set($state['devices'][$key], $rule['path'], '<h1>'.$rule['heading'].'</h1><form><input name="username"><input name="password"></form>');
                } else {
                    data_set($state['devices'][$key], $rule['path'], $rule['expected']);
                }
            }
            $state['devices'][$key]['session']['connectedMac'] = $scenario['devices'][$key]['session']['mac'];
        }
        foreach (['172.26.40', '172.26.50', '172.26.30'] as $index => $net) {
            $state['devices']['hap']['tables']['dhcp'][$index]['pool'] = 'pool-'.$index;
            $state['devices']['hap']['tables']['pools'][] = ['name' => 'pool-'.$index, 'ranges' => $net.'.50-'.$net.'.99', 'disabled' => false];
        }
        $state['physical'] = ['wires' => array_fill_keys(['a', 'b'], ['putih-oranye', 'oranye', 'putih-hijau', 'biru', 'putih-biru', 'hijau', 'putih-cokelat', 'cokelat']), 'crimp' => ['a' => true, 'b' => true], 'tested' => true, 'connections' => ['internet' => 'ether1', 'switch' => 'ether2'], 'hexUplink' => 'ether1', 'pcLan' => true, 'powered' => true];

        return $state;
    }

    private function uppercase(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->uppercase($item), $value);
        }

        return is_string($value) ? strtoupper($value) : $value;
    }
}
