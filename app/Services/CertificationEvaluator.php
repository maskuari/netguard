<?php

namespace App\Services;

class CertificationEvaluator
{
    /** @param array<string, mixed> $scenario
     * @param  array<string, mixed>  $state
     * @return array{correct: bool, errors: list<string>, errorCount: int}
     */
    public function evaluate(array $scenario, array $state): array
    {
        $errors = [];
        foreach (['hap' => 'Router hAP', 'hex' => 'Switch hEX'] as $key => $label) {
            $device = $state['devices'][$key] ?? [];
            $rules = array_map(function (array $rule): array {
                foreach (['where', 'fields', 'expected', 'heading', 'absent'] as $field) {
                    if (array_key_exists($field, $rule)) {
                        $rule[$field] = $this->fold($rule[$field]);
                    }
                }

                return $rule;
            }, $scenario['rules'][$key]);
            $result = app(PracticeEvaluator::class)->evaluate(['type' => 'certification', 'rules' => $rules], $this->fold(is_array($device) ? $device : []));
            foreach ($result['errors'] as $error) {
                $errors[] = $label.' - '.$error;
            }
            if (! data_get($device, 'session.connectedMac') || strcasecmp((string) data_get($device, 'session.connectedMac'), (string) data_get($scenario, 'devices.'.$key.'.session.mac')) !== 0) {
                $errors[] = $label.' - belum pernah login WinBox ke MAC perangkat yang sesuai.';
            }
        }
        $physical = $this->fold($state['physical'] ?? []);
        $order = ['putih-oranye', 'oranye', 'putih-hijau', 'biru', 'putih-biru', 'hijau', 'putih-cokelat', 'cokelat'];
        foreach (['a', 'b'] as $end) {
            foreach ($order as $pin => $color) {
                if (data_get($physical, 'wires.'.$end.'.'.$pin) !== $color) {
                    $errors[] = 'Kabel ujung '.strtoupper($end).' pin '.($pin + 1).' - seharusnya '.$color.'.';
                }
            }
            if (data_get($physical, 'crimp.'.$end) !== true) {
                $errors[] = 'Kabel ujung '.strtoupper($end).' belum di-crimp.';
            }
        }
        foreach (['tested' => 'Kabel belum diuji dengan LAN tester.', 'pcLan' => 'Ujung kabel belum terpasang ke LAN PC.', 'powered' => 'PC belum dinyalakan.'] as $key => $message) {
            if (($physical[$key] ?? null) !== true) {
                $errors[] = $message;
            }
        }
        foreach (['internet' => 'ether1', 'switch' => 'ether2'] as $connection => $port) {
            if (data_get($physical, 'connections.'.$connection) !== $port) {
                $errors[] = 'Topologi hAP - kabel '.$connection.' harus pada '.$port.'.';
            }
        }
        if (data_get($physical, 'hexUplink') !== 'ether1') {
            $errors[] = 'Topologi hEX - uplink dari ether2 hAP harus masuk ether1 hEX.';
        }
        $hap = $this->fold($state['devices']['hap'] ?? []);
        foreach (['vlan-staf' => '172.26.40', 'vlan-operasional' => '172.26.50', 'ether3-admin' => '172.26.30'] as $interface => $net) {
            $server = collect(data_get($hap, 'tables.dhcp', []))->first(fn (mixed $row): bool => is_array($row) && ($row['interface'] ?? '') === $interface && ($row['disabled'] ?? true) === false);
            $pool = collect(data_get($hap, 'tables.pools', []))->first(fn (mixed $row): bool => is_array($row) && ($row['name'] ?? '') === ($server['pool'] ?? null) && ($row['disabled'] ?? true) === false);
            if (($pool['ranges'] ?? '') !== $net.'.50-'.$net.'.99') {
                $errors[] = 'DHCP '.$interface.' - server belum memakai pool '.$net.'.50-'.$net.'.99.';
            }
        }
        $errors = array_values(array_unique($errors));

        return ['correct' => $errors === [], 'errors' => $errors, 'errorCount' => count($errors)];
    }

    private function fold(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->fold($item), $value);
        }

        return is_string($value) ? mb_strtolower(trim($value)) : $value;
    }
}
