(() => {
    'use strict';
    const navbar = document.querySelector('.chapter-navbar, .game-navbar');
    if (!navbar) return;
    const phone = window.matchMedia('(pointer: coarse) and (max-width: 599px), (pointer: coarse) and (max-height: 599px) and (max-width: 1000px)');
    const control = document.createElement('button');
    control.type = 'button'; control.className = 'device-fullscreen';
    control.setAttribute('data-device-fullscreen', '');
    control.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
    const status = document.createElement('div'); status.className = 'device-layout-notice'; status.hidden = true; status.setAttribute('role', 'status');
    document.body.append(status);
    const active = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const update = () => {
        control.hidden = !phone.matches;
        control.setAttribute('aria-label', active() ? 'Keluar layar penuh' : 'Layar penuh');
        control.title = active() ? 'Keluar layar penuh' : 'Layar penuh';
        control.setAttribute('aria-pressed', String(active()));
    };
    let noticeTimer;
    const notify = (message) => { status.textContent = message; status.hidden = false; window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { status.hidden = true; }, 6500); };
    control.addEventListener('click', async () => {
        control.disabled = true;
        try {
            if (active()) {
                const exit = document.exitFullscreen || document.webkitExitFullscreen;
                if (exit) await exit.call(document);
            } else {
                const page = document.documentElement;
                const enter = page.requestFullscreen || page.webkitRequestFullscreen;
                if (!enter) { notify('Browser ini belum mendukung layar penuh. Putar HP ke landscape; kamu juga bisa menambahkan web ke Layar Utama lewat menu browser.'); return; }
                await enter.call(page);
                if (screen.orientation?.lock) {
                    try { await screen.orientation.lock('landscape'); } catch { /* Manual rotation remains available when orientation locking is unsupported. */ }
                }
            }
        } catch { notify('Layar penuh belum diizinkan browser. Coba lagi atau putar HP ke landscape untuk area praktik yang lebih luas.'); }
        finally { control.disabled = false; update(); }
    });
    navbar.append(control);
    phone.addEventListener('change', update);
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    update();
})();
