@php
    $student = auth()->user();
    $teacherPath = 'images/asset/char/guru/bapak Amat/';
@endphp
<!DOCTYPE html>
<html lang="id" data-page="chapter-two">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0879ef">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Chapter 02: IP, VLAN dan DHCP — NetGuard Academy</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
    <link rel="preload" as="image" href="{{ asset('images/background/ruanglab.png') }}">
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-two.css') }}?v={{ filemtime(public_path('css/chapter-two.css')) }}">
    <script src="{{ asset('js/chapter-two.js') }}?v={{ filemtime(public_path('js/chapter-two.js')) }}" defer></script>
</head>
<body class="ch2-body">
<div class="ch2-shell" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.two.complete') }}" data-completed="{{ $student->completedAdventureChapters() >= 2 ? 'true' : 'false' }}">
    <header class="ch2-header">
        <a class="ch2-back" href="{{ route('adventure') }}#chapter-02" aria-label="Kembali ke peta chapter">←</a>
        <img class="ch2-logo" src="{{ asset('images/logo/logo.png') }}" alt="" width="54" height="54">
        <div class="ch2-heading"><small>NETGUARD ACADEMY · ADVENTURE MODE</small><strong>Lab Chapter 02</strong><span>Pengalamatan IP, VLAN dan DHCP</span></div>
        <div class="ch2-progress"><small>PROGRES MISI</small><strong data-progress-label>0 / 5</strong><progress data-progress value="0" max="5"></progress></div>
        <button class="ch2-save" type="button" data-save>▣ <span>Simpan Progres</span></button>
        <img class="ch2-avatar" src="{{ asset($student->profileAvatarPath()) }}" alt="{{ $student->name }}" width="46" height="46">
    </header>

    <main class="ch2-main" id="main-content">
        <div class="ch2-topline"><span>CHAPTER 02 / 05</span><p>Jaringan fisik sudah siap. Sekarang kita membagi pengguna sekolah ke segmen yang tepat.</p></div>
        <nav class="ch2-track" aria-label="Tahap misi Chapter 2">
            <button type="button" data-jump="lesson"><b>00</b><span>Materi</span></button>
            <button type="button" data-jump="vlan"><b>01</b><span>Buat VLAN</span></button>
            <button type="button" data-jump="wan"><b>02</b><span>DHCP Client</span></button>
            <button type="button" data-jump="addresses"><b>03</b><span>IP Gateway</span></button>
            <button type="button" data-jump="dhcp"><b>04</b><span>DHCP Server</span></button>
            <button type="button" data-jump="verify"><b>05</b><span>Uji Klien</span></button>
        </nav>

        <div class="ch2-layout">
            <section class="ch2-board" aria-live="off">
                <div class="ch2-stage" data-panel="intro">
                    <div class="ch2-intro-art"><img src="{{ asset('images/asset/chapter-two-topology.svg') }}" alt="Diagram router hAP membagi jaringan sekolah ke VLAN siswa, VLAN guru, dan WiFi" width="1100" height="560"></div>
                    <div class="ch2-dialogue" data-dialogue tabindex="0" role="button" aria-label="Klik untuk melanjutkan dialog Pak Amat">
                        <img class="ch2-dialogue__teacher" src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru TKJ">
                        <div class="ch2-dialogue__card"><b>PAK AMAT · GURU TKJ</b><p data-dialogue-text>Kerja bagus! Router dan kabel dari misi pertama sudah siap. Sekarang kita perlu memisahkan jaringan siswa dan guru.</p><small data-dialogue-count>1 / 4 · KLIK DI MANA SAJA UNTUK LANJUT</small></div>
                    </div>
                </div>

                <div class="ch2-stage" data-panel="lesson" hidden>
                    <div class="ch2-stage-head"><small>MATERI · SEBELUM KONFIGURASI</small><h1>Kenapa jaringan sekolah perlu dibagi?</h1><p>Satu jalur fisik menuju switch dapat membawa beberapa jaringan logis. Kita akan membuat VLAN siswa dan guru, lalu memberi gateway dan alamat otomatis pada tiap segmen.</p></div>
                    <img class="ch2-lesson-map" src="{{ asset('images/asset/chapter-two-topology.svg') }}" alt="Diagram hubungan internet, router, VLAN siswa, VLAN guru, WiFi, dan klien" width="1100" height="560">
                    <div class="ch2-concepts"><article><span>01</span><h2>VLAN</h2><p>Memisahkan siswa dan guru secara logis meskipun keduanya melewati interface induk <b>ether2-vlan</b> menuju switch.</p></article><article><span>02</span><h2>IP gateway</h2><p>Alamat router pada setiap segmen. Klien memakai gateway di subnet yang sama untuk berkomunikasi ke luar segmennya.</p></article><article><span>03</span><h2>DHCP</h2><p><b>Client</b> pada WAN menerima alamat dari penyedia. <b>Server</b> pada segmen lokal membagikan alamat kepada perangkat sekolah.</p></article></div>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-next="vlan">Mulai membuat VLAN →</button></div>
                </div>

                <div class="ch2-stage" data-panel="vlan" hidden>
                    <div class="ch2-stage-head"><small>MISI 01 / 05 · INTERFACES → VLAN</small><h1>Pisahkan siswa dan guru</h1><p>Buat dua VLAN di atas interface menuju switch. Nama, ID, dan interface induk harus sesuai skenario.</p></div>
                    <div class="ch2-workspace ch2-workspace--split"><div class="ch2-device"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="Router MikroTik hAP" loading="lazy"><span>hAP · ether2-vlan menuju switch</span><div class="ch2-branches"><i>VLAN 10 · SISWA</i><i>VLAN 20 · GURU</i></div></div><div class="ch2-sim-window"><div class="ch2-window-title"><span>▣ WinBox / Interfaces / VLAN</span><span>− □ ×</span></div><div class="ch2-window-body"><div class="ch2-window-tabs"><b>VLAN</b><span>Ethernet</span><span>Wireless</span></div><div class="ch2-form-grid"><label>Nama VLAN siswa<input data-vlan-name="student" type="text" value="vlan1-siswa" autocomplete="off"></label><label>VLAN ID siswa<input data-vlan-id="student" type="number" min="1" max="4094" value="10"></label><label>Interface induk<select data-vlan-parent="student"><option value="">Pilih interface</option><option>ether1-internet</option><option>ether2-vlan</option><option>ether3-local</option></select></label><label>Nama VLAN guru<input data-vlan-name="teacher" type="text" value="vlan2-guru" autocomplete="off"></label><label>VLAN ID guru<input data-vlan-id="teacher" type="number" min="1" max="4094" value="20"></label><label>Interface induk<select data-vlan-parent="teacher"><option value="">Pilih interface</option><option>ether1-internet</option><option>ether2-vlan</option><option>ether3-local</option></select></label></div></div></div></div>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-check="vlan">Simpan kedua VLAN</button></div>
                </div>

                <div class="ch2-stage" data-panel="wan" hidden>
                    <div class="ch2-stage-head"><small>MISI 02 / 05 · IP → DHCP CLIENT</small><h1>Terima alamat dari jalur internet</h1><p>Di sisi WAN, router bertindak sebagai DHCP Client. Pilih interface yang terhubung ke penyedia, bukan interface siswa atau guru.</p></div>
                    <div class="ch2-workspace ch2-workspace--split"><div class="ch2-device ch2-device--wan"><div class="ch2-cloud">☁<strong>INTERNET / ISP</strong></div><div class="ch2-link-line"></div><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="Router hAP terhubung ke ISP" loading="lazy"><span data-wan-status>Menunggu alamat WAN…</span></div><div class="ch2-sim-window"><div class="ch2-window-title"><span>▣ WinBox / IP / DHCP Client</span><span>− □ ×</span></div><div class="ch2-window-body"><p class="ch2-window-note">DHCP Client menerima IP, gateway, dan parameter lain dari jaringan penyedia.</p><label class="ch2-full-label">Interface<select data-wan-interface><option value="">Pilih interface WAN</option><option>ether1-internet</option><option>ether2-vlan</option><option>ether3-local</option><option>wlan1</option></select></label><div class="ch2-status-row"><span>Status</span><b data-wan-table-status>belum terhubung</b></div></div></div></div>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-check="wan">Aktifkan DHCP Client</button></div>
                </div>

                <div class="ch2-stage" data-panel="addresses" hidden>
                    <div class="ch2-stage-head"><small>MISI 03 / 05 · IP → ADDRESSES</small><h1>Pasangkan IP gateway ke interface</h1><p>Perhatikan segmen di sebelah kiri. Masukkan alamat <b>beserta prefix /24</b> pada interface yang sesuai. Nilai ini adalah skenario latihan dari modul.</p></div>
                    <div class="ch2-address-list"><div class="ch2-address-row"><div><b>Jalur konfigurasi lokal</b><small>PC admin · ether3-local</small></div><input data-address="local" type="text" inputmode="decimal" placeholder="IP/prefix" aria-label="Alamat gateway lokal"></div><div class="ch2-address-row"><div><b>VLAN siswa · ID 10</b><small>vlan1-siswa</small></div><input data-address="student" type="text" inputmode="decimal" placeholder="IP/prefix" aria-label="Alamat gateway siswa"></div><div class="ch2-address-row"><div><b>VLAN guru · ID 20</b><small>vlan2-guru</small></div><input data-address="teacher" type="text" inputmode="decimal" placeholder="IP/prefix" aria-label="Alamat gateway guru"></div><div class="ch2-address-row"><div><b>Wireless / HotSpot</b><small>wlan1</small></div><input data-address="wireless" type="text" inputmode="decimal" placeholder="IP/prefix" aria-label="Alamat gateway wireless"></div></div>
                    <details class="ch2-hint"><summary>Lihat lembar skenario IP</summary><div><span>ether3-local → 192.168.100.1/24</span><span>vlan1-siswa → 192.168.40.1/24</span><span>vlan2-guru → 192.168.60.1/24</span><span>wlan1 → 192.168.20.1/24</span></div></details>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-check="addresses">Periksa gateway</button></div>
                </div>

                <div class="ch2-stage" data-panel="dhcp" hidden>
                    <div class="ch2-stage-head"><small>MISI 04 / 05 · IP → DHCP SERVER</small><h1>Bagikan IP ke klien tiap segmen</h1><p>Jalankan DHCP Server pada interface yang tepat. Pool harus berada di subnet gateway segmen tersebut dan tidak memakai alamat gateway.</p></div>
                    <div class="ch2-pool-grid"><div class="ch2-pool-card"><div><span>VLAN 10</span><h2>Jaringan siswa</h2><small>Gateway 192.168.40.1/24</small></div><label>Interface<select data-pool-interface="student"><option value="">Pilih interface</option><option>vlan1-siswa</option><option>vlan2-guru</option><option>ether1-internet</option></select></label><label>Addresses to Give Out<input data-pool-range="student" type="text" placeholder="192.168.40.10-192.168.40.50" autocomplete="off"></label></div><div class="ch2-pool-card ch2-pool-card--teacher"><div><span>VLAN 20</span><h2>Jaringan guru</h2><small>Gateway 192.168.60.1/24</small></div><label>Interface<select data-pool-interface="teacher"><option value="">Pilih interface</option><option>vlan1-siswa</option><option>vlan2-guru</option><option>ether1-internet</option></select></label><label>Addresses to Give Out<input data-pool-range="teacher" type="text" placeholder="192.168.60.10-192.168.60.50" autocomplete="off"></label></div></div>
                    <p class="ch2-note">Dalam modul, pool siswa dicontohkan 192.168.40.10–192.168.40.50. Untuk guru, gunakan rentang valid di subnet 192.168.60.0/24 pada skenario ini.</p>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-check="dhcp">Jalankan DHCP Setup</button></div>
                </div>

                <div class="ch2-stage" data-panel="verify" hidden>
                    <div class="ch2-stage-head"><small>MISI 05 / 05 · PENGUJIAN KLIEN</small><h1>Apakah tiap klien masuk segmen yang tepat?</h1><p>Klik “Minta alamat” pada kedua PC. Periksa IP dan gateway yang diterima, lalu pastikan keduanya sesuai VLAN.</p></div>
                    <div class="ch2-verify-map"><div class="ch2-verify-router"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="Router MikroTik hAP" loading="lazy"><b>DHCP SERVER · hAP</b></div><div class="ch2-verify-line"></div><div class="ch2-client-grid"><article data-client="student"><div class="ch2-client-icon">▣</div><span>VLAN 10 · SISWA</span><h2>PC Siswa</h2><dl><div><dt>IP address</dt><dd data-client-ip="student">—</dd></div><div><dt>Gateway</dt><dd data-client-gateway="student">—</dd></div></dl><button class="ch2-secondary" type="button" data-request-ip="student">Minta alamat</button></article><article data-client="teacher"><div class="ch2-client-icon">▣</div><span>VLAN 20 · GURU</span><h2>PC Guru</h2><dl><div><dt>IP address</dt><dd data-client-ip="teacher">—</dd></div><div><dt>Gateway</dt><dd data-client-gateway="teacher">—</dd></div></dl><button class="ch2-secondary" type="button" data-request-ip="teacher">Minta alamat</button></article></div></div>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-check="verify">Periksa hasil pengujian</button></div>
                </div>

                <div class="ch2-stage" data-panel="recap" hidden>
                    <div class="ch2-stage-head"><small>REKAP CHAPTER 02</small><h1>Jaringan siswa dan guru sudah terpisah</h1><p>Semua konfigurasi berhasil diuji. Sebelum evaluasi, ingat peran tiap komponen dan hubungan antarsemen jaringan.</p></div>
                    <div class="ch2-teacher-note"><img src="{{ asset($teacherPath.'mantap.png') }}" alt="Pak Amat memberi apresiasi" loading="lazy"><div><b>PAK AMAT · GURU TKJ</b><p>Bagus! PC siswa menerima alamat 192.168.40.x, sedangkan PC guru menerima 192.168.60.x. Berarti VLAN, gateway, dan DHCP Server kita sudah bekerja sesuai segmen. Sekarang kita cek pemahamanmu.</p></div></div>
                    <img class="ch2-lesson-map" src="{{ asset('images/asset/chapter-two-topology.svg') }}" alt="Rekap topologi jaringan Chapter 2" width="1100" height="560" loading="lazy">
                    <div class="ch2-recap-list"><p><b>VLAN</b> memisahkan segmen logis pada ether2-vlan.</p><p><b>DHCP Client</b> menerima konfigurasi WAN melalui ether1-internet.</p><p><b>Gateway</b> harus berada pada interface dan subnet klien yang tepat.</p><p><b>DHCP Server</b> membagikan alamat dari pool yang sesuai subnet.</p></div>
                    <div class="ch2-actions"><button class="ch2-primary" type="button" data-next="quiz">Mulai evaluasi 5 soal →</button></div>
                </div>

                <div class="ch2-stage" data-panel="quiz" hidden>
                    <div class="ch2-stage-head"><small>EVALUASI PEMAHAMAN · 5 SOAL</small><h1>Buktikan konfigurasi jaringanmu</h1><p>Jawab lima soal berdasarkan materi dan praktik tadi. Semua jawaban harus tepat agar Chapter 2 tercatat selesai.</p></div>
                    <form data-quiz-form class="ch2-quiz">
                        @foreach ($questions as $question)
                            <fieldset><legend><b>{{ $loop->iteration }}.</b> {{ $question['question'] }}</legend><div>@foreach ($question['options'] as $option)<label><input type="radio" name="answer-{{ $loop->parent->iteration }}" value="{{ $loop->index }}" required><span>{{ $option }}</span></label>@endforeach</div></fieldset>
                        @endforeach
                        <div class="ch2-actions"><button class="ch2-primary" type="submit" data-submit-quiz>Simpan hasil Chapter 2</button></div>
                    </form>
                </div>

                <div class="ch2-stage" data-panel="finish" hidden>
                    <div class="ch2-finish"><span class="ch2-finish__medal">★</span><small>CHAPTER 02 SELESAI</small><h1>Bagus! Jaringan sekolah kini terbagi rapi.</h1><p>VLAN siswa dan guru sudah terbentuk. Gateway, DHCP Client WAN, dan DHCP Server telah dikonfigurasi; kedua PC memperoleh IP dari segmen yang benar.</p><div class="ch2-finish__teacher"><img src="{{ asset($teacherPath.'mantap.png') }}" alt="Pak Amat" loading="lazy"><span><b>PAK AMAT · GURU TKJ</b>Kerja bagus! Kamu tidak hanya memasukkan angka, tetapi memastikan setiap klien mendapat alamat dan gateway yang sesuai. Itu bekal penting untuk misi akses internet berikutnya.</span></div><div><a class="ch2-primary" href="{{ route('adventure') }}#chapter-03">Lihat peta chapter →</a><a class="ch2-secondary" href="{{ route('homepage') }}">Kembali ke Beranda</a></div></div>
                </div>
                <footer class="ch2-board-footer"><p data-feedback role="status" aria-live="polite">Klik dialog Pak Amat untuk memulai misi.</p><button class="ch2-secondary" type="button" data-previous hidden>← Materi sebelumnya</button></footer>
            </section>
            <aside class="ch2-guide" aria-label="Petunjuk misi"><div class="ch2-guide__title"><span>▤</span><div><small>PETUNJUK MISI</small><h2>Langkah-Langkah</h2></div></div><ol data-guide-list><li>Dengarkan penjelasan Pak Amat.</li><li>Pelajari alasan jaringan dibagi.</li></ol><div class="ch2-guide__module"><b>Materi modul</b><span data-module-section>Chapter 2 · §2.1–2.2</span></div><img src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat" loading="lazy"></aside>
        </div>
    </main>
</div>
</body>
</html>
