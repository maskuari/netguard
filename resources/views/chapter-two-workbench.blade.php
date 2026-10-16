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
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/game-music.css') }}?v={{ filemtime(public_path('css/game-music.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-one.css') }}?v={{ filemtime(public_path('css/chapter-one.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/chapter-two-workbench.css') }}?v={{ filemtime(public_path('css/chapter-two-workbench.css')) }}">
    <script src="{{ asset('js/chapter-two-workbench.js') }}?v={{ filemtime(public_path('js/chapter-two-workbench.js')) }}" defer></script>
</head>
<body>
<div class="academy-scene chapter-one-scene ch2-scene" data-user-id="{{ $student->id }}" data-complete-url="{{ route('chapter.two.complete') }}" data-completed="{{ $student->completedAdventureChapters() >= 2 ? 'true' : 'false' }}">
    <section class="ch2-dialogue-overlay" data-ch2-dialogue hidden role="dialog" aria-modal="true" aria-labelledby="ch2-dialogue-speaker">
        <img class="ch2-dialogue-overlay__teacher" src="{{ asset($teacherPath.'ngasih_arahan.png') }}" alt="Pak Amat, guru TKJ" decoding="async">
        <div class="ch2-dialogue-overlay__card" data-ch2-dialogue-next role="button" tabindex="0" aria-label="Lanjutkan dialog Pak Amat">
            <div class="ch2-dialogue-overlay__content"><span id="ch2-dialogue-speaker">PAK AMAT · GURU TKJ</span><p data-dialogue-text></p><small data-dialogue-count>1 / 3 · KLIK UNTUK LANJUT</small></div>
        </div>
    </section>
    <div class="lab-scroll">
        <header class="lab-header">
            <a class="lab-back" href="{{ route('adventure') }}#chapter-02" aria-label="Kembali ke peta chapter">←</a>
            <img class="lab-logo" src="{{ asset('images/logo/logo.png') }}" alt="" width="55" height="55">
            <div class="lab-heading"><span>NETGUARD ACADEMY · ADVENTURE MODE</span><strong>Lab Chapter 02</strong><small>IP, VLAN dan DHCP · Lanjutan WinBox Chapter 1</small></div>
            <div class="lab-hud"><span>PROGRES MISI</span><strong data-progress-label>0 / 5</strong><progress data-progress value="0" max="5"></progress></div>
            <button class="lab-save-progress" type="button" data-save><span aria-hidden="true">▣</span><span class="lab-save-progress__label">Simpan Progres</span></button>
            <details class="lab-settings"><summary aria-label="Pengaturan musik">♫</summary><div class="lab-settings__panel">@include('game-music-settings')</div></details>
            <img class="lab-avatar" src="{{ asset($student->profileAvatarPath()) }}" alt="{{ $student->name }}" title="{{ $student->name }}" width="49" height="49">
        </header>

        <main class="lab-main ch2-main" id="main-content">
            <div class="ch2-workspace">
            <section class="ch2-workbench" aria-label="WinBox dan dialog Pak Amat">
            <div class="simulation-monitor ch2-monitor"><span class="simulation-monitor__camera"></span><div class="simulation-monitor__screen">
                <div class="routeros ch2-routeros">
                    <header class="ch2-winbox-titlebar"><span><img src="{{ asset('images/logo/winbox.png') }}" alt="" width="16" height="16"> admin@192.168.88.1 (<b data-router-identity>Router</b>) (MikroTik) - WinBox v6.36rc6 on CCR1036-12G-4S (tile)</span><span class="ch2-window-chrome">−　□　×</span></header>
                    <div class="routeros__toolbar ch2-winbox-menubar"><span>Session</span><span>Settings</span><span>Dashboard</span></div>
                    <div class="ch2-winbox-quickbar"><button type="button" aria-label="Kembali">↶</button><button type="button" aria-label="Ulangi">↷</button><button type="button">Safe Mode</button><label>Session: <input type="text" value="[fe80::4e5e:cfff:fe6f:c0ab%3]" readonly></label><span>Memory: <b>15.4 GiB</b></span><span>CPU: <b>0%</b></span><i></i></div>
                    <div class="routeros__body">
                        <nav class="ch2-nav" aria-label="Menu WinBox">
                            <span>▣ Quick Set</span><span>⌘ CAPsMAN</span>
                            <button type="button" data-open-window="interfaces">▤ Interfaces</button>
                            <button type="button" data-open-window="vlan" data-unlock="vlan">↳ VLAN</button>
                            <span>◉ Wireless</span><span>◇ Bridge</span><span>⛓ PPP</span><span>▦ Switch</span>
                            <span class="ch2-nav__section">▤ IP</span>
                            <button type="button" data-open-window="wan" data-unlock="wan">↳ DHCP Client</button>
                            <button type="button" data-open-window="addresses" data-unlock="addresses">↳ Addresses</button>
                            <button type="button" data-open-window="dhcp" data-unlock="dhcp">↳ DHCP Server</button>
                            <button type="button" data-open-window="clients" data-unlock="verify">↳ Leases / Klien</button>
                            <span>⤴ Routing</span><span>⚙ System</span>
                            <button type="button" data-open-window="identity">↳ Identity</button>
                            <span>◷ Queues</span><span>≡ Log</span><span>⚒ Tools</span>
                        </nav>
                        <div class="routeros__content ch2-desktop">
                            <section class="winbox-child ch2-window ch2-window--routes" data-window="routes" aria-label="Route List">
                                <header><span>Route List</span><span class="ch2-window-controls"><button type="button" data-minimize="routes" aria-label="Minimalkan Route List">_</button><button type="button" data-close="routes" aria-label="Tutup Route List">×</button></span></header>
                                <div class="ch2-window-tabs"><b>Routes</b><span>Nexthops</span><span>Rules</span><span>VRF</span></div>
                                <div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" aria-label="Tambah route">＋</button><button type="button" aria-label="Hapus route">−</button><button type="button" aria-label="Aktifkan route">✓</button><button type="button" aria-label="Nonaktifkan route">×</button><button type="button" aria-label="Filter">▽</button><input type="search" placeholder="Find" aria-label="Cari route"><span>all</span></div>
                                <div class="ch2-table ch2-route-table"><div class="ch2-table__head"><span>Flags</span><span>Dst. Address</span><span>Gateway</span><span>Distance</span><span>Routing Mark</span><span>Pref. Source</span></div><div><strong>DAC</strong><span>192.168.88.0/24</span><span>bridge</span><span>0</span><span>main</span><span>192.168.88.1</span></div><div><strong>DAC</strong><span>192.168.100.0/24</span><span>ether3-local</span><span>0</span><span>main</span><span>192.168.100.1</span></div><div><strong>DAC</strong><span>192.168.40.0/24</span><span>vlan1-siswa</span><span>0</span><span>main</span><span>192.168.40.1</span></div><div><strong>DAC</strong><span>192.168.60.0/24</span><span>vlan2-guru</span><span>0</span><span>main</span><span>192.168.60.1</span></div><div><strong>AS</strong><span>0.0.0.0/0</span><span>ether1-internet</span><span>1</span><span>main</span><span>—</span></div></div><footer>5 items</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--small" data-window="identity" hidden aria-label="Identity MikroTik">
                                <header><span>Identity</span><span class="ch2-window-controls"><button type="button" data-minimize="identity" aria-label="Minimalkan Identity">_</button><button type="button" data-close="identity" aria-label="Tutup Identity">×</button></span></header>
                                <div class="ch2-window-content"><label>Name <input data-identity-input type="text" value="Router" autocomplete="off"></label><div class="ch2-window-actions"><button type="button" data-save-identity>OK</button><button type="button" data-save-identity>Apply</button></div></div><footer>System / Identity</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--list" data-window="interfaces" aria-label="Daftar interface MikroTik">
                                <header><span>Interface List</span><span class="ch2-window-controls"><button type="button" data-minimize="interfaces" aria-label="Minimalkan Interfaces">_</button><button type="button" data-close="interfaces" aria-label="Tutup Interfaces">×</button></span></header>
                                <div class="ch2-window-tabs ch2-window-tabs--interfaces"><b>Interface</b><span>Interface List</span><span>Ethernet</span><span>EoIP Tunnel</span><span>IP Tunnel</span><span>GRE Tunnel</span><button type="button" data-open-window="vlan" data-unlock="vlan">VLAN</button><span>VXLAN</span><span>VRRP</span><span>Bonding</span><span>LTE</span></div>
                                <div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" aria-label="Tambah interface">＋</button><button type="button" aria-label="Hapus interface">−</button><button type="button" aria-label="Aktifkan interface">✓</button><button type="button" aria-label="Nonaktifkan interface">×</button><button type="button" aria-label="Komentar">▤</button><button type="button" aria-label="Filter">▽</button><input type="search" placeholder="Find" aria-label="Cari interface"><span>all</span></div>
                                <div class="ch2-table ch2-interface-table"><div class="ch2-table__head"><span>Name</span><span>Type</span><span>MTU</span><span>Actual MTU</span><span>L2 MTU</span><span>Tx</span><span>Rx</span><span>Tx Packet (p/s)</span></div>
                                    <button type="button" data-edit-interface="ether1"><strong data-interface-name="ether1">↔ ether1-internet</strong><span>Ethernet</span><span>1500</span><span>1500</span><span>1588</span><span>0 bps</span><span>0 bps</span><span>0</span></button>
                                    <button type="button" data-edit-interface="ether2"><strong data-interface-name="ether2">↔ ether2-vlan</strong><span>Ethernet</span><span>1500</span><span>1500</span><span>1588</span><span>0 bps</span><span>0 bps</span><span>0</span></button>
                                    <button type="button" data-edit-interface="ether3"><strong data-interface-name="ether3">↔ ether3-local</strong><span>Ethernet</span><span>1500</span><span>1500</span><span>1588</span><span>0 bps</span><span>0 bps</span><span>0</span></button>
                                    <div><strong>↔ ether4</strong><span>Ethernet</span><span>1500</span><span>1500</span><span>1588</span><span>0 bps</span><span>0 bps</span><span>0</span></div><div><strong>↔ ether5</strong><span>Ethernet</span><span>1500</span><span>1500</span><span>1588</span><span>0 bps</span><span>0 bps</span><span>0</span></div><div><strong>↔ wlan1</strong><span>Wireless</span><span>1500</span><span>1500</span><span>1600</span><span>0 bps</span><span>0 bps</span><span>0</span></div>
                                </div><footer>6 items · Klik interface untuk melihat properti</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--small" data-window="edit" hidden aria-label="Ubah nama interface">
                                <header><span data-edit-title>Interface</span><span class="ch2-window-controls"><button type="button" data-minimize="edit" aria-label="Minimalkan editor">_</button><button type="button" data-close="edit" aria-label="Tutup editor">×</button></span></header>
                                <div class="ch2-window-tabs"><b>General</b><span>Status</span><span>Traffic</span></div><div class="ch2-window-content"><label>Name <input data-interface-input type="text" autocomplete="off"></label><label>Type <input value="Ethernet" readonly></label><div class="ch2-window-actions"><button type="button" data-save-interface>OK</button><button type="button" data-save-interface>Apply</button></div></div>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--list" data-window="vlan" hidden aria-label="Daftar VLAN MikroTik">
                                <header><span>Interface List</span><span class="ch2-window-controls"><button type="button" data-minimize="vlan" aria-label="Minimalkan VLAN">_</button><button type="button" data-close="vlan" aria-label="Tutup VLAN">×</button></span></header>
                                <div class="ch2-window-tabs ch2-window-tabs--interfaces"><button type="button" data-open-window="interfaces">Interface</button><span>Interface List</span><span>Ethernet</span><span>EoIP Tunnel</span><span>IP Tunnel</span><span>GRE Tunnel</span><b>VLAN</b><span>VXLAN</span><span>VRRP</span><span>Bonding</span><span>LTE</span></div>
                                <div class="ch2-window-toolbar ch2-window-toolbar--icons"><button type="button" data-new-vlan="auto" aria-label="Tambah VLAN" title="Tambah VLAN">＋</button><button type="button" data-vlan-tool="remove" aria-label="Hapus" title="Hapus">−</button><button type="button" data-vlan-tool="enable" aria-label="Aktifkan" title="Aktifkan">✓</button><button type="button" data-vlan-tool="disable" aria-label="Nonaktifkan" title="Nonaktifkan">×</button><button type="button" data-vlan-tool="comment" aria-label="Komentar" title="Komentar">▤</button><button type="button" data-vlan-tool="filter" aria-label="Filter" title="Filter">▽</button><input type="search" placeholder="Find" aria-label="Cari VLAN"><span>all</span></div>
                                <div class="ch2-table ch2-vlan-table"><div class="ch2-table__head"><span></span><span>#</span><span>Name</span><span>Type</span><span>MTU</span><span>Actual MTU</span><span>L2 MTU</span><span>VLAN ID</span><span>Interface</span><span>Tx</span><span>Rx</span><span>FP Tx</span><span>FP Rx</span></div><div data-vlan-row="student" hidden><span>◇</span><span>0</span><strong>vlan1-siswa</strong><span>VLAN</span><span>1500</span><span>1500</span><span>1588</span><span>10</span><span>ether2-vlan</span><span>0 bps</span><span>0 bps</span><span>0 bps</span><span>0 bps</span></div><div data-vlan-row="teacher" hidden><span>◇</span><span>1</span><strong>vlan2-guru</strong><span>VLAN</span><span>1500</span><span>1500</span><span>1588</span><span>20</span><span>ether2-vlan</span><span>0 bps</span><span>0 bps</span><span>0 bps</span><span>0 bps</span></div><p data-vlan-empty>Belum ada VLAN. Klik + untuk menambahkan.</p></div><footer data-vlan-count>0 items</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--small" data-window="vlan-edit" hidden aria-label="Form VLAN baru">
                                <header><span>New Interface VLAN</span><span class="ch2-window-controls"><button type="button" data-minimize="vlan-edit" aria-label="Minimalkan form VLAN">_</button><button type="button" data-close="vlan-edit" aria-label="Tutup form VLAN">×</button></span></header>
                                <div class="ch2-vlan-edit-layout"><div class="ch2-vlan-edit-main"><div class="ch2-window-tabs"><b>General</b><span>Status</span><span>Traffic</span></div><div class="ch2-window-content"><label>Name <input data-vlan-name type="text" autocomplete="off"></label><label>Type <input value="VLAN" readonly></label><label>MTU <input value="1500" readonly></label><label>Actual MTU <input value="1500" readonly></label><label>L2 MTU <input value="1588" readonly></label><label>VLAN ID <input data-vlan-id type="number" min="1" max="4094"></label><label>Interface <select data-vlan-parent><option value="">Pilih interface</option><option>ether1-internet</option><option>ether2-vlan</option><option>ether3-local</option></select></label></div></div><div class="ch2-vlan-edit-actions"><button type="button" data-save-vlan>OK</button><button type="button" data-close="vlan-edit">Cancel</button><button type="button" data-save-vlan>Apply</button><button type="button" data-vlan-tool="disable">Disable</button><button type="button" data-vlan-tool="comment">Comment</button><button type="button" data-vlan-tool="copy">Copy</button><button type="button" data-close="vlan-edit">Remove</button></div></div>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--medium" data-window="wan" hidden aria-label="DHCP Client WAN">
                                <header><span>IP / DHCP Client</span><span class="ch2-window-controls"><button type="button" data-minimize="wan" aria-label="Minimalkan DHCP Client">_</button><button type="button" data-close="wan" aria-label="Tutup DHCP Client">×</button></span></header>
                                <div class="ch2-window-toolbar"><span>＋ New DHCP Client</span></div><div class="ch2-window-content"><label>Interface <select data-wan-interface><option value="">Pilih interface WAN</option><option>ether1-internet</option><option>ether2-vlan</option><option>ether3-local</option><option>wlan1</option></select></label><div class="ch2-window-actions"><button type="button" data-save-wan>OK</button><button type="button" data-save-wan>Apply</button></div><p class="ch2-window-status">Status: <b data-wan-status>belum terhubung</b></p></div><footer>DHCP Client menerima konfigurasi dari ISP</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--list" data-window="addresses" hidden aria-label="IP Addresses MikroTik">
                                <header><span>IP / Addresses</span><span class="ch2-window-controls"><button type="button" data-minimize="addresses" aria-label="Minimalkan IP Addresses">_</button><button type="button" data-close="addresses" aria-label="Tutup IP Addresses">×</button></span></header>
                                <div class="ch2-window-toolbar"><span>＋ New Address</span><small>Contoh: vlan1-siswa → 192.168.40.1/24</small></div><div class="ch2-address-form"><label>Address <input data-address-input type="text" inputmode="decimal" placeholder="192.168.40.1/24" autocomplete="off"></label><label>Interface <select data-address-interface><option value="">Pilih interface</option><option>ether3-local</option><option>vlan1-siswa</option><option>vlan2-guru</option><option>wlan1</option></select></label><button type="button" data-save-address>＋ Tambahkan</button></div>
                                <div class="ch2-address-reference"><b>Lembar skenario:</b> ether3-local 192.168.100.1/24 · vlan1-siswa 192.168.40.1/24 · vlan2-guru 192.168.60.1/24 · wlan1 192.168.20.1/24</div>
                                <div class="ch2-table ch2-address-table"><div class="ch2-table__head"><span>#</span><span>Address</span><span>Network</span><span>Interface</span></div><div data-address-row="local" hidden><span>0</span><strong>192.168.100.1/24</strong><span>192.168.100.0</span><span>ether3-local</span></div><div data-address-row="student" hidden><span>1</span><strong>192.168.40.1/24</strong><span>192.168.40.0</span><span>vlan1-siswa</span></div><div data-address-row="teacher" hidden><span>2</span><strong>192.168.60.1/24</strong><span>192.168.60.0</span><span>vlan2-guru</span></div><div data-address-row="wireless" hidden><span>3</span><strong>192.168.20.1/24</strong><span>192.168.20.0</span><span>wlan1</span></div></div><footer data-address-count>0 items</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--list" data-window="dhcp" hidden aria-label="DHCP Server MikroTik">
                                <header><span>IP / DHCP Server</span><span class="ch2-window-controls"><button type="button" data-minimize="dhcp" aria-label="Minimalkan DHCP Server">_</button><button type="button" data-close="dhcp" aria-label="Tutup DHCP Server">×</button></span></header>
                                <div class="ch2-window-tabs"><b>DHCP</b><span>Networks</span><span>Leases</span></div><div class="ch2-window-toolbar"><span>DHCP Setup</span><small>Addresses to Give Out harus satu subnet dengan gateway</small></div><div class="ch2-address-form"><label>Interface <select data-pool-interface><option value="">Pilih VLAN</option><option>vlan1-siswa</option><option>vlan2-guru</option><option>ether1-internet</option></select></label><label>Addresses to Give Out <input data-pool-range type="text" placeholder="192.168.40.10-192.168.40.50" autocomplete="off"></label><button type="button" data-save-pool>＋ Jalankan setup</button></div><div class="ch2-table"><div class="ch2-table__head"><span>#</span><span>Interface</span><span>Pool</span><span>Gateway</span></div><div data-pool-row="student" hidden><span>0</span><strong>vlan1-siswa</strong><span data-pool-display="student">—</span><span>192.168.40.1</span></div><div data-pool-row="teacher" hidden><span>1</span><strong>vlan2-guru</strong><span data-pool-display="teacher">—</span><span>192.168.60.1</span></div></div><footer data-pool-count>0 items</footer>
                            </section>

                            <section class="winbox-child ch2-window ch2-window--list" data-window="clients" hidden aria-label="Pengujian DHCP klien">
                                <header><span>IP / DHCP Server / Leases</span><span class="ch2-window-controls"><button type="button" data-minimize="clients" aria-label="Minimalkan Leases">_</button><button type="button" data-close="clients" aria-label="Tutup Leases">×</button></span></header>
                                <div class="ch2-window-toolbar"><span>Uji dua PC pada segmen masing-masing</span></div><div class="ch2-client-list"><article data-client="student"><div><b>PC Siswa · VLAN 10</b><small>Gateway 192.168.40.1</small></div><span data-client-ip="student">Belum mendapat IP</span><button type="button" data-request-ip="student">Minta alamat</button></article><article data-client="teacher"><div><b>PC Guru · VLAN 20</b><small>Gateway 192.168.60.1</small></div><span data-client-ip="teacher">Belum mendapat IP</span><button type="button" data-request-ip="teacher">Minta alamat</button></article></div><footer>Periksa bahwa IP PC siswa dan guru berbeda subnet</footer>
                            </section>

                            <div class="winbox-taskbar ch2-taskbar" data-taskbar aria-label="Jendela WinBox diminimalkan"></div>
                        </div>
                    </div>
                    <footer class="routeros__status">48:A9:8A:1C:01:01 · RouterOS 7.14.2 <span>CPU 2% &nbsp; Memory 32 MiB</span></footer>
                </div>
            </div><span class="simulation-monitor__stand"></span></div>
            </section>
            <aside class="lab-guide ch2-guide" aria-label="Petunjuk misi">
                <div class="lab-guide__header"><span aria-hidden="true">▤</span><div><small>PETUNJUK MISI</small><h2>Yang perlu dilakukan</h2></div></div>
                <ol data-guide-list><li>Dengarkan arahan Pak Amat.</li><li>Pelajari konsep VLAN.</li><li>Buat VLAN siswa dan guru di WinBox.</li></ol>
                <p class="ch2-guide__feedback" data-feedback role="status" aria-live="polite">Identity dan Interfaces tetap bisa dibuka melalui menu di kiri WinBox.</p>
                <button class="ch2-task-back" type="button" data-previous hidden>← Tahap sebelumnya</button>
                <div class="lab-guide__note"><b>Materi modul</b><p data-module-section>Chapter 2 · VLAN, IP, DHCP</p></div>
                <img src="{{ asset('images/asset/char/siswa/cewe/tugas.png') }}" alt="" aria-hidden="true" decoding="async">
            </aside>
            </div>
        </main>
    </div>
</div>

<dialog class="ch2-learning-dialog" data-learning-dialog aria-labelledby="ch2-learning-title"><button type="button" class="ch2-dialog-close" data-close-learning aria-label="Tutup penjelasan">×</button><div class="ch2-learning-body" data-learning-body></div><button type="button" class="ch2-task-button" data-learning-continue>Mulai praktik →</button></dialog>
<template data-concept="vlan"><span class="ch2-modal-kicker">PAK AMAT · MATERI SEBELUM PRAKTIK</span><h2 id="ch2-learning-title">Apa itu VLAN?</h2><p>VLAN adalah cara memisahkan jaringan secara <b>logis</b> pada jalur fisik menuju switch. Pada lab sekolah, siswa memakai VLAN ID 10 dan guru VLAN ID 20. Keduanya dibuat di atas interface <b>ether2-vlan</b>, tetapi perangkatnya berada di segmen berbeda.</p><img class="ch2-topology" src="{{ asset('images/asset/chapter-two-topology.svg') }}" alt="Internet masuk ke router hAP; VLAN 10 siswa dan VLAN 20 guru melalui switch" width="1100" height="560"><p class="ch2-modal-note">Selanjutnya buka Interfaces → VLAN, lalu tambahkan vlan1-siswa dan vlan2-guru.</p></template>
<template data-concept="wan"><span class="ch2-modal-kicker">PAK AMAT · MATERI DHCP CLIENT</span><h2 id="ch2-learning-title">Router menerima alamat dari ISP</h2><p><b>DHCP Client</b> dipasang pada sisi WAN, yaitu <b>ether1-internet</b>. Ia meminta IP dan parameter jaringan dari penyedia. Ini berbeda dengan DHCP Server yang nanti membagikan alamat ke PC siswa dan guru.</p><p class="ch2-modal-note">Buka IP → DHCP Client, pilih ether1-internet, lalu periksa statusnya.</p></template>
<template data-concept="addresses"><span class="ch2-modal-kicker">PAK AMAT · MATERI IP GATEWAY</span><h2 id="ch2-learning-title">Setiap segmen butuh gateway</h2><p>Gateway adalah alamat router di dalam subnet klien. Pasangkan IP pada interface yang sesuai: lokal <b>192.168.100.1/24</b>, siswa <b>192.168.40.1/24</b>, guru <b>192.168.60.1/24</b>, dan wireless <b>192.168.20.1/24</b>.</p><p class="ch2-modal-note">Buka IP → Addresses. Jangan tertukar antara interface dan alamatnya.</p></template>
<template data-concept="dhcp"><span class="ch2-modal-kicker">PAK AMAT · MATERI DHCP SERVER</span><h2 id="ch2-learning-title">Bagikan alamat secara otomatis</h2><p><b>DHCP Server</b> melayani klien pada segmen lokal. Pool siswa harus berada di subnet 192.168.40.0/24, misalnya <b>192.168.40.10–192.168.40.50</b>. Pool guru harus di subnet 192.168.60.0/24. Alamat gateway .1 tidak boleh ikut dibagikan.</p><p class="ch2-modal-note">Buka IP → DHCP Server dan jalankan setup pada kedua VLAN.</p></template>
<template data-concept="verify"><span class="ch2-modal-kicker">PAK AMAT · PENGUJIAN</span><h2 id="ch2-learning-title">Cek hasil dari sisi klien</h2><p>Konfigurasi belum selesai sampai kita memastikan PC siswa mendapat IP 192.168.40.x dan PC guru mendapat IP 192.168.60.x. Gateway masing-masing harus sama dengan alamat router pada segmennya.</p><p class="ch2-modal-note">Buka Leases / Klien lalu minta alamat pada kedua PC.</p></template>
<template data-concept="recap"><span class="ch2-modal-kicker">PAK AMAT · KERJA BAGUS!</span><h2 id="ch2-learning-title">Jaringan sekolah sudah terbagi rapi</h2><p>VLAN siswa dan guru terbentuk, DHCP Client WAN terhubung, gateway terpasang, dan kedua klien memperoleh alamat dari pool yang tepat. Kamu sudah memahami hubungan antarbagian konfigurasi ini.</p><p class="ch2-modal-note">Sekarang jawab lima soal evaluasi agar Chapter 2 tersimpan sebagai selesai.</p></template>

<dialog class="ch2-learning-dialog ch2-quiz-dialog" data-quiz-dialog aria-labelledby="ch2-quiz-title"><button type="button" class="ch2-dialog-close" data-close-quiz aria-label="Tutup evaluasi">×</button><span class="ch2-modal-kicker">EVALUASI PEMAHAMAN · CHAPTER 02</span><h2 id="ch2-quiz-title">Cek pemahaman VLAN, IP dan DHCP</h2><p>Jawab lima soal berdasarkan materi modul. Semua jawaban harus tepat agar progres Chapter 2 tersimpan di akun.</p><form data-quiz-form>@foreach ($questions as $question)<fieldset><legend><b>{{ $loop->iteration }}.</b> {{ $question['question'] }}</legend><div>@foreach ($question['options'] as $option)<label><input type="radio" name="answer-{{ $loop->parent->iteration }}" value="{{ $loop->index }}" required><span>{{ $option }}</span></label>@endforeach</div></fieldset>@endforeach<button class="ch2-task-button" type="submit" data-submit-quiz>Simpan hasil Chapter 2</button></form></dialog>
<dialog class="ch2-learning-dialog ch2-finish-dialog" data-finish-dialog aria-labelledby="ch2-finish-title"><img src="{{ asset($teacherPath.'mantap.png') }}" alt="Pak Amat memberi apresiasi"><span class="ch2-modal-kicker">PAK AMAT · CHAPTER 02 SELESAI</span><h2 id="ch2-finish-title">Hebat! Jaringan sekolah sudah tersegmentasi.</h2><p>VLAN, gateway, DHCP Client, dan DHCP Server telah bekerja. PC siswa dan guru mendapat alamat yang sesuai. Ini bekal untuk menyiapkan akses internet pada chapter berikutnya.</p><div><a class="ch2-task-button" href="{{ route('adventure') }}#chapter-03">Lihat peta chapter →</a><button type="button" class="ch2-task-back" data-close-finish>Kembali ke WinBox</button></div></dialog>
@include('game-music-player')
</body>
</html>
