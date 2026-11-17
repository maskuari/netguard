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
            $row('wan', ['interface' => 'ether1-wan'], ['addDefaultRoute' => true, 'usePeerDns' => true, 'usePeerNtp' => true, 'status' => 'bound'], 'DHCP Client WAN'),
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
            ['title' => 'Studi kasus · Kantor Nusantara', 'items' => ['Kantor Nusantara membutuhkan jaringan terpisah untuk staf dan operasional, jaringan admin, serta Wi-Fi tamu. Bangun dan uji jaringan menggunakan hAP sebagai router, hEX sebagai switch, satu PC, dan kabel LAN yang sama.', 'Ikuti langkah di bawah secara berurutan seperti saat praktik Chapter 1–5. Nilai IP, VLAN, nama perangkat, SSID, dan akun sudah disesuaikan untuk studi kasus ini.']],
            ['title' => 'Rakit kabel straight T568B', 'items' => ['Susun urutan T568B yang sama pada pin 1–8 di Ujung A dan Ujung B, pasang konektor RJ45, lalu crimp kedua ujungnya.', 'Sambungkan kedua ujung ke LAN tester dan nyalakan. Amati lampu MAIN dan REMOTE menyala berurutan 1–8. Pin yang tidak menyala menandakan inti kabel yang perlu diperiksa.']],
            ['title' => 'Rakit topologi awal', 'items' => ['Sambungkan Internet/ISP ke ether1 hAP. Sambungkan ether2 hAP ke ether1 hEX sebagai uplink trunk. Sambungkan ether3 hAP ke PC konfigurasi dan pasang ujung kabel satunya ke soket LAN PC.']],
            ['title' => 'Nyalakan PC dan masuk ke WinBox hAP', 'items' => ['Nyalakan PC. Buka WinBox, pilih MAC Address hAP pada tab Neighbors, lalu Connect. Gunakan login admin dengan password kosong.']],
            ['title' => 'Atur Identity router', 'items' => ['Di WinBox hAP, buka System → Identity. Isi Name dengan Router-Nusantara, lalu klik OK.']],
            ['title' => 'Ubah nama interface Ethernet', 'items' => ['Di Interfaces, ubah ether1 menjadi ether1-wan, ether2 menjadi ether2-trunk, dan ether3 menjadi ether3-admin. Simpan setiap perubahan sebelum lanjut.']],
            ['title' => 'Buat VLAN staf dan operasional', 'items' => ['Buka Interfaces → VLAN lalu tambahkan VLAN staf: Name vlan-staf, VLAN ID 110, Interface ether2-trunk.', 'Tambahkan VLAN operasional: Name vlan-operasional, VLAN ID 120, Interface ether2-trunk. Pastikan keduanya muncul di daftar VLAN.']],
            ['title' => 'Tambahkan DHCP Client untuk Internet', 'items' => ['Buka IP → DHCP Client, klik +, lalu pilih Interface ether1-wan. Biarkan Use Peer DNS dan Use Peer NTP tercentang serta Add Default Route bernilai yes, sesuai pengaturan DHCP Client di Chapter 2. Klik OK dan pastikan status menjadi bound.']],
            ['title' => 'Pasang alamat IP gateway', 'items' => ['Buka IP → Addresses dan tambahkan satu per satu: 172.26.30.1/24 pada ether3-admin; 172.26.40.1/24 pada vlan-staf; dan 172.26.50.1/24 pada vlan-operasional. Jangan memasang gateway VLAN pada ether2-trunk.']],
            ['title' => 'Siapkan DHCP Server dan pool', 'items' => ['Jalankan DHCP Setup pada ether3-admin dengan pool 172.26.30.50-172.26.30.99, lalu pada vlan-staf dengan pool 172.26.40.50-172.26.40.99, lalu pada vlan-operasional dengan pool 172.26.50.50-172.26.50.99.', 'Untuk tiap jaringan, gunakan subnet dan gateway yang sesuai, DNS server berupa gateway .1 pada subnet tersebut, dan Lease Time 00:30:00. Pastikan setiap DHCP Server aktif dan memakai pool yang benar.']],
            ['title' => 'Atur DNS router', 'items' => ['Buka IP → DNS. Isi Servers dengan 1.1.1.1 dan 9.9.9.9, aktifkan Allow Remote Requests, lalu klik OK.']],
            ['title' => 'Tambahkan NAT masquerade', 'items' => ['Buka IP → Firewall → NAT dan tambahkan aturan dengan Chain srcnat, Out. Interface ether1-wan, serta Action masquerade. Simpan dan pastikan aturan aktif.']],
            ['title' => 'Uji Internet dari router dan PC', 'items' => ['Di New Terminal router, jalankan ping 1.1.1.1.', 'Di PC yang tetap tersambung ke ether3-admin, buka CMD. Jalankan ipconfig dan pastikan IP 172.26.30.50 serta gateway 172.26.30.1, lalu jalankan ping 1.1.1.1.']],
            ['title' => 'Aktifkan Wi-Fi dan atur SSID', 'items' => ['Buka Wireless, aktifkan wlan1, lalu atur Mode ap bridge dan SSID Nusantara-Guest.']],
            ['title' => 'Buat Security Profile Wi-Fi', 'items' => ['Buat Security Profile bernama aman-kantor dengan Mode dynamic keys. Aktifkan WPA PSK dan WPA2 PSK, lalu gunakan Kantor2026! sebagai pre-shared key. Terapkan profile aman-kantor pada wlan1.']],
            ['title' => 'Jalankan HotSpot Setup', 'items' => ['Buka IP → HotSpot → HotSpot Setup pada wlan1. Gunakan Local Address 172.26.60.1/24, pool 172.26.60.50-172.26.60.90, DNS 1.1.1.1 dan 9.9.9.9, serta DNS Name portal.nusantara.test. SMTP 0.0.0.0 dan pilih tanpa sertifikat.', 'Buat akun awal operator dengan password Operator2026! dan profile default.']],
            ['title' => 'Uji Wi-Fi dan halaman portal', 'items' => ['Sambungkan HP ke SSID Nusantara-Guest dengan password Kantor2026!, lalu login ke portal menggunakan operator / Operator2026!.', 'Di desktop PC, unduh hotspot/login.html dari Files, buka dengan Notepad, dan tambahkan judul H1 Selamat Datang di Kantor Nusantara. Simpan lalu unggah kembali ke router; pertahankan form login.']],
            ['title' => 'Buat User Profile HotSpot', 'items' => ['Di IP → HotSpot → User Profiles, buat profile direksi dengan Shared Users 1 dan Rate Limit 8M/8M.', 'Buat profile staf dengan Shared Users 2 dan Rate Limit 4M/4M.', 'Buat profile tamu dengan Shared Users 1 dan Rate Limit 1M/2M.']],
            ['title' => 'Buat akun HotSpot dan uji dari HP', 'items' => ['Di tab Users, buat direksi / Direksi2026! dengan profile direksi; staf / Staf2026! dengan profile staf; serta tamu / Tamu2026! dengan profile tamu.', 'Login ke portal HP memakai masing-masing akun secara bergantian dan pastikan profile sesi sesuai. Logout sebelum berpindah akun.']],
            ['title' => 'Pindahkan koneksi PC ke hEX', 'items' => ['Setelah konfigurasi hAP selesai, pindahkan ujung kabel PC dari ether3-admin hAP ke ether5 hEX. Ujung kabel di LAN PC tetap terpasang. Keluar dari sesi hAP, buka Neighbors, lalu Connect ke MAC Address hEX menggunakan admin dengan password kosong.']],
            ['title' => 'Atur Identity dan Bridge hEX', 'items' => ['Buka System → Identity dan isi Switch-Nusantara.', 'Buka Bridge, tambahkan bridge-kantor dengan Protocol Mode rstp dan VLAN Filtering tidak aktif.']],
            ['title' => 'Tambahkan port ke Bridge', 'items' => ['Di Bridge → Ports, masukkan ether1, ether2, ether3, dan ether4 ke bridge-kantor. Ether5 dipakai untuk PC teknisi, jadi jangan masukkan ke bridge.']],
            ['title' => 'Atur Switch Port trunk dan access', 'items' => ['Atur ether1 sebagai trunk: VLAN Mode secure, VLAN Header add if missing, Default VLAN ID 0.', 'Atur ether2 dan ether3 sebagai access staf: VLAN Mode secure, VLAN Header always strip, Default VLAN ID 110. Atur ether4 sebagai access operasional dengan VLAN Mode secure, VLAN Header always strip, Default VLAN ID 120.']],
            ['title' => 'Tambahkan keanggotaan VLAN switch', 'items' => ['Di Switch → VLAN, tambahkan VLAN ID 110 pada switch1 dengan Ports ether1, ether2, ether3.', 'Tambahkan VLAN ID 120 pada switch1 dengan Ports ether1 dan ether4.']],
            ['title' => 'Uji tiap port access dan kumpulkan', 'items' => ['Pindahkan kabel PC dari ether5 ke ether2, jalankan ipconfig, dan pastikan IP 172.26.40.50/24 dengan gateway 172.26.40.1. Ulangi di ether3 dengan hasil yang sama.', 'Pindahkan kabel ke ether4 dan pastikan IP 172.26.50.50/24 dengan gateway 172.26.50.1. Setelah semua konfigurasi dan pengujian selesai, klik Selesaikan konfigurasi.', 'Huruf besar/kecil tidak memengaruhi penilaian. Angka IP, VLAN ID, rentang, dan nilai konfigurasi lain harus sesuai.']],
        ];

        return ['id' => (string) Str::uuid(), 'mode' => 'certification', 'type' => 'certification', 'chapter' => 5, 'title' => 'Jaringan Kantor Nusantara', 'description' => $sections[0]['items'][0], 'surface' => 'physical', 'initialState' => $base, 'devices' => ['hap' => $base, 'hex' => $hex], 'sections' => $sections, 'rules' => ['hap' => $hapRules, 'hex' => $hexRules], 'clues' => [], 'briefing' => ['context' => $sections[0]['items'][0], 'initial' => 'Perangkat kosong. Mulai dari kabel.', 'assignment' => 'Bangun seluruh jaringan kantor.', 'requirements' => [], 'outcome' => 'Seluruh kebutuhan berfungsi.', 'submission' => 'Selesaikan konfigurasi untuk diperiksa.']];
    }
}
