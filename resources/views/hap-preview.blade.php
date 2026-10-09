<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#061b45">
        <title>Uji Putar MikroTik hAP — NetGuard Academy</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/asset/alat/hap16frame.png') }}">
        <link rel="stylesheet" href="{{ asset('css/hap-preview.css') }}?v={{ filemtime(public_path('css/hap-preview.css')) }}">
        <script src="{{ asset('js/hap-preview.js') }}?v={{ filemtime(public_path('js/hap-preview.js')) }}" defer></script>
    </head>
    <body>
        <main class="preview-shell">
            <header class="preview-header">
                <a class="back-link" href="{{ route('home') }}" aria-label="Kembali ke halaman awal">
                    <span aria-hidden="true">←</span> Kembali
                </a>
                <div class="preview-brand">
                    <img src="{{ asset('images/logo/logo.png') }}" alt="" width="44" height="44">
                    <span>NetGuard <strong>Academy</strong></span>
                </div>
                <span class="preview-tag">UJI ASET</span>
            </header>

            <section class="preview-content" aria-labelledby="preview-title">
                <div class="preview-copy">
                    <span class="eyebrow"><span class="eyebrow-dot"></span> 16 FRAME · PUTAR 360°</span>
                    <h1 id="preview-title">Kenali perangkat <span>MikroTik hAP</span></h1>
                    <p>Geser perangkat ke kiri atau kanan untuk melihat setiap sisinya. Gunakan tombol panah atau putar otomatis untuk memeriksa urutan frame.</p>
                    <div class="preview-facts" aria-label="Informasi aset">
                        <div><strong>16</strong><span>Sudut pandang</span></div>
                        <div><strong>360°</strong><span>Satu putaran</span></div>
                        <div><strong>4 × 4</strong><span>Grid gambar</span></div>
                    </div>
                    <p class="asset-note">Sumber gambar: <code>asset/alat/hap16frame.png</code></p>
                </div>

                <div class="viewer" id="hap-viewer">
                    <div class="viewer-heading"><span class="live-dot"></span> Tampilan perangkat <span class="viewer-label">DRAG TO ROTATE</span></div>
                    <div class="viewer-stage">
                        <div class="viewer-orbit viewer-orbit--outer" aria-hidden="true"></div>
                        <div class="viewer-orbit viewer-orbit--inner" aria-hidden="true"></div>
                        <canvas id="hap-canvas" width="900" height="650" tabindex="0" role="img" aria-label="MikroTik hAP, geser ke kiri atau kanan untuk memutar perangkat" data-sprite="{{ asset('images/asset/alat/hap16frame.png') }}"></canvas>
                        <span class="drag-hint" aria-hidden="true"><span>↔</span> Geser untuk memutar</span>
                        <p class="viewer-status" id="viewer-status" role="status">Menyiapkan gambar perangkat…</p>
                    </div>
                    <div class="viewer-controls">
                        <button class="step-button" id="frame-prev" type="button" aria-label="Sudut sebelumnya" disabled>←</button>
                        <label class="frame-scrubber">
                            <span>Sudut <output id="frame-count" for="frame-range">01 / 16</output></span>
                            <input id="frame-range" type="range" min="0" max="15" value="0" aria-label="Pilih sudut perangkat" disabled>
                        </label>
                        <button class="step-button" id="frame-next" type="button" aria-label="Sudut berikutnya" disabled>→</button>
                        <button class="autoplay-button" id="frame-autoplay" type="button" aria-pressed="false" disabled><span aria-hidden="true">▶</span> Putar otomatis</button>
                    </div>
                </div>
            </section>
            <footer class="preview-footer">NetGuard Academy · Viewer aset Chapter 1</footer>
        </main>
    </body>
</html>
