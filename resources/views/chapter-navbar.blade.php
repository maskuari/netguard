<header class="lab-header chapter-navbar">
    <a class="lab-back" href="{{ route('adventure') }}" data-home-back aria-label="Kembali ke beranda chapter" title="Beranda chapter"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg></a>
    <img class="lab-logo" src="{{ asset('images/logo/logo.png') }}" alt="NetGuard Academy" width="55" height="55" decoding="async">
    <div class="lab-heading"><span>NETGUARD ACADEMY · ADVENTURE MODE</span><strong>Lab Chapter {{ str_pad((string) $chapterNumber, 2, '0', STR_PAD_LEFT) }}</strong><small>{{ $chapterSubtitle }}</small></div>
    <div class="lab-hud"><span>PROGRES MISI</span><strong data-mission-count data-progress-label>0 / 5</strong><progress data-progress value="0" max="5" aria-label="Progres misi chapter">0 dari 5 misi</progress></div>
    <button class="chapter-step-back" type="button" data-step-back aria-label="Kembali ke langkah sebelumnya" title="Langkah sebelumnya"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h9a7 7 0 0 1 7 7v4"/></svg><span class="chapter-step-back__label">Langkah sebelumnya</span></button>
    <button class="lab-save-progress" type="button" data-save-progress data-save aria-label="Simpan progres" title="Simpan progres" aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h12l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8M14 5v2"/></svg><span class="lab-save-progress__label">Simpan Progres</span></button>
    <details class="lab-settings"><summary aria-label="Pengaturan audio" title="Pengaturan audio"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/></svg></summary><div class="lab-settings__panel">@include('game-music-settings')</div></details>
    <img class="lab-avatar" src="{{ asset($student->profileAvatarPath()) }}" alt="{{ $student->name }}" title="{{ $student->name }}" width="49" height="49" decoding="async">
</header>
<div class="chapter-home-confirm" data-home-confirm hidden>
    <div class="chapter-home-confirm__backdrop" data-home-confirm-close></div>
    <section class="chapter-home-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="chapter-home-confirm-title" aria-describedby="chapter-home-confirm-text">
        <div class="chapter-home-confirm__icon" aria-hidden="true">↩</div>
        <span class="chapter-home-confirm__eyebrow">KELUAR DARI CHAPTER</span>
        <h2 id="chapter-home-confirm-title">Kembali ke beranda?</h2>
        <p id="chapter-home-confirm-text">Progres yang belum disimpan akan hilang. Simpan progres terlebih dahulu jika ingin melanjutkannya nanti.</p>
        <div class="chapter-home-confirm__actions">
            <button type="button" class="chapter-home-confirm__cancel" data-home-confirm-close>Tetap di sini</button>
            <button type="button" class="chapter-home-confirm__leave" data-home-confirm-leave>Kembali ke beranda</button>
        </div>
    </section>
</div>
