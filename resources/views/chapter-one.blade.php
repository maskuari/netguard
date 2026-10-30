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
        <link rel="stylesheet" href="{{ asset('css/chapter-evaluation.css') }}?v={{ filemtime(public_path('css/chapter-evaluation.css')) }}">
        <script src="{{ asset('js/chapter-evaluation.js') }}?v={{ filemtime(public_path('js/chapter-evaluation.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/chapter-navbar.css') }}?v={{ filemtime(public_path('css/chapter-navbar.css')) }}">
        <script src="{{ asset('js/chapter-navbar.js') }}?v={{ filemtime(public_path('js/chapter-navbar.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/chapter-step-guide.css') }}?v={{ filemtime(public_path('css/chapter-step-guide.css')) }}">
        <script src="{{ asset('js/chapter-step-guide.js') }}?v={{ filemtime(public_path('js/chapter-step-guide.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/lab-pc-desktop.css') }}?v={{ filemtime(public_path('css/lab-pc-desktop.css')) }}">
        <script src="{{ asset('js/lab-pc-desktop.js') }}?v={{ filemtime(public_path('js/lab-pc-desktop.js')) }}" defer></script>
        <script src="{{ asset('js/chapter-one.js') }}?v={{ filemtime(public_path('js/chapter-one.js')) }}" defer></script>
    </head>
    <body>
        <div class="academy-scene chapter-one-scene is-prologue" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.one.complete') }}" data-teacher-base="{{ asset('images/asset/char/guru/bapak Amat') }}" data-student-base="{{ asset(rtrim($studentPath, '/')) }}" data-student-name="{{ $student->name }}">
            <div class="chapter-prologue" data-prologue>
                @include('chapter-step-back')
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
                        <div class="chapter-dialogue__content"><span id="dialogue-speaker" data-dialogue-speaker>PAK AMAT · GURU TKJ</span><p data-dialogue-text></p><div class="chapter-dialogue__options" data-dialogue-options role="group" aria-label="Pilihan jawaban" hidden></div><p class="chapter-dialogue__answer-feedback" data-dialogue-answer-feedback role="status" aria-live="polite" hidden></p><button class="chapter-dialogue__quiz-next" type="button" data-dialogue-quiz-next hidden>Lanjut →</button><small data-dialogue-count>1 / 6 · KLIK UNTUK LANJUT</small></div>
                    </div>
                </div>
            </div>
            <div class="lab-scroll">
                @include('chapter-navbar', ['chapterNumber' => 1, 'chapterSubtitle' => 'Perangkat & Konfigurasi Awal Router'])

                <main class="lab-main" id="main-content">
                    <div class="lab-layout">
                        <aside class="lab-character lab-character--teacher" aria-label="Arahan guru">
                            <div class="lab-character__portrait"><img data-teacher-image src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru pembimbing" decoding="async"></div>
                            <div class="lab-character__speech"><span>PAK AMAT · GURU TKJ</span><p data-teacher-text>Sekolah kita membutuhkan jaringan yang rapi. Hari ini kamu jadi Junior Network Engineer!</p></div>
                        </aside>



                        <section class="lab-board" aria-labelledby="lab-stage-title">
                            <header class="lab-board__header"><span class="lab-board__eyebrow" data-stage-label>MISI 01 / 05</span><h1 id="lab-stage-title" data-stage-title>Jaringan sekolah menunggu bantuanmu</h1><p data-stage-subtitle>Ikuti cerita dan siapkan perlengkapan sebelum konfigurasi.</p></header>
                            <div class="lab-board__body">
                                @include('lab-pc-desktop')
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
                                    <p class="lab-callout">Ketuk setiap kartu alat. Nama, bentuk, dan kegunaannya akan tampil di panel detail sebelah kanan.</p>
                                    <div class="device-grid">
                                        <button class="device-card" type="button" data-device="hap"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>MikroTik hAP</b><small>Router utama</small></button>
                                        <button class="device-card" type="button" data-device="hex"><img src="{{ asset('images/asset/alat/mikrotikhex.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>MikroTik hEX</b><small>Sisi switch</small></button>
                                        <button class="device-card" type="button" data-device="pc"><img src="{{ asset('images/asset/alat/lab-pc-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>PC konfigurasi</b><small>Menjalankan WinBox</small></button>
                                        <button class="device-card" type="button" data-device="cable"><img src="{{ asset('images/asset/alat/lab-cable-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Kabel UTP</b><small>8 inti berpilin</small></button>
                                        <button class="device-card" type="button" data-device="rj45"><img src="{{ asset('images/asset/alat/lab-rj45-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Konektor RJ45</b><small>8 posisi</small></button>
                                        <button class="device-card" type="button" data-device="crimper"><img src="{{ asset('images/asset/alat/lab-crimper-green-dialog.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>Tang crimping</b><small>Menjepit pin</small></button>
                                        <button class="device-card" type="button" data-device="tester"><img src="{{ asset('images/asset/alat/lab-tester-real.png') }}" alt="" loading="lazy" fetchpriority="low" decoding="async"><b>LAN tester</b><small>Uji pin 1–8</small></button>
                                    </div>
                                </section>

                                <section class="lab-stage topology-lesson" data-stage="topologyLesson" hidden>
                                    <div class="topology-lesson__content">
                                        <div class="topology-lesson__diagram" role="img" aria-label="Internet ke ether1 hAP; ether2 hAP ke ether1 hEX sebagai trunk; ether3 hAP langsung ke PC konfigurasi">
                                            <div class="topology-lesson__internet"><b>Internet</b><small>ISP</small></div>
                                            <div class="topology-lesson__line"><span>ether1</span></div>
                                            <div class="topology-lesson__router"><img src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="MikroTik hAP"><b>hAP · Router utama</b></div>
                                            <div class="topology-lesson__split" aria-hidden="true"><span><b>ether2</b><i></i></span><span><b>ether3</b><i></i></span></div>
                                            <div class="topology-lesson__endpoints"><div><img src="{{ asset('images/asset/alat/mikrotikhex.png') }}" alt="MikroTik hEX"><b>hEX · Port 1 / ether1</b><small>Uplink trunk ke router</small></div><div><img src="{{ asset('images/asset/alat/lab-pc-real.png') }}" alt="PC konfigurasi"><b>PC konfigurasi</b><small>Koneksi langsung ke ether3 hAP</small></div></div>
                                        </div>
                                        <div class="topology-lesson__routes"><h3>Pahami tiga jalur jaringan</h3><p><b>Topologi</b> adalah susunan hubungan antarperangkat. Pada latihan ini, hAP menjadi router utama yang menghubungkan sumber internet, hEX, dan PC konfigurasi.</p><ol><li><b>ether1</b><span>Internet / ISP<small>Jalur WAN: koneksi dari penyedia internet masuk ke router melalui port ini.</small></span></li><li><b>ether2</b><span>Port 1 / ether1 hEX<small>Jalur router ke switch. Kabel dari ether2 hAP dipasang ke port 1 hEX.</small></span></li><li><b>ether3</b><span>PC konfigurasi<small>Jalur lokal untuk membuka WinBox dan mengatur router dari PC, bukan sambungan ke ISP.</small></span></li></ol><p class="topology-lesson__module-note"><b>Apa itu trunk?</b> Satu sambungan yang dapat membawa beberapa VLAN. Jalur hAP–hEX ini nantinya membawa jaringan siswa dan guru. Dalam latihan ini hEX berfungsi sebagai switch.</p><p class="topology-lesson__source">Sesuai modul §1.2 dan §1.9 · Ketiga jalur memakai kabel yang terpisah.</p></div>
                                    </div>
                                </section>

                                <section class="lab-stage straight-lesson" data-stage="lesson" hidden>
                                    <div class="straight-lesson__learning">
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
                                        <p class="straight-lesson__note"><b>Ingat:</b> urutan warna pin 1–8 harus sama pada Ujung A dan Ujung B.</p>
                                    </div>
                                    <div class="straight-lesson__ends" aria-label="Kedua ujung kabel straight memakai susunan T568B yang sama">
                                        @foreach (['A', 'B'] as $cableEnd)
                                            <div class="straight-lesson__end">
                                                <b>UJUNG {{ $cableEnd }} · T568B</b>
                                                <ol>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-white-orange.svg') }}" alt="" loading="lazy"><span>Putih-Oranye</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-orange.svg') }}" alt="" loading="lazy"><span>Oranye</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-white-green.svg') }}" alt="" loading="lazy"><span>Putih-Hijau</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-blue.svg') }}" alt="" loading="lazy"><span>Biru</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-white-blue.svg') }}" alt="" loading="lazy"><span>Putih-Biru</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-green.svg') }}" alt="" loading="lazy"><span>Hijau</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-white-brown.svg') }}" alt="" loading="lazy"><span>Putih-Cokelat</span></li>
                                                    <li><img src="{{ asset('images/asset/alat/t568b-brown.svg') }}" alt="" loading="lazy"><span>Cokelat</span></li>
                                                </ol>
                                            </div>
                                        @endforeach
                                        <span class="straight-lesson__same">URUTAN SAMA</span>
                                    </div>
                                </section>

                                <section class="lab-stage" data-stage="prep" hidden>
                                    <div class="task-heading"><div><span>SEBELUM MENYUSUN WARNA</span><h2>Siapkan kabel UTP</h2><p>Potong kabel, kupas jaket secukupnya, lalu luruskan inti sebelum masuk ke puzzle T568B.</p></div></div>
                                    <div class="prep-workbench" data-prep-workbench data-phase="coil" aria-live="polite">
                                        <div class="prep-workbench__cable-wrap">
                                            <img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--coil" src="{{ asset('images/asset/alat/utp-straight-coiled-hd.png') }}" alt="Kabel UTP biru yang masih tergulung dan belum dikupas">
                                            <img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--cut" src="{{ asset('images/asset/alat/utp-straight-cut-hd.png') }}" alt="Kabel UTP lurus yang sudah dipotong sesuai panjang">
                                            <img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--stripped" src="{{ asset('images/asset/alat/utp-prep-stripped-neat.png') }}" alt="Jaket kabel telah dikupas dan empat pasang inti masih terpilin rapi">
                                            <img loading="lazy" decoding="async" class="prep-workbench__cable prep-workbench__cable--straight" src="{{ asset('images/asset/alat/utp-prep-straight-unsorted.png') }}" alt="Delapan inti kabel sudah lurus tetapi belum diurutkan menurut T568B">
                                            <span class="prep-workbench__cut-mark" aria-hidden="true"></span>
                                            <img loading="lazy" decoding="async" class="prep-workbench__tool prep-workbench__tool--scissors" src="{{ asset('images/asset/alat/lab-scissors-real.png') }}" alt="">
                                            <img loading="lazy" decoding="async" class="prep-workbench__tool prep-workbench__tool--stripper" src="{{ asset('images/asset/alat/lab-crimper-green.png') }}" alt="">
                                        </div>
                                        <div class="prep-workbench__caption"><b data-prep-visual-title>Kabel masih tergulung</b><span data-prep-visual-note>Potong kabel sesuai panjang yang dibutuhkan.</span></div>
                                    </div>
                                    <div class="prep-tools">
                                        <button type="button" data-prep-action="cut"><img src="{{ asset('images/asset/alat/lab-scissors-real.png') }}" alt=""><span>Potong sesuai panjang</span></button>
                                        <button type="button" data-prep-action="strip"><img src="{{ asset('images/asset/alat/lab-crimper-green.png') }}" alt=""><span>Kupas dengan bilah tang crimping</span></button>
                                        <button type="button" data-prep-action="straighten"><img src="{{ asset('images/asset/alat/utp-prep-straight-unsorted.png') }}" alt=""><span>Urai & luruskan inti</span></button>
                                    </div>
                                    <p class="lab-callout">Hati-hati: jaket luar dikupas secukupnya tanpa melukai inti kabel.</p>
                                </section>

                                <section class="lab-stage" data-stage="wiring" data-wire-assets="{{ asset('images/asset/alat') }}" hidden>
                                    <div class="wiring-heading"><div><span>STANDAR T568B · KABEL STRAIGHT</span><h2>Pasang inti kabel — <strong data-wire-end>Ujung A</strong></h2><p>Ikuti urutan pin 1–8. Ketuk warna sekali atau seret ke pin pada konektor.</p></div><span class="wiring-heading__badge" data-wire-count>0 / 8</span></div>
                                    <div class="wiring-station">
                                        <div class="wiring-station__art">
                                            <img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/rj45-wiring-board-cartoon.png') }}" alt="Ilustrasi konektor RJ45 kosong dengan delapan ruang pin di atas meja kerja">
                                            <div class="wire-slots" data-wire-slots aria-label="Delapan ruang pin konektor RJ45"></div>
                                            <span class="wiring-station__art-label">RJ45 · 8 PIN</span>
                                        </div>
                                        <div class="wiring-station__controls">
                                            <div class="wiring-recall"><span>UJI INGATAN</span><b>Masih ingat urutan T568B?</b><p>Susun delapan inti sendiri. Kamu bisa mengganti warna sebelum menekan Periksa.</p></div>
                                            <div class="wiring-station__bank-heading"><b>Pilih inti kabel</b><span data-wire-next>Ketuk warna untuk pin 1.</span></div>
                                            <div class="wire-bank" data-wire-bank aria-label="Pilihan warna inti kabel"></div>
                                            <div class="wiring-station__actions">
                                                <button class="lab-button lab-button--secondary" type="button" data-undo-wire disabled>↶ Batalkan terakhir</button>
                                                <button class="lab-button lab-button--primary" type="button" data-check-wire>Periksa urutan →</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section class="lab-stage" data-stage="terminate" hidden>
                                    <div class="terminate-visual" data-terminate-visual>
                                        <div class="terminate-frames" data-terminate-frames data-phase="trim" data-frame="0" data-frames-trim="{{ asset('images/asset/alat/rj45-trim-3d-frames-v4.png') }}" data-frames-insert="{{ asset('images/asset/alat/rj45-insert-3d-frames-v2.png') }}" data-frames-crimp="{{ asset('images/asset/alat/rj45-crimp-3d-frames-v5.png') }}" role="img" aria-label="Animasi 3D: potong rata delapan inti dengan bilah dalam tang hijau" style="background-image: url('{{ asset('images/asset/alat/rj45-trim-3d-frames-v4.png') }}')"></div>
                                        <span class="terminate-frame-caption" data-frame-caption role="status" aria-live="polite">Siap merapikan ujung kabel</span>
                                    </div>
                                    <div class="terminate-copy"><span data-terminate-end>UJUNG A</span><h2 data-terminate-title>Rapikan dan potong rata</h2><p data-terminate-description>Potong ujung delapan inti agar panjangnya rata sebelum masuk ke konektor RJ45.</p></div>
                                    <div class="terminate-progress"><span data-terminate-dot="0"></span><span data-terminate-dot="1"></span><span data-terminate-dot="2"></span></div>
                                    <button class="lab-button lab-button--primary" type="button" data-terminate-action>Potong rata delapan inti</button>
                                </section>

                                <section class="lab-stage" data-stage="tester" hidden>
                                    <div class="tester-layout"><div class="tester-bench"><div class="tester-bench__devices"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/lab-tester-real.png') }}" alt="LAN tester MAIN dan REMOTE yang dikenalkan pada awal misi, dengan port RJ45 di bagian atas"><span class="tester-bench__device-label tester-bench__device-label--main">MAIN</span><span class="tester-bench__device-label tester-bench__device-label--remote">REMOTE</span><div class="tester-hardware-leds tester-hardware-leds--main" data-tester-hardware="main" aria-label="Indikator 1 sampai 8 MAIN"></div><div class="tester-hardware-leds tester-hardware-leds--remote" data-tester-hardware="remote" aria-label="Indikator 1 sampai 8 REMOTE"></div><button type="button" class="tester-port tester-port--main" data-tester-port="main" aria-label="Port MAIN, lepas untuk menaruh Ujung A"><span data-tester-port-state="main">LETAKKAN UJUNG A</span></button><button type="button" class="tester-port tester-port--remote" data-tester-port="remote" aria-label="Port REMOTE, lepas untuk menaruh Ujung B"><span data-tester-port-state="remote">LETAKKAN UJUNG B</span></button><svg class="tester-cable-paths" viewBox="0 0 1000 750" preserveAspectRatio="none" aria-hidden="true"><path data-tester-path="main" d="M 300 700 C 290 480, 310 240, 310 40"/><path data-tester-path="remote" d="M 725 700 C 735 480, 730 240, 730 40"/></svg><span class="tester-inserted tester-inserted--main" data-tester-inserted="main" aria-hidden="true">A</span><span class="tester-inserted tester-inserted--remote" data-tester-inserted="remote" aria-hidden="true">B</span><div class="tester-cable-ends" aria-label="Tarik konektor kabel ke port tester"><button type="button" class="tester-cable-end" data-tester-end="main" draggable="true" aria-label="Tarik Ujung A kabel ke port MAIN"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/rj45-single-hd.png') }}" alt=""><span>UJUNG A <small>Tarik ke MAIN</small></span></button><button type="button" class="tester-cable-end" data-tester-end="remote" draggable="true" aria-label="Tarik Ujung B kabel ke port REMOTE"><img loading="lazy" decoding="async" src="{{ asset('images/asset/alat/rj45-single-hd.png') }}" alt=""><span>UJUNG B <small>Tarik ke port REMOTE</small></span></button></div></div></div><div class="tester-instructions"><span>UJI KONTINUITAS</span><h2>Hubungkan kedua ujung kabel</h2><p>Seret konektor Ujung A ke port MAIN dan Ujung B ke port REMOTE. Kalau memakai layar sentuh, ketuk konektor lalu ketuk port tujuannya.</p><button class="lab-button lab-button--primary" type="button" data-tester-power disabled>▶&nbsp; Tes kabel</button></div></div>
                                    <div class="tester-leds"><div><b>MAIN</b><span data-tester-leds="main"></span></div><div><b>REMOTE</b><span data-tester-leds="remote"></span></div></div>
                                    <p class="lab-callout" data-tester-result>Hasil benar: indikator 1 sampai 8 menyala dalam urutan yang sama pada MAIN dan REMOTE.</p>
                                </section>

                                <section class="lab-stage" data-stage="topology" hidden>
                                    <p class="lab-callout">Seret ujung kabel ke lubang port hAP. Kamu juga bisa memilih kabel, lalu mengetuk port. Klik port yang sudah terisi untuk mencabut kabel.</p>
                                    <div class="topology-workbench">
                                        <div class="topology-hap"><img src="{{ asset('images/asset/alat/mkrotikhapport.png') }}" alt="Tampak depan MikroTik hAP dengan port Ethernet 1 sampai 4">
                                            @foreach ([1, 2, 3] as $port)
                                                <button type="button" class="topology-socket topology-socket--{{ $port }}" data-topology-socket="{{ $port }}" aria-label="Pasang kabel di ether{{ $port }}"><i class="topology-socket__connector" aria-hidden="true"></i><span>ether{{ $port }}</span><b data-port-label="{{ $port }}">Kosong</b></button><input type="hidden" data-port="{{ $port }}" value="">
                                            @endforeach
                                        </div>
                                        <div class="topology-actions">
                                            <div class="topology-cables" aria-label="Kabel untuk dihubungkan ke router">
                                                @foreach (['internet' => 'Internet / ISP', 'switch' => 'Port 1 hEX', 'pc' => 'PC konfigurasi'] as $cable => $label)
                                                    <button type="button" draggable="true" data-topology-cable="{{ $cable }}" aria-pressed="false"><img src="{{ asset('images/asset/alat/rj45-single-hd.webp') }}" alt="Konektor RJ45"><span>{{ $label }}</span><small data-cable-status>Seret ke port hAP</small></button>
                                                @endforeach
                                            </div>
                                            <button class="lab-button lab-button--primary" type="button" data-check-topology>Periksa sambungan</button>
                                        </div>
                                    </div>
                                </section>

                                <section class="lab-stage" data-stage="pc" hidden>
                                    <div class="pc-scene"><div class="pc-monitor"><div class="pc-screen" data-pc-screen><div class="pc-screen__off">LAYAR MATI</div><div class="pc-screen__boot" hidden><span class="pc-spinner"></span><b>Menyiapkan PC lab...</b></div><div class="pc-screen__desktop" hidden><div class="desktop-bar">Lab TKJ <span>● WiFi&nbsp; ▰ 09:15</span></div><div class="pc-desktop-apps"><button type="button" data-open-winbox><img src="{{ asset('images/logo/winbox.png') }}" alt=""> WinBox</button><button type="button" data-open-client-cmd="local"><span class="pc-cmd-icon" aria-hidden="true">C:\_</span>Command Prompt</button></div></div></div><span class="pc-monitor__stand"></span></div><button class="pc-power" type="button" data-power-pc>⏻ <span>Nyalakan PC</span></button></div>
                                </section>

                                <section class="lab-stage" data-stage="winbox" hidden>
                                    <div class="simulation-monitor simulation-monitor--classic"><div class="simulation-monitor__screen"><div class="winbox-window wb-loader">
                                        <header><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" alt="WinBox">WinBox (64bit) v3.41</span><span>─ □ ×</span></header>
                                        <div class="routeros__menubar"><span>File</span><span>Tools</span></div>
                                        <div class="winbox-login">
                                            <div class="winbox-connect wb-loader__connection" data-connect-dialog><header hidden>Connect To Router <button type="button" data-close-connect aria-label="Tutup dialog koneksi" hidden>×</button></header><div class="winbox-credentials"><label>Connect To: <input data-connect-to aria-label="Connect To"></label><label>Login: <input data-winbox-login value="admin" autocomplete="off"></label><label>Password: <input data-winbox-password type="password" value="" autocomplete="off"></label><div class="wb-loader__options"><label><input type="checkbox" data-loader-keep-password> Keep Password</label><label><input type="checkbox" data-loader-new-window> Open In New Window</label></div><div class="wb-loader__buttons"><button class="winbox-control" type="button" data-loader-add>Add/Set</button><button class="winbox-control" type="button" disabled title="RoMON tidak digunakan pada jaringan latihan ini">Connect To RoMON</button><button class="winbox-control" type="button" data-connect-winbox>Connect</button></div></div></div>
                                            <div class="winbox-neighbors"><div class="winbox-neighbors__list"><div class="winbox-tabs" role="tablist" aria-label="Router list"><button type="button" role="tab" data-loader-tab="managed" aria-selected="false">Managed</button><button type="button" role="tab" data-loader-tab="neighbors" aria-selected="true">Neighbors</button></div><div class="winbox-toolbar"><button type="button" data-refresh-neighbors>Refresh</button><button type="button" data-loader-remove hidden>Remove</button><label class="wb-loader__find">Find <input data-loader-find aria-label="Find router" type="search"></label></div><div class="winbox-table"><div class="winbox-table__head"><span>MAC Address</span><span>IP Address</span><span>Identity</span><span>Version</span><span>Board</span><span>Uptime</span></div><button type="button" data-neighbor-row hidden><span>48:A9:8A:1C:01:01</span><span>192.168.88.1</span><span>MikroTik</span><span>7.14.3</span><span>hAP lite</span><span>00:04:32</span></button><button type="button" data-managed-row hidden><span data-managed-address></span><span>admin</span><span>MikroTik</span><span>7.14.3</span><span>hAP lite</span><span></span></button></div></div></div>
                                        </div>
                                        <footer class="wb-loader__status" data-neighbor-status role="status" aria-live="polite">0 items</footer>
                                    </div></div></div>
                                </section>

                                <section class="lab-stage" data-stage="config" hidden>
                                    <div class="simulation-monitor simulation-monitor--classic"><div class="simulation-monitor__screen"><div class="routeros">
                                        <header><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" alt="WinBox">admin@48:A9:8A:1C:01:01 (<b data-router-identity>MikroTik</b>) - WinBox (64bit) v7.14.3 on hAP lite (smips)</span><span>─ □ ×</span></header>
                                        <div class="routeros__menubar"><span>Session</span><span>Settings</span><span>Dashboard</span></div>
                                        <div class="routeros__toolbar"><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#undo"></use></svg></span><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#redo"></use></svg></span><span class="wb-safe-mode">Safe Mode</span><span class="wb-session">Session: <span>48:A9:8A:1C:01:01</span></span><small class="routeros__connected"><i></i></small></div>
                                        <div class="routeros__body">
                                            <nav aria-label="Menu WinBox"><button type="button" data-config-nav="interfaces" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#interfaces"></use></svg><span>Interfaces</span></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#wireless"></use></svg><span>Wireless</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#bridge"></use></svg><span>Bridge</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ppp"></use></svg><span>PPP</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#switch"></use></svg><span>Switch</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#mesh"></use></svg><span>Mesh</span></span>
<button type="button" data-config-nav="ip" aria-expanded="false" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ip"></use></svg><span>IP</span><i class="wb-menu-arrow" aria-hidden="true">›</i></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ipv6"></use></svg><span>IPv6</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#mpls"></use></svg><span>MPLS</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#routing"></use></svg><span>Routing</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
<button type="button" data-config-nav="system" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#system"></use></svg><span>System</span><i class="wb-menu-arrow" aria-hidden="true">›</i></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#queues"></use></svg><span>Queues</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#files"></use></svg><span>Files</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#log"></use></svg><span>Log</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#radius"></use></svg><span>RADIUS</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#tools"></use></svg><span>Tools</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#terminal"></use></svg><span>New Terminal</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#dot1x"></use></svg><span>Dot1X</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#supout"></use></svg><span>Make Supout.rif</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#winbox"></use></svg><span>New WinBox</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#exit"></use></svg><span>Exit</span></span>
                                                @include('winbox-ip-menu', ['ipChapter' => 1, 'ipWindows' => []])
                                                @include('winbox-system-menu', ['systemChapter' => 1])
                                            </nav>
                                            <div class="routeros__content">
                                                <div data-config-panel="home" class="winbox-desktop" aria-label="Area kerja WinBox"></div>
                                                <div data-config-panel="system" hidden></div>
                                                <div data-config-panel="identity" class="winbox-child winbox-child--dialog" hidden>
                                                    <header>Identity <span>─ □ ×</span></header>
                                                    <div class="winbox-child__body"><div class="winbox-child__fields"><label>Name: <input data-identity-input autocomplete="off" value="MikroTik"></label></div><div class="winbox-child__actions"><button type="button" data-save-identity>OK</button><button type="button" data-save-identity>Apply</button></div></div><footer>System / Identity</footer>
                                                </div>
                                                <div data-config-panel="interfaces" class="winbox-child winbox-child--list" hidden>
                                                    <header>Interface List <span>─ □ ×</span></header>
                                                    <div class="winbox-child__tabs"><strong>Interface</strong><span>Interface List</span><span>Ethernet</span><span>EoIP Tunnel</span><span>IP Tunnel</span><span>GRE Tunnel</span><span>VLAN</span><span>VXLAN</span><span>VRRP</span><span>Bonding</span><span>LTE</span></div>
                                                    <div class="winbox-child__tools"><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#add"></use></svg></span><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#remove"></use></svg></span><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#enable"></use></svg></span><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#disable"></use></svg></span><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#comment"></use></svg></span><span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#filter"></use></svg></span><label class="wb-find"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#find"></use></svg><input type="search" data-interface-find placeholder="Find" aria-label="Cari interface"></label></div>
                                                    @include('winbox-interface-list', ['interfaceChapter' => 1])<footer><span data-interface-count>5 items</span></footer>
                                                </div>
                                                <div data-config-panel="edit" class="winbox-child winbox-child--dialog" hidden>
                                                    <header><span data-edit-title>Interface &lt;ether1&gt;</span><span>─ □ ×</span></header>
                                                    <div class="winbox-child__tabs"><strong>General</strong><span>Ethernet</span><span>Loop Protect</span><span>Status</span><span>Traffic</span></div>
                                                    <div class="winbox-child__body"><div class="winbox-child__fields"><label>Name: <input data-interface-input autocomplete="off"></label><label>Type: <input value="Ethernet" readonly></label><label>MTU: <input value="1500" readonly></label><label>Actual MTU: <input value="1500" readonly></label><label>L2 MTU: <input value="1598" readonly></label><label>MAC Address: <input data-interface-mac value="48:A9:8A:1C:01:01" readonly></label><label>ARP: <input value="enabled" readonly></label></div><div class="winbox-child__actions"><button type="button" data-save-interface>OK</button><button type="button" data-save-interface>Apply</button><button type="button" disabled>Disable</button><button type="button" disabled>Comment</button><button type="button" disabled>Copy</button><button type="button" disabled>Remove</button></div></div><footer>enabled <span>running</span></footer>
                                                </div>
                                                <div class="winbox-taskbar" data-window-taskbar aria-label="Jendela diminimalkan"></div>
                                            </div>
                                        </div>
                                        <footer class="routeros__status"><span>5 interfaces</span><span>CPU: 2% &nbsp; Memory: 32 MiB &nbsp; Uptime: 00:04:32</span></footer>
                                    </div></div></div>
                                    <div class="config-checks"><span data-config-check="identity">○ Identity: Router</span><span data-config-check="ether1">○ ether1-internet</span><span data-config-check="ether2">○ ether2-vlan</span><span data-config-check="ether3">○ ether3-local</span></div>
                                </section>

                                <section class="lab-stage" data-stage="quiz" hidden>
                                    <div class="quiz-intro"><span>EVALUASI CHAPTER 01</span><h2>Cek pemahaman perangkat dan konfigurasi router</h2><p>Jawab lima soal evaluasi untuk menyelesaikan chapter.</p><button class="lab-button lab-button--primary" type="button" data-open-quiz>Buka evaluasi →</button></div>
                                </section>

                                <section class="lab-stage" data-stage="finish" hidden>
                                    <div class="finish-card"><h2>Chapter 01 selesai</h2><p>Router siap untuk misi berikutnya.</p><button class="lab-button lab-button--primary" type="button" data-open-finish>Lihat hasil Chapter 1</button></div>
                                </section>
                            </div>
                        </section>

                        <aside class="lab-guide" aria-label="Petunjuk misi">
                            <div class="lab-guide__steps">
                                <div class="lab-guide__header"><span>▤</span><div><small>PETUNJUK MISI</small><h2>Langkah-Langkah</h2></div></div>
                                <ol data-guide-list tabindex="0" aria-label="Urutan langkah praktik"><li>Dengarkan tugas sekolah.</li><li>Kenali alat di lab.</li><li>Siapkan router untuk konfigurasi.</li></ol>
                                <section class="device-recognition-checklist" data-device-checklist hidden aria-label="Target mengenali tujuh alat">
                                    <div class="device-recognition-checklist__heading"><b>Target pengenalan alat</b><span data-device-task-count role="status" aria-live="polite" aria-atomic="true">0 / 7 selesai</span></div>
                                    <p>Ketuk setiap kartu alat di kiri dan baca penjelasan Pak Amat.</p>
                                    <ul data-device-task-list></ul>
                                    <p class="device-recognition-checklist__complete" data-device-task-complete role="status" hidden>✓ Semua alat sudah dikenali. Lanjut ke topologi jaringan.</p>
                                </section>
                                <div class="lab-guide__note"><b>Materi modul</b><p data-module-section>Bab 1 · Pengantar jaringan sekolah</p></div>
                                <button class="lab-button lab-button--primary lab-guide__lesson-next" type="button" data-lesson-next hidden>Mulai praktik kabel →</button>
                                <p class="lab-guide__feedback" data-feedback role="status" aria-live="polite">Ikuti arahan Pak Amat untuk memulai.</p>
                                <button class="lab-button lab-button--primary lab-guide__continue" type="button" data-continue hidden>Lanjut →</button>
                            </div>
                            <div class="lab-device-panel" data-device-panel hidden>
                                <div class="lab-device-panel__heading"><small>DETAIL PERANGKAT</small><span>Ketuk alat di sebelah kiri</span></div>
                                <div class="device-detail"><div class="device-detail__visual"><img data-device-preview src="{{ asset('images/asset/alat/mikrotikhap.png') }}" alt="Contoh perangkat MikroTik hAP"><canvas data-hap-rotator data-sprite="{{ asset('images/asset/alat/hap16frame.png') }}" width="480" height="300" tabindex="0" role="img" aria-label="MikroTik hAP. Geser ke kiri atau kanan untuk memutar perangkat" hidden></canvas></div><div class="device-detail__copy"><b data-device-name>Pilih salah satu alat</b><p data-device-detail>Ketuk kartu alat di sebelah kiri untuk melihat fungsi dan kegunaannya di sini.</p><small data-device-tip>Pak Amat juga akan menjelaskan alat yang kamu pilih.</small></div></div>
                            </div>

                        </aside>
                    </div>
                </main>
                <p class="lab-watermark">NetGuard Academy · MikroTik Mission · © {{ date('Y') }}</p>
            </div>
        </div>
        <dialog class="ch1-learning-dialog" data-configuration-learning aria-labelledby="configuration-learning-title">
            <button class="ch1-learning-close" type="button" data-close-configuration-learning aria-label="Tutup materi">×</button>
            <div data-configuration-learning-body></div>
            <button class="lab-button lab-button--primary" type="button" data-start-configuration-practice>Mulai praktik di WinBox →</button>
        </dialog>
        <template data-configuration-concept="identity">
            <span class="ch1-learning-kicker">PAK AMAT · MATERI SEBELUM PRAKTIK</span>
            <h2 id="configuration-learning-title">Kita akan mengganti nama router</h2>
            <p>Pada langkah ini, kita akan mengubah <b>Identity</b> router dari <b>MikroTik</b> menjadi <b>Router</b> melalui menu System → Identity. Sebelum mulai, pahami dulu fungsi nama perangkat ini.</p>
            <h3>Apa itu Identity router?</h3>
            <p><b>Identity adalah nama perangkat MikroTik.</b> Nama ini muncul pada daftar Neighbors dan judul sesi WinBox. Saat ada beberapa router, Identity membantu kita mengenali perangkat yang sedang dikonfigurasi.</p>
            <div class="ch1-learning-example"><span>Nama bawaan</span><b>MikroTik</b><span aria-hidden="true">→</span><span>Nama sesuai rancangan</span><b>Router</b></div>
            <h3>Mengapa kita mengubahnya?</h3>
            <p>Tujuannya agar router utama mudah dikenali dan tidak tertukar dengan perangkat lain. Sesuai modul, gunakan nama <b>Router</b>. Mengubah Identity tidak mengganti alamat IP, nomor port, atau membuat koneksi internet aktif.</p>
            <p class="ch1-learning-note"><b>Yang akan kamu lakukan:</b> buka System → Identity, isi Name dengan Router, lalu klik OK. Target selesai jika checklist Nama router sudah hijau.</p>
        </template>
        <template data-configuration-concept="interfaces">
            <span class="ch1-learning-kicker">PAK AMAT · MATERI SEBELUM PRAKTIK</span>
            <h2 id="configuration-learning-title">Kita akan mengganti nama port</h2>
            <p>Identity router sudah kita atur. Berikutnya, kita akan mengganti nama <b>ether1, ether2, dan ether3</b> melalui menu Interfaces menjadi <b>ether1-internet, ether2-vlan, dan ether3-local</b>, sesuai jalur masing-masing pada topologi.</p>
            <h3>Mengapa port perlu diberi nama?</h3>
            <p><b>Interface adalah jalur koneksi pada router.</b> Nama bawaan seperti ether1 hanya menunjukkan nomor port. Kita tambahkan fungsi jalurnya agar lebih mudah memilih interface saat mengatur VLAN, alamat IP, DHCP, dan akses internet.</p>
            <div class="ch1-learning-table"><table><thead><tr><th>Port fisik</th><th>Nama yang dibuat</th><th>Fungsi jalur</th></tr></thead><tbody><tr><td>ether1</td><td><b>ether1-internet</b></td><td>Terhubung ke Internet / ISP</td></tr><tr><td>ether2</td><td><b>ether2-vlan</b></td><td>Trunk menuju port 1 hEX</td></tr><tr><td>ether3</td><td><b>ether3-local</b></td><td>Terhubung ke PC konfigurasi</td></tr></tbody></table></div>
            <h3>Apa tujuannya untuk langkah berikutnya?</h3>
            <p>Di Chapter 2, DHCP Client dipasang pada ether1-internet, VLAN dibuat di atas ether2-vlan, dan gateway PC lokal dipasang pada ether3-local. Nama yang jelas mengurangi kesalahan memilih jalur. <b>Nomor dan fungsi fisik port tetap sama</b> setelah diganti namanya.</p>
            <p>ether4 dan wlan1 tetap ditampilkan karena merupakan interface perangkat. Keduanya tidak perlu diubah pada tugas penamaan ini.</p>
            <p class="ch1-learning-note"><b>Yang akan kamu lakukan:</b> buka Interfaces, klik dua kali setiap baris ether1–ether3, ubah Name sesuai tabel, lalu klik OK. Selesaikan ketiga checklist sebelum evaluasi.</p>
        </template>
        @include('chapter-evaluation', ['chapterNumber' => 1, 'quizTitle' => 'Cek pemahaman perangkat dan konfigurasi router', 'finishTitle' => 'Hebat! Router siap untuk misi berikutnya.', 'finishDescription' => 'Kabel straight lulus LAN tester, topologi awal tersambung, dan WinBox sudah terhubung. Identity serta nama interface router sudah sesuai fungsinya. Ini bekal untuk menyiapkan VLAN, IP, dan DHCP pada chapter berikutnya.'])
        @include('game-music-player')
    </body>
</html>
