<?php

namespace App\Services;

use Illuminate\Support\Str;

class PracticeScenario
{
    public const array TYPES = ['identity', 'interfaces', 'wiring', 'topology', 'login', 'vlan', 'wan', 'addresses', 'dhcp', 'dns', 'nat', 'route', 'router-test', 'pc-test', 'wireless', 'security', 'hotspot', 'portal-login', 'portal-page', 'profile', 'users', 'switch-identity', 'bridge', 'bridge-ports', 'switch-ports', 'switch-vlan', 'switch-test'];

    /**
     * @param  array<string, mixed>  $scenario
     * @return array{context: string, initial: string, assignment: string, outcome: string, requirements: array<int, string>, submission: string}
     */
    public function briefing(array $scenario): array
    {
        $device = $scenario['initialState']['device'];
        $gateway = $scenario['initialState']['tables']['addresses'][0]['address'] ?? null;
        $context = match ($scenario['chapter']) {
            1 => 'Kita sedang menyiapkan jaringan ruang multimedia sekolah. Bapak memberimu satu pekerjaan khusus agar perangkat dan sambungannya siap digunakan.',
            2 => 'Ruang multimedia membutuhkan jaringan yang tertata. Ada jalur perangkat, alamat gateway, dan pembagian IP yang perlu dikonfigurasi dengan benar. Kali ini kamu mengerjakan satu bagian saja.',
            3 => 'Komputer studio membutuhkan akses melalui router sekolah. Sambungan dasar sudah tersedia. Tugasmu kali ini berkaitan dengan jalur internet atau pemeriksaan koneksinya.',
            4 => 'Sekolah menyiapkan layanan Wi-Fi dan HotSpot untuk ruang multimedia. Wi-Fi menghubungkan perangkat ke jaringan, sedangkan akun HotSpot dipakai untuk login ke portal. Perhatikan layanan mana yang diminta dalam soal ini.',
            5 => 'Sekarang perangkat yang kamu konfigurasi adalah MikroTik hEX lite sebagai switch, bukan router hAP. Gunakan PC dan satu kabel LAN yang sama. Konfigurasi switch dan pengujian port memiliki tugas yang berbeda.',
        };
        $initial = match ($scenario['type']) {
            'identity', 'switch-identity' => 'PC sudah terhubung ke '.$device.' dan sesi WinBox sudah terbuka. Identity perangkat masih MikroTik. Tidak perlu merakit ulang jaringan atau mengulang login.',
            'interfaces' => 'Sesi WinBox pada router hAP sudah terbuka. Port fisik masih memakai nama ether1, ether2, dan ether3. Alamat dan layanan pendukung sudah disiapkan; yang perlu kamu rapikan adalah nama interface.',
            'wiring' => 'Kedua ujung kabel UTP belum disusun dan belum di-crimp. Panel kabel menyediakan warna inti, pin konektor, crimping, dan LAN tester. Kamu mengerjakan kabel, bukan konfigurasi WinBox.',
            'topology' => 'Tiga jalur kabel belum dipasang pada port router dan sambungan LAN PC juga belum siap. Perangkat tersedia di panel kabel. Sesuaikan sambungan fisik dengan peran port yang Bapak minta.',
            'login' => 'Kabel PC sudah terhubung ke router, tetapi PC belum menyala dan sesi WinBox belum terhubung. Perangkat tujuan dikenali dari MAC Address pada rincian tugas.',
            'vlan' => 'WinBox sudah terhubung ke router hAP. Port ether2 tersedia sebagai interface induk dan belum ada interface VLAN untuk tugas ini. Kamu akan membuat satu interface virtual di atas port tersebut.',
            'wan' => 'Sumber internet berada pada ether4. Belum ada DHCP Client WAN untuk tugas ini. Layanan lain telah disiapkan, sehingga kamu cukup membuat DHCP Client sesuai kebutuhan ISP.',
            'addresses' => 'Router sudah dapat dikonfigurasi melalui WinBox. Alamat gateway pada ether3 belum dipasang. Tugasmu adalah menambahkan IP milik router, bukan memasukkan IP secara manual pada PC.',
            'dhcp' => 'Gateway '.$gateway.' pada ether3 sudah terpasang. DHCP Server, pool alamat, dan DHCP Network untuk tugas ini belum dibuat. Klien perlu menerima IP otomatis dari rentang yang ditentukan.',
            'dns' => 'Koneksi dasar router sudah disiapkan, tetapi daftar DNS Servers masih kosong dan Allow Remote Requests belum aktif. Klien LAN akan memakai router sebagai tempat bertanya DNS.',
            'nat' => 'Router memiliki jalur ISP melalui ether4. DHCP Client dan rute pendukung sudah siap, tetapi aturan NAT untuk klien studio belum dibuat. Kamu cukup menambahkan aturan source NAT yang diminta.',
            'route' => 'Router sudah memiliki sambungan WAN dan konfigurasi DNS. Default route untuk tujuan di luar jaringan lokal belum dibuat. Gateway ISP yang harus dipakai tersedia pada rincian tugas.',
            'router-test' => 'WAN, DNS, rute, dan NAT sudah disiapkan. Kamu tidak diminta mengubah konfigurasi tersebut. Pengujian harus dijalankan dari router, bukan dari CMD komputer.',
            'pc-test' => 'Kabel PC terpasang pada ether3. Gateway, DHCP, DNS, dan NAT sudah siap. Kamu akan memeriksa alamat yang diterima komputer dan koneksinya ke gateway melalui CMD.',
            'wireless' => 'Interface wlan1 masih nonaktif, memakai mode station, dan SSID bawaan MikroTik. Profil keamanan default tersedia. Kamu perlu mengubah wlan1 menjadi access point sesuai permintaan.',
            'security' => 'Wi-Fi wlan1 sudah tersedia. Profil keamanan baru yang diminta belum ada. Tugas mencakup membuat profil tersebut dan menerapkannya ke wlan1; membuat profil saja belum cukup.',
            'hotspot' => 'Wi-Fi wlan1 sudah aktif. HotSpot dan akun awal untuk tugas ini belum dibuat. Alamat jaringan, rentang pool, dan DNS pada wizard perlu kamu isi sendiri sesuai rincian tugas. Password akun portal berbeda perannya dari kunci Wi-Fi.',
            'portal-login' => 'Wi-Fi, keamanan WPA2, HotSpot, dan akun tamu sudah disiapkan pada router. HP uji belum terhubung dan belum login. Gunakan kunci Wi-Fi saat menyambung jaringan, lalu gunakan akun HotSpot saat portal meminta login.',
            'portal-page' => 'HotSpot sudah tersedia dan router menyimpan hotspot/login.html bawaan. Salinan di desktop belum ada. File pada router yang akan diperiksa, jadi perubahan di Notepad harus disimpan dan diunggah kembali.',
            'profile' => 'HotSpot sudah berjalan dengan profil default. Profil tamu khusus yang diminta belum ada. Kamu mengatur batas pemakaian pada User Profile, bukan membuat akun pengguna pada tugas ini.',
            'users' => 'HotSpot dan User Profile yang diminta sudah dibuat. Akun peserta baru belum ada. Gunakan profil yang tersedia ketika membuat akun; tidak perlu membuat ulang profilnya.',
            'bridge' => 'WinBox sudah terhubung ke hEX. Belum ada bridge untuk tugas ini. Kamu cukup membuat satu bridge; penambahan anggota port dan konfigurasi VLAN bukan bagian dari tugas ini.',
            'bridge-ports' => 'Bridge tujuan sudah tersedia pada hEX, tetapi port yang diminta belum menjadi anggotanya. Ether5 disisakan untuk PC teknisi dan harus tetap berada di luar bridge.',
            'switch-ports' => 'WinBox sudah terhubung ke hEX. Pengaturan VLAN pada switch port masih bawaan. Kamu mengubah peran ether1 sebagai uplink dan ether3 sebagai port akses melalui pengaturan Switch Port.',
            'switch-vlan' => 'Port switch tersedia pada hEX dan tabel keanggotaan VLAN untuk tugas ini masih kosong. Kamu menambahkan satu entri VLAN pada switch1 beserta seluruh port anggotanya.',
            'switch-test' => 'Bridge, VLAN, dan DHCP pendukung sudah disiapkan. Ujung kabel PC masih berada di ether5 hEX. Ujung yang masuk ke LAN komputer tetap terpasang saat kamu memindahkan ujung pada switch.',
        };
        $outcome = match ($scenario['type']) {
            'identity', 'switch-identity' => 'Nama perangkat harus sama persis dengan Identity yang diminta. Nama ini menandai perangkat di sesi WinBox; nama port tidak perlu diubah.',
            'interfaces' => 'Ketiga port harus memiliki nama baru sesuai pasangannya. Port fisik tetap sama; kamu hanya mengganti namanya.',
            'wiring' => 'Kedua ujung harus mengikuti T568A, sudah di-crimp, dan sudah diuji menggunakan LAN tester.',
            'topology' => 'Setiap kabel harus berada pada port sesuai rincian, dan ujung kabel komputer harus terpasang pada LAN PC.',
            'login' => 'PC menyala dan WinBox terhubung ke MAC perangkat yang diminta menggunakan akun latihan.',
            'vlan' => 'Satu interface VLAN aktif dengan nama, VLAN ID, dan interface induk yang tepat. VLAN ID adalah nomor jaringan virtual, bukan nomor port.',
            'wan' => 'DHCP Client pada ether4 aktif dan berstatus bound, menambahkan default route, serta tidak mengambil DNS dari ISP.',
            'addresses' => 'Ether3 memiliki alamat gateway beserta prefix /24 sesuai tugas. Alamat ini adalah IP router untuk jaringan studio.',
            'dhcp' => 'DHCP Server aktif pada ether3 dengan pool, gateway, DNS, dan lease time sesuai rincian. Pool tersebut harus benar-benar digunakan oleh server.',
            'dns' => 'Kedua alamat resolver tersimpan dan router diizinkan menjawab permintaan DNS dari klien LAN.',
            'nat' => 'Aturan srcnat aktif dengan action masquerade melalui ether4. Kolom sumber dan tujuan alamat dibiarkan kosong sesuai rincian.',
            'route' => 'Rute 0.0.0.0/0 memakai gateway dan distance yang diminta. Tujuan ini mewakili jaringan luar yang tidak memiliki rute lebih spesifik.',
            'router-test' => 'Ping dari router menuju alamat pada rincian tugas mendapat balasan.',
            'pc-test' => 'IP komputer sudah diperiksa dengan ipconfig dan pengujian ping ke gateway mendapat balasan.',
            'wireless' => 'Wlan1 aktif sebagai access point, menyiarkan SSID yang diminta, dan memakai Security Profile default.',
            'security' => 'Profil baru memakai dynamic keys dan WPA2 PSK dengan kunci yang diminta, lalu terpilih sebagai Security Profile wlan1.',
            'hotspot' => 'HotSpot aktif pada wlan1 dengan alamat, pool, DNS, dan nama portal sesuai rincian, serta akun awal dapat digunakan.',
            'portal-login' => 'HP terhubung ke SSID yang diminta dan sesi portal berhasil login sebagai akun tamu yang ditentukan.',
            'portal-page' => 'File login.html pada router memuat judul H1 yang diminta dan tetap memiliki formulir username serta password.',
            'profile' => 'User Profile baru membatasi dua perangkat bersamaan dengan Rate Limit rx/tx sesuai rincian.',
            'users' => 'Akun HotSpot baru memiliki username, password, dan User Profile yang tepat.',
            'bridge' => 'Bridge aktif dengan nama yang diminta, Protocol Mode rstp, dan VLAN Filtering tidak aktif.',
            'bridge-ports' => 'Seluruh port yang diminta menjadi anggota bridge tujuan, sedangkan ether5 tidak masuk bridge.',
            'switch-ports' => 'VLAN Mode, VLAN Header, dan Default VLAN ID kedua port harus sesuai peran uplink dan aksesnya.',
            'switch-vlan' => 'Satu entri pada switch1 memiliki VLAN ID yang tepat dan seluruh port anggota yang diminta.',
            'switch-test' => 'Kabel PC berada di ether3 dan hasil ipconfig menampilkan IP yang diminta dari jaringan VLAN tersebut.',
        };

        return [
            'context' => $context,
            'initial' => $initial,
            'assignment' => $scenario['description'],
            'outcome' => $outcome,
            'requirements' => $scenario['clues'],
            'submission' => 'Simpan perubahan konfigurasi dengan OK atau Apply pada jendela terkait. Tombol Selesaikan jawaban akan muncul mengambang di atas area praktik setelah kamu mulai mengerjakan. Setelah seluruh kebutuhan tugas terpenuhi, tekan tombol tersebut dan konfirmasi pengumpulan. Bapak baru memeriksa jawaban setelah kamu mengumpulkannya. Jika ada kekeliruan, hasil akhir menampilkan daftar bagian yang belum sesuai. Semua menu tetap bisa dipakai, tetapi kamu hanya mengerjakan satu misi dalam soal ini.',
        ];
    }

    /** @return array<string, mixed> */
    public function generate(?string $previousType = null, ?string $type = null): array
    {
        $choices = array_values(array_diff(self::TYPES, [$previousType]));
        $type ??= $choices[random_int(0, count($choices) - 1)];
        if (! in_array($type, self::TYPES, true)) {
            throw new \InvalidArgumentException('Jenis latihan tidak dikenal.');
        }
        $n = random_int(70, 190);
        $tag = strtoupper(Str::random(4));
        $net = '172.22.'.$n;
        $vid = random_int(110, 399);
        $name = 'Lab-'.$tag;
        $ssid = 'Praktik-'.$tag;
        $key = 'Belajar-'.$n.'-'.$tag;
        $bridge = 'bridge-'.$tag;
        $profile = 'profil-'.$tag;
        $user = 'peserta-'.strtolower($tag);
        $state = $this->initialState($net, $ssid, $key);
        $scalar = fn (string $path, mixed $expected, string $label): array => ['path' => $path, 'expected' => $expected, 'label' => $label];
        $row = fn (string $table, array $where, array $fields, string $label): array => ['table' => $table, 'where' => $where, 'fields' => ['disabled' => false, ...$fields], 'label' => $label];
        $catalog = [
            'identity' => [1, 'Identitas ruang multimedia', 'Ubah identitas perangkat menjadi '.$name.' agar teknisi mudah mengenalinya.', ['Identity: '.$name], [$scalar('identity', $name, 'Identity perangkat')]],
            'interfaces' => [1, 'Nama jalur jaringan', 'Rapikan nama tiga interface router sesuai peran jalurnya.', ['ether1 → ether1-uplink-'.$tag, 'ether2 → ether2-studio-'.$tag, 'ether3 → ether3-teknisi-'.$tag], [
                $row('interfaces', ['defaultName' => 'ether1'], ['name' => 'ether1-uplink-'.$tag], 'Interface ether1'),
                $row('interfaces', ['defaultName' => 'ether2'], ['name' => 'ether2-studio-'.$tag], 'Interface ether2'),
                $row('interfaces', ['defaultName' => 'ether3'], ['name' => 'ether3-teknisi-'.$tag], 'Interface ether3'),
            ]],
            'wiring' => [1, 'Kabel straight ruang multimedia', 'Siapkan kabel straight T568A pada kedua ujung, crimp, lalu uji dengan LAN tester.', ['Jenis: straight.', 'Kedua ujung: T568A.', 'Crimp dan uji kedua ujung.'], [
                $scalar('physical.wires.a', ['putih-hijau', 'hijau', 'putih-oranye', 'biru', 'putih-biru', 'oranye', 'putih-cokelat', 'cokelat'], 'Urutan pin ujung A'),
                $scalar('physical.wires.b', ['putih-hijau', 'hijau', 'putih-oranye', 'biru', 'putih-biru', 'oranye', 'putih-cokelat', 'cokelat'], 'Urutan pin ujung B'),
                $scalar('physical.crimp.a', true, 'Crimp ujung A'), $scalar('physical.crimp.b', true, 'Crimp ujung B'), $scalar('physical.tested', true, 'Pengujian LAN tester'),
            ]],
            'topology' => [1, 'Jalur perangkat studio', 'Sambungkan sumber internet, switch hEX, dan PC teknisi ke router. Ujung satunya juga harus masuk ke LAN komputer.', ['Internet → ether4.', 'hEX → ether3.', 'PC → ether2; LAN PC terpasang.'], [$scalar('physical.connections.internet', 'ether4', 'Kabel internet'), $scalar('physical.connections.switch', 'ether3', 'Kabel switch'), $scalar('physical.connections.pc', 'ether2', 'Kabel PC'), $scalar('physical.pcLan', true, 'LAN PC')]],
            'login' => [1, 'Masuk ke perangkat baru', 'Nyalakan PC dan buka sesi WinBox ke perangkat yang diminta menggunakan admin dan password kosong.', ['MAC: '.$state['session']['mac'], 'Login: admin; password kosong.'], [$scalar('session.connected', true, 'Koneksi WinBox'), $scalar('session.connectedMac', $state['session']['mac'], 'MAC tujuan')]],
            'vlan' => [2, 'VLAN ruang multimedia', 'Pisahkan jaringan multimedia dengan satu interface VLAN di atas ether2.', ['Name: vlan-media-'.$tag, 'VLAN ID: '.$vid, 'Interface induk: ether2.'], [$row('vlans', ['name' => 'vlan-media-'.$tag], ['vlanId' => $vid, 'interface' => 'ether2'], 'Interface VLAN')]],
            'wan' => [2, 'Alamat otomatis dari ISP', 'ISP terhubung ke ether4. Router harus menerima IP dan default route, tetapi tidak memakai DNS otomatis ISP.', ['Interface: ether4.', 'Add Default Route: yes.', 'Use Peer DNS: no.'], [$row('wan', ['interface' => 'ether4'], ['addDefaultRoute' => true, 'usePeerDns' => false, 'status' => 'bound'], 'DHCP Client WAN')]],
            'addresses' => [2, 'Gateway studio', 'Pasang alamat gateway jaringan multimedia pada ether3.', ['Address: '.$net.'.1/24.', 'Interface: ether3.'], [$row('addresses', ['interface' => 'ether3'], ['address' => $net.'.1/24'], 'IP gateway')]],
            'dhcp' => [2, 'DHCP untuk studio', 'Gateway ether3 sudah disiapkan. Berikan konfigurasi IP otomatis untuk komputer studio.', ['Subnet: '.$net.'.0/24; interface ether3.', 'Pool: '.$net.'.60-'.$net.'.95.', 'Gateway/DNS: '.$net.'.1; lease 00:20:00.'], [$row('dhcp', ['interface' => 'ether3'], ['leaseTime' => '00:20:00'], 'DHCP Server'), $row('pools', [], ['ranges' => $net.'.60-'.$net.'.95'], 'Pool DHCP'), $row('networks', ['address' => $net.'.0/24'], ['gateway' => $net.'.1', 'dns' => [$net.'.1']], 'DHCP Network')]],
            'dns' => [3, 'Resolver jaringan multimedia', 'Router memakai dua resolver publik dan harus bisa menjawab permintaan DNS klien LAN.', ['Servers: 9.9.9.9 dan 149.112.112.112.', 'Permintaan DNS klien LAN diizinkan.'], [$scalar('dns.servers', ['9.9.9.9', '149.112.112.112'], 'Servers DNS'), $scalar('dns.allowRemoteRequests', true, 'Allow Remote Requests')]],
            'nat' => [3, 'Internet untuk klien studio', 'Samarkan alamat klien yang keluar melalui jalur ISP ether4 dengan source NAT.', ['Chain: srcnat; Action: masquerade.', 'Out. Interface: ether4.', 'Src. Address dan Dst. Address kosong.'], [$row('nat', ['chain' => 'srcnat'], ['outInterface' => 'ether4', 'action' => 'masquerade', 'srcAddress' => '', 'dstAddress' => ''], 'Aturan NAT')]],
            'route' => [3, 'Default route studio', 'Arahkan tujuan di luar jaringan lokal ke gateway ISP.', ['Dst. Address: 0.0.0.0/0.', 'Gateway: 203.0.113.1.', 'Distance: 1.'], [$row('routes', ['dstAddress' => '0.0.0.0/0'], ['gateway' => '203.0.113.1', 'distance' => 1], 'Default route')]],
            'router-test' => [3, 'Uji koneksi dari router', 'Konfigurasi dasar sudah disiapkan. Uji koneksi menuju resolver publik dari router dan pastikan ada balasan.', ['Asal pengujian: router.', 'Tujuan ping: 9.9.9.9.'], [$scalar('tests.routerPing', '9.9.9.9', 'Ping router')]],
            'pc-test' => [3, 'Uji koneksi PC studio', 'Periksa alamat PC melalui CMD dan uji koneksi ke gateway. Konfigurasi dasar sudah siap.', ['IP PC: '.$net.'.60/24.', 'Gateway: '.$net.'.1.', 'Periksa dengan ipconfig dan ping gateway.'], [$scalar('tests.pcIp', $net.'.60', 'Pemeriksaan ipconfig'), $scalar('tests.pcPing', $net.'.1', 'Ping gateway dari PC')]],
            'wireless' => [4, 'Access point ruang multimedia', 'Aktifkan wlan1 sebagai access point dengan nama jaringan baru.', ['Mode: ap bridge; interface wlan1 aktif.', 'SSID: '.$ssid, 'Security Profile: default.'], [$row('wireless', ['name' => 'wlan1'], ['mode' => 'ap bridge', 'ssid' => $ssid, 'securityProfile' => 'default'], 'Wi-Fi multimedia')]],
            'security' => [4, 'Keamanan Wi-Fi studio', 'Buat Security Profile baru dan terapkan ke wlan1.', ['Name: '.$profile.'; mode dynamic keys.', 'WPA2 PSK aktif; kunci '.$key, 'Terapkan profil pada wlan1.'], [$row('security', ['name' => $profile], ['mode' => 'dynamic keys', 'wpa2' => true, 'key' => $key], 'Security Profile'), $row('wireless', ['name' => 'wlan1'], ['securityProfile' => $profile], 'Profil pada wlan1')]],
            'hotspot' => [4, 'Portal tamu multimedia', 'Wi-Fi sudah aktif. Siapkan HotSpot pada wlan1 beserta akun awal. Tidak memakai SMTP atau sertifikat.', ['Local Address: '.$net.'.1/24; interface wlan1.', 'Pool: '.$net.'.60-'.$net.'.95; DNS 9.9.9.9.', 'DNS Name: portal-'.strtolower($tag).'.test.', 'Akun: '.$user.' / '.$key], [$row('hotspot', ['interface' => 'wlan1'], ['localAddress' => $net.'.1/24', 'pool' => $net.'.60-'.$net.'.95', 'dns' => ['9.9.9.9'], 'dnsName' => 'portal-'.strtolower($tag).'.test'], 'HotSpot studio'), $row('users', ['name' => $user], ['password' => $key], 'Akun HotSpot awal')]],
            'portal-login' => [4, 'Uji portal dari HP', 'Hubungkan HP uji ke Wi-Fi studio, lalu masuk ke portal HotSpot menggunakan akun tamu.', ['SSID: '.$ssid.'; kunci Wi-Fi '.$key, 'HotSpot: '.$user.' / Tamu-'.$n], [$scalar('phone.ssid', $ssid, 'SSID HP'), $scalar('phone.authenticatedUser', $user, 'Login HotSpot di HP')]],
            'portal-page' => [4, 'Sambutan portal studio', 'Salin hotspot/login.html ke desktop, edit melalui Notepad, simpan, lalu unggah kembali. Formulir login harus tetap ada.', ['Berkas: hotspot/login.html.', 'Judul H1: Selamat Datang di Studio '.$tag, 'Berkas yang dinilai adalah berkas pada router.'], [['path' => 'files.routerHtml', 'heading' => 'Selamat Datang di Studio '.$tag, 'label' => 'Halaman login router']]],
            'profile' => [4, 'Profil tamu studio', 'Buat profil HotSpot untuk dua perangkat dengan batas kecepatan berbeda dari profil bawaan.', ['Name: '.$profile, 'Shared Users: 2.', 'Rate Limit rx/tx: 3M/6M.'], [$row('profiles', ['name' => $profile], ['sharedUsers' => 2, 'rateLimit' => '3M/6M'], 'HotSpot User Profile')]],
            'users' => [4, 'Akun peserta studio', 'Profil tamu sudah tersedia. Buat satu akun peserta menggunakan profil yang diminta.', ['Username: '.$user, 'Password: '.$key, 'Profile: '.$profile], [$row('users', ['name' => $user], ['password' => $key, 'profile' => $profile], 'Akun peserta')]],
            'switch-identity' => [5, 'Identitas switch studio', 'Beri identitas baru pada hEX agar tidak tertukar dengan router utama.', ['Identity hEX: '.$name], [$scalar('identity', $name, 'Identity hEX')]],
            'bridge' => [5, 'Bridge switch multimedia', 'Buat bridge pada hEX dengan protokol spanning tree bawaan.', ['Name: '.$bridge, 'Protocol Mode: rstp.', 'VLAN Filtering: tidak aktif.'], [$row('bridges', ['name' => $bridge], ['protocol' => 'rstp', 'vlanFiltering' => false], 'Bridge hEX')]],
            'bridge-ports' => [5, 'Anggota bridge studio', 'Bridge sudah tersedia. Masukkan tiga port yang diminta; sisakan ether5 untuk PC teknisi.', ['Bridge: '.$bridge, 'Anggota: ether1, ether2, ether4.', 'ether5 di luar bridge.'], [$row('bridgePorts', ['interface' => 'ether1'], ['bridge' => $bridge], 'Bridge Port ether1'), $row('bridgePorts', ['interface' => 'ether2'], ['bridge' => $bridge], 'Bridge Port ether2'), $row('bridgePorts', ['interface' => 'ether4'], ['bridge' => $bridge], 'Bridge Port ether4'), ['table' => 'bridgePorts', 'absent' => ['interface' => 'ether5'], 'label' => 'ether5 harus tetap di luar bridge']]],
            'switch-ports' => [5, 'Trunk dan access studio', 'Tentukan peran port uplink dan akses pada switch hEX.', ['ether1: check / add if missing / Default VLAN ID 0.', 'ether3: secure / always strip / Default VLAN ID '.$vid.'.'], [$row('switchPorts', ['name' => 'ether1'], ['mode' => 'check', 'header' => 'add if missing', 'vlanId' => 0], 'Switch Port ether1'), $row('switchPorts', ['name' => 'ether3'], ['mode' => 'secure', 'header' => 'always strip', 'vlanId' => $vid], 'Switch Port ether3')]],
            'switch-vlan' => [5, 'Tabel VLAN switch studio', 'Jalur trunk dan akses sudah disiapkan. Tambahkan keanggotaan VLAN pada switch1.', ['Switch: switch1; VLAN ID '.$vid, 'Ports: ether1, ether3, ether4.'], [$row('switchVlans', ['vlanId' => $vid], ['switch' => 'switch1', 'ports' => ['ether1', 'ether3', 'ether4']], 'Switch VLAN')]],
            'switch-test' => [5, 'Pengujian satu port akses', 'Pindahkan ujung kabel PC dari ether5 ke ether3 hEX, lalu periksa hasil ipconfig. Ujung pada LAN PC tetap terpasang.', ['Kabel PC: ether5 → ether3.', 'IP: '.$net.'.60/24.', 'Gateway: '.$net.'.1.'], [$scalar('physical.pcPort', 'ether3', 'Port kabel PC'), $scalar('tests.pcIp', $net.'.60', 'Hasil ipconfig pada port akses')]],
        ];
        [$chapter, $title, $description, $clues, $rules] = $catalog[$type];
        foreach (['vlan' => ['vlans'], 'wan' => ['wan'], 'addresses' => ['addresses'], 'dhcp' => ['dhcp', 'pools', 'networks'], 'nat' => ['nat'], 'route' => ['routes'], 'hotspot' => ['hotspot', 'users']] as $target => $tables) {
            if ($type === $target) {
                foreach ($tables as $table) {
                    $state['tables'][$table] = [];
                }
            }
        }
        if ($type === 'dns') {
            $state['dns'] = ['servers' => [], 'allowRemoteRequests' => false];
        }
        if ($type === 'wireless') {
            $state['tables']['wireless'][0] = ['name' => 'wlan1', 'mode' => 'station', 'ssid' => 'MikroTik', 'securityProfile' => 'default', 'disabled' => true];
        }
        if ($type === 'login') {
            $state['session']['connected'] = false;
            $state['physical']['powered'] = false;
        }
        if ($type === 'topology') {
            $state['physical']['pcLan'] = false;
        }
        if ($type === 'users') {
            $state['tables']['profiles'][] = ['name' => $profile, 'sharedUsers' => 2, 'rateLimit' => '3M/6M', 'disabled' => false];
        }
        if ($type === 'portal-login') {
            $state['tables']['users'][] = ['name' => $user, 'password' => 'Tamu-'.$n, 'profile' => 'default', 'disabled' => false];
        }
        if ($type === 'bridge-ports') {
            $state['tables']['bridges'][] = ['name' => $bridge, 'protocol' => 'rstp', 'disabled' => false];
        }
        if ($chapter === 5) {
            $state['device'] = 'hEX lite';
        } else {
            $state['tables']['interfaces'] = array_slice($state['tables']['interfaces'], 0, 4);
            $state['tables']['switchPorts'] = array_slice($state['tables']['switchPorts'], 0, 4);
        }
        if ($type === 'switch-test') {
            $state['physical']['pcPort'] = 'ether5';
            $state['tables']['bridges'][] = ['name' => $bridge, 'protocol' => 'rstp', 'disabled' => false];
            foreach (['ether1', 'ether3'] as $port) {
                $state['tables']['bridgePorts'][] = ['interface' => $port, 'bridge' => $bridge, 'disabled' => false];
            }
            $state['tables']['switchPorts'][0] = ['name' => 'ether1', 'switch' => 'switch1', 'mode' => 'check', 'header' => 'add if missing', 'vlanId' => 0, 'disabled' => false];
            $state['tables']['switchPorts'][2] = ['name' => 'ether3', 'switch' => 'switch1', 'mode' => 'secure', 'header' => 'always strip', 'vlanId' => $vid, 'disabled' => false];
            $state['tables']['switchVlans'][] = ['switch' => 'switch1', 'vlanId' => $vid, 'ports' => ['ether1', 'ether3'], 'disabled' => false];
        }

        return ['id' => (string) Str::uuid(), 'type' => $type, 'chapter' => $chapter, 'surface' => in_array($type, ['wiring', 'topology', 'switch-test'], true) ? 'physical' : ($type === 'login' ? 'desktop' : 'winbox'), 'title' => $title, 'description' => $description, 'clues' => $clues, 'initialState' => $state, 'rules' => $rules];
    }

    /** @return array<string, mixed> */
    private function initialState(string $net, string $ssid, string $key): array
    {
        $on = ['disabled' => false];

        return [
            'identity' => 'MikroTik', 'device' => 'hAP lite',
            'session' => ['connected' => true, 'mac' => '48:A9:8A:2C:07:'.strtoupper(bin2hex(random_bytes(1))), 'connectedMac' => ''],
            'dns' => ['servers' => ['9.9.9.9', '149.112.112.112'], 'allowRemoteRequests' => true],
            'tables' => [
                'interfaces' => array_map(fn (int $port): array => ['name' => 'ether'.$port, 'defaultName' => 'ether'.$port, 'mtu' => 1500, ...$on], range(1, 5)),
                'vlans' => [], 'addresses' => [['address' => $net.'.1/24', 'network' => $net.'.0', 'interface' => 'ether3', ...$on]],
                'wan' => [['interface' => 'ether4', 'addDefaultRoute' => true, 'usePeerDns' => false, 'status' => 'bound', 'address' => '203.0.113.2/24', ...$on]],
                'dhcp' => [['name' => 'dhcp-studio', 'interface' => 'ether3', 'pool' => 'pool-studio', 'leaseTime' => '00:20:00', ...$on]],
                'pools' => [['name' => 'pool-studio', 'ranges' => $net.'.60-'.$net.'.95', ...$on]],
                'networks' => [['address' => $net.'.0/24', 'gateway' => $net.'.1', 'dns' => [$net.'.1'], ...$on]],
                'nat' => [['chain' => 'srcnat', 'action' => 'masquerade', 'outInterface' => 'ether4', 'srcAddress' => '', 'dstAddress' => '', ...$on]],
                'routes' => [['dstAddress' => '0.0.0.0/0', 'gateway' => '203.0.113.1', 'distance' => 1, ...$on]],
                'wireless' => [['name' => 'wlan1', 'mode' => 'ap bridge', 'ssid' => $ssid, 'securityProfile' => 'studio', ...$on]],
                'security' => [['name' => 'default', 'mode' => 'none', 'wpa2' => false, 'key' => '', ...$on], ['name' => 'studio', 'mode' => 'dynamic keys', 'wpa2' => true, 'key' => $key, ...$on]],
                'hotspot' => [['name' => 'hotspot-studio', 'interface' => 'wlan1', 'localAddress' => $net.'.1/24', 'pool' => $net.'.60-'.$net.'.95', 'dns' => ['9.9.9.9'], 'dnsName' => 'studio.test', ...$on]],
                'profiles' => [['name' => 'default', 'sharedUsers' => 1, 'rateLimit' => '', ...$on]],
                'users' => [['name' => 'teknisi', 'password' => 'studio', 'profile' => 'default', ...$on]],
                'bridges' => [], 'bridgePorts' => [], 'switchVlans' => [],
                'switchPorts' => array_map(fn (int $port): array => ['name' => 'ether'.$port, 'switch' => 'switch1', 'mode' => 'disabled', 'header' => 'leave as is', 'vlanId' => 0, ...$on], range(1, 5)),
            ],
            'physical' => ['wires' => ['a' => [], 'b' => []], 'crimp' => ['a' => false, 'b' => false], 'tested' => false, 'connections' => [], 'pcLan' => true, 'pcPort' => 'ether3', 'powered' => true],
            'files' => ['routerHtml' => '<html><body><div align="center"><form name="login"><input name="username"><input name="password" type="password"><input type="submit" value="Connect"></form></div></body></html>', 'desktopHtml' => null],
            'phone' => ['ssid' => '', 'authenticatedUser' => ''], 'tests' => ['routerPing' => '', 'pcIp' => '', 'pcPing' => ''],
        ];
    }
}
