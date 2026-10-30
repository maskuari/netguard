@php
    $student = auth()->user();
    $teacherPath = 'images/asset/char/guru/bapak Amat/';
@endphp
<!DOCTYPE html>
<html lang="id" data-page="chapter-five">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0879ef">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Chapter 05: VLAN Switch dan Integrasi Jaringan — NetGuard Academy</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/game-music.css') }}?v={{ filemtime(public_path('css/game-music.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-one.css') }}?v={{ filemtime(public_path('css/chapter-one.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-two-workbench.css') }}?v={{ filemtime(public_path('css/chapter-two-workbench.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-four-workbench.css') }}?v={{ filemtime(public_path('css/chapter-four-workbench.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-evaluation.css') }}?v={{ filemtime(public_path('css/chapter-evaluation.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/router-configuration.css') }}?v={{ filemtime(public_path('css/router-configuration.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-navbar.css') }}?v={{ filemtime(public_path('css/chapter-navbar.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-step-guide.css') }}?v={{ filemtime(public_path('css/chapter-step-guide.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-five-workbench.css') }}?v={{ filemtime(public_path('css/chapter-five-workbench.css')) }}">
    <script src="{{ asset('js/chapter-evaluation.js') }}?v={{ filemtime(public_path('js/chapter-evaluation.js')) }}" defer></script>
    <script src="{{ asset('js/chapter-navbar.js') }}?v={{ filemtime(public_path('js/chapter-navbar.js')) }}" defer></script>
    <script src="{{ asset('js/chapter-step-guide.js') }}?v={{ filemtime(public_path('js/chapter-step-guide.js')) }}" defer></script>
    <script src="{{ asset('js/chapter-five-workbench.js') }}?v={{ filemtime(public_path('js/chapter-five-workbench.js')) }}" defer></script>
</head>
<body>
<div class="academy-scene chapter-one-scene ch2-scene ch3-scene ch4-scene ch5-scene is-prologue" data-teacher-base="{{ asset(rtrim($teacherPath, '/')) }}" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.five.complete') }}" data-completed="{{ $student->completedAdventureChapters() >= 5 ? 'true' : 'false' }}">
    <section class="chapter-prologue ch2-prologue" data-ch5-prologue role="dialog" aria-modal="true" aria-labelledby="ch5-prologue-title" tabindex="0">
        @include('chapter-step-back')
        <div class="prologue-title" aria-hidden="true"><span>NETGUARD ACADEMY</span><b>CHAPTER 05 <i>·</i> VLAN SWITCH</b></div>
        <div class="chapter-prologue__synopsis">
            <div class="chapter-prologue__character"><span class="chapter-prologue__character-glow"></span><img data-ch5-prologue-avatar src="{{ asset($teacherPath.'menugaskan.png') }}" alt="Pak Amat, guru TKJ" decoding="async"><span class="chapter-prologue__character-name">PAK AMAT <i>·</i> GURU TKJ</span></div>
            <div class="chapter-prologue__story" data-ch5-prologue-story>
                <span class="chapter-prologue__eyebrow"><i></i><b data-ch5-prologue-kicker>PROLOG · 01</b></span>
                <h1 id="ch5-prologue-title" data-ch5-prologue-title>Router dan VLAN sekolah sudah siap</h1>
                <p data-ch5-prologue-text>VLAN siswa dan guru sudah dibuat di router. Sekarang hubungkan router ke switch dengan trunk, lalu atur port access agar tiap komputer masuk ke VLAN yang tepat.</p>
                <div class="chapter-prologue__progress"><span data-ch5-prologue-progress></span></div>
                <div class="chapter-prologue__controls"><small data-ch5-prologue-count>ADEGAN 01 / 04</small><small class="chapter-prologue__click-hint">KLIK DI MANA SAJA UNTUK LANJUT</small></div>
            </div>
        </div>
    </section>
    <section class="ch2-dialogue-overlay" data-ch5-dialogue hidden role="dialog" aria-modal="true" aria-labelledby="ch5-dialogue-speaker">
        @include('chapter-step-back')
        <img class="ch2-dialogue-overlay__teacher" src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru TKJ" decoding="async">
        <div class="ch2-dialogue-overlay__card" data-ch5-dialogue-next role="button" tabindex="0" aria-label="Lanjutkan dialog Pak Amat">
            <div class="ch2-dialogue-overlay__content"><span id="ch5-dialogue-speaker">PAK AMAT · GURU TKJ</span><p data-ch5-dialogue-text></p><small data-ch5-dialogue-count>KLIK DI MANA SAJA UNTUK LANJUT</small></div>
        </div>
    </section>

    <div class="lab-scroll">
        @include('chapter-navbar', ['chapterNumber' => 5, 'chapterSubtitle' => 'VLAN Switch dan Integrasi Jaringan'])
        <main class="lab-main ch2-main" id="main-content">
            <div class="ch2-workspace ch5-workspace">
                <section class="ch2-workbench ch5-workbench" aria-label="WinBox Switch hEX dan komputer klien">
                    <div class="ch5-inherited-bar"><span><b>Router hAP · konfigurasi Chapter 1–4 dipertahankan</b><small>Uplink: <strong data-upstream-interface>ether2-vlan</strong> · VLAN siswa 10 · VLAN guru 20</small></span><span class="ch5-switch-state"><i></i> Switch hEX · sesi WinBox melalui ether5</span></div>
                    <div class="ch5-lab-stage" data-ch5-stage="winbox">
                        <div class="simulation-monitor simulation-monitor--classic ch2-monitor ch5-monitor">
                            <div class="simulation-monitor__screen">
                                <div class="routeros ch2-routeros ch5-routeros">
                                    <header class="ch2-winbox-titlebar"><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" alt="WinBox" width="17" height="17">admin@48:A9:8A:1C:01:05 (Switch) - WinBox (64bit) v7.14.3 on hEX lite (smips)</span><span class="ch2-window-chrome"><button type="button" aria-label="Minimalkan WinBox">−</button><button type="button" aria-label="Pulihkan / maksimalkan WinBox">□</button><button type="button" aria-label="Tutup WinBox">×</button></span></header>
                                    <div class="routeros__menubar ch2-winbox-menubar"><span>Session</span><span>Settings</span><span>Dashboard</span></div>
                                    <div class="routeros__toolbar ch2-winbox-quickbar"><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#undo"></use></svg></span><span class="wb-toolbar-icon"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#redo"></use></svg></span><span class="wb-safe-mode">Safe Mode</span><span class="wb-session">Session: <span>48:A9:8A:1C:01:05</span></span><small class="routeros__connected"><i></i></small></div>
                                    <div class="routeros__body">
                                        <nav class="ch2-nav ch5-nav" aria-label="Menu WinBox">
                                            <button type="button" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#interfaces"></use></svg><span>Interfaces</span></button>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#wireless"></use></svg><span>Wireless</span></span>
                                            <button type="button" data-open-bridge class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#bridge"></use></svg><span>Bridge</span></button>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ppp"></use></svg><span>PPP</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#switch"></use></svg><span>Switch</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#mesh"></use></svg><span>Mesh</span></span>
                                            <button type="button" class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ip"></use></svg><span>IP</span><i class="wb-menu-arrow" aria-hidden="true">›</i></button>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#ipv6"></use></svg><span>IPv6</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#routing"></use></svg><span>Routing</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#system"></use></svg><span>System</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#queues"></use></svg><span>Queues</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#files"></use></svg><span>Files</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#log"></use></svg><span>Log</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#radius"></use></svg><span>RADIUS</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#tools"></use></svg><span>Tools</span><i class="wb-menu-arrow" aria-hidden="true">›</i></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#terminal"></use></svg><span>New Terminal</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#dot1x"></use></svg><span>Dot1X</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#supout"></use></svg><span>Make Supout.rif</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#winbox"></use></svg><span>New WinBox</span></span>
                                            <span class="routeros__menu-item"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#exit"></use></svg><span>Exit</span></span>
                                        </nav>
                                        <div class="routeros__content ch2-desktop ch5-desktop">
                                            <section class="winbox-child ch2-window ch2-window--list ch5-bridge-window" data-window="bridge" aria-label="Bridge" hidden>
                                                <header><span>Bridge</span><span class="ch2-window-controls"><button type="button" aria-label="Minimalkan Bridge">_</button><button type="button" aria-label="Maksimalkan Bridge">□</button><button type="button" data-close-bridge aria-label="Tutup Bridge">×</button></span></header>
                                                <div class="ch2-window-tabs ch5-tabs"><button type="button" class="is-active" data-bridge-tab="Bridges">Bridge</button><button type="button" data-bridge-tab="Ports">Ports</button><button type="button" data-bridge-tab="VLANs">VLANs</button><button type="button" data-bridge-tab="MSTIs">MSTIs</button><button type="button" data-bridge-tab="Filters">Filters</button><button type="button" data-bridge-tab="NAT">NAT</button><button type="button" data-bridge-tab="Hosts">Hosts</button><button type="button" data-bridge-tab="MDB">MDB</button></div>
                                                <div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" data-bridge-add title="Add" aria-label="Tambah bridge"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#add"></use></svg></button><button type="button" data-bridge-remove disabled title="Remove" aria-label="Hapus bridge"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#remove"></use></svg></button><button type="button" data-bridge-enable disabled title="Enable" aria-label="Aktifkan bridge"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#enable"></use></svg></button><button type="button" data-bridge-disable disabled title="Disable" aria-label="Nonaktifkan bridge"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#disable"></use></svg></button><button type="button" data-bridge-comment disabled title="Comment" aria-label="Komentar bridge">▤</button></div>
                                                <div class="ch5-tab-panel" data-bridge-panel="Bridges"><div class="ch2-table ch5-table"><div class="ch2-table__head"><span>Flags</span><span>Name</span><span>Type</span><span>MTU</span><span>Actual MTU</span><span>L2 MTU</span><span>MAC Address</span><span>Protocol Mode</span><span>VLAN Filtering</span></div><button type="button" class="ch2-data-row" data-bridge-row hidden><span>R</span><strong>bridge1</strong><span>Bridge</span><span>auto</span><span>1500</span><span>1598</span><span>48:A9:8A:1C:01:05</span><span>rstp</span><span data-bridge-filtering-value>no</span></button><p class="ch5-empty" data-bridge-empty>No items</p></div><footer data-bridge-count>0 items</footer></div>
                                                <div class="ch5-tab-panel" data-bridge-panel="Ports" hidden><div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" data-port-add title="Add" aria-label="Tambah bridge port"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#add"></use></svg></button><button type="button" disabled title="Remove" aria-label="Hapus bridge port"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#remove"></use></svg></button></div><div class="ch2-table ch5-table"><div class="ch2-table__head"><span>Flags</span><span>Interface</span><span>Bridge</span><span>PVID</span><span>Frame Types</span><span>Ingress Filtering</span><span>HW</span></div><div data-port-rows></div><p class="ch5-empty" data-port-empty>No items</p></div><footer data-port-count>0 items</footer></div>
                                                <div class="ch5-tab-panel" data-bridge-panel="VLANs" hidden><div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" data-vlan-add title="Add" aria-label="Tambah bridge VLAN"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#add"></use></svg></button><button type="button" disabled title="Remove" aria-label="Hapus bridge VLAN"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#remove"></use></svg></button></div><div class="ch2-table ch5-table"><div class="ch2-table__head"><span>Flags</span><span>Bridge</span><span>VLAN IDs</span><span>Current Tagged</span><span>Current Untagged</span></div><div data-vlan-rows></div><p class="ch5-empty" data-vlan-empty>No items</p></div><footer data-vlan-count>0 items</footer></div>
                                                <div class="ch5-tab-panel ch5-placeholder" data-bridge-panel="MSTIs" hidden><span>Multiple Spanning Tree Instances</span></div><div class="ch5-tab-panel ch5-placeholder" data-bridge-panel="Filters" hidden><span>Bridge Filters</span></div><div class="ch5-tab-panel ch5-placeholder" data-bridge-panel="NAT" hidden><span>Bridge NAT</span></div><div class="ch5-tab-panel ch5-placeholder" data-bridge-panel="Hosts" hidden><span>Bridge Hosts</span></div><div class="ch5-tab-panel ch5-placeholder" data-bridge-panel="MDB" hidden><span>Multicast Database</span></div>
                                            </section>
                                            <section class="winbox-child ch2-window ch2-window--medium ch5-editor" data-window="bridge-edit" aria-label="Bridge properties" hidden>
                                                <header><span data-bridge-editor-title>New Bridge</span><span class="ch2-window-controls"><button type="button" data-close-editor aria-label="Tutup">×</button></span></header>
                                                <div class="ch5-editor-layout"><div class="ch5-editor-main"><div class="ch2-window-tabs"><button type="button" class="is-active">General</button><button type="button" data-bridge-editor-status>Status</button></div><div class="ch2-window-content"><label>Name <input data-bridge-name autocomplete="off"></label><label>MTU <input value="auto" readonly></label><label>Actual MTU <input value="1500" readonly></label><label>MAC Address <input value="auto" readonly></label><label>Protocol Mode <select data-bridge-protocol><option>rstp</option><option>stp</option><option>none</option></select></label><label class="ch5-native-check">VLAN Filtering <input type="checkbox" data-bridge-filtering></label><label>DHCP Snooping <input type="checkbox" disabled></label></div></div><div class="ch5-editor-actions"><button type="button" data-save-bridge>OK</button><button type="button" data-close-editor>Cancel</button><button type="button" data-apply-bridge>Apply</button></div></div><footer data-bridge-editor-status-text>enabled</footer>
                                            </section>
                                            <section class="winbox-child ch2-window ch2-window--medium ch5-editor" data-window="port-edit" aria-label="Bridge Port properties" hidden>
                                                <header><span>New Bridge Port</span><span class="ch2-window-controls"><button type="button" data-close-editor aria-label="Tutup">×</button></span></header>
                                                <div class="ch5-editor-layout"><div class="ch5-editor-main"><div class="ch2-window-tabs"><button type="button" class="is-active">General</button><button type="button">Status</button></div><div class="ch2-window-content"><label>Interface <select data-port-interface><option value="">-- pilih interface --</option><option>ether1</option><option>ether2</option><option>ether3</option><option>ether4</option><option>ether5</option></select></label><label>Bridge <select data-port-bridge><option>bridge1</option></select></label><label>PVID <input type="number" min="1" max="4094" value="1" data-port-pvid></label><label class="ch5-native-check">Ingress Filtering <input type="checkbox" checked data-port-ingress></label><label>Frame Types <select data-port-frame><option value="admit-all">admit-all</option><option value="admit-only-untagged-and-priority-tagged">admit-only-untagged-and-priority-tagged</option><option value="admit-only-vlan-tagged">admit-only-vlan-tagged</option></select></label><label>Edge <select><option>auto</option><option>yes</option><option>no</option></select></label></div></div><div class="ch5-editor-actions"><button type="button" data-save-port>OK</button><button type="button" data-close-editor>Cancel</button><button type="button" data-save-port>Apply</button></div></div><footer data-port-editor-status>enabled</footer>
                                            </section>
                                            <section class="winbox-child ch2-window ch2-window--medium ch5-editor" data-window="vlan-edit" aria-label="Bridge VLAN properties" hidden>
                                                <header><span>New Bridge VLAN</span><span class="ch2-window-controls"><button type="button" data-close-editor aria-label="Tutup">×</button></span></header>
                                                <div class="ch5-editor-layout"><div class="ch5-editor-main"><div class="ch2-window-tabs"><button type="button" class="is-active">General</button><button type="button">Status</button></div><div class="ch2-window-content"><label>Bridge <select data-vlan-bridge><option>bridge1</option></select></label><label>Tagged <input data-vlan-tagged autocomplete="off" placeholder="ether1"></label><label>Untagged <input data-vlan-untagged autocomplete="off" placeholder="ether2"></label><label>VLAN IDs <input data-vlan-id type="number" min="1" max="4094" autocomplete="off"></label><label>Current Tagged <input value="" readonly></label><label>Current Untagged <input value="" readonly></label></div></div><div class="ch5-editor-actions"><button type="button" data-save-vlan>OK</button><button type="button" data-close-editor>Cancel</button><button type="button" data-save-vlan>Apply</button></div></div><footer data-vlan-editor-status>enabled</footer>
                                            </section>
                                            <div class="winbox-taskbar ch2-taskbar" data-taskbar aria-label="Jendela WinBox diminimalkan"></div>
                                        </div>
                                    </div>
                                    <footer class="routeros__status"><span>RouterOS 7.14.3 · hEX lite</span><span>CPU: 1% &nbsp; Memory: 20.3 MiB &nbsp; Uptime: 00:00:18</span></footer>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section class="ch5-client-workspace" data-client-workspace hidden aria-label="Komputer klien">
                        <header><span data-client-title>PC Siswa · ether2 access · VLAN 10</span><button type="button" data-back-winbox>Kembali ke WinBox</button></header>
                        <div class="ch5-client-desktop"><button type="button" class="ch5-cmd-shortcut" data-launch-cmd><span>C:\_</span>Command Prompt</button><small>SMK Negeri 1 Amuntai · Windows 10</small></div>
                        <section class="ch5-client-terminal" data-client-terminal hidden><header><span data-terminal-title>Command Prompt — PC Siswa</span><button type="button" data-close-cmd aria-label="Tutup Command Prompt">×</button></header><div class="ch5-console"><pre data-terminal-output aria-live="polite">Microsoft Windows [Version 10.0.19045]
(c) Microsoft Corporation. All rights reserved.

</pre><form data-terminal-form><label><span data-terminal-prompt>C:\Users\Siswa&gt;</span><input data-terminal-input autocomplete="off" spellcheck="false" aria-label="Ketik perintah Command Prompt"></label></form></div></section>
                    </section>
                    <nav class="ch5-taskbar" aria-label="Perangkat dan aplikasi lab"><button type="button" class="is-active" data-task-winbox><img src="{{ asset('images/logo/winbox.png') }}" alt=""><span>WinBox · Switch hEX</span></button><button type="button" data-task-client="student"><span class="ch5-computer-icon">▣</span><span>PC Siswa</span></button><button type="button" data-task-client="teacher"><span class="ch5-computer-icon">▣</span><span>PC Guru</span></button><span>Management · ether5</span></nav>
                </section>

                <aside class="lab-guide ch2-guide ch3-guide ch5-guide" aria-label="Petunjuk misi">
                    <div class="lab-guide__header"><span aria-hidden="true">▤</span><div><small>PETUNJUK MISI</small><h2>Langkah-Langkah</h2></div></div>
                    <div class="chapter-guide-scroll" data-guide-scroll tabindex="0" aria-label="Langkah dan target misi"><ol data-guide-list></ol><section class="ch2-vlan-checklist ch5-reference"><div class="ch2-vlan-checklist__heading"><b>Konfigurasi router sebelumnya</b><span>dipertahankan</span></div><p>VLAN 10 · Siswa · gateway 192.168.40.1<br>VLAN 20 · Guru · gateway 192.168.60.1</p><p>Switch hEX: ether1 trunk ke <strong data-reference-uplink>ether2-vlan</strong>; ether2 access siswa; ether3 access guru. Port ether5 khusus sesi manajemen.</p></section></div>
                    <p class="ch2-guide__feedback" data-feedback role="status" aria-live="polite"></p>
                    <button class="ch2-task-back" type="button" data-reread-learning>Baca penjelasan tahap ini</button>
                    <button class="ch2-task-back" type="button" data-previous hidden>← Tahap sebelumnya</button>
                    <button class="ch2-task-button ch5-evaluation-button" type="button" data-open-evaluation hidden>Buka evaluasi Chapter 5 →</button>
                    <div class="lab-guide__note"><b>Materi modul</b><p>Bab 5 · Bridge, trunk/access, dan integrasi VLAN switch</p></div>
                    <button class="ch2-task-back ch2-prologue-replay" type="button" data-replay-prologue>↺ Lihat pembuka Chapter 5</button>
                </aside>
            </div>
        </main>
    </div>
</div>

<dialog class="ch2-learning-dialog" data-learning-dialog aria-labelledby="ch5-learning-title"><button type="button" class="ch2-dialog-close" data-close-learning aria-label="Tutup penjelasan">×</button><span class="ch2-modal-kicker">PAK AMAT · CHAPTER 05</span><h2 id="ch5-learning-title" data-learning-title>Apa fungsi trunk dan access?</h2><div data-learning-body><p><b>Port trunk</b> membawa lebih dari satu VLAN dalam satu kabel dengan tag VLAN. Pada simulasi ini, trunk adalah kabel dari switch hEX <b>ether1</b> ke router hAP <b>ether2-vlan</b>; jalur itu sudah membawa VLAN 10 siswa dan VLAN 20 guru dari konfigurasi Chapter 2.</p><p><b>Port access</b> menyambungkan satu komputer ke satu VLAN tanpa meminta komputer memberi tag. Kita atur <b>ether2</b> untuk siswa dengan PVID 10 dan <b>ether3</b> untuk guru dengan PVID 20. Setelah tabel VLAN selesai, aktifkan VLAN Filtering dan uji alamat serta gateway dari CMD kedua PC.</p><p class="ch2-modal-note">Pengaturan IP, DHCP, DNS, NAT, WiFi, dan HotSpot di router yang sudah dibuat pada Chapter 1–4 tetap dipertahankan. Chapter ini menambahkan konfigurasi bridge di switch.</p></div><button type="button" class="ch2-task-button" data-learning-continue>Mulai praktik di WinBox →</button></dialog>
@include('chapter-evaluation', ['chapterNumber' => 5, 'quizTitle' => 'Cek pemahaman VLAN Switch dan trunk/access', 'finishTitle' => 'Switch dan jaringan sekolah sudah terintegrasi!', 'finishDescription' => 'Bridge, trunk, access port, tabel VLAN, dan VLAN Filtering telah dikonfigurasi. Koneksi klien siswa dan guru diuji dari CMD dengan gateway masing-masing sesuai VLAN 10 dan VLAN 20.'])
@include('game-music-player')
</body>
</html>
