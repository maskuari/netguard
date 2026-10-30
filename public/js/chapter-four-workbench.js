(() => {
    'use strict';
    const scene = document.querySelector('.ch4-scene');
    if (!scene) return;
    const model = window.NetGuardChapterFour;
    const parameters = model.parameters;
    const names = Object.keys(parameters.profiles);
    const stages = ['wireless', 'security', 'hotspot', 'connect', 'portal', 'profiles', 'users'];
    const key = 'netguard.chapter-four.v1.' + scene.dataset.userId;
    const defaultPortalHtml = [
        '<!DOCTYPE html>', '<html>', '<head>', '    <meta charset="utf-8">', '    <title>Internet hotspot - Log in</title>', '    <meta name="viewport" content="width=device-width, initial-scale=1">', '    <style>', '        body { font-family: Arial, sans-serif; color: #737373; background: white; }', '        table { margin: auto; font-size: 14px; }', '        td { padding: 4px; }', '        input { border: 1px solid #bbbbbb; padding: 4px; }', '    </style>', '</head>', '<body>', '', '$(if chap-id)', '<form name="sendin" action="$(link-login-only)" method="post">', '    <input type="hidden" name="username">', '    <input type="hidden" name="password">', '    <input type="hidden" name="dst" value="$(link-orig)">', '    <input type="hidden" name="popup" value="true">', '</form>', '$(endif)', '', '<div align="center">', '<form name="login" action="$(link-login-only)" method="post">', '    <input type="hidden" name="dst" value="$(link-orig)">', '    <input type="hidden" name="popup" value="true">', '    <p>Please log on to use the internet hotspot service</p>', '    <table>', '        <tr><td>login</td><td><input name="username" value="$(username)"></td></tr>', '        <tr><td>password</td><td><input name="password" type="password"></td></tr>', '        <tr><td></td><td><input type="submit" value="OK"></td></tr>', '    </table>', '</form>', '$(if error)<p>$(error)</p>$(endif)', '<p>Powered by MikroTik RouterOS</p>', '</div>', '</body>', '</html>',
    ].join('\n');
    const fresh = () => ({ stage: 'intro', prologueComplete: false, wireless: { enabled: false, mode: 'station', ssid: 'MikroTik', security: 'default' }, security: null, hotspot: null, initialLogin: false, phoneConnected: false, portalHtml: defaultPortalHtml, portalVerified: false, exported: false, edited: false, uploaded: false, profiles: {}, users: {}, verified: {}, actions: {}, answers: [] });
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    const state = { ...fresh(), ...saved };
    if (!saved || (!state.edited && !state.uploaded && (state.portalHtml === defaultPortalHtml || state.portalHtml.includes('<!-- HotSpot login -->')))) state.portalHtml = defaultPortalHtml;
    const inherited = window.NetGuardRouterConfiguration?.read(scene.dataset.userId);
    window.NetGuardRouterConfiguration?.bind(scene);
    if (!['intro', ...stages, 'quiz', 'finish'].includes(state.stage)) state.stage = 'intro';
    const windows = new Map([...document.querySelectorAll('[data-window]')].map((node) => [node.dataset.window, node]));
    const surface = scene.querySelector('.lab-scroll');
    const overlay = document.querySelector('[data-ch2-dialogue]');
    const prologue = document.querySelector('[data-ch2-prologue]');
    const learning = document.querySelector('[data-learning-dialog]');
    const quiz = document.querySelector('[data-quiz-dialog]');
    const finish = document.querySelector('[data-finish-dialog]');
    const evaluation = window.NetGuardEvaluation;
    let dialogueTimer = null, dialogueCallback = null, dialogueFullText = '', returnFocus = null;
    let prologueIndex = 0, prologueTimer = null, prologueTyping = false, replaying = false;
    let revision = 0, announced = null, completionTimer = null, nextLesson = null, topLayer = 20;
    let wirelessTab = 'interfaces', radioTab = 'general', securityTab = 'general', hotspotTab = 'Servers', selectedWlan = false;
    let selectedSecurity = false, activeWirelessTool = null, advancedRadio = false;
    let profileTab = 'general', userTab = 'general', selectedHotspot = null, userDraftDisabled = false;
    let hotspotDetail = null;
    let selectedInterface = null;
    let setupStep = 0, setupDraft = [], setupConfirmed = Boolean(state.hotspotConfirmed), session = null, downloadedHtml = state.desktopHtml || state.portalHtml;
    let editingProfile = null, editingUser = null, editingInitialUser = false;
    let phoneScreen = 'home', phoneWifiEnabled = true;
    const field = (name) => document.querySelector('[data-field="' + name + '"]');
    const value = (name) => field(name).value.trim();
    const open = (name) => !windows.get(name).hidden;
    const action = (name) => Boolean(state.actions[state.stage]?.[name]);
    const persist = () => { try { state.answers = [...document.querySelectorAll('[data-quiz-form] input:checked')].map((node) => Number(node.value)); localStorage.setItem(key, JSON.stringify(state)); return true; } catch { return false; } };
    const message = (text, kind = '') => { const node = document.querySelector('[data-feedback]'); node.textContent = text; node.dataset.kind = kind; if (kind) window.NetGuardAudio?.play(kind === 'error' ? 'error' : 'correct'); };
    const updateBackAvailability = () => window.NetGuardChapterNavbar.setBackEnabled(prologue.hidden || prologueIndex > 0);
    const say = (text, callback = null) => {
        window.clearInterval(dialogueTimer); dialogueCallback = callback; dialogueFullText = text; returnFocus = document.activeElement;
        surface.inert = true; overlay.hidden = false; updateBackAvailability();
        const body = overlay.querySelector('[data-dialogue-text]'); body.textContent = '';
        overlay.querySelector('[data-dialogue-count]').textContent = 'KLIK DI MANA SAJA UNTUK LANJUT';
        overlay.querySelector('[data-ch2-dialogue-next]').focus({ preventScroll: true });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { body.textContent = text; dialogueTimer = null; return; }
        let position = 0;
        dialogueTimer = window.setInterval(() => { position += 3; body.textContent = text.slice(0, position); if (position >= text.length) { window.clearInterval(dialogueTimer); dialogueTimer = null; } }, 20);
    };
    const explainError = (text) => { window.NetGuardAudio?.play('error'); say(text); };
    const advanceDialogue = () => {
        if (overlay.hidden) return;
        if (dialogueTimer !== null) { window.clearInterval(dialogueTimer); dialogueTimer = null; overlay.querySelector('[data-dialogue-text]').textContent = dialogueFullText; return; }
        overlay.hidden = true; surface.inert = false;
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        const callback = dialogueCallback; dialogueCallback = null; callback?.(); render();
    };
    overlay.addEventListener('click', (event) => { if (event.target.closest('[data-step-back]')) return; advanceDialogue(); });
    document.addEventListener('keydown', (event) => { if (!overlay.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); advanceDialogue(); } });
    const done = (stage) => ({
        wireless: model.wirelessValid(state), security: model.wifiReady(state), hotspot: model.hotspotValid(state) && setupConfirmed,
        connect: state.initialLogin && model.wifiReady(state) && model.hotspotValid(state),
        portal: state.uploaded && state.portalVerified && model.loginHtmlValid(state.portalHtml),
        profiles: names.every((name) => model.profileValid(state, name)),
        users: names.every((name) => model.userValid(state, name) && state.verified[name]) && state.actions.users?.['active:review'],
    })[stage] || false;
    const info = {
        wireless: ['Aktifkan wireless dan atur SSID', 'Kita akan membuka WiFi sekolah agar HP dapat menemukan jaringan. Aktifkan wlan1, ubah mode menjadi ap bridge, lalu beri nama jaringan sesuai pilihanmu.', 'SSID adalah nama WiFi yang tampil di HP. Mode ap bridge membuat wlan1 melayani perangkat sebagai access point. Nama SSID bebas dipilih; isi 1–32 byte, lalu ingat nama tersebut untuk menghubungkan HP. Pengaturan IP dan DHCP yang sudah kamu simpan sebelumnya tetap dipertahankan; tahap ini mengatur radio dan keamanan WiFi.'],
        security: ['Amankan WiFi sekolah', 'Sekarang kita beri password untuk bergabung ke WiFi. Buat Security Profile dengan nama dan password pilihanmu, lalu terapkan profile tersebut pada wlan1. Password ini berbeda dari akun HotSpot yang akan kita buat.', 'Security Profile menyimpan mode dan metode keamanan WiFi. Nama profile bebas, asalkan tidak kosong dan bukan default yang sudah tersedia. Pilih mode dynamic keys, centang WPA PSK serta WPA2 PSK, lalu isi kedua pre-shared key dengan password pilihanmu (8–63 karakter). HP memakai WPA2 Pre-Shared Key untuk tersambung. Setelah disimpan, pilih nama profile buatanmu pada Security Profile wlan1. Membuat profile saja belum menerapkannya pada WiFi.'],
        hotspot: ['Jalankan HotSpot Setup', 'WiFi sudah punya password. Berikutnya kita siapkan halaman login HotSpot pada wlan1. Tentukan sendiri DNS Name untuk alamat portalnya. Username dan password akun awal bebas kamu tentukan.', 'HotSpot meminta autentikasi setelah perangkat masuk ke WiFi. Buka IP → Hotspot → Servers → Hotspot Setup. Pilih wlan1, pertahankan nilai bawaan wizard, isi DNS Name dengan nama portal pilihanmu, lalu buat username dan password akun HotSpot awal pilihanmu. Password WiFi dan akun portal memiliki fungsi berbeda.'],
        connect: ['Hubungkan HP dan login HotSpot', 'Sekarang gunakan HP uji. Pilih SSID yang sudah kamu buat, masukkan password WPA2 WiFi tersebut, lalu login pada portal memakai akun HotSpot awal yang kamu buat. Kita periksa IP HP dan sesi login yang terbentuk.', 'HP harus bergabung ke WiFi dahulu sebelum membuka portal. Setelah terhubung, DHCP memberikan IP 192.168.20.x. Browser portal meminta username dan password HotSpot. Gunakan username dan password yang kamu simpan pada Create local HotSpot user. Akun ini dipakai untuk login portal, bukan untuk mengisi password WiFi.'],
        portal: ['Ubah halaman login sekolah', 'Kita tambahkan sambutan sekolah pada halaman login. Ambil hotspot/login.html dari Files ke desktop, buka dengan Notepad, simpan perubahannya, lalu unggah kembali. Setelah itu hubungkan ulang HP untuk melihat hasilnya.', 'File hotspot/login.html berada di router. Klik tombol □ pada judul utama WinBox untuk mengecilkan jendela agar desktop terlihat, lalu seret file ke desktop. Tombol − menyembunyikan WinBox, jadi tidak dipakai saat menyeret file. Klik kanan login.html → Open with Notepad. Tepat di bawah <div align="center"> tambahkan <h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>. Simpan dengan Ctrl+S, lalu seret kembali login.html ke File List untuk mengganti file router. Sambungkan ulang WiFi HP agar halaman baru dibuka.'],
        profiles: ['Buat User Profiles HotSpot', 'Kepala sekolah, guru, dan siswa memiliki batas akses yang berbeda. Kita buat tiga User Profile agar tiap akun mendapat batas pengguna dan kecepatan yang sesuai.', 'Shared Users adalah jumlah sesi bersamaan untuk satu akun. Rate Limit rx/tx membatasi laju trafik profile. Buat kepalasekolah: Shared Users 1, Rate Limit 512k/512k; guru: 10, 256k/256k; siswa: 5, 128k/128k. Profile baru berlaku pada akun yang memilihnya.'],
        users: ['Buat dan uji akun HotSpot', 'Kita buat dulu akun kepala sekolah, guru, dan siswa. Setelah ketiganya tersimpan, baru kita coba login bergantian dari HP. Terakhir, kita buka tab Active untuk melihat akun yang sedang tersambung.', 'Buka IP → Hotspot → Users, lalu buat tiga akun dengan profile masing-masing: kepalasekolah/123, guru/456, dan siswa/789. Setelah semua akun tersimpan, coba login dari HP satu per satu. Sebelum mengganti akun, klik Log out pada HP. Biarkan akun terakhir tetap login, lalu buka IP → Hotspot → Active. Tab Active menunjukkan sesi yang sedang aktif saat itu; karena kita memakai satu HP, hanya akun yang terakhir login yang terlihat. Semua akun tersimpan tetap dapat dilihat pada tab Users.'],
    };
    const closeMenus = () => document.querySelectorAll('[data-ch2-submenu]').forEach((node) => { node.hidden = true; });
    const record = (name) => { state.actions[state.stage] = { ...state.actions[state.stage], [name]: true }; persist(); render(); };
    const openWindow = (name) => {
        const node = windows.get(name); if (!node) return;
        closeMenus(); node.hidden = false; node.style.zIndex = String(++topLayer);
        const menuName = ['wireless', 'wireless-edit', 'security-edit', 'wireless-tool'].includes(name) ? 'wireless' : name;
        document.querySelectorAll('.ch2-nav > button').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.openWindow === menuName || (button.dataset.ch2Menu === 'ip' && ['hotspot', 'hotspot-setup', 'profile-edit', 'user-edit', 'addresses', 'wan', 'dns', 'firewall', 'routes'].includes(name)));
        });
        document.querySelector('[data-taskbar] [data-restore="' + name + '"]')?.remove();
        record('open:' + name);
    };
    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow)));
    const saveInheritedInternet = (patch) => {
        try {
            const storageKey = 'netguard.chapter-three.v1.' + scene.dataset.userId;
            const previous = JSON.parse(localStorage.getItem(storageKey) || '{}');
            localStorage.setItem(storageKey, JSON.stringify({ ...previous, ...patch }));
            Object.assign(inherited, patch);
            pc.setNetwork(Boolean(inherited.wan.bound && inherited.wan.defaultRoute && inherited.nat && !inherited.nat.disabled));
            renderInheritedInternet(); render();
        } catch { explainError('Perubahan belum dapat disimpan di browser ini. Konfigurasi sebelumnya tetap dipertahankan.'); }
    };
    const renderInheritedInternet = () => {
        if (!inherited) return;
        document.querySelectorAll('[data-dns-server]').forEach((input) => { input.value = inherited.dns.servers[Number(input.dataset.dnsServer)] || ''; });
        document.querySelector('[data-dns-second]').hidden = inherited.dns.servers.length < 2;
        document.querySelector('[data-dns-remote]').checked = inherited.dns.remote;
        document.querySelector('[data-nat-row]').hidden = !inherited.nat;
        document.querySelector('[data-nat-row]').classList.toggle('is-disabled', Boolean(inherited.nat?.disabled));
        document.querySelector('[data-nat-count]').textContent = inherited.nat ? '1 item' : '0 items';
        document.querySelector('[data-inherited-nat-action]').textContent = inherited.nat?.action || '';
        document.querySelector('[data-inherited-nat-chain]').textContent = inherited.nat?.chain || '';
        document.querySelector('[data-inherited-nat-out]').textContent = inherited.nat?.out || '';
        document.querySelector('[data-nat-packets]').textContent = String(inherited.nat?.packets || 0);
        document.querySelector('[data-nat-bytes]').textContent = (inherited.nat?.packets || 0) * 64 + ' B';
        document.querySelectorAll('[data-nat-tool]').forEach((button) => { button.disabled = !inherited.nat; });
    };
    document.querySelectorAll('[data-firewall-tab]').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('[data-firewall-panel]').forEach((panel) => { panel.hidden = panel.dataset.firewallPanel !== button.dataset.firewallTab; });
        document.querySelectorAll('[data-firewall-tab]').forEach((tab) => tab.classList.toggle('is-active', tab === button));
    }));
    document.querySelector('[data-add-dns-server]').addEventListener('click', () => { document.querySelector('[data-dns-second]').hidden = false; });
    document.querySelectorAll('[data-save-dns]').forEach((button) => button.addEventListener('click', () => {
        if (!inherited) return;
        const servers = [...document.querySelectorAll('[data-dns-server]')].map((input) => input.value.trim()).filter(Boolean);
        if (servers.some((server) => !/^\d{1,3}(\.\d{1,3}){3}$/.test(server) || server.split('.').some((part) => Number(part) > 255))) return explainError('Isi Servers dengan alamat IP server DNS yang valid.');
        saveInheritedInternet({ dns: { ...inherited.dns, servers, remote: document.querySelector('[data-dns-remote]').checked } });
        if (button.dataset.saveDns === 'ok') windows.get('dns').hidden = true;
    }));
    document.querySelectorAll('[data-nat-tool]').forEach((button) => button.addEventListener('click', () => {
        if (!inherited?.nat) return;
        saveInheritedInternet({ nat: button.dataset.natTool === 'remove' ? null : { ...inherited.nat, disabled: button.dataset.natTool === 'disable' } });
    }));
    renderInheritedInternet();
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => { windows.get(button.dataset.close).hidden = true; guide.refresh(); }));
    document.querySelectorAll('[data-maximize]').forEach((button) => button.addEventListener('click', () => windows.get(button.dataset.maximize).classList.toggle('is-maximized')));
    document.querySelectorAll('[data-minimize]').forEach((button) => button.addEventListener('click', () => {
        const name = button.dataset.minimize; windows.get(name).hidden = true;
        if (!document.querySelector('[data-taskbar] [data-restore="' + name + '"]')) {
            const restore = document.createElement('button'); restore.type = 'button'; restore.dataset.restore = name; restore.textContent = windows.get(name).querySelector('header > span').textContent;
            restore.addEventListener('click', () => openWindow(name)); document.querySelector('[data-taskbar]').append(restore);
        }
    }));
    windows.forEach((node) => { if (node.classList.contains('ch2-window--list')) node.classList.add('is-maximized'); node.addEventListener('pointerdown', () => { node.style.zIndex = String(++topLayer); }); });
    document.querySelectorAll('[data-ch2-menu]').forEach((button) => button.addEventListener('click', () => {
        const menu = document.querySelector('[data-ch2-submenu="' + button.dataset.ch2Menu + '"]'); if (!menu) return;
        const wasHidden = menu.hidden; closeMenus(); menu.hidden = !wasHidden; button.setAttribute('aria-expanded', String(wasHidden));
    }));
    document.addEventListener('click', (event) => { if (!event.target.closest('.ch2-nav')) closeMenus(); });
    const phone = document.querySelector('[data-phone-area]');
    const app = document.querySelector('.ch2-routeros');
    const pc = window.NetGuardPcDesktop.create({ onOpenWinbox: () => { phone.hidden = true; app.hidden = false; app.classList.remove('is-app-restored'); syncFileDesktop(); }, onHome: () => { phone.hidden = true; document.querySelector('.ch2-workbench').classList.remove('ch4-file-mode'); closeMenus(); record('desktop'); }, getNetwork: () => {
        const lan = inherited?.dhcp.find((item) => item.group === 'local' && !item.disabled);
        if (!lan || !inherited.addresses.some((item) => item.group === 'local' && !item.disabled)) return null;
        return { address: inherited.leases.local?.address || lan.pool.split('-')[0], gateway: lan.gateway };
    }, onError: explainError });
    pc.setAvailable(true); pc.setNetwork(inherited ? Boolean(inherited.wan.bound && inherited.wan.defaultRoute && inherited.nat && !inherited.nat.disabled) : false);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => {
        app.hidden = true; pc.showDesktop();
    }));
    const syncFileDesktop = () => {
        const restored = app.classList.contains('is-app-restored');
        document.querySelector('.ch2-workbench').classList.toggle('ch4-file-mode', restored);
        document.querySelector('[data-pc-desktop]').hidden = !restored;
    };
    document.querySelector('[data-ch2-app-size]').addEventListener('click', () => {
        const restored = app.classList.toggle('is-app-restored');
        if (restored) pc.showPreview(); else pc.showWinbox();
        syncFileDesktop();
    });
    const setupScreens = [
        ['Select interface to run HotSpot on', 'HotSpot Interface', 'wlan1', ['ether1-internet', 'ether3-local', 'wlan1']],
        ['Set HotSpot address for interface', 'Local Address of Network', inherited?.addresses.find((item) => item.group === 'wireless')?.address || '192.168.20.1/24'],
        ['Set pool for HotSpot addresses', 'Address Pool of Network', inherited?.dhcp.find((item) => item.group === 'wireless')?.pool || '192.168.20.2-192.168.20.254'],
        ['Select certificate', 'Select Certificate', 'none', ['none']],
        ['Select SMTP server', 'IP Address of SMTP Server', '0.0.0.0'],
        ['Setup DNS configuration', 'DNS Servers', inherited?.dns.servers.length ? inherited.dns.servers.join(',') : '8.8.8.8,8.8.4.4'],
        ['DNS name of local HotSpot server', 'DNS Name', ''],
        ['Create local HotSpot user', 'Name / Password', ''],
    ];
    const setupPaint = () => {
        const screen = setupScreens[setupStep];
        document.querySelector('[data-setup-label]').textContent = screen?.[0] || 'Setup has completed successfully';
        document.querySelector('[data-setup-field-label]').textContent = screen?.[1] || '';
        document.querySelector('[data-setup-masquerade-row]').hidden = setupStep !== 1;
        const input = document.querySelector('[data-setup-input]'), select = document.querySelector('[data-setup-select]');
        input.hidden = !screen || Boolean(screen[3]) || setupStep === 7; select.hidden = !screen?.[3];
        input.closest('label')?.classList.toggle('is-empty', !screen || setupStep === 7);
        document.querySelector('[data-setup-user-fields]')?.remove();
        if (screen?.[3]) { select.replaceChildren(...screen[3].map((text) => { const option = document.createElement('option'); option.textContent = text; return option; })); select.value = setupDraft[setupStep] || (setupStep === 0 ? screen[3][0] : screen[2]); }
        else if (screen) input.value = setupDraft[setupStep] ?? screen[2];
        if (setupStep === 7) {
            const wrapper = document.createElement('div'); wrapper.dataset.setupUserFields = '';
            for (const [label, name, type] of [['Name of Local HotSpot User', 'name', 'text'], ['Password for the User', 'password', 'password']]) { const row = document.createElement('label'); row.textContent = label; const field = document.createElement('input'); field.type = type; field.dataset.setupCredential = name; field.value = setupDraft[7]?.[name] || (name === 'name' ? 'admin' : ''); row.append(field); wrapper.append(row); }
            windows.get('hotspot-setup').querySelector('.ch2-window-content').append(wrapper);
        }
        document.querySelector('[data-setup-back]').disabled = setupStep === 0 || setupStep === 8;
        document.querySelector('[data-setup-back]').hidden = setupStep === 8;
        document.querySelector('[data-setup-cancel]').hidden = setupStep === 8;
        document.querySelector('[data-setup-next]').textContent = setupStep === 8 ? 'OK' : 'Next';
        guide.refresh();
    };
    const phoneNetwork = () => {
        const subnet = inherited?.addresses.find((item) => item.group === 'wireless' && !item.disabled);
        const dhcp = inherited?.dhcp.find((item) => item.group === 'wireless' && !item.disabled);
        const pool = state.hotspot?.pool || dhcp?.pool || '192.168.20.2-192.168.20.254';
        return { address: inherited?.leases.wireless?.address || pool.split('-')[0], gateway: dhcp?.gateway || subnet?.address.split('/')[0] || '192.168.20.1', mac: '02:4E:47:00:00:01' };
    };
    const guidePlan = () => {
        const shared = parameters.profiles;
        if (state.stage === 'wireless') return [
            ['Klik Wireless pada menu kiri WinBox. Pada tab WiFi Interfaces, klik baris wlan1 satu kali untuk memilihnya.', action('wlan:selected') || model.wirelessValid(state)],
            ['Klik tombol centang ✓ di atas tabel untuk mengaktifkan wlan1. Huruf X (disabled) pada baris harus hilang.', state.wireless.enabled],
            ['Klik dua kali baris wlan1. Pada jendela Interface <wlan1>, klik tab Wireless.', action('radio:wireless') || model.wirelessValid(state)],
            ['Pada tab Wireless, pilih Mode ap bridge. Isi SSID dengan nama WiFi pilihanmu, lalu klik OK. SSID ini yang nanti dipilih pada HP.', model.wirelessValid(state)],
        ];
        if (state.stage === 'security') return [
            ['Klik Wireless → tab Security Profiles, lalu tombol + untuk membuat profile baru.', action('open:security-edit') || model.securityValid(state)],
            ['Isi Name dengan nama Security Profile pilihanmu. Pilih Mode dynamic keys. Centang WPA PSK dan WPA2 PSK. Isi kedua Pre-Shared Key dengan password pilihanmu (8–63 karakter). Klik OK. Jika ada koreksi Pak Amat, perbaiki kolom yang disebutkan.', model.securityValid(state)],
            ['Kembali ke tab WiFi Interfaces. Klik dua kali wlan1, lalu tab Wireless. Pilih Security Profile yang tadi kamu buat dan klik OK. Profile harus diterapkan, bukan hanya dibuat.', model.wifiReady(state)],
        ];
        if (state.stage === 'hotspot') return [
            ['Klik IP → Hotspot. Pada tab Servers, klik Hotspot Setup. Wizard dimulai dari HotSpot Interface.', action('open:hotspot-setup') || model.hotspotValid(state)],
            ...setupScreens.map((screen, index) => [index === 6 ? 'Pada DNS Name, ketik nama portal pilihanmu lalu klik Next. Gunakan nama tanpa spasi, http://, atau /login. Nama ini akan tampil sebagai alamat halaman login di HP.' : index === 7 ? 'Pada Create local HotSpot user, isi Name dengan username pilihanmu dan tentukan Password, lalu klik Next. Ingat akun ini untuk login melalui browser HP.' : 'Pada layar ' + screen[0] + ', ' + (index === 0 ? 'pilih wlan1' : 'pertahankan ' + screen[1] + ': ' + screen[2]) + ', lalu klik Next. Jika belum hijau, pastikan tombol Next pada wizard yang diklik.', model.hotspotValid(state) || setupStep > index]),
            ['Setelah Setup has completed successfully tampil, klik OK. Baris hotspot1 akan terlihat di tabel Servers.', model.hotspotValid(state) && setupConfirmed],
        ];
        if (state.stage === 'connect') return [
            ['Klik HP uji · Wi-Fi sekolah di dekat taskbar. Pada layar utama HP, buka Pengaturan Wi-Fi. Pastikan Gunakan Wi-Fi menyala, lalu pilih jaringan dengan SSID yang kamu buat di WinBox.', action('phone:network') || state.initialLogin],
            ['Isi Password Wi-Fi sesuai WPA2 Pre-Shared Key yang kamu simpan, lalu klik Connect. Periksa HP menerima IP ' + phoneNetwork().address + ' dan gateway ' + phoneNetwork().gateway + '. Portal ' + (state.hotspot?.dnsName || 'pilihanmu') + ' terbuka setelah WiFi terhubung.', state.phoneConnected || state.initialLogin],
            ['Pada browser HP, isi username dan password akun awal yang tadi kamu buat pada HotSpot Setup, lalu klik Log in. Ini akun HotSpot, bukan password WiFi. Status sesi akan muncul setelah autentikasi berhasil.', state.initialLogin],
        ];
        if (state.stage === 'portal') return [
            ['Klik Kembali ke PC · WinBox jika HP terbuka. Buka Files pada menu kiri. Klik □ pada judul utama WinBox untuk mengecilkan jendelanya, lalu seret hotspot/login.html ke desktop yang terlihat di belakang WinBox.', state.exported],
            ['Klik Desktop PC di taskbar. Klik kanan file login.html, lalu pilih Open with Notepad. Pada layar sentuh klik file untuk menampilkan pilihan yang sama.', action('notepad:open') || state.edited],
            ['Di Notepad, cari <div align="center">. Tepat di bawahnya tambahkan <h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>. Tekan Ctrl+S atau klik Simpan.', state.edited],
            ['Tutup Notepad. Klik WinBox pada taskbar, buka Files, dan klik □ pada judul WinBox agar desktop terlihat. Seret file login.html dari desktop ke tabel File List. Konfirmasi penggantian file ketika diminta.', state.uploaded && model.loginHtmlValid(state.portalHtml)],
            ['Buka HP uji. Klik Wi-Fi pada navigasi bawah HP, lalu Lupakan jaringan / hubungkan ulang. Pilih SSID buatanmu, masukkan password WPA2 WiFi yang kamu simpan dan Connect lagi. Pastikan browser kini menampilkan sambutan sekolah sebelum login.', state.portalVerified && state.uploaded],
        ];
        if (state.stage === 'profiles') return names.flatMap((name) => [
            ['Klik IP → Hotspot → tab User Profiles, lalu tombol + untuk profile ' + name + '.', model.profileValid(state, name) || (open('profile-edit') && editingProfile === name)],
            ['Isi Name ' + name + ', Shared Users ' + shared[name].shared + ', Rate Limit ' + shared[name].rate + ', lalu klik OK. Shared Users membatasi sesi bersamaan per akun; Rate Limit membatasi kecepatannya.', model.profileValid(state, name)],
        ]);
        if (state.stage === 'users') return [
            ...names.map((name) => ['Klik IP → Hotspot → Users → +. Buat Name ' + name + ', Password ' + shared[name].password + ', pilih Profile ' + name + ', lalu klik OK.', model.userValid(state, name)]),
            ...names.map((name) => ['Buka HP uji. Jika akun sebelumnya masih login, klik Log out. Masuk dengan Username ' + name + ' dan Password ' + shared[name].password + ', lalu klik Log in. Pastikan detail sesi menunjukkan Profile ' + name + '.', Boolean(state.verified[name])]),
            ['Setelah mencoba ketiga akun, biarkan akun terakhir tetap login. Kembali ke WinBox, buka IP → Hotspot → Active, lalu klik baris akun yang sedang login. Active menampilkan sesi yang tersambung sekarang; dengan satu HP, hanya akun yang terakhir login yang muncul. Daftar semua akun ada di tab Users.', action('active:review')],
        ];
        return [[state.stage === 'intro' ? 'Ikuti arahan Pak Amat sebelum membangun WiFi sekolah.' : state.stage === 'quiz' ? 'Jawab lima soal, lalu klik Simpan hasil Chapter 4.' : 'Chapter 4 selesai. Kembali ke peta untuk melihat progres.', state.stage === 'finish']];
    };
    const guide = window.NetGuardStepGuide.create({ list: document.querySelector('[data-guide-list]'), root: scene, getKey: () => state.stage + ':' + revision, getPlan: guidePlan });
    const paintHotspot = () => {
        const table = document.querySelector('[data-hotspot-table]'), network = phoneNetwork();
        const hotspotRecord = (id, values) => ({ id, values });
        const records = {
            Servers: state.hotspot ? [hotspotRecord('hotspot1', ['hotspot1', state.hotspot.interface, 'hs-pool-1', 'hsprof1', '00:05:00', '2'])] : [],
            'Server Profiles': [hotspotRecord('default', ['default', '0.0.0.0', '', 'hotspot', '0.0.0.0:0']), ...(state.hotspot ? [hotspotRecord('hsprof1', ['hsprof1', state.hotspot.address?.split('/')[0] || network.gateway, state.hotspot.dnsName, 'hotspot', '0.0.0.0:0'])] : [])],
            'User Profiles': [hotspotRecord('default', ['default', '', 'none', '1', '']), ...names.filter((name) => state.profiles[name]).map((name) => hotspotRecord(name, [name, state.profiles[name].options?.sessionTimeout || '', state.profiles[name].options?.idleTimeout || 'none', state.profiles[name].shared, state.profiles[name].rate]))],
            Users: [...(state.hotspot && !state.hotspot.userRemoved && !Object.hasOwn(state.users, state.hotspot.user) ? [hotspotRecord(state.hotspot.user, ['all', state.hotspot.user, '', '', 'default', '00:00:00', '0 B', '0 B'])] : []), ...names.filter((name) => Object.hasOwn(state.users, name)).map((name) => hotspotRecord(name, [state.users[name].server || 'all', name, state.users[name].options?.address || '', state.users[name].options?.mac || '', state.users[name].profile, state.users[name].stats?.uptime || '00:00:00', state.users[name].stats?.bytesIn || '0 B', state.users[name].stats?.bytesOut || '0 B']))],
            Active: session ? [hotspotRecord(session.name, ['hotspot1', session.name, network.address, network.mac, '00:00:01', '00:00:00', ''])] : [],
            Hosts: state.phoneConnected ? [hotspotRecord('phone', [network.mac, network.address, network.address, 'hotspot1', '00:00:01', '00:00:00'])] : [],
            'IP Bindings': [], 'Service Ports': [], 'Walled Garden': [], 'Walled Garden IP List': [], Cookies: [],
        }[hotspotTab] || [];
        const headers = { Servers: ['Name', 'Interface', 'Address Pool', 'Profile', 'Idle Timeout', 'Addresses Per MAC'], 'Server Profiles': ['Name', 'HotSpot Address', 'DNS Name', 'HTML Directory', 'HTTP Proxy'], 'User Profiles': ['Name', 'Session Timeout', 'Idle Timeout', 'Shared Users', 'Rate Limit (rx/tx)'], Users: ['Server', 'Name', 'Address', 'MAC Address', 'Profile', 'Uptime', 'Bytes In', 'Bytes Out'], Active: ['Server', 'User', 'Address', 'MAC Address', 'Uptime', 'Idle Time', 'Session Time Left'], Hosts: ['MAC Address', 'Address', 'To Address', 'Server', 'Uptime', 'Idle Time'], 'IP Bindings': ['MAC Address', 'Address', 'To Address', 'Server', 'Type'], 'Service Ports': ['Name', 'Ports', 'Disabled'], 'Walled Garden': ['Server', 'Method', 'Dst. Host', 'Dst. Port', 'Path', 'Action'], 'Walled Garden IP List': ['Server', 'Protocol', 'Src. Address', 'Dst. Address', 'Dst. Port', 'Action'], Cookies: ['User', 'MAC Address', 'Expires In'] }[hotspotTab];
        table.style.setProperty?.('--hotspot-columns', headers.map((name) => name === 'Name' || name === 'User' ? '160px' : name === 'MAC Address' ? '160px' : '140px').join(' '));
        const heading = document.createElement('div'); heading.className = 'ch4-table-head'; headers.forEach((text) => { const cell = document.createElement('span'); cell.textContent = text; heading.append(cell); });
        const search = document.querySelector('[data-hotspot-find]').value.toLowerCase();
        const visible = records.filter((row) => row.values.some((value) => String(value).toLowerCase().includes(search)));
        const rows = visible.map(({ id, values }) => {
            const row = document.createElement('button'); row.type = 'button'; row.className = 'ch4-data-row'; row.dataset.hotspotRecord = id;
            row.classList.toggle('is-selected', selectedHotspot === id);
            row.classList.toggle('is-disabled', Boolean(hotspotTab === 'Users' ? (Object.hasOwn(state.users, id) && state.users[id]?.disabled || (id === state.hotspot?.user && state.hotspot?.userDisabled)) : hotspotTab === 'Servers' && state.hotspot?.disabled));
            values.forEach((text) => { const cell = document.createElement('span'); cell.textContent = String(text); cell.title = String(text); row.append(cell); });
            row.addEventListener('click', () => { selectedHotspot = id; if (hotspotTab === 'Active' && session && state.verified[session.name] && names.every((name) => state.verified[name])) record('active:review'); else render(); });
            row.addEventListener('dblclick', () => { if (hotspotTab === 'User Profiles') editProfile(id); else if (hotspotTab === 'Users') editUser(id); else if (hotspotTab === 'Servers') editHotspotServer(); else if (hotspotTab === 'Server Profiles') editHotspotServerProfile(id); });
            return row;
        });
        table.replaceChildren(heading, ...rows); document.querySelector('[data-hotspot-count]').textContent = (search ? visible.length + ' of ' : '') + records.length + ' items';
        document.querySelector('[data-hotspot-setup]').hidden = hotspotTab !== 'Servers';
        document.querySelector('[data-hotspot-reset-html]').hidden = hotspotTab !== 'Servers';
        document.querySelectorAll('[data-hotspot-tool]').forEach((button) => { const tool = button.dataset.hotspotTool; button.hidden = ['reset-counters', 'reset-all-counters'].includes(tool) && hotspotTab !== 'Users'; button.disabled = !['filter', 'reset-all-counters'].includes(tool) && !selectedHotspot; });
    };
    const render = () => {
        if (inherited) window.NetGuardRouterConfiguration.render(scene, { ...inherited, extraPools: state.hotspot?.pool ? [{ name: 'hs-pool-1', range: state.hotspot.pool }] : [] }, state.wireless);
        document.querySelectorAll('[data-inherited-interface]').forEach((row) => {
            row.classList.toggle('is-selected', row.dataset.inheritedInterface === selectedInterface);
            const search = document.querySelector('[data-interface-find]').value.toLowerCase();
            const name = inherited?.interfaces.find((item) => item.id === row.dataset.inheritedInterface)?.name || '';
            row.hidden = Boolean(search && !name.toLowerCase().includes(search));
        });
        updateBackAvailability();
        const count = stages.filter(done).length;
        document.querySelector('[data-progress-label]').textContent = count + ' / ' + stages.length;
        document.querySelector('[data-progress]').max = stages.length; document.querySelector('[data-progress]').value = count;
        document.querySelector('[data-task-heading]').textContent = info[state.stage]?.[0] || 'Chapter 4';
        document.querySelector('[data-module-section]').textContent = 'Bab 4 · ' + (info[state.stage]?.[0] || 'Evaluasi');
        document.querySelector('[data-task-count]').textContent = (done(state.stage) ? '✓ Selesai' : 'Sedang dikerjakan');
        const summary = document.createElement('li'); summary.classList.toggle('is-done', done(state.stage)); summary.textContent = state.stage === 'profiles' || state.stage === 'users' ? names.map((name) => name + ': ' + parameters.profiles[name].shared + ' sesi · ' + parameters.profiles[name].rate).join(' | ') : state.stage === 'security' ? 'Security Profile: ' + (state.security?.name || 'nama bebas') + ' · dynamic keys · WPA/WPA2 PSK · password pilihanmu' : state.stage === 'hotspot' ? 'wlan1 · DNS Name: ' + (state.hotspot?.dnsName || setupDraft[6] || 'nama portal pilihanmu') + ' · Akun awal: ' + (state.hotspot?.user || setupDraft[7]?.name || 'pilihanmu') : state.stage === 'wireless' ? 'SSID saat ini: ' + state.wireless.ssid + '. Aktifkan wlan1 dan pilih mode ap bridge. Nama WiFi bebas kamu tentukan; IP dan DHCP sebelumnya tetap dipertahankan.' : 'SSID: ' + state.wireless.ssid + ' · gunakan password WiFi yang kamu buat';
        document.querySelector('[data-task-list]').replaceChildren(summary);
        document.querySelector('[data-wlan-row]').classList.toggle('is-selected', selectedWlan);
        document.querySelector('[data-wlan-row]').classList.toggle('is-disabled', !state.wireless.enabled);
        document.querySelector('[data-wlan-row]').setAttribute('aria-pressed', String(selectedWlan));
        document.querySelector('[data-wlan-flags]').textContent = state.wireless.enabled ? (state.wireless.mode === 'ap bridge' || state.phoneConnected ? 'R' : '') : 'X';
        document.querySelector('[data-ssid-row]').value = state.wireless.ssid;
        document.querySelector('[data-security-row]').value = state.wireless.security;
        document.querySelector('[data-radio-status]').value = state.wireless.enabled ? (state.wireless.mode === 'ap bridge' ? 'running-ap' : 'searching-for-network') : 'disabled';
        document.querySelector('[data-radio-clients]').value = state.phoneConnected ? '1' : '0';
        document.querySelector('[data-radio-footer]').textContent = state.wireless.enabled ? 'enabled' : 'disabled';
        document.querySelector('[data-radio-toggle]').textContent = state.wireless.enabled ? 'Disable' : 'Enable';
        document.querySelector('[data-radio-advanced]').textContent = advancedRadio ? 'Simple Mode' : 'Advanced Mode';
        document.querySelectorAll('[data-radio-advanced-field]').forEach((node) => { node.hidden = !advancedRadio; });
        document.querySelector('[data-security-record]').hidden = !state.security;
        document.querySelector('[data-security-name-row]').textContent = state.security?.name || '';
        document.querySelector('[data-security-record]').classList.toggle('is-selected', selectedSecurity);
        document.querySelectorAll('[data-remove-security]').forEach((node) => { node.disabled = !state.security || !selectedSecurity; });
        document.querySelector('[data-wireless-count]').textContent = wirelessTab === 'interfaces' ? '1 item' : wirelessTab === 'security' ? (state.security ? '2 items' : '1 item') : '0 items';
        document.querySelectorAll('[data-security-panel]').forEach((node) => { node.hidden = node.dataset.securityPanel !== securityTab; });
        document.querySelectorAll('[data-security-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.securityTab === securityTab));
        const dynamicSecurity = field('security-mode').value === 'dynamic keys';
        for (const name of ['wpa', 'wpa2']) field(name).disabled = !dynamicSecurity;
        field('wpa-key').disabled = !dynamicSecurity || !field('wpa').checked;
        field('wpa2-key').disabled = !dynamicSecurity || !field('wpa2').checked;
        document.querySelector('[data-login-file]').hidden = !state.hotspot || Boolean(state.loginFileRemoved);
        document.querySelector('[data-hotspot-directory]').hidden = !state.hotspot;
        document.querySelector('[data-login-file-size]').textContent = (encodeURIComponent(state.portalHtml).replace(/%[0-9A-F]{2}/gi, 'x').length / 1024).toFixed(1) + ' KiB';
        document.querySelector('[data-file-count]').textContent = state.hotspot ? (state.loginFileRemoved ? '1 item' : '2 items') : '0 items';
        document.querySelectorAll('[data-wireless-panel]').forEach((node) => { node.hidden = node.dataset.wirelessPanel !== wirelessTab; });
        document.querySelectorAll('[data-wireless-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.wirelessTab === wirelessTab));
        document.querySelector('[data-wireless-settings]').hidden = radioTab !== 'wireless';
        document.querySelectorAll('[data-radio-panel]').forEach((node) => { node.hidden = node.dataset.radioPanel !== radioTab; });
        for (const [kind, current] of [['profile', profileTab], ['user', userTab]]) {
            document.querySelectorAll('[data-' + kind + '-panel]').forEach((node) => { node.hidden = node.dataset[kind + 'Panel'] !== current; });
            document.querySelectorAll('[data-' + kind + '-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset[kind + 'Tab'] === current));
        }
        document.querySelector('[data-toggle-hotspot-user]').textContent = userDraftDisabled ? 'Enable' : 'Disable';
        document.querySelector('[data-user-footer]').textContent = userDraftDisabled ? 'disabled' : 'enabled';
        document.querySelector('[data-remove-hotspot="profile"]').disabled = !state.profiles[editingProfile] || editingProfile === 'default';
        document.querySelector('[data-remove-hotspot="user"]').disabled = !Object.hasOwn(state.users, editingUser) && !(editingInitialUser && state.hotspot && !state.hotspot.userRemoved);
        document.querySelectorAll('[data-radio-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.radioTab === radioTab));
        document.querySelectorAll('[data-hotspot-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.hotspotTab === hotspotTab));
        document.querySelectorAll('[data-phone-screen]').forEach((screen) => { screen.hidden = screen.dataset.phoneScreen !== phoneScreen; });
        document.querySelector('[data-phone-network]').hidden = !phoneWifiEnabled || !model.wirelessValid(state);
        document.querySelector('[data-phone-wifi-toggle]').checked = phoneWifiEnabled;
        document.querySelector('[data-phone-scan]').textContent = !phoneWifiEnabled ? 'Wi-Fi dimatikan. Aktifkan untuk mencari jaringan.' : model.wirelessValid(state) ? 'Jaringan tersedia' : 'Jaringan sekolah belum ditemukan. Periksa wlan1 dan SSID pada router.';
        document.querySelector('[data-phone-home-status]').textContent = state.phoneConnected ? 'Terhubung · ' + state.wireless.ssid : 'Belum terhubung ke Wi-Fi';
        document.querySelector('[data-phone-signal]').textContent = state.phoneConnected ? '◉' : '▱';
        document.querySelector('[data-phone-signal]').setAttribute('aria-label', state.phoneConnected ? 'Wi-Fi terhubung' : 'Wi-Fi belum terhubung');
        document.querySelector('[data-phone-ssid]').textContent = state.wireless.ssid;
        document.querySelector('[data-portal-address]').textContent = (state.hotspot?.dnsName || '') + (session ? '/status' : '/login');
        document.querySelector('[data-phone-forget]').hidden = !state.phoneConnected;
        document.querySelector('[data-phone-browser]').hidden = phoneScreen !== 'browser' || !state.phoneConnected || !model.hotspotValid(state);
        document.querySelector('[data-phone-signin]').hidden = !state.phoneConnected || !model.hotspotValid(state);
        document.querySelector('[data-portal-heading]').textContent = state.uploaded && model.loginHtmlValid(state.portalHtml) ? parameters.heading : 'HotSpot Login';
        document.querySelector('[data-phone-login]').hidden = Boolean(session);
        document.querySelector('[data-phone-session]').hidden = !session;
        document.querySelector('[data-previous]').hidden = state.stage === 'intro' || state.stage === 'finish';
        document.querySelector('[data-reread-learning]').hidden = !stages.includes(state.stage);
        paintHotspot(); guide.refresh();
        window.clearTimeout(completionTimer);
        if (stages.includes(state.stage) && done(state.stage) && announced !== state.stage && overlay.hidden && !learning.open && prologue.hidden) {
            const current = state.stage, token = revision;
            completionTimer = window.setTimeout(() => {
                if (token !== revision || state.stage !== current || !done(current)) return;
                announced = current;
                say(info[current][0] + ' selesai. Hasilnya sudah sesuai rancangan jaringan sekolah.', () => { const next = stages[stages.indexOf(current) + 1]; if (next) teach(next); else { state.stage = 'quiz'; persist(); quiz.showModal(); } });
            }, 650);
        }
    };
    const showLesson = (name) => { nextLesson = name; document.querySelector('[data-learning-title]').textContent = info[name][0]; const body = document.createElement('p'); body.textContent = info[name][2]; document.querySelector('[data-learning-body]').replaceChildren(body); learning.showModal(); };
    const teach = (name) => say(info[name][1], () => showLesson(name));
    const beginLesson = () => { if (!nextLesson) return; state.stage = nextLesson; nextLesson = null; announced = null; learning.close(); persist(); render(); document.querySelector('[data-guide-scroll]').scrollTop = 0; };
    document.querySelector('[data-learning-continue]').addEventListener('click', beginLesson);
    document.querySelector('[data-reread-learning]').addEventListener('click', () => { if (stages.includes(state.stage)) showLesson(state.stage); });
    document.querySelector('[data-close-learning]').addEventListener('click', beginLesson);
    learning.addEventListener('cancel', (event) => { event.preventDefault(); beginLesson(); });
    document.querySelectorAll('[data-wireless-tab]').forEach((button) => button.addEventListener('click', () => { wirelessTab = button.dataset.wirelessTab; record('wireless:' + wirelessTab); render(); }));
    document.querySelectorAll('[data-radio-tab]').forEach((button) => button.addEventListener('click', () => { radioTab = button.dataset.radioTab; record('radio:' + radioTab); render(); }));
    document.querySelector('[data-wlan-row]').addEventListener('click', () => { selectedWlan = true; record('wlan:selected'); render(); });
    const optionName = (node) => node.dataset.radioOption || node.dataset.securityOption || node.dataset.profileOption || node.dataset.userOption;
    const loadOptions = (selector, saved = {}) => document.querySelectorAll(selector).forEach((node) => { const name = optionName(node); if (node.type === 'checkbox') node.checked = saved[name] ?? node.defaultChecked; else node.value = saved[name] ?? node.dataset.initialValue ?? node.defaultValue ?? node.value; });
    const readOptions = (selector) => Object.fromEntries([...document.querySelectorAll(selector)].map((node) => [optionName(node), node.type === 'checkbox' ? node.checked : node.value]));
    document.querySelectorAll('[data-radio-option], [data-security-option], [data-profile-option], [data-user-option]').forEach((node) => { node.dataset.initialValue = node.value; });
    const editWireless = () => {
        field('wlan-name').value = 'wlan1'; field('mode').value = state.wireless.mode; field('ssid').value = state.wireless.ssid;
        const profiles = ['default', ...(state.security ? [state.security.name] : [])];
        field('security').replaceChildren(...profiles.map((name) => { const option = document.createElement('option'); option.value = name; option.textContent = name; return option; }));
        field('security').value = state.wireless.security; loadOptions('[data-radio-option]', state.wireless.options); radioTab = 'general'; openWindow('wireless-edit'); render();
    };
    document.querySelector('[data-wlan-row]').addEventListener('dblclick', editWireless);
    document.querySelector('[data-wlan-row]').addEventListener('keydown', (event) => { if (event.key === 'Enter') editWireless(); });
    for (const [selector, enabled] of [['[data-enable-wlan]', true], ['[data-disable-wlan]', false]]) document.querySelector(selector).addEventListener('click', () => { if (!selectedWlan) return explainError('Klik baris wlan1 terlebih dahulu agar terpilih, lalu klik tombol centang untuk mengaktifkannya.'); state.wireless.enabled = enabled; if (!enabled) { state.phoneConnected = false; session = null; state.verified = {}; } persist(); render(); });
    const editSecurity = (existing = false) => {
        const profile = existing ? state.security : null;
        selectedSecurity = Boolean(profile); securityTab = 'general';
        document.querySelector('[data-security-title]').textContent = profile ? 'Security Profile <' + profile.name + '>' : 'New Security Profile';
        field('security-name').value = profile?.name || ''; field('security-mode').value = profile?.mode || 'none'; field('wpa').checked = Boolean(profile?.wpa); field('wpa2').checked = Boolean(profile?.wpa2); field('wpa-key').value = profile?.key || ''; field('wpa2-key').value = profile?.key2 || '';
        loadOptions('[data-security-option]', profile?.options); openWindow('security-edit'); render();
    };
    document.querySelector('[data-add-security]').addEventListener('click', () => editSecurity());
    document.querySelector('[data-security-record]').addEventListener('click', () => { selectedSecurity = true; render(); });
    document.querySelector('[data-security-record]').addEventListener('dblclick', () => editSecurity(true));
    document.querySelectorAll('[data-security-tab]').forEach((button) => button.addEventListener('click', () => { securityTab = button.dataset.securityTab; render(); }));
    for (const name of ['security-mode', 'wpa', 'wpa2']) field(name).addEventListener('change', render);
    document.querySelector('[data-copy-security]').addEventListener('click', () => { selectedSecurity = false; field('security-name').value = ''; document.querySelector('[data-security-title]').textContent = 'New Security Profile'; render(); });
    document.querySelectorAll('[data-remove-security]').forEach((button) => button.addEventListener('click', () => {
        if (!selectedSecurity || !state.security) return;
        state.security = null; state.wireless.security = 'default'; state.phoneConnected = false; session = null; selectedSecurity = false;
        windows.get('security-edit').hidden = true; persist(); render();
    }));
    document.querySelector('[data-radio-toggle]').addEventListener('click', () => {
        state.wireless.enabled = !state.wireless.enabled;
        if (!state.wireless.enabled) { state.phoneConnected = false; session = null; }
        persist(); render();
    });
    document.querySelector('[data-radio-advanced]').addEventListener('click', () => { advancedRadio = !advancedRadio; render(); });
    document.querySelector('[data-wireless-find]').addEventListener('input', (event) => { document.querySelector('[data-wlan-row]').hidden = !'wlan1'.includes(event.target.value.trim().toLowerCase()); });
    const selectInterfaceRow = (row) => {
        if (!row) return;
        selectedInterface = row.dataset.inheritedInterface;
        document.querySelectorAll('[data-inherited-interface]').forEach((item) => item.classList.toggle('is-selected', item.dataset.inheritedInterface === selectedInterface));
    };
    for (const selector of ['[data-inherited-interfaces]', '[data-inherited-ethernet]']) {
        const table = document.querySelector(selector);
        table.addEventListener('click', (event) => selectInterfaceRow(event.target.closest('[data-inherited-interface]')));
        const inspect = (event) => {
            const row = event.target.closest('[data-inherited-interface]'); if (!row) return;
            selectInterfaceRow(row);
            if (selectedInterface === 'wlan1') editWireless();
            else if (selectedInterface.startsWith('vlan')) {
                const vlan = inherited?.vlans.find((item) => item.name === selectedInterface);
                if (vlan) showHotspotDetails('Interface <' + vlan.name + '>', [['name', 'Name', vlan.name], ['type', 'Type', 'VLAN'], ['mtu', 'MTU', '1500'], ['vlanId', 'VLAN ID', String(vlan.id)], ['parent', 'Interface', vlan.parent]], 'interface-readonly');
            } else {
                const item = inherited?.interfaces.find((item) => item.id === selectedInterface);
                if (item) showHotspotDetails('Interface <' + item.name + '>', [['name', 'Name', item.name], ['type', 'Type', item.type], ['mtu', 'MTU', '1500'], ['actualMtu', 'Actual MTU', '1500'], ['l2mtu', 'L2 MTU', '1598'], ['arp', 'ARP', 'enabled']], 'interface-readonly');
            }
        };
        table.addEventListener('dblclick', inspect);
        table.addEventListener('keydown', (event) => { if (event.key === 'Enter') inspect(event); });
    }
    document.querySelector('[data-interface-find]').addEventListener('input', (event) => document.querySelectorAll('[data-inherited-interface]').forEach((row) => { const name = inherited?.interfaces.find((item) => item.id === row.dataset.inheritedInterface)?.name || ''; row.hidden = !name.toLowerCase().includes(event.target.value.toLowerCase()); }));
    document.querySelectorAll('[data-inherited-interface-tool]').forEach((button) => button.addEventListener('click', () => {
        const tool = button.dataset.inheritedInterfaceTool;
        if (tool === 'filter') return document.querySelector('[data-interface-find]').focus();
        if (selectedInterface === 'wlan1' && ['enable', 'disable'].includes(tool)) { state.wireless.enabled = tool === 'enable'; if (!state.wireless.enabled) { state.phoneConnected = false; session = null; } persist(); render(); return; }
        if (tool === 'detect') return say('Detect Internet dipakai untuk mendeteksi jalur internet pada interface. Jalur WAN sekolah tetap menggunakan konfigurasi ether1 yang sudah kamu buat. Untuk menyiapkan WiFi, buka Wireless.');
        say(tool === 'add' ? 'Tombol + dipakai untuk menambah interface virtual. Radio wlan1 sudah tersedia: buka Wireless untuk mengaktifkan dan mengaturnya.' : 'Pilih interface yang ingin diperiksa. Konfigurasi port dan VLAN dari tahap sebelumnya tetap digunakan; pada tahap ini kita mengatur wlan1 melalui Wireless.');
    }));
    document.querySelectorAll('[data-wireless-tool]').forEach((button) => button.addEventListener('click', () => {
        const tool = button.dataset.wirelessTool;
        if (tool === 'Reset Configuration') {
            say('Reset Configuration akan mengembalikan pengaturan wlan1. Lanjutkan hanya jika kamu ingin mengatur ulang WiFi sekolah.', () => {
                state.wireless = fresh().wireless; state.phoneConnected = false; session = null; persist(); editWireless();
            });
            return;
        }
        if (tool === 'add') return explainError('Tombol + membuat interface wireless virtual. Untuk mengatur radio bawaan router, pilih wlan1 yang sudah ada lalu klik dua kali.');
        if (!['comment', 'security-comment', 'filter', 'Scanner', 'Scan...'].includes(tool)) {
            say(tool + ' adalah alat wireless WinBox. Pengoperasian alat ini belum disimulasikan. Untuk menyiapkan WiFi sekolah, atur wlan1 pada tab Wireless dan buat password melalui Security Profiles.');
            return;
        }
        if (tool === 'security-comment' && !state.security) return explainError('Buat Security Profile terlebih dahulu, lalu pilih barisnya sebelum menambahkan komentar.');
        activeWirelessTool = tool;
        document.querySelector('[data-wireless-tool-title]').textContent = tool === 'comment' ? 'Comment for wlan1' : tool === 'security-comment' ? 'Comment for Security Profile' : tool === 'filter' ? 'Filter' : tool;
        const content = document.querySelector('[data-wireless-tool-content]'); content.replaceChildren();
        const row = document.createElement('label');
        const input = document.createElement(tool.includes('comment') ? 'textarea' : 'input'); input.dataset.wirelessToolInput = '';
        row.textContent = tool.includes('comment') ? 'Comment' : tool === 'filter' ? 'Name contains' : 'Interface';
        input.value = tool === 'comment' ? state.wireless.comment || '' : tool === 'security-comment' ? state.security?.comment || '' : tool === 'filter' ? '' : 'wlan1';
        if (!tool.includes('comment') && tool !== 'filter') input.readOnly = true;
        row.append(input); content.append(row);
        const output = document.createElement('pre'); output.dataset.wirelessToolOutput = ''; content.append(output);
        document.querySelector('[data-run-wireless-tool]').textContent = tool.includes('comment') || tool === 'filter' ? 'OK' : 'Start';
        openWindow('wireless-tool');
    }));
    document.querySelector('[data-run-wireless-tool]').addEventListener('click', () => {
        const input = document.querySelector('[data-wireless-tool-input]');
        if (activeWirelessTool === 'comment') state.wireless.comment = input.value;
        else if (activeWirelessTool === 'security-comment' && state.security) state.security.comment = input.value;
        else if (activeWirelessTool === 'filter') { document.querySelector('[data-wireless-find]').value = input.value; document.querySelector('[data-wlan-row]').hidden = !'wlan1'.includes(input.value.toLowerCase()); }
        else {
            document.querySelector('[data-wireless-tool-output]').textContent = 'Interface: wlan1\n' + (state.wireless.enabled ? 'No results' : 'Interface is disabled');
            return;
        }
        windows.get('wireless-tool').hidden = true; persist(); render();
    });
    document.querySelectorAll('[data-hotspot-tab]').forEach((button) => button.addEventListener('click', () => { hotspotTab = button.dataset.hotspotTab; selectedHotspot = null; record('hotspot:' + hotspotTab); render(); }));
    document.querySelector('[data-hotspot-find]').addEventListener('input', paintHotspot);
    for (const kind of ['profile', 'user']) document.querySelectorAll('[data-' + kind + '-tab]').forEach((button) => button.addEventListener('click', () => { if (kind === 'profile') profileTab = button.dataset.profileTab; else userTab = button.dataset.userTab; render(); }));
    const optionsFor = (select, values, selected) => { select.replaceChildren(...values.map((value) => { const option = document.createElement('option'); option.value = value; option.textContent = value; return option; })); select.value = selected; };
    const editProfile = (name = null) => {
        const profile = state.profiles[name];
        editingProfile = name || names.find((name) => !model.profileValid(state, name)) || 'kepalasekolah'; profileTab = 'general';
        document.querySelector('[data-profile-title]').textContent = name ? 'Hotspot User Profile <' + name + '>' : 'New Hotspot User Profile';
        field('profile-name').value = name || ''; field('shared').value = profile?.shared || '1'; field('rate').value = profile?.rate || '';
        const poolSelect = document.querySelector('[data-profile-option="pool"]');
        optionsFor(poolSelect, ['none', ...(inherited?.dhcp.map((_, index) => 'dhcp_pool' + index) || []), ...(state.hotspot?.pool ? ['hs-pool-1'] : [])], profile?.options?.pool || 'none');
        loadOptions('[data-profile-option]', profile?.options); openWindow('profile-edit'); render();
    };
    const editUser = (name = null) => {
        editingInitialUser = Boolean(name && name === state.hotspot?.user && !Object.hasOwn(state.users, name) && !state.hotspot.userRemoved);
        const user = editingInitialUser ? { password: state.hotspot?.password || '', profile: 'default', server: 'all', disabled: state.hotspot?.userDisabled } : state.users[name];
        editingUser = name || names.find((name) => !model.userValid(state, name)) || 'kepalasekolah'; userTab = 'general'; userDraftDisabled = Boolean(user?.disabled);
        document.querySelector('[data-user-title]').textContent = name ? 'Hotspot User <' + name + '>' : 'New Hotspot User';
        field('user-name').value = name || ''; field('user-password').value = user?.password || '';
        optionsFor(field('user-profile'), ['default', ...Object.keys(state.profiles).filter((id) => id !== 'default')], user?.profile || 'default');
        optionsFor(field('user-server'), ['all', ...(state.hotspot ? ['hotspot1'] : [])], user?.server || 'all');
        loadOptions('[data-user-option]', user?.options);
        document.querySelector('[data-user-uptime]').value = user?.stats?.uptime || '00:00:00';
        document.querySelector('[data-user-bytes-in]').value = user?.stats?.bytesIn || '0 B'; document.querySelector('[data-user-bytes-out]').value = user?.stats?.bytesOut || '0 B';
        openWindow('user-edit'); render();
    };
    document.querySelector('[data-hotspot-add]').addEventListener('click', () => { if (hotspotTab === 'User Profiles') editProfile(); else if (hotspotTab === 'Users') editUser(); else explainError('Untuk membuat server gunakan tab Servers → Hotspot Setup. Untuk profile pilih User Profiles → +, sedangkan akun dibuat melalui Users → +.'); });
    const showHotspotDetails = (title, fields, kind) => {
        hotspotDetail = kind; document.querySelector('[data-hotspot-detail-title]').textContent = title;
        const form = document.querySelector('[data-hotspot-detail-form]'); form.replaceChildren();
        for (const [name, label, value, options] of fields) {
            const row = document.createElement('label'); row.textContent = label;
            const input = document.createElement(options ? 'select' : 'input'); input.dataset.hotspotDetailField = name;
            if (options) optionsFor(input, options, value); else input.value = value;
            if (kind === 'interface-readonly') input.readOnly = true;
            row.append(input); form.append(row);
        }
        openWindow('hotspot-detail');
    };
    const editHotspotServer = () => { if (state.hotspot) showHotspotDetails('Hotspot Server <hotspot1>', [['name', 'Name', 'hotspot1'], ['interface', 'Interface', state.hotspot.interface, ['wlan1', ...(inherited?.interfaces.filter((item) => item.type === 'Ethernet').map((item) => item.name) || [])]], ['pool', 'Address Pool', state.hotspot.pool || phoneNetwork().address], ['profile', 'Profile', 'hsprof1', ['default', 'hsprof1']], ['idle', 'Idle Timeout', state.hotspot.idle || '00:05:00'], ['addressesPerMac', 'Addresses Per MAC', state.hotspot.addressesPerMac || '2']], 'server'); };
    const editHotspotServerProfile = (id) => showHotspotDetails('Hotspot Server Profile <' + id + '>', [['name', 'Name', id], ['address', 'HotSpot Address', id === 'hsprof1' ? phoneNetwork().gateway : '0.0.0.0'], ['dnsName', 'DNS Name', id === 'hsprof1' ? state.hotspot.dnsName : ''], ['html', 'HTML Directory', 'hotspot'], ['proxy', 'HTTP Proxy', '0.0.0.0'], ['proxyPort', 'HTTP Proxy Port', '0'], ['smtp', 'SMTP Server', '0.0.0.0']], 'server-profile:' + id);
    document.querySelector('[data-hotspot-detail-form]').addEventListener('submit', (event) => event.preventDefault());
    document.querySelectorAll('[data-save-hotspot-detail]').forEach((button) => button.addEventListener('click', () => {
        const details = Object.fromEntries([...document.querySelectorAll('[data-hotspot-detail-field]')].map((input) => [input.dataset.hotspotDetailField, input.value.trim()]));
        if (hotspotDetail === 'server') {
            if (details.interface !== 'wlan1') return explainError('HotSpot sekolah harus berjalan di wlan1, yaitu interface WiFi untuk HP.');
            state.hotspot = { ...state.hotspot, interface: details.interface, pool: details.pool, idle: details.idle, addressesPerMac: details.addressesPerMac };
        } else if (hotspotDetail === 'server-profile:hsprof1') {
            if (!model.dnsNameValid(details.dnsName)) return explainError('DNS Name bebas kamu tentukan. Gunakan nama portal tanpa spasi, http://, atau /login.');
            state.hotspot = { ...state.hotspot, dnsName: details.dnsName, html: details.html };
        } else if (hotspotDetail?.startsWith('comment:')) {
            const target = hotspotDetail.slice(8);
            if (hotspotTab === 'Users' && state.users[target]) state.users[target].comment = details.comment;
            else if (state.hotspot) state.hotspot.comment = details.comment;
        }
        if (!button.hasAttribute('data-apply')) windows.get('hotspot-detail').hidden = true;
        persist(); render();
    }));
    const removeHotspotRecord = (kind, id) => {
        if (kind === 'profile' && id !== 'default') { delete state.profiles[id]; for (const user of Object.values(state.users)) if (user.profile === id) user.profile = 'default'; state.verified = {}; }
        else if (kind === 'user' && state.hotspot && id === state.hotspot.user && !Object.hasOwn(state.users, id)) { state.hotspot.userRemoved = true; state.initialLogin = false; delete state.verified[id]; if (session?.name === id) session = null; }
        else if (kind === 'user') { delete state.users[id]; delete state.verified[id]; if (session?.name === id) session = null; }
        else if (kind === 'server') { state.hotspot = null; setupConfirmed = false; state.hotspotConfirmed = false; session = null; }
        else if (kind === 'active') session = null;
        selectedHotspot = null; persist(); render();
    };
    for (const kind of ['profile', 'user']) {
        document.querySelector('[data-copy-hotspot="' + kind + '"]').addEventListener('click', () => { field(kind === 'profile' ? 'profile-name' : 'user-name').value = ''; if (kind === 'profile') editingProfile = null; else { editingUser = null; editingInitialUser = false; } });
        document.querySelector('[data-remove-hotspot="' + kind + '"]').addEventListener('click', () => { removeHotspotRecord(kind, kind === 'profile' ? editingProfile : editingUser); windows.get(kind + '-edit').hidden = true; });
    }
    document.querySelector('[data-toggle-hotspot-user]').addEventListener('click', () => { userDraftDisabled = !userDraftDisabled; render(); });
    const resetCounters = (all = false) => { for (const [name, user] of Object.entries(state.users)) if (all || name === editingUser || name === selectedHotspot) user.stats = { uptime: '00:00:00', bytesIn: '0 B', bytesOut: '0 B' }; persist(); render(); };
    document.querySelector('[data-reset-user-counters]').addEventListener('click', () => resetCounters());
    document.querySelector('[data-reset-all-user-counters]').addEventListener('click', () => resetCounters(true));
    document.querySelector('[data-hotspot-comment]').addEventListener('click', () => showHotspotDetails('Comment for Hotspot User', [['comment', 'Comment', state.users[editingUser]?.comment || '']], 'comment:' + editingUser));
    document.querySelectorAll('[data-hotspot-tool]').forEach((button) => button.addEventListener('click', () => {
        const tool = button.dataset.hotspotTool;
        if (tool === 'filter') { document.querySelector('[data-hotspot-find]').focus(); return; }
        if (tool === 'reset-counters' || tool === 'reset-all-counters') return resetCounters(tool === 'reset-all-counters');
        if (!selectedHotspot) return;
        if (tool === 'remove') removeHotspotRecord({ Users: 'user', 'User Profiles': 'profile', Servers: 'server', Active: 'active' }[hotspotTab], selectedHotspot);
        else if (tool === 'comment') showHotspotDetails('Comment', [['comment', 'Comment', state.users[selectedHotspot]?.comment || state.hotspot?.comment || '']], 'comment:' + selectedHotspot);
        else if (hotspotTab === 'Users' && state.hotspot && selectedHotspot === state.hotspot.user && !Object.hasOwn(state.users, selectedHotspot)) { state.hotspot.userDisabled = tool === 'disable'; if (tool === 'disable') state.initialLogin = false; if (session?.name === selectedHotspot) session = null; persist(); render(); }
        else if (hotspotTab === 'Users' && state.users[selectedHotspot]) { state.users[selectedHotspot].disabled = tool === 'disable'; if (session?.name === selectedHotspot) session = null; persist(); render(); }
        else if (hotspotTab === 'Servers' && state.hotspot) { state.hotspot.disabled = tool === 'disable'; if (state.hotspot.disabled) session = null; persist(); render(); }
    }));
    document.querySelector('[data-hotspot-reset-html]').addEventListener('click', () => { if (!state.hotspot) return; say('Reset HTML akan mengembalikan halaman HotSpot bawaan dan menghapus sambutan yang kamu tambahkan. Klik lanjut untuk menerapkan.', () => { state.portalHtml = defaultPortalHtml; state.loginFileRemoved = false; state.uploaded = false; state.portalVerified = false; persist(); render(); }); });
    document.querySelectorAll('[data-edit-form]').forEach((form) => form.addEventListener('submit', (event) => event.preventDefault()));
    const disconnectPhone = () => { state.phoneConnected = false; session = null; document.querySelector('[data-phone-status]').textContent = 'Pengaturan WiFi berubah. Hubungkan ulang dengan SSID dan password yang baru disimpan.'; };
    document.querySelectorAll('[data-save-form]').forEach((button) => button.addEventListener('click', () => {
        const name = button.dataset.saveForm;
        if (name === 'wireless-edit') {
            if (!state.wireless.enabled) return explainError('wlan1 masih disabled. Tutup jendela, pilih baris wlan1 pada tab WiFi Interfaces, lalu klik centang ✓.');
            if (value('mode') !== 'ap bridge' || !model.ssidValid(value('ssid')) || value('wlan-name') !== 'wlan1') return explainError('Pada tab Wireless, pilih Mode ap bridge dan isi SSID dengan nama WiFi pilihanmu, maksimal 32 byte. Biarkan Name wlan1 pada tab General.');
            if (state.stage !== 'wireless' && (!model.securityValid(state) || value('security') !== state.security.name)) return explainError('Pada tab Wireless, pilih Security Profile yang sudah kamu buat agar wlan1 memakai password WiFi tersebut.');
            if (value('security') !== 'default' && (!model.securityValid(state) || value('security') !== state.security.name)) return explainError('Security Profile pilihanmu belum tersedia. Buat dahulu melalui Wireless → Security Profiles → +.');
            if (state.wireless.ssid !== value('ssid') || state.wireless.security !== value('security')) disconnectPhone();
            state.wireless = { ...state.wireless, enabled: true, mode: value('mode'), ssid: value('ssid'), security: value('security'), options: readOptions('[data-radio-option]') };
        } else if (name === 'security-edit') {
            const security = { name: value('security-name'), mode: value('security-mode'), wpa: field('wpa').checked, wpa2: field('wpa2').checked, key: field('wpa-key').value, key2: field('wpa2-key').value };
            if (!security.name || security.name === 'default') return explainError('Isi Name dengan nama Security Profile pilihanmu. Nama default sudah dipakai profile bawaan; pilih nama lain.');
            if (security.mode !== 'dynamic keys' || !security.wpa || !security.wpa2) return explainError('Pilih Mode dynamic keys dan centang WPA PSK serta WPA2 PSK agar WiFi menggunakan keamanan password.');
            if (!model.passwordValid(security.key) || !model.passwordValid(security.key2)) return explainError('Password WiFi bebas kamu tentukan. Isi kedua Pre-Shared Key dengan 8–63 karakter, atau 64 digit heksadesimal. Ingat WPA2 Pre-Shared Key untuk menghubungkan HP.');
            if (state.security && state.security.key2 !== security.key2) disconnectPhone();
            if (state.security && state.wireless.security === state.security.name) state.wireless.security = security.name;
            state.security = { ...state.security, ...security, options: readOptions('[data-security-option]') }; selectedSecurity = true;
        } else if (name === 'profile-edit') {
            const id = value('profile-name'), target = parameters.profiles[id];
            if (!target && id !== 'default') return explainError('Gunakan nama profile kepalasekolah, guru, atau siswa. Ikuti nama pada petunjuk aktif.');
            if (target && (Number(value('shared')) !== target.shared || value('rate') !== target.rate)) return explainError('Profile ' + id + ' membutuhkan Shared Users ' + target.shared + ' dan Rate Limit ' + target.rate + '. Isi rx/tx lengkap dengan huruf k dan tanda /.');
            if (editingProfile && state.profiles[editingProfile] && editingProfile !== id) delete state.profiles[editingProfile];
            state.profiles[id] = { shared: Number(value('shared')), rate: value('rate'), options: readOptions('[data-profile-option]') };
        } else if (name === 'user-edit') {
            const id = value('user-name'), target = parameters.profiles[id];
            if (editingInitialUser) {
                if (!id) return explainError('Isi Name dengan username akun HotSpot pilihanmu. Password bebas kamu tentukan.');
                if (id !== state.hotspot.user && Object.hasOwn(state.users, id)) return explainError('Username itu sudah dipakai akun HotSpot lain. Pilih username yang berbeda.');
                const previousName = state.hotspot.user;
                if (session?.name === previousName) session = null;
                state.initialLogin = false;
                delete state.verified[previousName];
                state.hotspot = { ...state.hotspot, user: id, password: field('user-password').value, userDisabled: userDraftDisabled, userRemoved: false };
            }
            else {
                if (state.hotspot && id === state.hotspot.user && !state.hotspot.userRemoved) return explainError('Username ini sudah dipakai akun awal HotSpot. Pilih username lain atau ubah akun awal pada tabel Users.');
                if (!target || field('user-password').value !== target.password || value('user-profile') !== id || !model.profileValid(state, id)) return explainError('Buat akun dengan pasangan yang tepat: kepalasekolah/123 → profile kepalasekolah; guru/456 → profile guru; siswa/789 → profile siswa. Profile harus sudah dibuat terlebih dahulu.');
                state.users[id] = { ...state.users[id], password: field('user-password').value, profile: id, server: value('user-server') || 'all', disabled: userDraftDisabled, options: readOptions('[data-user-option]') }; state.verified[id] = false;
            }
        }
        if (!button.hasAttribute('data-apply')) windows.get(name).hidden = true;
        persist(); render(); message('Pengaturan tersimpan.', 'success');
    }));
    document.querySelector('[data-hotspot-setup]').addEventListener('click', () => { if (hotspotTab !== 'Servers') return explainError('Pilih tab Servers terlebih dahulu, lalu klik Hotspot Setup.'); if (!model.wifiReady(state)) return explainError('Selesaikan wlan1 dan terapkan Security Profile buatanmu terlebih dahulu.'); setupStep = 0; setupDraft = []; setupConfirmed = false; openWindow('hotspot-setup'); setupPaint(); });
    document.querySelector('[data-setup-back]').addEventListener('click', () => { if (setupStep > 0 && setupStep < 8) { setupStep--; setupPaint(); } });
    document.querySelector('[data-setup-next]').addEventListener('click', () => {
        if (setupStep === 8) { setupConfirmed = true; state.hotspotConfirmed = true; windows.get('hotspot-setup').hidden = true; persist(); render(); return; }
        if (setupStep === 7) {
            const user = document.querySelector('[data-setup-credential="name"]').value.trim(), password = document.querySelector('[data-setup-credential="password"]').value;
            if (!user) return explainError('Isi Name dengan username akun HotSpot pilihanmu. Password juga bebas kamu tentukan. Ingat akun ini untuk login pada browser HP.');
            if (Object.hasOwn(state.users, user)) return explainError('Username itu sudah dipakai akun HotSpot lain. Pilih username awal yang berbeda.');
            setupDraft[7] = { name: user, password }; state.initialLogin = false; session = null; state.hotspot = { interface: setupDraft[0], address: setupDraft[1], pool: setupDraft[2], certificate: setupDraft[3], smtp: setupDraft[4], dns: setupDraft[5], dnsName: setupDraft[6], user, password, masquerade: document.querySelector('[data-setup-masquerade]').checked };
        } else {
            const current = setupScreens[setupStep]; const actual = current[3] ? document.querySelector('[data-setup-select]').value : document.querySelector('[data-setup-input]').value.trim();
            if (setupStep === 6) {
                if (!model.dnsNameValid(actual)) return explainError('DNS Name bebas kamu tentukan. Isi nama portal tanpa spasi, http://, atau /login, lalu klik Next.');
            } else if (actual !== current[2]) return explainError(current[1] + ' belum sesuai. Gunakan ' + current[2] + ' pada layar ini, lalu klik Next.');
            setupDraft[setupStep] = actual;
        }
        setupStep++; persist(); setupPaint(); render();
    });
    const openPhoneBrowser = () => {
        if (!phoneWifiEnabled || !state.phoneConnected) return explainError('HP belum terhubung ke Wi-Fi. Pada HP, buka Pengaturan Wi-Fi, aktifkan Gunakan Wi-Fi, pilih SSID buatanmu, lalu Connect memakai password WPA2 WiFi yang kamu simpan. Setelah itu halaman login HotSpot dapat dibuka.');
        if (!model.hotspotValid(state)) return explainError('HP sudah terhubung ke Wi-Fi, tetapi portal belum tersedia. Kembali ke WinBox → IP → Hotspot → Servers dan selesaikan Hotspot Setup pada wlan1.');
        if (state.loginFileRemoved) return explainError('File hotspot/login.html tidak ada di router. Buka IP → Hotspot → Servers → Reset HTML untuk memulihkan halaman login, atau unggah kembali login.html dari desktop.');
        phoneScreen = 'browser'; record('phone:browser'); render();
    };
    document.querySelector('[data-open-phone]').addEventListener('click', () => { closeMenus(); phone.hidden = false; phoneScreen = state.phoneConnected && model.hotspotValid(state) ? 'browser' : 'home'; record('phone:open'); render(); });
    for (const selector of ['[data-phone-open-wifi]', '[data-phone-wifi-shortcut]']) document.querySelector(selector).addEventListener('click', () => { phoneScreen = 'wifi'; record('phone:wifi'); render(); });
    document.querySelector('[data-phone-home]').addEventListener('click', () => { phoneScreen = 'home'; render(); });
    document.querySelector('[data-phone-back]').addEventListener('click', () => { phoneScreen = phoneScreen === 'browser' ? 'wifi' : 'home'; render(); });
    for (const selector of ['[data-phone-open-browser]', '[data-phone-signin]']) document.querySelector(selector).addEventListener('click', openPhoneBrowser);
    document.querySelector('[data-phone-wifi-toggle]').addEventListener('change', (event) => {
        phoneWifiEnabled = event.currentTarget.checked;
        if (!phoneWifiEnabled) { state.phoneConnected = false; session = null; document.querySelector('[data-wifi-connect]').hidden = true; document.querySelector('[data-phone-status]').textContent = 'Wi-Fi dimatikan.'; }
        persist(); render();
    });
    document.querySelector('[data-return-router]').addEventListener('click', () => { phone.hidden = true; pc.showWinbox(); render(); });
    document.querySelector('[data-phone-network]').addEventListener('click', () => { document.querySelector('[data-wifi-connect]').hidden = false; record('phone:network'); });
    document.querySelector('[data-wifi-connect]').addEventListener('submit', (event) => {
        event.preventDefault();
        if (!phoneWifiEnabled) return explainError('Aktifkan Gunakan Wi-Fi pada HP sebelum menghubungkan ke jaringan sekolah.');
        if (!model.wifiReady(state)) return explainError('WiFi belum siap. Periksa Wireless: wlan1 aktif, Mode ap bridge, SSID terisi, dan Security Profile buatanmu sudah dipilih.');
        if (document.querySelector('[data-wifi-password]').value !== state.security.key2) return explainError('Password WiFi belum cocok dengan WPA2 Pre-Shared Key yang kamu simpan. Periksa Wireless → Security Profiles, klik dua kali profile ' + state.security.name + ', lalu gunakan password WPA2 profile tersebut pada HP. Akun HotSpot awal buatanmu dipakai setelah halaman portal terbuka.');
        state.phoneConnected = true; phoneScreen = model.hotspotValid(state) ? 'browser' : 'wifi'; document.querySelector('[data-wifi-connect]').hidden = true;
        document.querySelector('[data-phone-status]').textContent = 'Terhubung ke ' + state.wireless.ssid + '\nIP: ' + phoneNetwork().address + '\nGateway/DNS: ' + phoneNetwork().gateway;
        if (state.uploaded && model.loginHtmlValid(state.portalHtml)) state.portalVerified = true;
        persist(); render(); message('HP terhubung. Lanjutkan login pada browser portal.', 'success');
    });
    document.querySelector('[data-phone-forget]').addEventListener('click', () => { state.phoneConnected = false; session = null; phoneScreen = 'wifi'; document.querySelector('[data-wifi-password]').value = ''; document.querySelector('[data-wifi-connect]').hidden = true; document.querySelector('[data-phone-status]').textContent = 'Jaringan dilupakan. Pilih SSID sekolah dan hubungkan kembali.'; persist(); render(); });
    document.querySelector('[data-phone-login]').addEventListener('submit', (event) => {
        event.preventDefault(); const name = document.querySelector('[data-phone-user]').value.trim(); const password = document.querySelector('[data-phone-password]').value;
        const result = model.authenticate(state, name, password, session?.name === name ? 1 : 0);
        if (!result.ok) return explainError(result.reason === 'credentials' ? 'Username, password atau profile belum cocok. Gunakan akun awal yang kamu simpan pada HotSpot Setup. Akun kepala sekolah, guru dan siswa mengikuti pasangan akun serta User Profile pada petunjuk.' : result.reason === 'sessions' ? 'Shared Users akun ini sudah mencapai batas sesi. Log out sesi sebelumnya pada HP sebelum login lagi.' : 'Hubungkan HP ke WiFi sekolah dan pastikan HotSpot Setup pada wlan1 sudah selesai.');
        session = { name, ...result }; if (result.initial) state.initialLogin = true; else { state.verified[name] = true; state.users[name].stats = { uptime: '00:00:01', bytesIn: '0 B', bytesOut: '0 B' }; }
        document.querySelector('[data-session-details]').textContent = 'Login berhasil\nUser: ' + name + '\nIP: ' + phoneNetwork().address + '\nProfile: ' + result.profile + '\nShared Users: ' + result.shared + '\nRate Limit rx/tx: ' + result.rate;
        persist(); render(); message('Login HotSpot berhasil. Periksa detail sesi.', 'success');
    });
    document.querySelector('[data-phone-logout]').addEventListener('click', () => { session = null; document.querySelector('[data-phone-user]').value = ''; document.querySelector('[data-phone-password]').value = ''; render(); });
    const desktop = document.querySelector('[data-pc-desktop]');
    const desktopFile = document.createElement('button'); desktopFile.type = 'button'; desktopFile.className = 'ch4-desktop-file'; desktopFile.textContent = '▤ login.html'; desktopFile.draggable = true; desktopFile.hidden = !state.exported; desktop.append(desktopFile);
    const fileMenu = document.createElement('button'); fileMenu.type = 'button'; fileMenu.className = 'ch4-file-menu'; fileMenu.textContent = 'Open with Notepad'; fileMenu.hidden = true; desktop.append(fileMenu);
    const exportFile = () => { if (!model.hotspotValid(state)) return explainError('Selesaikan HotSpot Setup dahulu agar direktori hotspot dan login.html dibuat.'); state.exported = true; downloadedHtml = state.portalHtml; state.desktopHtml = downloadedHtml; desktopFile.hidden = false; persist(); render(); message('login.html tersalin ke desktop. Klik kanan file, lalu Open with Notepad.', 'success'); };
    const loginFile = document.querySelector('[data-login-file]');
    loginFile.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', 'router-login-html'));
    loginFile.addEventListener('keydown', (event) => { if (event.key === 'Enter') exportFile(); });
    desktopFile.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', 'desktop-login-html'));
    const host = document.querySelector('.ch2-workbench');
    host.addEventListener('dragover', (event) => { if (app.classList.contains('is-app-restored') || !desktop.hidden) event.preventDefault(); });
    host.addEventListener('drop', (event) => { if (event.target.closest('[data-upload-login], .routeros')) return; event.preventDefault(); if (event.dataTransfer.getData('text/plain') === 'router-login-html') exportFile(); });
    const showFileMenu = (event) => { event.preventDefault(); fileMenu.hidden = false; };
    desktopFile.addEventListener('contextmenu', showFileMenu); desktopFile.addEventListener('click', showFileMenu);
    fileMenu.addEventListener('click', () => { fileMenu.hidden = true; document.querySelector('[data-login-html]').value = downloadedHtml; document.querySelector('[data-notepad]').hidden = false; record('notepad:open'); });
    const saveHtml = () => { const html = document.querySelector('[data-login-html]').value; if (!model.loginHtmlValid(html)) return explainError('Tambahkan <h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1> tepat di bawah <div align="center">. Jangan menghapus formulir login yang sudah ada.'); downloadedHtml = html; state.desktopHtml = html; state.edited = true; document.querySelector('[data-notepad-status]').textContent = 'Tersimpan di desktop'; persist(); render(); };
    document.querySelector('[data-save-html]').addEventListener('click', saveHtml);
    document.querySelector('[data-login-html]').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveHtml(); } });
    document.querySelector('[data-close-notepad]').addEventListener('click', () => { document.querySelector('[data-notepad]').hidden = true; });
    const upload = document.querySelector('[data-upload-login]'); upload.addEventListener('dragover', (event) => { event.preventDefault(); });
    const queueLoginUpload = () => {
        if (!state.edited || !model.loginHtmlValid(downloadedHtml)) return explainError('Simpan perubahan login.html di Notepad dahulu sebelum mengunggah ke router.');
        say('File hotspot/login.html akan diganti dengan versi desktop. Klik untuk menerapkan halaman login yang baru.', () => { state.portalHtml = downloadedHtml; state.loginFileRemoved = false; state.uploaded = true; state.portalVerified = false; persist(); render(); message('Halaman login di router sudah diganti. Hubungkan ulang WiFi HP untuk memeriksa sambutannya.', 'success'); });
    };
    upload.addEventListener('drop', (event) => { event.preventDefault(); event.stopPropagation(); if (event.dataTransfer.getData('text/plain') !== 'desktop-login-html') return explainError('Seret file login.html dari desktop PC ke File List ini.'); queueLoginUpload(); });
    document.querySelector('[data-login-file]').addEventListener('click', () => document.querySelector('[data-login-file]').classList.add('is-selected'));
    document.querySelector('[data-file-find]').addEventListener('input', (event) => { document.querySelector('[data-login-file]').hidden = !state.hotspot || state.loginFileRemoved || !'hotspot/login.html'.includes(event.target.value.toLowerCase()); });
    document.querySelectorAll('[data-file-tool]').forEach((button) => button.addEventListener('click', () => {
        if (button.dataset.fileTool === 'upload') { document.querySelector('[data-pick-login-file]').hidden = !state.exported; document.querySelector('[data-upload-file-name]').value = ''; openWindow('upload-picker'); }
        else if (button.dataset.fileTool === 'remove') {
            if (!document.querySelector('[data-login-file]').classList.contains('is-selected')) return explainError('Pilih baris hotspot/login.html terlebih dahulu.');
            state.loginFileRemoved = true; state.portalHtml = ''; state.uploaded = false; state.portalVerified = false; persist(); render();
        } else say('Backup dan Restore menyimpan atau memulihkan konfigurasi router. Untuk mengubah halaman HotSpot sekolah, gunakan hotspot/login.html: salin ke desktop, edit di Notepad, lalu unggah kembali.');
    }));
    document.querySelector('[data-pick-login-file]').addEventListener('click', () => { document.querySelector('[data-upload-file-name]').value = 'login.html'; });
    document.querySelector('[data-upload-file-open]').addEventListener('click', () => { if (document.querySelector('[data-upload-file-name]').value !== 'login.html' || !state.exported) return explainError('Pilih login.html yang sudah disalin ke desktop dan disimpan melalui Notepad.'); windows.get('upload-picker').hidden = true; queueLoginUpload(); });

    const previousStep = () => {
        if (!prologue.hidden) { if (prologueIndex > 0) { prologueIndex--; paintPrologue(); } return; }
        if (learning.open) { learning.close(); return; }
        if (!overlay.hidden) { window.clearInterval(dialogueTimer); dialogueTimer = null; dialogueCallback = null; overlay.hidden = true; surface.inert = false; return; }
        const order = ['intro', ...stages, 'quiz', 'finish']; const destination = order[Math.max(0, order.indexOf(state.stage) - 1)];
        const resets = (name) => order.indexOf(name) >= order.indexOf(destination);
        revision++; window.clearTimeout(completionTimer); announced = null; session = null; state.phoneConnected = false;
        stages.filter(resets).forEach((name) => { delete state.actions[name]; });
        if (resets('wireless')) state.wireless = fresh().wireless;
        if (resets('security')) { state.security = null; state.wireless.security = 'default'; }
        if (resets('hotspot')) { state.hotspot = null; state.hotspotConfirmed = false; setupStep = 0; setupConfirmed = false; }
        if (resets('connect')) state.initialLogin = false;
        if (resets('portal')) { state.portalHtml = fresh().portalHtml; state.desktopHtml = state.portalHtml; downloadedHtml = state.portalHtml; state.exported = false; state.edited = false; state.uploaded = false; state.portalVerified = false; desktopFile.hidden = true; }
        if (resets('profiles')) state.profiles = {};
        if (resets('users')) { state.users = {}; state.verified = {}; }
        state.stage = destination; state.evaluationResult = null; evaluation.clear(); quiz.close(); finish.close(); windows.forEach((node) => { node.hidden = true; }); phone.hidden = true; document.querySelector('[data-notepad]').hidden = true; pc.hideDesktop();
        document.querySelectorAll('[data-quiz-form] input').forEach((node) => { node.checked = false; });
        persist(); render(); if (destination === 'intro') startPrologue(); else if (info[destination]) teach(destination); else quiz.showModal();
    };
    window.NetGuardChapterNavbar.bindPrevious(previousStep);
    document.querySelector('[data-previous]').addEventListener('click', previousStep);
    document.querySelector('[data-save]').addEventListener('click', () => message(persist() ? 'Progres Chapter 4 tersimpan.' : 'Progres belum dapat disimpan di browser ini.', persist() ? 'success' : 'error'));
    document.querySelector('[data-close-quiz]').addEventListener('click', () => quiz.close());
    document.querySelector('[data-close-finish]').addEventListener('click', () => finish.close());
    document.querySelector('[data-quiz-form]').addEventListener('change', () => { evaluation.clear(); persist(); });
    document.querySelector('[data-quiz-form]').addEventListener('submit', async (event) => {
        event.preventDefault(); const answers = [1, 2, 3, 4, 5].map((n) => document.querySelector('[name="answer-' + n + '"]:checked'));
        if (answers.some((answer) => !answer)) return evaluation.showError('Jawab kelima soal terlebih dahulu.');
        const button = document.querySelector('[data-submit-quiz]'); button.disabled = true;
        try {
            const response = await fetch(scene.dataset.completeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, body: JSON.stringify({ answers: answers.map((node) => Number(node.value)) }) });
            const result = await response.json(); const summary = evaluation.showResult(result); if (summary) { state.evaluationResult = summary; persist(); }
            if (!response.ok) { if (!summary) evaluation.showError(result.message || 'Hasil belum tersimpan.'); return; }
            state.stage = 'finish'; persist(); quiz.close(); render(); finish.showModal();
        } catch { evaluation.showError('Koneksi terputus. Coba simpan hasil kembali.'); } finally { button.disabled = false; }
    });
    const scenes = [
        ['Internet sudah tersedia', 'Sekarang sekolah membutuhkan WiFi yang aman dan halaman login untuk mengelola pengguna. Kita lanjutkan router serta PC lab yang sama.'],
        ['Siapkan identitas WiFi', 'Aktifkan wlan1 dan gunakan mode ap bridge. Tentukan sendiri SSID, nama Security Profile, serta password WiFi, lalu terapkan profile itu pada wlan1.'],
        ['Dua pintu masuk yang berbeda', 'Password WiFi menghubungkan HP ke wireless. Akun HotSpot dipakai sesudahnya pada halaman login dengan DNS Name yang kamu tentukan sendiri.'],
        ['Sambutan dan akun sekolah', 'Kita ubah login.html, lalu buat profile serta akun kepala sekolah, guru, dan siswa dengan batas akses masing-masing.'],
        ['Buktikan dari HP', 'Hubungkan HP uji ke WiFi, login ke portal, lalu periksa sesi pada tab Active. Pak Amat membantu saat ada konfigurasi yang salah.'],
    ];
    const finishPrologueTyping = () => { window.clearInterval(prologueTimer); prologueTimer = null; prologueTyping = false; document.querySelector('[data-ch2-prologue-title]').textContent = scenes[prologueIndex][0]; document.querySelector('[data-ch2-prologue-text]').textContent = scenes[prologueIndex][1]; };
    const paintPrologue = () => {
        updateBackAvailability(); window.clearInterval(prologueTimer); const [title, text] = scenes[prologueIndex];
        const heading = document.querySelector('[data-ch2-prologue-title]'), body = document.querySelector('[data-ch2-prologue-text]');
        document.querySelector('[data-ch2-prologue-kicker]').textContent = 'PROLOG · ' + String(prologueIndex + 1).padStart(2, '0');
        document.querySelector('[data-ch2-prologue-count]').textContent = 'ADEGAN ' + (prologueIndex + 1) + ' / ' + scenes.length;
        document.querySelector('[data-ch2-prologue-progress]').style.width = ((prologueIndex + 1) / scenes.length * 100) + '%';
        heading.textContent = ''; body.textContent = ''; prologueTyping = true;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finishPrologueTyping();
        let position = 0; prologueTimer = window.setInterval(() => { position++; heading.textContent = title.slice(0, position); if (position > title.length) body.textContent = text.slice(0, position - title.length); if (position >= title.length + text.length) finishPrologueTyping(); }, 24);
    };
    const startPrologue = (replay = false) => { replaying = replay; prologueIndex = 0; prologue.hidden = false; scene.classList.add('is-prologue'); surface.inert = true; paintPrologue(); prologue.focus(); };
    const advancePrologue = () => { if (prologue.hidden) return; if (prologueTyping) return finishPrologueTyping(); if (prologueIndex < scenes.length - 1) { prologueIndex++; paintPrologue(); return; } prologue.hidden = true; scene.classList.remove('is-prologue'); surface.inert = false; state.prologueComplete = true; persist(); if (!replaying || state.stage === 'intro') teach('wireless'); else render(); };
    prologue.addEventListener('click', (event) => { if (!event.target.closest('[data-step-back]')) advancePrologue(); }); prologue.addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key) && !event.repeat) { event.preventDefault(); event.stopPropagation(); advancePrologue(); } });
    document.querySelector('[data-replay-prologue]').addEventListener('click', () => startPrologue(true));
    (saved?.answers || []).forEach((answer, index) => { const node = document.querySelector('[name="answer-' + (index + 1) + '"][value="' + answer + '"]'); if (node) node.checked = true; });
    evaluation.showResult(state.evaluationResult || null); render();
    if (!state.prologueComplete && state.stage === 'intro') startPrologue(); else { prologue.hidden = true; scene.classList.remove('is-prologue'); if (state.stage === 'intro') teach('wireless'); else if (state.stage === 'quiz') quiz.showModal(); else if (state.stage === 'finish') finish.showModal(); else render(); }
})();
