<?php

namespace App\Services;

class PracticeEvaluator
{
    /** @param array<string, mixed> $scenario
     * @param  array<string, mixed>  $state
     * @return array{correct: bool, errors: list<string>}
     */
    public function evaluate(array $scenario, array $state): array
    {
        $errors = [];
        foreach ($scenario['rules'] as $rule) {
            if (isset($rule['table'])) {
                $rows = data_get($state, 'tables.'.$rule['table'], []);
                $rows = array_values(array_filter(is_array($rows) ? $rows : [], 'is_array'));
                $matches = array_values(array_filter($rows, fn (array $row): bool => $this->matches($row, $rule['where'] ?? $rule['absent'] ?? [])));
                if (isset($rule['absent'])) {
                    if (count($matches) > 0) {
                        $errors[] = $rule['label'].'.';
                    }

                    continue;
                }
                if ($matches === []) {
                    if (count($rows) === 1 && $rule['where'] !== []) {
                        foreach ([...$rule['where'], ...$rule['fields']] as $field => $expected) {
                            if (! $this->equal($rows[0][$field] ?? null, $expected)) {
                                $errors[] = $rule['label'].' — '.$this->fieldLabel($field).': seharusnya '.$this->display($expected).'; tersimpan '.$this->display($rows[0][$field] ?? null).'.';
                            }
                        }
                    } else {
                        $errors[] = $rule['label'].' belum ada atau belum sesuai'.($rule['where'] !== [] ? ' ('.$this->display($rule['where']).')' : '').'.';
                    }

                    continue;
                }
                if (count($matches) > 1 && $rule['where'] !== []) {
                    $errors[] = $rule['label'].' memiliki entri ganda. Sisakan satu entri yang sesuai.';
                }
                $rowErrors = [];
                foreach ($matches as $row) {
                    $candidateErrors = [];
                    foreach ($rule['fields'] as $field => $expected) {
                        if (! $this->equal($row[$field] ?? null, $expected)) {
                            $candidateErrors[] = $rule['label'].' — '.$this->fieldLabel($field).': seharusnya '.$this->display($expected).'; tersimpan '.$this->display($row[$field] ?? null).'.';
                        }
                    }
                    if ($candidateErrors === []) {
                        $rowErrors = [];
                        break;
                    }
                    if ($rowErrors === [] || count($candidateErrors) < count($rowErrors)) {
                        $rowErrors = $candidateErrors;
                    }
                }
                array_push($errors, ...$rowErrors);
            } elseif (isset($rule['heading'])) {
                $html = data_get($state, $rule['path'], '');
                $html = is_string($html) ? $html : '';
                preg_match_all('/<h1\b[^>]*>(.*?)<\/h1>/is', $html, $headings);
                $texts = array_map(fn (string $heading): string => trim(html_entity_decode(strip_tags($heading), ENT_QUOTES | ENT_HTML5, 'UTF-8')), $headings[1] ?? []);
                if (! in_array($rule['heading'], $texts, true)) {
                    $errors[] = 'Berkas hotspot/login.html pada router belum memiliki judul H1 “'.$rule['heading'].'”.';
                }
                if (! preg_match('/<form\b/i', $html) || ! preg_match('/name\s*=\s*["\']?username\b/i', $html) || ! preg_match('/name\s*=\s*["\']?password\b/i', $html)) {
                    $errors[] = 'Formulir login pada hotspot/login.html hilang atau kolom username/password terhapus.';
                }
            } elseif (! $this->equal(data_get($state, $rule['path']), $rule['expected'], str_starts_with($rule['path'], 'physical.wires.'))) {
                $errors[] = $rule['label'].': seharusnya '.$this->display($rule['expected']).'; hasil saat ini '.$this->display(data_get($state, $rule['path'])).'.';
            }
        }

        if ($scenario['type'] === 'dhcp') {
            $servers = data_get($state, 'tables.dhcp', []);
            $pools = data_get($state, 'tables.pools', []);
            $server = collect(is_array($servers) ? $servers : [])->first(fn (mixed $row): bool => is_array($row) && ($row['interface'] ?? '') === 'ether3' && ! ($row['disabled'] ?? false));
            $pool = collect(is_array($pools) ? $pools : [])->first(fn (mixed $row): bool => is_array($row) && ($row['name'] ?? '') === ($server['pool'] ?? null) && ! ($row['disabled'] ?? false));
            $expectedPool = collect($scenario['rules'])->firstWhere('table', 'pools')['fields']['ranges'];
            if (($pool['ranges'] ?? null) !== $expectedPool) {
                $errors[] = 'DHCP Server ether3 belum memakai Address Pool dengan rentang yang diminta.';
            }
        }

        return ['correct' => $errors === [], 'errors' => array_values(array_unique($errors))];
    }

    private function equal(mixed $actual, mixed $expected, bool $ordered = false): bool
    {
        if (is_array($expected)) {
            if (! is_array($actual)) {
                return false;
            }
            $actual = array_map(fn (mixed $value): string => is_scalar($value) ? trim((string) $value) : '', array_values($actual));
            $expected = array_map(fn (mixed $value): string => trim((string) $value), array_values($expected));
            if (! $ordered) {
                sort($actual);
                sort($expected);
            }

            return $actual === $expected;
        }
        if (is_bool($expected)) {
            return $actual === $expected;
        }

        return is_scalar($actual) && trim((string) $actual) === trim((string) $expected);
    }

    /** @param array<string, mixed> $row
     * @param  array<string, mixed>  $fields
     */
    private function matches(array $row, array $fields): bool
    {
        foreach ($fields as $key => $value) {
            if (! $this->equal($row[$key] ?? null, $value)) {
                return false;
            }
        }

        return true;
    }

    private function display(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'aktif/yes' : 'tidak aktif/no';
        }
        if (is_array($value)) {
            return implode(', ', array_map(fn (mixed $item): string => $this->display($item), $value));
        }

        return is_scalar($value) && (string) $value !== '' ? (string) $value : 'kosong';
    }

    private function fieldLabel(string $field): string
    {
        return ['disabled' => 'Disabled', 'vlanId' => 'VLAN ID', 'outInterface' => 'Out. Interface', 'addDefaultRoute' => 'Add Default Route', 'usePeerDns' => 'Use Peer DNS', 'sharedUsers' => 'Shared Users', 'rateLimit' => 'Rate Limit', 'securityProfile' => 'Security Profile', 'leaseTime' => 'Lease Time', 'srcAddress' => 'Src. Address', 'dstAddress' => 'Dst. Address', 'wpa2' => 'WPA2 PSK', 'key' => 'WPA2 Pre-Shared Key'][$field] ?? ucfirst($field);
    }
}
