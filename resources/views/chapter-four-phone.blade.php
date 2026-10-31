<section class="ch4-phone-area" data-phone-area hidden aria-label="Pengujian HP sekolah">
    <button type="button" class="ch4-phone-back" data-return-router>← Kembali ke PC · WinBox</button>
    <div class="ch4-phone"><header><span>09:15</span><span class="ch4-phone-camera" aria-hidden="true"></span><span><span data-phone-signal aria-label="Wi-Fi belum terhubung">▱</span> ▰</span></header>
        <div class="ch4-phone-content">
            <section class="ch4-phone-home" data-phone-screen="home">
                <div class="ch4-phone-clock"><b>09:15</b><span>HP lab sekolah</span><small data-phone-home-status>Belum terhubung ke Wi-Fi</small></div>
                <div class="ch4-phone-apps"><button type="button" data-phone-open-wifi><span aria-hidden="true">⚙</span>Pengaturan Wi-Fi</button><button type="button" data-phone-open-browser><span aria-hidden="true">◎</span>Browser</button></div>
            </section>
            <section data-phone-screen="wifi" hidden>
            <h2>Wi-Fi</h2><p>Pilih jaringan sekolah</p>
            <label class="ch4-wifi-toggle">Gunakan Wi-Fi<input type="checkbox" data-phone-wifi-toggle checked role="switch"></label>
            <p data-phone-scan role="status">Mencari jaringan yang tersedia…</p>
            <div class="ch4-phone-progress" data-phone-progress role="status" aria-live="polite" hidden><span class="ch4-phone-spinner" aria-hidden="true"></span><span data-phone-progress-text></span></div>
            <button type="button" class="ch4-network" data-phone-network hidden><span>◉</span><b data-phone-ssid></b><small>Diamankan · WPA/WPA2 PSK</small></button>
            <form data-wifi-connect hidden><label>Password Wi-Fi<input type="password" data-wifi-password autocomplete="off"></label><button type="submit">Connect</button></form>
            <p data-phone-status role="status">Belum terhubung ke Wi-Fi.</p>
            <button type="button" data-phone-forget hidden>Lupakan jaringan / hubungkan ulang</button>
            <button type="button" class="ch4-open-portal" data-phone-signin hidden>Login ke jaringan · Buka portal HotSpot →</button>
            </section>
            <section class="ch4-phone-browser" data-phone-browser data-phone-screen="browser" hidden>
                <div class="ch4-address-bar"><span aria-hidden="true">ⓘ</span><span data-portal-address></span><span aria-hidden="true">⋮</span></div>
                <div class="ch4-portal-loading" data-portal-loading role="status" aria-live="polite" hidden><span class="ch4-phone-spinner" aria-hidden="true"></span><span>Memuat halaman login…</span></div>
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
