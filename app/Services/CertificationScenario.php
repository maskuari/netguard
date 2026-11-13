<?php

namespace App\Services;

use Illuminate\Support\Str;

class CertificationScenario
{
    /** @return array<string, mixed> */
    public function generate(): array
    {
        $base = app(PracticeScenario::class)->generate(null, 'identity')['initialState'];
        foreach ($base['tables'] as $table => $rows) {
            if (! in_array($table, ['interfaces', 'switchPorts', 'security', 'profiles'], true)) {
                $base['tables'][$table] = [];
            }
        }
        $base['tables']['security'] = [['name' => 'default', 'mode' => 'none', 'wpa2' => false, 'key' => '', 'disabled' => false]];
        $base['tables']['profiles'] = [['name' => 'default', 'sharedUsers' => 1, 'rateLimit' => '', 'disabled' => false]];
        $base['dns'] = ['servers' => [], 'allowRemoteRequests' => false];
        $base['identity'] = 'MikroTik';
        $base['session'] = ['connected' => false, 'mac' => '48:A9:8A:CC:01:01', 'connectedMac' => ''];
        $base['physical'] = ['wires' => ['a' => [], 'b' => []], 'crimp' => ['a' => false, 'b' => false], 'tested' => false, 'connections' => [], 'pcLan' => false, 'pcPort' => '', 'powered' => false];
        $base['caseInsensitive'] = true;
        $base['tables']['interfaces'] = array_slice($base['tables']['interfaces'], 0, 4);
        $base['tables']['wireless'] = [['name' => 'wlan1', 'mode' => 'station', 'ssid' => 'MikroTik', 'securityProfile' => 'default', 'disabled' => true]];
        $hex = $base;
        $hex['device'] = 'hEX lite';
        $hex['session']['mac'] = '48:A9:8A:CC:01:05';
        $hex['tables']['interfaces'][] = ['name' => 'ether5', 'defaultName' => 'ether5', 'mtu' => 1500, 'disabled' => false];
        $hex['tables']['wireless'] = [];
        $row = fn (string $table, array $where, array $fields, string $label): array => ['table' => $table, 'where' => $where, 'fields' => ['disabled' => false, ...$fields], 'label' => $label];
        $value = fn (string $path, mixed $expected, string $label): array => ['path' => $path, 'expected' => $expected, 'label' => $label];
        $hapRules = [
            $value('identity', 'Router-Nusantara', 'Identity router hAP'),
            $value('dns.servers', ['1.1.1.1', '9.9.9.9'], 'DNS router'),
            $value('dns.allowRemoteRequests', true, 'Allow Remote Requests'),
            $row('wan', ['interface' => 'ether1-wan'], ['addDefaultRoute' => true, 'usePeerDns' => false, 'status' => 'bound'], 'DHCP Client WAN'),
            $row('nat', ['chain' => 'srcnat', 'outInterface' => 'ether1-wan'], ['action' => 'masquerade'], 'NAT internet'),
            $row('wireless', ['name' => 'wlan1'], ['ssid' => 'Nusantara-Guest', 'mode' => 'ap bridge', 'securityProfile' => 'aman-kantor'], 'Wi-Fi tamu'),
            $row('security', ['name' => 'aman-kantor'], ['mode' => 'dynamic keys', 'wpa2' => true, 'key' => 'Kantor2026!'], 'Keamanan Wi-Fi'),
            $row('hotspot', ['interface' => 'wlan1'], ['localAddress' => '172.26.60.1/24', 'pool' => '172.26.60.50-172.26.60.90', 'dns' => ['1.1.1.1', '9.9.9.9'], 'dnsName' => 'portal.nusantara.test'], 'HotSpot tamu'),
            $row('users', ['name' => 'operator'], ['password' => 'Operator2026!', 'profile' => 'default'], 'Akun awal HotSpot'),
            ['path' => 'files.routerHtml', 'heading' => 'Selamat Datang di Kantor Nusantara', 'label' => 'Judul portal'],
            $value('tests.routerPing', '1.1.1.1', 'Ping dari router'),
            $value('tests.pcIp', '172.26.30.50', 'ipconfig PC pada LAN admin hAP'),
            $value('tests.pcPing', '1.1.1.1', 'Ping internet dari PC admin'),
            $value('phone.ssid', 'Nusantara-Guest', 'SSID yang tersambung di HP'),
            $value('tests.portalUsers.operator', true, 'Uji login HP akun awal operator'),
        ];
        foreach (['ether1' => 'ether1-wan', 'ether2' => 'ether2-trunk', 'ether3' => 'ether3-admin'] as $port => $name) {
            $hapRules[] = $row('interfaces', ['defaultName' => $port], ['name' => $name], 'Nama interface '.$port);
        }
        foreach ([['staf', 110, '172.26.40'], ['operasional', 120, '172.26.50'], ['admin', null, '172.26.30']] as [$name, $id, $net]) {
            $interface = $id ? 'vlan-'.$name : 'ether3-admin';
            if ($id) {
                $hapRules[] = $row('vlans', ['name' => $interface], ['vlanId' => $id, 'interface' => 'ether2-trunk'], 'VLAN '.$name);
            }
            $hapRules[] = $row('addresses', ['interface' => $interface], ['address' => $net.'.1/24'], 'Gateway '.$name);
            $hapRules[] = $row('dhcp', ['interface' => $interface], ['leaseTime' => '00:30:00'], 'DHCP '.$name);
            $hapRules[] = $row('networks', ['address' => $net.'.0/24'], ['gateway' => $net.'.1', 'dns' => [$net.'.1']], 'DHCP Network '.$name);
        }
        foreach ([['direksi', 1, '8M/8M', 'Direksi2026!'], ['staf', 2, '4M/4M', 'Staf2026!'], ['tamu', 1, '1M/2M', 'Tamu2026!']] as [$name, $shared, $rate, $password]) {
            $hapRules[] = $row('profiles', ['name' => $name], ['sharedUsers' => $shared, 'rateLimit' => $rate], 'Profil HotSpot '.$name);
            $hapRules[] = $row('users', ['name' => $name], ['password' => $password, 'profile' => $name], 'Akun HotSpot '.$name);
            $hapRules[] = $value('tests.portalUsers.'.$name, true, 'Uji login HP akun '.$name);
        }
        $hexRules = [$value('identity', 'Switch-Nusantara', 'Identity hEX'), $row('bridges', ['name' => 'bridge-kantor'], ['protocol' => 'rstp', 'vlanFiltering' => false], 'Bridge hEX')];
        foreach (range(1, 4) as $port) {
            $hexRules[] = $row('bridgePorts', ['interface' => 'ether'.$port], ['bridge' => 'bridge-kantor'], 'Bridge Port ether'.$port);
            $hexRules[] = $row('switchPorts', ['name' => 'ether'.$port], ['mode' => 'secure', 'header' => $port === 1 ? 'add if missing' : 'always strip', 'vlanId' => $port === 1 ? 0 : ($port === 4 ? 120 : 110)], 'Switch Port ether'.$port);
        }
        $hexRules[] = ['table' => 'bridgePorts', 'absent' => ['interface' => 'ether5'], 'label' => 'ether5 harus tetap di luar bridge'];
        $hexRules[] = $row('switchVlans', ['vlanId' => 110], ['switch' => 'switch1', 'ports' => ['ether1', 'ether2', 'ether3']], 'Keanggotaan VLAN 110');
        $hexRules[] = $row('switchVlans', ['vlanId' => 120], ['switch' => 'switch1', 'ports' => ['ether1', 'ether4']], 'Keanggotaan VLAN 120');
        foreach ([2 => '172.26.40.50', 3 => '172.26.40.50', 4 => '172.26.50.50'] as $port => $ip) {
            $hexRules[] = $value('tests.ports.ether'.$port, $ip, 'Hasil ipconfig pada ether'.$port);
        }
        $sections = [
            ['title' => 'Permintaan Kantor Nusantara', 'items' => ['Kantor Nusantara membuka dua kelompok kerja: staf dan operasional, serta Wi-Fi tamu. Bangun jaringan dari kabel kosong sampai seluruh layanan dan pengujian berjalan.', 'hAP adalah router utama; hEX bertugas sebagai switch VLAN. Gunakan satu PC dan satu kabel PC yang dipindah antarput saat pengujian. Semua konfigurasi dimulai kosong.']],
            ['title' => 'Kabel dan topologi', 'items' => ['Buat kabel straight T568B pada kedua ujung, crimp, kemudian periksa menggunakan LAN tester. Tidak ada penilaian benar/salah saat menyusun warna; amati lampu setiap pin.', 'Internet ke ether1 hAP. ether2 hAP ke ether1 hEX (uplink tetap). PC ke ether3 hAP untuk konfigurasi router. Ujung lainnya masuk ke LAN PC.', 'Untuk konfigurasi switch: pindahkan ujung kabel PC dari hAP ke ether5 hEX. Saat pengujian pindah ke ether2, ether3, lalu ether4 hEX. Nyalakan PC, buka WinBox, pilih perangkat lewat Neighbors; akun admin dengan password kosong.']],
            ['title' => 'Router hAP: identitas dan internet', 'items' => ['Identity: Router-Nusantara. Ubah nama ether1 ke ether1-wan; ether2 ke ether2-trunk; ether3 ke ether3-admin.', 'DHCP Client pada ether1-wan: Add Default Route yes, Use Peer DNS no. DNS Servers 1.1.1.1 dan 9.9.9.9; Allow Remote Requests aktif.', 'NAT: chain srcnat, action masquerade, Out. Interface ether1-wan. Jalankan ping 1.1.1.1 dari terminal router. Dari CMD PC pada ether3-admin, jalankan ipconfig (172.26.30.50) lalu ping 1.1.1.1.']],
            ['title' => 'Router hAP: VLAN, IP dan DHCP', 'items' => ['VLAN staf: name vlan-staf, ID 110, parent ether2-trunk. Gateway 172.26.40.1/24; DHCP pool 172.26.40.50-172.26.40.99.', 'VLAN operasional: name vlan-operasional, ID 120, parent ether2-trunk. Gateway 172.26.50.1/24; DHCP pool 172.26.50.50-172.26.50.99.', 'LAN admin: ether3-admin, gateway 172.26.30.1/24; DHCP pool 172.26.30.50-172.26.30.99.', 'Ketiga DHCP aktif, lease 00:30:00; masing-masing menggunakan gateway dan DNS .1 pada subnetnya. Nama server dan pool bebas; pastikan server menggunakan pool yang sesuai.']],
            ['title' => 'Wi-Fi dan HotSpot', 'items' => ['Aktifkan wlan1, mode ap bridge; SSID Nusantara-Guest. Security Profile aman-kantor, dynamic keys, WPA2 PSK aktif, kunci Kantor2026!. Terapkan profil ke wlan1.', 'HotSpot wlan1: Local Address 172.26.60.1/24, pool 172.26.60.50-172.26.60.90, DNS 1.1.1.1 dan 9.9.9.9, DNS Name portal.nusantara.test. SMTP 0.0.0.0, tanpa sertifikat.', 'Akun awal: operator / Operator2026! dengan profile default; uji login akun ini dari HP lalu logout. Edit hotspot/login.html melalui desktop dan Notepad, unggah kembali dengan H1: Selamat Datang di Kantor Nusantara. Form login harus tetap ada.', 'Profil dan akun direksi: Shared Users 1, Rate Limit 8M/8M; username direksi, password Direksi2026!, profile direksi.', 'Profil dan akun staf: Shared Users 2, Rate Limit 4M/4M; username staf, password Staf2026!, profile staf.', 'Profil dan akun tamu: Shared Users 1, Rate Limit 1M/2M; username tamu, password Tamu2026!, profile tamu. Hubungkan HP dan uji login ketiga akun bergantian, logout setiap berpindah akun.']],
            ['title' => 'Switch hEX dan pengujian', 'items' => ['Identity Switch-Nusantara. Buat bridge-kantor, Protocol Mode rstp, VLAN Filtering tidak aktif. Masukkan ether1?ether4 ke bridge; ether5 hanya untuk PC teknisi, jangan masuk bridge.', 'Switch Port ether1: VLAN Mode secure, VLAN Header add if missing, Default VLAN ID 0. ether2 dan ether3: secure, always strip, ID 110. ether4: secure, always strip, ID 120.', 'Switch VLAN switch1: ID 110 anggota ether1, ether2, ether3; ID 120 anggota ether1, ether4.', 'Pindahkan kabel PC dari ether5 ke ether2 dan jalankan ipconfig: harus 172.26.40.50/24, gateway 172.26.40.1. Ulangi ether3 dengan hasil sama. ether4 harus 172.26.50.50/24, gateway 172.26.50.1.', 'Simpan seluruh konfigurasi, lalu klik Selesaikan konfigurasi. Besar/kecil huruf tidak memengaruhi penilaian; angka IP, VLAN, rentang dan nilai lain harus sesuai.']],
        ];

        return ['id' => (string) Str::uuid(), 'mode' => 'certification', 'type' => 'certification', 'chapter' => 5, 'title' => 'Jaringan Kantor Nusantara', 'description' => $sections[0]['items'][0], 'surface' => 'physical', 'initialState' => $base, 'devices' => ['hap' => $base, 'hex' => $hex], 'sections' => $sections, 'rules' => ['hap' => $hapRules, 'hex' => $hexRules], 'clues' => [], 'briefing' => ['context' => $sections[0]['items'][0], 'initial' => 'Perangkat kosong. Mulai dari kabel.', 'assignment' => 'Bangun seluruh jaringan kantor.', 'requirements' => [], 'outcome' => 'Seluruh kebutuhan berfungsi.', 'submission' => 'Selesaikan konfigurasi untuk diperiksa.']];
    }
}
