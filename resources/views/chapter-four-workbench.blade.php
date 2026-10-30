@php
    $student = auth()->user();
    $teacherPath = 'images/asset/char/guru/bapak Amat/';
@endphp
<!DOCTYPE html>
<html lang="id" data-page="chapter-four">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0879ef">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Chapter 04: WiFi, HotSpot dan Pengguna — NetGuard Academy</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/game-music.css') }}?v={{ filemtime(public_path('css/game-music.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-one.css') }}?v={{ filemtime(public_path('css/chapter-one.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-two-workbench.css') }}?v={{ filemtime(public_path('css/chapter-two-workbench.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-four-workbench.css') }}?v={{ filemtime(public_path('css/chapter-four-workbench.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-evaluation.css') }}?v={{ filemtime(public_path('css/chapter-evaluation.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/router-configuration.css') }}?v={{ filemtime(public_path('css/router-configuration.css')) }}">
        <script src="{{ asset('js/router-configuration.js') }}?v={{ filemtime(public_path('js/router-configuration.js')) }}" defer></script>
        <script src="{{ asset('js/chapter-evaluation.js') }}?v={{ filemtime(public_path('js/chapter-evaluation.js')) }}" defer></script>
        <script src="{{ asset('js/chapter-four-simulation.js') }}?v={{ filemtime(public_path('js/chapter-four-simulation.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/chapter-navbar.css') }}?v={{ filemtime(public_path('css/chapter-navbar.css')) }}">
        <script src="{{ asset('js/chapter-navbar.js') }}?v={{ filemtime(public_path('js/chapter-navbar.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/chapter-step-guide.css') }}?v={{ filemtime(public_path('css/chapter-step-guide.css')) }}">
        <script src="{{ asset('js/chapter-step-guide.js') }}?v={{ filemtime(public_path('js/chapter-step-guide.js')) }}" defer></script>
        <link rel="stylesheet" href="{{ asset('css/lab-pc-desktop.css') }}?v={{ filemtime(public_path('css/lab-pc-desktop.css')) }}">
        <script src="{{ asset('js/lab-pc-desktop.js') }}?v={{ filemtime(public_path('js/lab-pc-desktop.js')) }}" defer></script>
        <script src="{{ asset('js/chapter-four-workbench.js') }}?v={{ filemtime(public_path('js/chapter-four-workbench.js')) }}" defer></script>
</head>
<body>
<div class="academy-scene chapter-one-scene ch2-scene ch3-scene ch4-scene is-prologue" data-teacher-base="{{ asset(rtrim($teacherPath, '/')) }}" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.four.complete') }}" data-completed="{{ $student->completedAdventureChapters() >= 4 ? 'true' : 'false' }}">
    <section class="chapter-prologue ch2-prologue" data-ch2-prologue role="dialog" aria-modal="true" aria-labelledby="ch2-prologue-title" tabindex="0">
        @include('chapter-step-back')
        <div class="prologue-title" aria-hidden="true"><span>NETGUARD ACADEMY</span><b>CHAPTER 04 <i>·</i> WIFI DAN HOTSPOT</b></div>
        <div class="chapter-prologue__synopsis">
            <div class="chapter-prologue__character"><span class="chapter-prologue__character-glow"></span><img data-ch2-prologue-avatar src="{{ asset($teacherPath.'menugaskan.png') }}" alt="Pak Amat, guru TKJ" decoding="async"><span class="chapter-prologue__character-name">PAK AMAT <i>·</i> GURU TKJ</span></div>
            <div class="chapter-prologue__story" data-ch2-prologue-story>
                <span class="chapter-prologue__eyebrow"><i></i><b data-ch2-prologue-kicker>PROLOG · 01</b></span>
                <h1 id="ch2-prologue-title" data-ch2-prologue-title>WiFi sekolah siap dibangun</h1>
                <p data-ch2-prologue-text>Internet router sudah tersedia. Sekarang aktifkan wireless, amankan WiFi, lalu siapkan HotSpot dan akun pengguna.</p>
                <div class="chapter-prologue__progress"><span data-ch2-prologue-progress></span></div>
                <div class="chapter-prologue__controls"><small data-ch2-prologue-count>ADEGAN 01 / 05</small><small class="chapter-prologue__click-hint">KLIK DI MANA SAJA UNTUK LANJUT</small></div>
            </div>
        </div>
    </section>
    <section class="ch2-dialogue-overlay" data-ch2-dialogue hidden role="dialog" aria-modal="true" aria-labelledby="ch2-dialogue-speaker">
        @include('chapter-step-back')
        <img class="ch2-dialogue-overlay__teacher" src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru TKJ" decoding="async">
        <div class="ch2-dialogue-overlay__card" data-ch2-dialogue-next role="button" tabindex="0" aria-label="Lanjutkan dialog Pak Amat">
            <div class="ch2-dialogue-overlay__content"><span id="ch2-dialogue-speaker">PAK AMAT · GURU TKJ</span><p data-dialogue-text></p><small data-dialogue-count>1 / 3 · KLIK DI MANA SAJA UNTUK LANJUT</small></div>
        </div>
    </section>
    <div class="lab-scroll">
        @include('chapter-navbar', ['chapterNumber' => 4, 'chapterSubtitle' => 'WiFi, HotSpot dan Pengelolaan Pengguna'])

        <main class="lab-main ch2-main" id="main-content">
            <div class="ch2-workspace">
            <section class="ch2-workbench" aria-label="WinBox dan dialog Pak Amat">
            @include('lab-pc-desktop')
            @include('chapter-four-phone')
            <div class="simulation-monitor simulation-monitor--classic ch2-monitor"><div class="simulation-monitor__screen">
                <div class="routeros ch2-routeros">
                    <header class="ch2-winbox-titlebar"><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" alt="WinBox" width="17" height="17">admin@48:A9:8A:1C:01:01 (<b data-router-identity>Router</b>) - WinBox (64bit) v7.14.3 on hAP lite (smips)</span><span class="ch2-window-chrome"><button type="button" data-ch2-app-hide aria-label="Minimalkan WinBox">−</button><button type="button" data-ch2-app-size aria-label="Pulihkan / maksimalkan WinBox">□</button><button type="button" data-ch2-app-hide aria-label="Tutup WinBox">×</button></span></header>
                    <div class="routeros__menubar ch2-winbox-menubar"><span>Session</span><span>Settings</span><span>Dashboard</span></div>
                    <div class="routeros__toolbar ch2-winbox-quickbar"><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#undo"></use></svg></span><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#redo"></use></svg></span><span class="wb-safe-mode">Safe Mode</span><span class="wb-session">Session: <span>48:A9:8A:1C:01:01</span></span><small class="routeros__connected"><i></i></small></div>
                    <div class="routeros__body">
                        <nav class="ch2-nav" aria-label="Menu WinBox"><button type="button" data-open-window="interfaces" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#interfaces"></use></svg><span>Interfaces</span></button>
<button type="button" class="routeros__menu-item" data-open-window="wireless"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#wireless"></use></svg><span>Wireless</span></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#bridge"></use></svg><span>Bridge</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ppp"></use></svg><span>PPP</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#switch"></use></svg><span>Switch</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#mesh"></use></svg><span>Mesh</span></span>
<button type="button" data-ch2-menu="ip" aria-expanded="false" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ip"></use></svg><span>IP</span><i class="wb-menu-arrow" aria-hidden="true">›</i></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ipv6"></use></svg><span>IPv6</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#mpls"></use></svg><span>MPLS</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#routing"></use></svg><span>Routing</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
<button type="button" data-ch2-menu="system" aria-expanded="false" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#system"></use></svg><span>System</span><i class="wb-menu-arrow" aria-hidden="true">›</i></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#queues"></use></svg><span>Queues</span></span>
<button type="button" class="routeros__menu-item" data-open-window="files"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#files"></use></svg><span>Files</span></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#log"></use></svg><span>Log</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#radius"></use></svg><span>RADIUS</span></span>
<button type="button" data-ch2-menu="tools" aria-expanded="false" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#tools"></use></svg><span>Tools</span><i class="wb-menu-arrow">›</i></button>
<button type="button" data-open-window="terminal" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#terminal"></use></svg><span>New Terminal</span></button>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#dot1x"></use></svg><span>Dot1X</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#supout"></use></svg><span>Make Supout.rif</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#winbox"></use></svg><span>New WinBox</span></span>
<span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#exit"></use></svg><span>Exit</span></span>
                            @include('winbox-ip-menu', ['ipChapter' => 4, 'ipWindows' => ['Addresses' => 'addresses', 'DHCP Server' => 'dhcp', 'Pool' => 'pools', 'DHCP Client' => 'wan', 'DNS' => 'dns', 'Firewall' => 'firewall', 'Routes' => 'routes', 'Hotspot' => 'hotspot']])
                            <div class="routeros__submenu ch3-tools-menu" data-ch2-submenu="tools" hidden><button type="button" data-open-window="ping">Ping</button></div>
                            @include('winbox-system-menu', ['systemChapter' => 2])
                        </nav>
                        <div class="routeros__content ch2-desktop">
@include('winbox-wireless')
@include('winbox-hotspot')
@include('winbox-files')@include('winbox-inherited-services')
@include('winbox-inherited-interface')
<section class="winbox-child ch2-window ch2-window--list" data-window="addresses" aria-label="Address List" hidden><header><span>Address List</span><span class="ch2-window-controls"><button type="button" data-minimize="addresses" aria-label="Minimalkan">_</button><button type="button" data-maximize="addresses" aria-label="Maksimalkan">□</button><button type="button" data-close="addresses" aria-label="Tutup">×</button></span></header><div class="ch2-table inherited-table inherited-table--addresses" data-inherited-addresses></div><footer>0 items</footer></section>
<section class="winbox-child ch2-window ch2-window--list" data-window="wan" aria-label="DHCP Client" hidden><header><span>DHCP Client</span><span class="ch2-window-controls"><button type="button" data-minimize="wan" aria-label="Minimalkan">_</button><button type="button" data-maximize="wan" aria-label="Maksimalkan">□</button><button type="button" data-close="wan" aria-label="Tutup">×</button></span></header><div class="ch2-window-toolbar"><button type="button" data-renew-wan>Renew</button></div><div class="ch2-table"><div class="ch2-table__head"><span>Interface</span><span>Add Default Route</span><span>Status</span><span>Address</span></div><div data-inspect-wan="client" tabindex="0" role="button" aria-label="Periksa baris DHCP Client ether1-internet"><strong data-inherited-wan-interface>ether1-internet</strong><span data-inherited-default-route>yes</span><span data-wan-status>bound</span><span data-wan-address>192.0.2.2/24</span></div></div><footer>1 item</footer></section>
<section class="winbox-child ch2-window ch2-window--small" data-window="dns" aria-label="DNS Settings" hidden><header><span>DNS Settings</span><span class="ch2-window-controls"><button type="button" data-minimize="dns" aria-label="Minimalkan">_</button><button type="button" data-maximize="dns" aria-label="Maksimalkan">□</button><button type="button" data-close="dns" aria-label="Tutup">×</button></span></header><div class="ch2-vlan-edit-layout"><div class="ch2-vlan-edit-main"><div class="ch2-window-content"><label>Servers <span class="ch3-dns-server-field"><input data-dns-server="0" type="text" autocomplete="off"><button type="button" data-add-dns-server aria-label="Tambah server DNS" title="Tambah server DNS">▾</button></span></label><label data-dns-second hidden>Servers <input data-dns-server="1" type="text" autocomplete="off"></label><label>Dynamic Servers <input value="" readonly></label><label class="ch3-checkbox">Allow Remote Requests <input data-dns-remote type="checkbox"></label><label>Max UDP Packet Size <input value="4096" readonly></label><label>Cache Size <input value="2048 KiB" readonly></label></div></div><div class="ch2-vlan-edit-actions"><button type="button" data-save-dns="ok">OK</button><button type="button" data-close="dns">Cancel</button><button type="button" data-save-dns="apply">Apply</button></div></div></section>
<section class="winbox-child ch2-window ch2-window--list" data-window="firewall" aria-label="Firewall" hidden><header><span>Firewall</span><span class="ch2-window-controls"><button type="button" data-minimize="firewall" aria-label="Minimalkan">_</button><button type="button" data-maximize="firewall" aria-label="Maksimalkan">□</button><button type="button" data-close="firewall" aria-label="Tutup">×</button></span></header><div class="ch2-window-tabs"><button type="button" data-firewall-tab="filter" class="is-active">Filter Rules</button><button type="button" data-firewall-tab="nat">NAT</button><span>Mangle</span><span>Raw</span><span>Service Ports</span><span>Connections</span><span>Address Lists</span></div><div data-firewall-panel="filter"><div class="ch2-table"><div class="ch2-table__head"><span>#</span><span>Chain</span><span>Action</span><span>Protocol</span></div></div><footer>0 items</footer></div><div data-firewall-panel="nat" hidden><div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" data-new-nat title="Add" aria-label="Tambah NAT"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#add"></use></svg></button><button type="button" data-nat-tool="remove" title="Remove" aria-label="Hapus NAT" disabled><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#remove"></use></svg></button><button type="button" data-nat-tool="enable" title="Enable" aria-label="Aktifkan NAT" disabled><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#enable"></use></svg></button><button type="button" data-nat-tool="disable" title="Disable" aria-label="Nonaktifkan NAT" disabled><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#disable"></use></svg></button></div><div class="ch2-table ch3-nat-table"><div class="ch2-table__head"><span>#</span><span>Action</span><span>Chain</span><span>Out. Interface</span><span>Bytes</span><span>Packets</span></div><div data-nat-row role="button" tabindex="0" aria-pressed="false" hidden><span>0</span><strong data-inherited-nat-action>masquerade</strong><span data-inherited-nat-chain>srcnat</span><span data-inherited-nat-out>ether1-internet</span><span data-nat-bytes>0 B</span><span data-nat-packets>0</span></div></div><footer data-nat-count>0 items</footer></div></section>
<section class="winbox-child ch2-window ch2-window--list" data-window="routes" aria-label="Route List" hidden><header><span>Route List</span><span class="ch2-window-controls"><button type="button" data-minimize="routes" aria-label="Minimalkan">_</button><button type="button" data-maximize="routes" aria-label="Maksimalkan">□</button><button type="button" data-close="routes" aria-label="Tutup">×</button></span></header><div class="ch2-window-tabs"><b>Routes</b><span>Nexthops</span><span>Rules</span><span>VRF</span></div><div class="ch2-table"><div class="ch2-table__head"><span>Flags</span><span>Dst. Address</span><span>Gateway</span><span>Distance</span></div><div data-default-route data-inspect-wan="route" tabindex="0" role="button" aria-label="Periksa baris default route 0.0.0.0/0"><span>DAd</span><strong>0.0.0.0/0</strong><span data-inherited-route-gateway></span><span>1</span></div></div><div class="ch2-table inherited-table" data-inherited-connected-routes></div><footer data-route-count>5 items</footer></section>
<section class="winbox-child ch2-window ch2-window--small" data-window="identity" aria-label="Identity" hidden><header><span>Identity</span><span class="ch2-window-controls"><button type="button" data-minimize="identity" aria-label="Minimalkan">_</button><button type="button" data-maximize="identity" aria-label="Maksimalkan">□</button><button type="button" data-close="identity" aria-label="Tutup">×</button></span></header><div class="ch2-window-content"><label>Name <input data-inherited-identity readonly></label><div class="ch2-window-actions"><button type="button" data-close="identity">OK</button><button type="button" data-close="identity">Cancel</button></div></div></section>
<section class="winbox-child ch2-window ch2-window--list" data-window="terminal" aria-label="Terminal" hidden><header><span>Terminal</span><span class="ch2-window-controls"><button type="button" data-minimize="terminal" aria-label="Minimalkan">_</button><button type="button" data-maximize="terminal" aria-label="Maksimalkan">□</button><button type="button" data-close="terminal" aria-label="Tutup">×</button></span></header><div class="ch3-terminal"><pre data-terminal-output aria-live="polite">MikroTik RouterOS 7.14.3
</pre><form data-terminal-form><label><span>[admin@Router] &gt;</span><input data-terminal-command autocomplete="off" spellcheck="false" aria-label="Perintah terminal router"></label></form></div></section>
<section class="winbox-child ch2-window ch2-window--medium" data-window="ping" aria-label="Ping" hidden><header><span>Ping</span><span class="ch2-window-controls"><button type="button" data-minimize="ping" aria-label="Minimalkan">_</button><button type="button" data-maximize="ping" aria-label="Maksimalkan">□</button><button type="button" data-close="ping" aria-label="Tutup">×</button></span></header><div class="ch2-window-content"><label>Ping To <input data-ping-address type="text" value="8.8.8.8"></label><label>Count <input value="4" readonly></label><div class="ch2-window-actions"><button type="button" data-start-ping>Start</button><button type="button" data-close="ping">Close</button></div></div><pre class="ch3-ping-output" data-ping-output></pre></section>                            <div class="winbox-taskbar ch2-taskbar" data-taskbar aria-label="Jendela WinBox diminimalkan"></div>
                        </div>
                    </div>
                    <footer class="routeros__status"><span>RouterOS 7.14.3 · hAP lite</span><span>CPU: 2% &nbsp; Memory: 32 MiB &nbsp; Uptime: 00:04:32</span></footer>
                </div>
            </div></div>
            </section>
            <aside class="lab-guide ch2-guide ch3-guide" aria-label="Petunjuk misi"><div class="lab-guide__header"><span aria-hidden="true">▤</span><div><small>PETUNJUK MISI</small><h2>Langkah-Langkah</h2></div></div><div class="chapter-guide-scroll" data-guide-scroll tabindex="0" aria-label="Langkah dan target misi"><ol data-guide-list></ol><section class="ch2-vlan-checklist" aria-label="Target misi"><div class="ch2-vlan-checklist__heading"><b data-task-heading>Target misi</b><span data-task-count role="status" aria-live="polite"></span></div><ul data-task-list></ul></section></div><p class="ch2-guide__feedback" data-feedback role="status" aria-live="polite"></p><button class="ch2-task-back" type="button" data-reread-learning>Baca penjelasan tahap ini</button><button class="ch2-task-back" type="button" data-previous hidden>← Tahap sebelumnya</button><div class="lab-guide__note"><b>Materi modul</b><p data-module-section>Bab 4 · WiFi dan HotSpot</p></div><button class="ch2-task-back ch2-prologue-replay" type="button" data-replay-prologue>↺ Lihat pembuka Chapter 4</button></aside>
            </div>
        </main>
    </div>
</div>

<dialog class="ch2-learning-dialog" data-learning-dialog aria-labelledby="ch3-learning-title"><button type="button" class="ch2-dialog-close" data-close-learning aria-label="Tutup materi">×</button><span class="ch2-modal-kicker">PAK AMAT · MATERI CHAPTER 04</span><h2 id="ch3-learning-title" data-learning-title></h2><div data-learning-body></div><button type="button" class="ch2-task-button" data-learning-continue>Mulai praktik →</button></dialog>
@include('chapter-evaluation', ['chapterNumber' => 4, 'quizTitle' => 'Cek pemahaman WiFi, HotSpot dan pengguna', 'finishTitle' => 'WiFi dan HotSpot sekolah siap digunakan!', 'finishDescription' => 'Wireless aktif, WiFi diamankan, halaman HotSpot disesuaikan, dan akun kepala sekolah, guru, serta siswa sudah diuji dengan profile masing-masing.'])
@include('game-music-player')
</body>
</html>
