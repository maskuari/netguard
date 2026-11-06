@php
    $student = auth()->user();
    $briefing = $scenario['briefing'];
@endphp
<!DOCTYPE html>
<html lang="id" data-page="practice">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Practice Mode — NetGuard Academy</title>
    <link rel="icon" href="{{ asset('images/logo/logo.png') }}">
    @foreach (['welcome', 'game-music', 'chapter-one', 'chapter-two-workbench', 'chapter-four-workbench', 'lab-pc-desktop', 'chapter-navbar', 'chapter-step-guide', 'chapter-five-workbench', 'practice'] as $stylesheet)
        <link rel="stylesheet" href="{{ asset('css/'.$stylesheet.'.css') }}?v={{ filemtime(public_path('css/'.$stylesheet.'.css')) }}">
    @endforeach
    <script src="{{ asset('js/practice-simulator.js') }}?v={{ filemtime(public_path('js/practice-simulator.js')) }}" defer></script>
    <script src="{{ asset('js/practice.js') }}?v={{ filemtime(public_path('js/practice.js')) }}" defer></script>
</head>
<body>
<div class="academy-scene chapter-one-scene ch2-scene ch3-scene ch4-scene ch5-scene practice-scene" data-practice data-check-url="{{ route('practice.check', $scenario['id']) }}" data-new-url="{{ route('practice') }}" data-user-id="{{ $student->id }}" data-assets="{{ asset('images') }}">
    <div class="lab-scroll">
        <header class="lab-header chapter-navbar practice-navbar">
            <a class="lab-back" href="{{ route('homepage') }}" aria-label="Kembali ke beranda"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></a>
            <img class="lab-logo" src="{{ asset('images/logo/logo.png') }}" alt="NetGuard Academy" width="55" height="55">
            <div class="lab-heading"><span>NETGUARD ACADEMY · PRACTICE MODE</span><strong>Latihan Mandiri</strong><small>Satu studi kasus · satu misi</small></div>
            <div class="practice-case-badge"><small>SUMBER KETERAMPILAN</small><b>Chapter {{ str_pad((string) $scenario['chapter'], 2, '0', STR_PAD_LEFT) }}</b></div>
            <button class="chapter-step-back" type="button" data-case-open><span>Studi kasus</span></button>
            <details class="lab-settings"><summary aria-label="Pengaturan audio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/></svg></summary><div class="lab-settings__panel">@include('game-music-settings')</div></details>
            <img class="lab-avatar" src="{{ asset($student->profileAvatarPath()) }}" alt="{{ $student->name }}" width="49" height="49">
        </header>
        <main class="lab-main"><div class="ch2-workspace ch5-workspace practice-layout">
            <section class="practice-host" data-practice-host aria-label="Lab latihan mandiri">
                @include('lab-pc-desktop')
                <div class="practice-winbox" data-practice-winbox>
                    <header class="ch2-winbox-titlebar"><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" width="17" height="17" alt=""><span data-session-title></span></span><span class="ch2-window-chrome"><button type="button" data-app-minimize aria-label="Minimalkan WinBox">−</button><button type="button" data-app-restore aria-label="Pulihkan atau maksimalkan WinBox">□</button><button type="button" data-session-exit aria-label="Tutup sesi WinBox">×</button></span></header>
                    <div class="routeros__menubar"><button type="button" data-top-menu="Session">Session</button><button type="button" data-top-menu="Settings">Settings</button><button type="button" data-top-menu="Dashboard">Dashboard</button></div>
                    <div class="routeros__toolbar"><button type="button" data-undo title="Undo">↶</button><button type="button" data-redo title="Redo">↷</button><button type="button" data-safe-mode>Safe Mode</button><span>Session: <span data-session-mac></span></span><small class="routeros__connected"><i></i></small></div>
                    <div class="practice-router-body"><nav class="ch2-nav ch5-nav" data-practice-nav aria-label="Menu WinBox"></nav><div class="practice-desktop" data-practice-desktop></div></div>
                    <footer class="practice-router-footer"><span data-board-title></span><span>CPU: 2%　Memory: 32 MiB　Uptime: 00:04:32</span></footer>
                </div>
                <section class="practice-physical ch5-connection-stage" data-physical hidden aria-label="Praktik kabel dan perangkat"></section>
                <section class="practice-phone-screen" data-phone hidden aria-label="HP uji"></section>
                <div class="practice-toast" data-practice-notice role="status" hidden></div>
                <button class="practice-submit" type="button" data-practice-submit hidden aria-haspopup="dialog" aria-controls="practice-submit-confirm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span>Selesaikan jawaban</span></button>
            </section>
            <aside class="lab-guide ch2-guide ch5-guide practice-guide" aria-label="Petunjuk studi kasus">
                <div class="lab-guide__header"><span aria-hidden="true">▤</span><div><small>STUDI KASUS</small><h2>Kebutuhan jaringan</h2></div></div>
                <div class="practice-clues"><small>CHAPTER {{ $scenario['chapter'] }} · SATU MISI</small><h3>{{ $scenario['title'] }}</h3><p>{{ $briefing['assignment'] }}</p><details class="practice-initial-summary"><summary>Kondisi awal perangkat</summary><p>{{ $briefing['initial'] }}</p></details><h4>Target yang diminta</h4><ul>@foreach ($briefing['requirements'] as $clue)<li>{{ $clue }}</li>@endforeach</ul><h4>Hasil yang harus tercapai</h4><p>{{ $briefing['outcome'] }}</p></div>
                <p class="practice-guide-note">Baca ulang dialog lewat <b>Studi kasus</b>. Simpan konfigurasi, lalu tekan <b>Selesaikan jawaban</b> ketika sudah siap diperiksa.</p>
            </aside>
        </div></main>
    </div>
</div>
<dialog class="ch2-dialogue-overlay practice-case-dialog" data-case-dialog data-teacher-base="{{ asset('images/asset/char/guru/bapak Amat') }}" aria-labelledby="practice-case-title" aria-describedby="practice-briefing-text">
    <button type="button" class="chapter-step-back practice-briefing-back" data-case-previous disabled>← Sebelumnya</button>
    <img class="ch2-dialogue-overlay__teacher" data-briefing-teacher-image src="{{ asset('images/asset/char/guru/bapak Amat/menugaskan.png') }}" alt="Pak Amat, guru TKJ" decoding="async">
    <div class="ch2-dialogue-overlay__card" data-case-start role="button" tabindex="0" aria-label="Lanjutkan penjelasan Pak Amat">
        <div class="ch2-dialogue-overlay__content">
            <span>PAK AMAT · GURU TKJ</span>
            <h2 id="practice-case-title" class="practice-case-name">{{ $scenario['title'] }} · <b data-briefing-heading>Studi kasus</b></h2>
            <p id="practice-briefing-text" data-briefing-text>{{ $briefing['context'] }}</p>
            <small data-briefing-count>KLIK DI MANA SAJA UNTUK LANJUT</small>
        </div>
    </div>
</dialog>
<dialog class="practice-confirm-dialog" id="practice-submit-confirm" data-submit-confirm aria-labelledby="practice-submit-title"><h2 id="practice-submit-title">Jawaban sudah selesai?</h2><p>Konfigurasi yang tersimpan akan diperiksa. Setelah dikumpulkan, hasil soal ini tidak bisa diubah.</p><div class="practice-dialog-actions"><button type="button" class="ch2-task-back" data-submit-cancel>Periksa lagi</button><button type="button" class="ch2-task-button" data-submit-send>Ya, selesaikan jawaban</button></div><p data-submit-error role="alert"></p></dialog>
<dialog class="practice-result-dialog" data-practice-result aria-labelledby="practice-result-title"><small>HASIL PRACTICE</small><h2 id="practice-result-title" data-result-title></h2><p data-result-description></p><ul data-result-errors></ul><div class="practice-dialog-actions"><a class="ch2-task-back" href="{{ route('homepage') }}">Kembali</a><a class="ch2-task-button" href="{{ route('practice', ['previous' => $scenario['id']]) }}">Coba lagi · soal baru →</a></div></dialog>
<script type="application/json" id="practice-scenario">@json($scenario)</script>
@include('game-music-player')
</body>
</html>
