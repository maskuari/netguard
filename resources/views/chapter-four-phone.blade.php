<section class="ch4-phone-area" data-phone-area hidden aria-label="Pengujian HP sekolah">
    <button type="button" class="ch4-phone-back" data-return-router>← Kembali ke PC · WinBox</button>
    <div class="ch4-phone"><header><span>09:15</span><span class="ch4-phone-camera" aria-hidden="true"></span><span><span data-phone-signal aria-label="Wi-Fi belum terhubung">▱</span> ▰</span></header>
        <div class="ch4-phone-content">
            <section class="ch4-phone-home" data-phone-screen="home">
                <div class="ch4-phone-clock"><b>09:15</b><span>HP lab sekolah</span><small data-phone-home-status>Belum terhubung ke Wi-Fi</small></div>
                <div class="ch4-phone-apps"><button type="button" data-phone-open-wifi><span aria-hidden="true">⚙</span>Pengaturan</button><button type="button" data-phone-open-browser><span aria-hidden="true">◎</span>Browser</button></div>
            </section>
            <section data-phone-screen="wifi" hidden>
            <div class="ch4-settings-header"><button type="button" data-phone-settings-back aria-label="Kembali dari pengaturan Wi-Fi">‹</button><h2>Wi-Fi</h2></div>
            <label class="ch4-wifi-toggle"><span>Gunakan Wi-Fi<small>Temukan dan hubungkan ke jaringan</small></span><input type="checkbox" data-phone-wifi-toggle checked role="switch"></label>
            <p data-phone-scan role="status">Mencari jaringan yang tersedia…</p>
            <div class="ch4-phone-progress" data-phone-progress role="status" aria-live="polite" hidden><span class="ch4-phone-spinner" aria-hidden="true"></span><span data-phone-progress-text></span></div>
            <button type="button" class="ch4-network" data-phone-network hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></svg><b data-phone-ssid></b><small data-phone-network-state>Diamankan · WPA/WPA2 PSK</small><span class="ch4-network-arrow" aria-hidden="true">›</span></button>
            <form class="ch4-wifi-connect" data-wifi-connect aria-label="Hubungkan ke jaringan Wi-Fi" hidden>
                <span class="ch4-wifi-sheet-label">HUBUNGKAN KE JARINGAN</span><h3 data-wifi-connect-ssid></h3>
                <label>Password<input type="password" data-wifi-password autocomplete="off" aria-describedby="wifi-connect-status"></label>
                <label class="ch4-show-password"><input type="checkbox" data-wifi-show-password>Tampilkan password</label>
                <p id="wifi-connect-status" data-wifi-connect-status role="status" aria-live="polite"></p>
                <div class="ch4-wifi-connect-actions"><button type="button" data-wifi-cancel>Batal</button><button type="submit">Hubungkan</button></div>
            </form>
            <p data-phone-status role="status">Belum terhubung ke Wi-Fi.</p>
            <button type="button" data-phone-forget hidden>Lupakan jaringan</button>
            </section>
            <section class="ch4-phone-browser" data-phone-browser data-phone-screen="browser" hidden>
                <div class="ch4-address-bar" data-browser-toolbar><button type="button" data-phone-browser-back aria-label="Kembali dari browser">‹</button><span aria-hidden="true">ⓘ</span><span data-portal-address></span><button type="button" data-browser-new-tab aria-label="Buka tab baru">+</button><button type="button" class="ch4-browser-tab-count" data-browser-tabs aria-label="Lihat tab terbuka" aria-expanded="false">1</button><span aria-hidden="true">⋮</span></div>
                <section class="ch4-browser-tabs" data-browser-tab-overview aria-label="Tab browser yang terbuka" hidden>
                    <header><h3>Tab terbuka</h3><button type="button" data-browser-overview-new-tab>+ Tab baru</button></header>
                    <div class="ch4-browser-tab-list" data-browser-tab-list></div>
                </section>
                <section class="ch4-google-home" data-browser-google aria-label="Halaman awal Google" hidden>
                    <div class="ch4-google-links"><span>Semua</span><span>Gambar</span><span aria-hidden="true">⠿</span></div>
                    <div class="ch4-google-wordmark" aria-label="Google"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>
                    <label class="ch4-google-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" placeholder="Telusuri Google" aria-label="Telusuri Google" autocomplete="off"><span aria-hidden="true">🎙</span></label>
                    <p>Google tersedia dalam: <span>Indonesia</span></p>
                    <footer>Indonesia</footer>
                </section>
                <div class="ch4-portal-loading" data-portal-loading role="status" aria-live="polite" hidden><span class="ch4-phone-spinner" aria-hidden="true"></span><span>Memuat halaman login…</span></div>
                <div class="ch4-browser-error" data-phone-browser-error role="status" aria-live="polite" hidden>
                    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 4h20l8 8v32H10ZM30 4v10h8M17 25l4 4m0-4-4 4m10-4 4 4m0-4-4 4M18 36h12"/></svg>
                    <h3 data-browser-error-title>Tidak ada koneksi internet</h3>
                    <p data-browser-error-description>Hubungkan HP ke Wi-Fi, lalu muat ulang halaman ini.</p>
                    <small data-browser-error-code>ERR_INTERNET_DISCONNECTED</small>
                    <div class="ch4-browser-error-actions"><button type="button" data-phone-browser-reload>Muat ulang</button><button type="button" data-phone-browser-wifi>Buka Wi-Fi</button></div>
                </div>
                <div class="ch4-default-portal" data-portal-content>
                    <div class="ch4-default-portal__wrap">
                        <div class="ch4-default-portal__logo" aria-label="MikroTik">MikroTik<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 24A21 21 0 0 0 24 3M3 16A13 13 0 0 0 16 3M3 8A5 5 0 0 0 8 3"/></svg></div>
                        <h3 data-portal-heading hidden></h3>
                        <form data-phone-login>
                            <p class="ch4-default-portal__info">Please log in to use the internet hotspot service</p>
                            <label class="ch4-default-portal__field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3Z"/></svg><input data-phone-user name="username" placeholder="Username" aria-label="Username" autocomplete="off"></label>
                            <label class="ch4-default-portal__field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="8" r="5"/><path d="m11 12 9 9m-4-4 3-3m-6 0 3-3"/></svg><input type="password" name="password" data-phone-password placeholder="Password" aria-label="Password" autocomplete="off"></label>
                            <p class="ch4-default-portal__error" data-portal-error role="alert" hidden></p>
                            <button type="submit">Connect</button>
                        </form>
                        <div data-phone-session hidden><p data-session-details></p><button type="button" data-phone-logout>Log out</button></div>
                        <p class="ch4-default-portal__powered">Powered by MikroTik RouterOS</p>
                    </div>
                </div>
            </section>
        </div>
        <nav class="ch4-phone-navigation" aria-label="Navigasi HP"><button type="button" data-phone-back aria-label="Kembali di HP">‹</button><button type="button" data-phone-home aria-label="Layar utama HP">○</button><button type="button" data-phone-wifi-shortcut aria-label="Buka Wi-Fi HP">Wi-Fi</button></nav>
    </div>
</section>
<section class="ch4-notepad" data-notepad hidden aria-label="Notepad login.html"><header>login.html — Notepad<button type="button" data-close-notepad aria-label="Tutup Notepad">×</button></header><div class="ch4-notepad-menubar">File　 Edit　 Format　 View　 Help</div><textarea data-login-html spellcheck="false" aria-label="Isi file login.html"></textarea><footer><button type="button" data-save-html>Simpan · Ctrl+S</button><span data-notepad-status></span></footer></section>
<button type="button" class="ch4-hp-launcher" data-open-phone>▯ HP uji · Wi-Fi sekolah</button>
