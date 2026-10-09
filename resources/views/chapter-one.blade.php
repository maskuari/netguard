@php
    $student = auth()->user();
    $studentCharacter = $student->gender === 'wanita' ? 'cewe' : 'cowo';
    $teacherPath = 'images/asset/char/guru/bapak Amat/';
    $studentPath = 'images/asset/char/siswa/'.$studentCharacter.'/';
@endphp
<!DOCTYPE html>
<html lang="id" data-page="chapter-one">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0879ef">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Chapter 01: Perangkat dan Router — NetGuard Academy</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/background/ruanglab.png') }}" fetchpriority="high">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/game-music.css') }}?v={{ filemtime(public_path('css/game-music.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/chapter-one.css') }}?v={{ filemtime(public_path('css/chapter-one.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/chapter-one.js') }}?v={{ filemtime(public_path('js/chapter-one.js')) }}" defer></script>
    </head>
    <body>
        <div class="academy-scene chapter-one-scene is-prologue" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.one.complete') }}" data-teacher-base="{{ asset('images/asset/char/guru/bapak Amat') }}" data-student-base="{{ asset(rtrim($studentPath, '/')) }}" data-student-name="{{ $student->name }}">
            <div class="chapter-prologue" data-prologue>
                <div class="prologue-network" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><i></i><i></i><i></i></div>
                <div class="prologue-title" aria-hidden="true"><span>NETGUARD ACADEMY</span><b>CHAPTER 01 <i>·</i> MISI SEKOLAH</b></div>
                <div class="chapter-prologue__synopsis" data-synopsis>
                    <div class="chapter-prologue__character"><span class="chapter-prologue__character-glow"></span><img data-synopsis-avatar src="{{ asset($teacherPath.'menugaskan.png') }}" alt="Pak Amat, guru TKJ" decoding="async"><span class="chapter-prologue__character-name">PAK AMAT <i>·</i> GURU TKJ</span></div>
                    <div class="chapter-prologue__story" data-synopsis-scene>
                        <span class="chapter-prologue__eyebrow"><i data-synopsis-dot></i><b data-synopsis-kicker>PROLOG · 01</b></span>
                        <h1 data-synopsis-title>Lab TKJ membutuhkan jaringan</h1>
                        <p data-synopsis-text>Pagi ini, lab TKJ sudah dipenuhi komputer yang siap digunakan. Namun semuanya masih berdiri sendiri—belum ada jaringan yang menghubungkan ruang praktik.</p>
                        <div class="chapter-prologue__progress"><span data-synopsis-progress></span></div>
                        <div class="chapter-prologue__controls"><small data-synopsis-count>ADEGAN 01 / 05</small><small class="chapter-prologue__click-hint">KLIK UNTUK LANJUT</small></div>
                    </div>
                </div>
                <div class="chapter-dialogue" data-dialogue hidden role="dialog" aria-modal="true" aria-labelledby="dialogue-speaker">
                    <div class="chapter-dialogue__portrait chapter-dialogue__portrait--teacher is-speaking" data-dialogue-teacher><img src="{{ asset($teacherPath.'menugaskan.png') }}" alt="Pak Amat, guru TKJ" decoding="async"></div>
                    <div class="chapter-dialogue__portrait chapter-dialogue__portrait--student" data-dialogue-student><img src="{{ asset($studentPath.'bicara_santai.png') }}" alt="{{ $student->name }}" decoding="async"></div>
                    <div class="chapter-dialogue__equipment" data-dialogue-equipment hidden><img data-dialogue-equipment-image src="" alt="" decoding="async"></div>
                    <div class="chapter-dialogue__card" data-dialogue-card>
                        <div class="chapter-dialogue__content"><span id="dialogue-speaker" data-dialogue-speaker>PAK AMAT · GURU TKJ</span><p data-dialogue-text></p><small data-dialogue-count>1 / 6 · KLIK UNTUK LANJUT</small></div>
                    </div>
                </div>
            </div>
            <div class="lab-scroll">
                <header class="lab-header">
                    <button class="lab-back" type="button" data-lab-back data-back-url="{{ route('adventure') }}#chapter-01" aria-label="Kembali ke materi sebelumnya">←</button>
                    <img class="lab-logo" src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async">
                    <div class="lab-heading"><span>NETGUARD ACADEMY · ADVENTURE MODE</span><strong>Lab Chapter 01</strong><small>Perangkat & Konfigurasi Awal Router</small></div>
                    <div class="lab-hud"><span>PROGRES MISI</span><strong data-mission-count>0 / 5</strong><progress data-progress value="0" max="5">0 dari 5 misi</progress></div>
                    <div class="lab-time"><span>WAKTU BERMAIN</span><strong data-time>00:00</strong></div>
                    <button class="lab-save-progress" type="button" data-save-progress aria-live="polite"><span aria-hidden="true">▣</span><span class="lab-save-progress__label">Simpan Progres</span></button>
                    <details class="lab-settings"><summary aria-label="Pengaturan musik">♫</summary><div class="lab-settings__panel">@include('game-music-settings')</div></details>
                    <img class="lab-avatar" src="{{ asset($student->profileAvatarPath()) }}" alt="{{ $student->name }}" title="{{ $student->name }}" decoding="async">
                </header>

                <main class="lab-main" id="main-content">
                    <div class="lab-layout">
                        <aside class="lab-character lab-character--teacher" aria-label="Arahan guru">
                            <div class="lab-character__portrait"><img data-teacher-image src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru pembimbing" decoding="async"></div>
                            <div class="lab-character__speech"><span>PAK AMAT · GURU TKJ</span><p data-teacher-text>Sekolah kita membutuhkan jaringan yang rapi. Hari ini kamu jadi Junior Network Engineer!</p></div>
                        </aside>

                        <aside class="sim-topology" data-simulator-topology hidden aria-label="Topologi Network Lab">
                            <header><span>▦</span><div><small>NETWORK LAB</small><h2>Topologi Jaringan</h2></div></header>
                            <div class="sim-topology__diagram">
                                <span class="sim-topology__cloud">Internet<br><small>ISP</small></span>
                                <span class="sim-topology__link"></span>
                                <div class="sim-topology__router"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt=""><b>hAP · Router</b></div>
                                <div class="sim-topology__branches"><span></span><span></span></div>
                                <div class="sim-topology__endpoints"><div><img src="{{ asset('images/asset/alat/lab-hex-real.png') }}" alt=""><b>hEX</b></div><div><span class="sim-topology__pc">▣</span><b>PC WinBox</b></div></div>
                            </div>
                            <div class="sim-topology__ports"><b>Jalur perangkat</b><span><i>1</i> ether1 → Internet</span><span><i>2</i> ether2 → hEX</span><span><i>3</i> ether3 → PC konfigurasi</span></div>
                            <div class="sim-topology__teacher"><img data-simulator-teacher src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat" decoding="async"><p data-simulator-teacher-text>Ikuti langkah pada papan misi.</p></div>
                        </aside>

                        <section class="lab-board" aria-labelledby="lab-stage-title">
                            <header class="lab-board__header"><span class="lab-board__eyebrow" data-stage-label>MISI 01 / 05</span><h1 id="lab-stage-title" data-stage-title>Jaringan sekolah menunggu bantuanmu</h1><p data-stage-subtitle>Ikuti cerita dan siapkan perlengkapan sebelum konfigurasi.</p></header>
                            <div class="lab-board__body">
                                <section class="lab-stage" data-stage="story">
                                    <div class="story-scene">
                                        <img src="{{ asset('images/background/ruanglab.png') }}" alt="Ruang laboratorium TKJ dengan banyak komputer dan perangkat jaringan" decoding="async">
                                        <div class="story-scene__copy">
                                            <span data-story-index>BABAK 1 / 3</span>
                                            <p data-story-text>Lab TKJ sekolah akan dipakai untuk belajar jaringan. Namun router, switch, dan PC belum saling terhubung.</p>
                                            <button class="lab-button lab-button--primary" type="button" data-story-next>Lanjutkan cerita →</button>
                                        </div>
                                    </div>
                                </section>

                                <section class="lab-stage" data-stage="devices" hidden>
                                    <p class="lab-callout">Klik semua alat untuk mendengar penjelasan Pak Amat. hAP berperan sebagai router utama; hEX dipakai sebagai perangkat Ethernet sisi switch pada skenario modul.</p>
                                    <div class="device-grid">
                                        <button class="device-card" type="button" data-device="hap"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>MikroTik hAP</b><small>Router utama</small></button>
                                        <button class="device-card" type="button" data-device="hex"><img src="{{ asset('images/asset/alat/lab-hex-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>MikroTik hEX</b><small>Sisi switch</small></button>
                                        <button class="device-card" type="button" data-device="pc"><img src="{{ asset('images/asset/alat/lab-pc-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>PC konfigurasi</b><small>Menjalankan WinBox</small></button>
                                        <button class="device-card" type="button" data-device="cable"><img src="{{ asset('images/asset/alat/lab-cable-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Kabel UTP</b><small>8 inti berpilin</small></button>
                                        <button class="device-card" type="button" data-device="rj45"><img src="{{ asset('images/asset/alat/lab-rj45-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Konektor RJ45</b><small>8 posisi</small></button>
                                        <button class="device-card" type="button" data-device="crimper"><img src="{{ asset('images/asset/alat/lab-crimper-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Tang crimping</b><small>Menjepit pin</small></button>
                                        <button class="device-card" type="button" data-device="tester"><img src="{{ asset('images/asset/alat/lab-tester-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>LAN tester</b><small>Uji pin 1–8</small></button>
                                    </div>
                                    <div class="device-detail"><div class="device-detail__visual"><img data-device-preview src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="" hidden><canvas data-hap-rotator data-sprite="{{ asset('images/asset/alat/hap16frame.png') }}" width="480" height="300" tabindex="0" role="img" aria-label="MikroTik hAP. Geser ke kiri atau kanan untuk memutar perangkat" hidden></canvas></div><div class="device-detail__copy"><b data-device-name>Periksa peralatan lab</b><p data-device-detail>Pilih salah satu alat di atas untuk melihat fungsinya.</p><small data-device-tip>Ketuk gambar perangkat untuk mendengar penjelasan Pak Amat.</small></div></div>
                                </section>

                                <section class="lab-stage straight-lesson" data-stage="lesson" hidden>
                                    <div class="straight-lesson__intro">
                                        <span>MATERI SEBELUM PRAKTIK · KABEL ETHERNET</span>
                                        <h2>Apa itu kabel straight?</h2>
                                        <p>Kabel straight adalah kabel Ethernet yang susunan warna dan nomor pinnya dibuat sama pada kedua ujung konektor. Pada misi ini, kedua ujung memakai standar <b>T568B</b>.</p>
                                    </div>
                                    <div class="straight-lesson__facts">
                                        <article><b>Pengertian</b><p>Di dalam kabel UTP terdapat 8 inti tembaga yang dipilin menjadi 4 pasang. Setiap inti dimasukkan ke satu pin RJ45. Pilinan membantu mengurangi gangguan sinyal saat data dikirim.</p></article>
                                        <article><b>Kegunaan kabel straight</b><p>Digunakan untuk menghubungkan perangkat yang berbeda peran, misalnya PC ke switch, router ke switch, atau PC ke router. Di lab ini kabel dipakai untuk menyambungkan perangkat sesuai topologi MikroTik.</p></article>
                                        <article><b>Kenapa kedua ujung harus sama?</b><p>Dengan T568B di Ujung A dan Ujung B, pin 1 terhubung ke pin 1, pin 2 ke pin 2, sampai pin 8. Jika kedua ujung memakai susunan berbeda, kabel menjadi crossover, bukan straight.</p></article>
                                    </div>
                                    <div class="straight-lesson__ends" aria-label="Kedua ujung kabel straight memakai susunan T568B yang sama">
                                        <div><b>UJUNG A · T568B</b><ol><li>Putih-Oranye</li><li>Oranye</li><li>Putih-Hijau</li><li>Biru</li><li>Putih-Biru</li><li>Hijau</li><li>Putih-Cokelat</li><li>Cokelat</li></ol></div>
                                        <span class="straight-lesson__same">URUTAN<br>SAMA</span>
                                        <div><b>UJUNG B · T568B</b><ol><li>Putih-Oranye</li><li>Oranye</li><li>Putih-Hijau</li><li>Biru</li><li>Putih-Biru</li><li>Hijau</li><li>Putih-Cokelat</li><li>Cokelat</li></ol></div>
                                    </div>
                                    <p class="straight-lesson__note"><b>Urutan T568B:</b> Putih-Oranye → Oranye → Putih-Hijau → Biru → Putih-Biru → Hijau → Putih-Cokelat → Cokelat. Terapkan urutan ini dari pin 1 sampai 8 pada kedua ujung.</p>
                                    <button class="lab-button lab-button--primary" type="button" data-lesson-next>Mulai praktik kabel →</button>
                                </section>

                                <section class="lab-stage" data-stage="prep" hidden>
                                    <div class="task-heading"><div><span>SEBELUM MENYUSUN WARNA</span><h2>Siapkan kabel UTP</h2><p>Potong kabel, kupas jaket secukupnya, lalu luruskan inti sebelum masuk ke puzzle T568B.</p></div></div>
                                    <div class="prep-workbench" data-prep-workbench data-phase="coil" aria-live="polite">
                                        <div class="prep-workbench__cable-wrap"><img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--coil" data-prep-cable-coil src="{{ asset('images/asset/alat/utp-straight-coiled-hd.png') }}" alt="Kabel UTP biru yang masih tergulung dan belum dikupas"><img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--cut" data-prep-cable-cut src="{{ asset('images/asset/alat/utp-straight-cut-hd.png') }}" alt="Kabel UTP lurus yang sudah dipotong sesuai panjang"><img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--prepared" data-prep-cable-prepared src="{{ asset('images/asset/alat/utp-straight-exposed-hd.png') }}" alt="Kabel UTP lurus dengan jaket terbuka dan delapan inti terlihat"><span class="prep-workbench__cut-mark" aria-hidden="true"></span><img loading="lazy" decoding="async" class="prep-workbench__tool prep-workbench__tool--scissors" data-prep-scissors src="{{ asset('images/asset/alat/lab-scissors-real.png') }}" alt=""><img loading="lazy" decoding="async" class="prep-workbench__tool prep-workbench__tool--stripper" data-prep-stripper src="{{ asset('images/asset/alat/lab-cable-stripper-real.png') }}" alt=""><span class="prep-workbench__sorted-strands" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
                                        <div class="prep-workbench__caption"><b data-prep-visual-title>Kabel masih tergulung</b><span data-prep-visual-note>Potong kabel sesuai panjang yang dibutuhkan.</span></div>
                                    </div>
                                    <div class="prep-steps"><span data-prep-step="0">1. Potong kabel</span><span data-prep-step="1">2. Kupas jaket luar</span><span data-prep-step="2">3. Luruskan delapan inti</span></div>
                                    <div class="prep-tools">
                                        <button type="button" data-prep-action="cut"><img src="{{ asset('images/asset/alat/lab-scissors-real.png') }}" alt=""><span>Potong sesuai panjang</span></button>
                                        <button type="button" data-prep-action="strip"><img src="{{ asset('images/asset/alat/lab-cable-stripper-real.png') }}" alt=""><span>Kupas jaket luar</span></button>
                                        <button type="button" data-prep-action="straighten"><img src="{{ asset('images/asset/alat/lab-cable-real.png') }}" alt=""><span>Urai & luruskan inti</span></button>
                                    </div>
                                    <p class="lab-callout">Hati-hati: jaket luar dikupas secukupnya tanpa melukai inti kabel.</p>
                                </section>

                                <section class="lab-stage" data-stage="wiring" hidden>
                                    <div class="wiring-heading"><div><span>STANDAR T568B · KABEL STRAIGHT</span><h2>Susun warna — <strong data-wire-end>Ujung A</strong></h2><p>Seret warna ke slot atau ketuk warna untuk mengisi slot kosong berikutnya. Susunan di kedua ujung harus sama.</p></div><span class="wiring-heading__badge" data-wire-count>0 / 8</span></div>
                                    <div class="wiring-guide"><b>Petunjuk pin 1–8</b><div data-wire-guide></div></div>
                                    <div class="wire-slots" data-wire-slots aria-label="Slot pin konektor RJ45"></div>
                                    <div class="wire-bank" data-wire-bank aria-label="Pilihan warna kabel"></div>
                                    <button class="lab-button lab-button--secondary" type="button" data-check-wire>Periksa urutan warna</button>
                                </section>

                                <section class="lab-stage" data-stage="terminate" hidden>
                                    <div class="terminate-visual" data-terminate-visual><div class="terminate-frames" data-terminate-frames role="img" aria-label="Animasi pemotongan, pemasangan RJ45, dan crimping kabel" style="background-image: url('{{ asset('images/asset/alat/rj45-assembly-frames.webp') }}')"></div><span class="terminate-frame-caption" data-frame-caption>Siap merapikan ujung kabel</span></div>
                                    <div class="terminate-copy"><span data-terminate-end>UJUNG A</span><h2 data-terminate-title>Rapikan dan potong rata</h2><p data-terminate-description>Potong ujung delapan inti agar panjangnya rata sebelum masuk ke konektor RJ45.</p></div>
                                    <div class="terminate-progress"><span data-terminate-dot="0"></span><span data-terminate-dot="1"></span><span data-terminate-dot="2"></span></div>
                                    <button class="lab-button lab-button--primary" type="button" data-terminate-action>Potong rata delapan inti</button>
                                </section>

                                <section class="lab-stage" data-stage="tester" hidden>
                                    <div class="tester-layout"><div class="tester-bench"><div class="tester-bench__devices"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/lan-tester-ports-hd.png') }}" alt="LAN tester MAIN dan REMOTE dengan port RJ45 menghadap ke depan"><span class="tester-bench__device-label tester-bench__device-label--main">MAIN</span><span class="tester-bench__device-label tester-bench__device-label--remote">REMOTE</span><div class="tester-hardware-leds tester-hardware-leds--main" data-tester-hardware="main" aria-label="Indikator 1 sampai 8 MAIN"></div><div class="tester-hardware-leds tester-hardware-leds--remote" data-tester-hardware="remote" aria-label="Indikator 1 sampai 8 REMOTE"></div><button type="button" class="tester-port tester-port--main" data-tester-port="main" aria-label="Port MAIN, lepas untuk menaruh Ujung A"><span data-tester-port-state="main">LETAKKAN UJUNG A</span></button><button type="button" class="tester-port tester-port--remote" data-tester-port="remote" aria-label="Port REMOTE, lepas untuk menaruh Ujung B"><span data-tester-port-state="remote">LETAKKAN UJUNG B</span></button><svg class="tester-cable-paths" viewBox="0 0 1000 750" preserveAspectRatio="none" aria-hidden="true"><path data-tester-path="main" d="M 245 700 C 245 665, 290 645, 345 610"/><path data-tester-path="remote" d="M 755 700 C 755 665, 710 645, 655 610"/></svg><span class="tester-inserted tester-inserted--main" data-tester-inserted="main" aria-hidden="true">A</span><span class="tester-inserted tester-inserted--remote" data-tester-inserted="remote" aria-hidden="true">B</span><div class="tester-cable-ends" aria-label="Tarik konektor kabel ke port tester"><button type="button" class="tester-cable-end" data-tester-end="main" draggable="true" aria-label="Tarik Ujung A kabel ke port MAIN"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/rj45-single-hd.png') }}" alt=""><span>UJUNG A <small>Tarik ke MAIN</small></span></button><button type="button" class="tester-cable-end" data-tester-end="remote" draggable="true" aria-label="Tarik Ujung B kabel ke port REMOTE"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/rj45-single-hd.png') }}" alt=""><span>UJUNG B <small>Tarik ke port REMOTE</small></span></button></div></div></div><div class="tester-instructions"><span>UJI KONTINUITAS</span><h2>Hubungkan kedua ujung kabel</h2><p>Seret konektor Ujung A ke port MAIN dan Ujung B ke port REMOTE. Kalau memakai layar sentuh, ketuk konektor lalu ketuk port tujuannya.</p><button class="lab-button lab-button--primary" type="button" data-tester-power disabled>▶&nbsp; Tes kabel</button></div></div>
                                    <div class="tester-leds"><div><b>MAIN</b><span data-tester-leds="main"></span></div><div><b>REMOTE</b><span data-tester-leds="remote"></span></div></div>
                                    <p class="lab-callout" data-tester-result>Hasil benar: indikator 1 sampai 8 menyala dalam urutan yang sama pada MAIN dan REMOTE.</p>
                                </section>

                                <section class="lab-stage" data-stage="topology" hidden>
                                    <p class="lab-callout">Seret ujung kabel ke lubang port hAP. Kamu juga bisa memilih kabel, lalu mengetuk port. Klik port yang sudah terisi untuk mencabut kabel.</p>
                                    <div class="topology-workbench">
                                        <div class="topology-hap"><img src="{{ asset('images/asset/alat/mkrotikhapport.png') }}" alt="Tampak depan MikroTik hAP dengan port Ethernet 1 sampai 4">
                                            @foreach ([1, 2, 3] as $port)
                                                <button type="button" class="topology-socket topology-socket--{{ $port }}" data-topology-socket="{{ $port }}" aria-label="Pasang kabel di ether{{ $port }}"><span>ether{{ $port }}</span><b data-port-label="{{ $port }}">Kosong</b></button><input type="hidden" data-port="{{ $port }}" value="">
                                            @endforeach
                                        </div>
                                        <div class="topology-cables" aria-label="Kabel untuk dihubungkan ke router">
                                            @foreach (['internet' => 'Internet / ISP', 'switch' => 'Port 1 hEX', 'pc' => 'PC konfigurasi'] as $cable => $label)
                                                <button type="button" draggable="true" data-topology-cable="{{ $cable }}" aria-pressed="false"><img src="{{ asset('images/asset/alat/rj45-single-hd.webp') }}" alt="Konektor RJ45"><span>{{ $label }}</span><small data-cable-status>Seret ke port hAP</small></button>
                                            @endforeach
                                        </div>
                                    </div>
                                    <button class="lab-button lab-button--primary" type="button" data-check-topology>Periksa sambungan</button>
                                </section>

                                <section class="lab-stage" data-stage="pc" hidden>
                                    <div class="pc-scene"><div class="pc-monitor"><div class="pc-screen" data-pc-screen><div class="pc-screen__off">LAYAR MATI</div><div class="pc-screen__boot" hidden><span class="pc-spinner"></span><b>Menyiapkan PC lab...</b></div><div class="pc-screen__desktop" hidden><div class="desktop-bar">Lab TKJ <span>● WiFi&nbsp; ▰ 09:15</span></div><button type="button" data-open-winbox><img src="{{ asset('images/logo/winbox.png') }}" alt=""> WinBox</button></div></div><span class="pc-monitor__stand"></span></div><button class="pc-power" type="button" data-power-pc>⏻ <span>Nyalakan PC</span></button></div>
                                    <p class="lab-callout">Setelah desktop muncul, buka aplikasi WinBox untuk menemukan router melalui Neighbors.</p>
                                </section>

                                <section class="lab-stage" data-stage="winbox" hidden>
                                    <div class="simulation-monitor"><span class="simulation-monitor__camera"></span><div class="simulation-monitor__screen"><div class="winbox-window"><header><b>WinBox (64bit) v3.41 (Addresses)</b><span>─ □ ×</span></header><div class="winbox-login"><div class="winbox-neighbors"><div class="winbox-login__logo"><img src="{{ asset('images/logo/winbox.png') }}" alt="Logo WinBox"><strong>WinBox</strong><span>MikroTik RouterOS Configuration Tool</span></div><div class="winbox-neighbors__list"><div class="winbox-tabs"><strong>Neighbors</strong><span>Managed</span></div><div class="winbox-toolbar"><button type="button" data-refresh-neighbors>⟳ Refresh</button><small data-neighbor-status>Tekan Refresh untuk mencari router hAP di jaringan lokal.</small></div><div class="winbox-table"><div class="winbox-table__head"><span>MAC Address</span><span>IP Address</span><span>Identity</span><span>Version</span><span>Board</span></div><button type="button" data-neighbor-row hidden><span>48:A9:8A:1C:01:01</span><span>192.168.88.1</span><span>MikroTik</span><span>7.14.2</span><span>hAP lite</span></button></div></div></div><div class="winbox-connect" data-connect-dialog hidden><header>Connect To Router <button class="winbox-connect-close" type="button" data-close-connect aria-label="Tutup dialog koneksi">×</button></header><div class="winbox-credentials"><label>MAC Address<input data-connect-to readonly placeholder="Pilih MAC Address"></label><label>User<input data-winbox-login value="admin" autocomplete="off"></label><label>Password<input data-winbox-password type="password" value="" autocomplete="off" placeholder="Kosong"></label><button class="winbox-control" type="button" data-connect-winbox>Connect</button></div></div></div></div></div><span class="simulation-monitor__stand"></span></div>
                                    <p class="lab-callout">Kredensial admin dengan password kosong hanya untuk perangkat latihan sesuai modul. Pada perangkat nyata, gunakan kredensial aman yang ditetapkan pengelola.</p>
                                </section>

                                <section class="lab-stage" data-stage="config" hidden>
                                    <div class="simulation-monitor"><span class="simulation-monitor__camera"></span><div class="simulation-monitor__screen"><div class="routeros"><header><span>WinBox 3.41 — admin@<b data-router-identity>MikroTik</b> (48:A9:8A:1C:01:01)</span><span>─ □ ×</span></header><div class="routeros__toolbar"><span>Session</span><span>Settings</span><span>Dashboard</span><span>Safe Mode</span><small class="routeros__connected">● Connected via MAC</small></div><div class="routeros__body"><nav aria-label="Menu WinBox"><span>▣ Quick Set</span><span>⌘ CAPsMAN</span><button type="button" data-config-nav="interfaces">▤ Interfaces</button><span>◉ Wireless</span><span>◇ Bridge</span><span>⛓ PPP</span><span>▦ Switch</span><span>▤ IP</span><span>⤴ Routing</span><button type="button" data-config-nav="system">⚙ System</button><button type="button" data-config-nav="identity" class="routeros__subnav">Identity</button><span>◷ Queues</span><span>▣ Files</span><span>≡ Log</span><span>⚒ Tools</span><span>› New Terminal</span></nav><div class="routeros__content">
                                        <div data-config-panel="home" class="winbox-desktop"><div class="winbox-desktop__mark">MikroTik<br><small>RouterOS</small></div><p>Pilih <b>System → Identity</b> pada menu kiri. Setelah nama router tersimpan, buka <b>Interfaces</b> dan ubah nama tiga port.</p></div>
                                        <div data-config-panel="system" class="winbox-desktop" hidden><div class="winbox-desktop__mark">System</div><p>Klik <b>Identity</b> pada submenu System untuk mengubah nama perangkat.</p></div>
                                        <div data-config-panel="identity" class="winbox-child winbox-child--dialog" hidden><header>Identity <span>─ □ ×</span></header><div class="winbox-child__body"><label>Name: <input data-identity-input autocomplete="off" placeholder="Router"></label><div class="winbox-child__actions"><button type="button" data-save-identity>OK</button><button type="button" data-save-identity>Apply</button></div></div><footer>System / Identity</footer></div>
                                        <div data-config-panel="interfaces" class="winbox-child winbox-child--list" hidden><header>Interface List <span>─ □ ×</span></header><div class="winbox-child__tabs"><strong>Interface</strong><span>Interface List</span><span>Ethernet</span><span>EoIP Tunnel</span><span>IP Tunnel</span><span>GRE Tunnel</span><span>VLAN</span><span>VRRP</span><span>Bonding</span></div><div class="winbox-child__tools"><span>＋</span><span>－</span><span>✓</span><span>×</span><span>▱</span><span>▼</span><small>Detect Internet</small></div><div class="interface-list"><div class="interface-list__head"><span>#</span><span>Name</span><span>Type</span><span>Actual MTU</span><span>L2 MTU</span><span>Tx</span><span>Rx</span></div><button type="button" data-edit-interface="ether1"><span>0</span><strong data-interface-name="ether1">ether1</strong><span>Ethernet</span><span>1500</span><span>1598</span><span>0 bps</span><span>0 bps</span></button><button type="button" data-edit-interface="ether2"><span>1</span><strong data-interface-name="ether2">ether2</strong><span>Ethernet</span><span>1500</span><span>1598</span><span>0 bps</span><span>0 bps</span></button><button type="button" data-edit-interface="ether3"><span>2</span><strong data-interface-name="ether3">ether3</strong><span>Ethernet</span><span>1500</span><span>1598</span><span>0 bps</span><span>0 bps</span></button><div class="interface-list__static"><span>3</span><span>ether4</span><span>Ethernet</span><span>1500</span><span>1598</span><span>0 bps</span><span>0 bps</span></div><div class="interface-list__static"><span>4</span><span>wlan1</span><span>Wireless</span><span>1500</span><span>1600</span><span>0 bps</span><span>0 bps</span></div></div><footer>5 items</footer></div>
                                        <div data-config-panel="edit" class="winbox-child winbox-child--dialog" hidden><header><span data-edit-title>Interface &lt;ether1&gt;</span><span>─ □ ×</span></header><div class="winbox-child__tabs"><strong>General</strong><span>Loop Protect</span><span>Status</span><span>Traffic</span></div><div class="winbox-child__body"><label>Name: <input data-interface-input autocomplete="off"></label><label>Type: <input value="Ethernet" readonly></label><label>MTU: <input value="1500" readonly></label><div class="winbox-child__actions"><button type="button" data-save-interface>OK</button><button type="button" data-save-interface>Apply</button></div></div></div>
                                    <div class="winbox-taskbar" data-window-taskbar aria-label="Jendela diminimalkan"></div></div></div><footer class="routeros__status">48:A9:8A:1C:01:01 · RouterOS 7.14.2 <span>CPU 2% &nbsp; Memory 32 MiB</span></footer></div></div><span class="simulation-monitor__stand"></span></div>
                                    <div class="config-checks"><span data-config-check="identity">○ Identity: Router</span><span data-config-check="ether1">○ ether1-internet</span><span data-config-check="ether2">○ ether2-vlan</span><span data-config-check="ether3">○ ether3-local</span></div>
                                </section>

                                <section class="lab-stage" data-stage="quiz" hidden>
                                    <div class="quiz-intro"><span>CEK PEMAHAMAN</span><h2>Buktikan router siap dikonfigurasi</h2><p>Jawab lima soal dari rekap Chapter 1. Semua harus tepat agar progres chapter tersimpan.</p></div>
                                    <form data-quiz-form>
                                        @foreach ($questions as $question)
                                            <fieldset class="quiz-question"><legend><b>{{ $loop->iteration }}.</b> {{ $question['question'] }}</legend><div>@foreach ($question['options'] as $option)<label><input type="radio" name="answer-{{ $loop->parent->iteration }}" value="{{ $loop->index }}" required><span>{{ $option }}</span></label>@endforeach</div></fieldset>
                                        @endforeach
                                        <button class="lab-button lab-button--primary" type="submit" data-submit-quiz>Simpan hasil Chapter 1</button>
                                    </form>
                                </section>

                                <section class="lab-stage" data-stage="finish" hidden>
                                    <div class="finish-card"><span class="finish-card__star">★</span><span>CHAPTER 01 SELESAI</span><h2>Router siap untuk misi berikutnya!</h2><p>Kabel straight lolos LAN tester, topologi awal tersambung, WinBox terhubung, dan identity serta interface sudah diberi nama sesuai fungsi.</p><div><a class="lab-button lab-button--primary" href="{{ route('adventure') }}#chapter-02" data-page-link="adventure">Lihat Chapter 2 →</a><a class="lab-button lab-button--secondary" href="{{ route('homepage') }}" data-page-link="homepage">Kembali ke Beranda</a></div></div>
                                </section>
                            </div>
                            <footer class="lab-board__footer"><p data-feedback role="status" aria-live="polite">Ikuti arahan Pak Amat untuk memulai.</p><button class="lab-button lab-button--primary" type="button" data-continue hidden>Lanjut →</button></footer>
                        </section>

                        <aside class="lab-guide" aria-label="Petunjuk misi"><div class="lab-guide__header"><span>▤</span><div><small>PETUNJUK MISI</small><h2>Langkah-Langkah</h2></div></div><ol data-guide-list><li>Dengarkan tugas sekolah.</li><li>Kenali alat di lab.</li><li>Siapkan router untuk konfigurasi.</li></ol><div class="lab-guide__note"><b>Materi modul</b><p data-module-section>Chapter 1 · §1.1–1.2</p></div><img src="{{ asset($studentPath.'tugas.png') }}" alt="" aria-hidden="true" decoding="async"></aside>

                        <section class="simulator-bottom" data-simulator-bottom hidden aria-label="Misi dan parameter simulasi">
                            <div class="simulator-bottom__mission"><span>▤</span><div><small>MISI</small><p data-simulator-mission>Siapkan PC lab dan buka WinBox.</p></div></div>
                            <div class="simulator-bottom__parameters"><span>⚙</span><div><small>PARAMETER / INFORMASI</small><dl><div><dt>Perangkat</dt><dd data-simulator-device>PC lab</dd></div><div><dt>Koneksi</dt><dd data-simulator-link>Router hAP lewat MAC Address</dd></div><div><dt>Target</dt><dd data-simulator-target>Buka WinBox</dd></div></dl></div></div>
                            <div class="simulator-bottom__action"><span data-simulator-action-icon>▶</span><b data-simulator-action>Jalankan langkah pada layar</b><small data-simulator-status>Progress misi tersimpan otomatis.</small><button class="lab-button lab-button--primary" type="button" data-simulator-next hidden>Lanjut →</button></div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
        @include('game-music-player')
    </body>
</html>
