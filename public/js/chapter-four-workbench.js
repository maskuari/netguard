(() => {
    'use strict';
    const scene = document.querySelector('.ch4-scene');
    if (!scene) return;
    const model = window.NetGuardChapterFour;
    const parameters = model.parameters;
    const names = Object.keys(parameters.profiles);
    const stages = ['wireless', 'security', 'hotspot', 'connect', 'portal', 'profiles', 'users'];
    const key = 'netguard.chapter-four.v1.' + scene.dataset.userId;
    const fresh = () => ({ stage: 'intro', prologueComplete: false, wireless: { enabled: false, mode: 'station', ssid: 'MikroTik', security: 'default' }, security: null, hotspot: null, initialLogin: false, phoneConnected: false, portalHtml: '<html>\n<body>\n<div align="center">\n<form name="login">\n<!-- HotSpot login -->\n</form>\n</div>\n</body>\n</html>', portalVerified: false, exported: false, edited: false, uploaded: false, profiles: {}, users: {}, verified: {}, actions: {}, answers: [] });
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    const state = { ...fresh(), ...saved };
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
    let wirelessTab = 'interfaces', radioTab = 'general', hotspotTab = 'Servers', selectedWlan = false;
    let setupStep = 0, setupDraft = [], setupConfirmed = Boolean(state.hotspotConfirmed), session = null, downloadedHtml = state.desktopHtml || state.portalHtml;
    let editingProfile = null, editingUser = null;
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
        users: names.every((name) => model.userValid(state, name) && state.verified[name] && state.actions.users?.['active:' + name]),
    })[stage] || false;
    const info = {
        wireless: ['Aktifkan wireless dan atur SSID', 'Kita akan membuka WiFi sekolah agar HP dapat menemukan jaringan. Aktifkan wlan1, ubah mode menjadi ap bridge, lalu beri nama jaringan SMKN1-Amuntai.', 'SSID adalah nama WiFi yang tampil di HP. Mode ap bridge membuat wlan1 melayani perangkat sebagai access point. Nama SSID tugas sekolah ini adalah SMKN1-Amuntai. Wlan1 sudah memakai gateway 192.168.20.1/24 dan DHCP dari Chapter 2.'],
        security: ['Amankan WiFi sekolah', 'Sekarang kita beri password untuk bergabung ke WiFi. Buat Security Profile user dengan password Sekolah123, lalu terapkan pada wlan1. Password ini berbeda dari akun HotSpot yang akan kita buat.', 'Security Profile menyimpan mode dan metode keamanan WiFi. Gunakan nama user, mode dynamic keys, centang WPA PSK serta WPA2 PSK, dan isi kedua pre-shared key dengan Sekolah123. Setelah disimpan, pilih user pada Security Profile wlan1. Membuat profile saja belum menerapkannya pada WiFi.'],
        hotspot: ['Jalankan HotSpot Setup', 'WiFi sudah punya password. Berikutnya kita siapkan halaman login HotSpot pada wlan1. Nama portalnya hotspot-tkj.com dan akun awalnya admin dengan password admin.', 'HotSpot meminta autentikasi setelah perangkat masuk ke WiFi. Buka IP → Hotspot → Servers → Hotspot Setup. Pilih wlan1, pertahankan nilai bawaan wizard, isi DNS Name hotspot-tkj.com, lalu buat local user admin/admin. Password WiFi dan akun portal memiliki fungsi berbeda.'],
        connect: ['Hubungkan HP dan login HotSpot', 'Sekarang gunakan HP uji. Pilih WiFi SMKN1-Amuntai, masukkan password Sekolah123, lalu login pada portal memakai admin dan admin. Kita periksa IP HP dan sesi login yang terbentuk.', 'HP harus bergabung ke WiFi dahulu sebelum membuka portal. Setelah terhubung, DHCP memberikan IP 192.168.20.x. Browser portal meminta username dan password HotSpot. Login admin/admin dipakai untuk pemeriksaan awal, bukan untuk mengisi password WiFi.'],
        portal: ['Ubah halaman login sekolah', 'Kita tambahkan sambutan sekolah pada halaman login. Ambil hotspot/login.html dari Files ke desktop, buka dengan Notepad, simpan perubahannya, lalu unggah kembali. Setelah itu hubungkan ulang HP untuk melihat hasilnya.', 'File hotspot/login.html berada di router. Minimize WinBox lalu seret file ke desktop. Klik kanan login.html → Open with Notepad. Tepat di bawah <div align="center"> tambahkan <h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>. Simpan dengan Ctrl+S, lalu seret kembali login.html ke File List untuk mengganti file router. Sambungkan ulang WiFi HP agar halaman baru dibuka.'],
        profiles: ['Buat User Profiles HotSpot', 'Kepala sekolah, guru, dan siswa memiliki batas akses yang berbeda. Kita buat tiga User Profile agar tiap akun mendapat batas pengguna dan kecepatan yang sesuai.', 'Shared Users adalah jumlah sesi bersamaan untuk satu akun. Rate Limit rx/tx membatasi laju trafik profile. Buat kepalasekolah: Shared Users 1, Rate Limit 512k/512k; guru: 10, 256k/256k; siswa: 5, 128k/128k. Profile baru berlaku pada akun yang memilihnya.'],
        users: ['Buat dan uji akun HotSpot', 'Sekarang buat akun kepalasekolah/123, guru/456, dan siswa/789. Pilih profile yang namanya sama. Setelah tersimpan, login satu per satu dari HP dan periksa sesi pada tab Active.', 'Buka IP → Hotspot → Users, klik + untuk setiap akun. Name dan Password menentukan kredensial login; Profile menentukan Shared Users dan Rate Limit. Setelah akun tersimpan, log out akun sebelumnya pada HP, lalu login dengan akun berikutnya. Periksa tab Active: User, Profile, Address, dan Rate Limit harus sesuai.'],
    };
    const closeMenus = () => document.querySelectorAll('[data-ch2-submenu]').forEach((node) => { node.hidden = true; });
    const record = (name) => { state.actions[state.stage] = { ...state.actions[state.stage], [name]: true }; persist(); render(); };
    const openWindow = (name) => {
        const node = windows.get(name); if (!node) return;
        closeMenus(); node.hidden = false; node.style.zIndex = String(++topLayer);
        document.querySelector('[data-taskbar] [data-restore="' + name + '"]')?.remove();
        record('open:' + name);
    };
    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow)));
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
    const pc = window.NetGuardPcDesktop.create({ onOpenWinbox: () => { phone.hidden = true; app.hidden = false; syncFileDesktop(); }, onHome: () => { phone.hidden = true; document.querySelector('.ch2-workbench').classList.remove('ch4-file-mode'); closeMenus(); record('desktop'); }, getNetwork: () => ({ address: '192.168.100.2', gateway: '192.168.100.1' }), onError: explainError });
    pc.setAvailable(true); pc.setNetwork(true);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => { app.hidden = true; pc.showDesktop(); }));
    const syncFileDesktop = () => {
        const restored = app.classList.contains('is-app-restored');
        document.querySelector('.ch2-workbench').classList.toggle('ch4-file-mode', restored);
        document.querySelector('[data-pc-desktop]').hidden = !restored;
    };
    document.querySelector('[data-ch2-app-size]').addEventListener('click', () => { app.classList.toggle('is-app-restored'); syncFileDesktop(); });
    const setupScreens = [
        ['Select interface to run HotSpot on', 'HotSpot Interface', 'wlan1', ['ether1-internet', 'ether3-local', 'wlan1']],
        ['Set HotSpot address for interface', 'Local Address of Network', '192.168.20.1/24'],
        ['Set pool for HotSpot addresses', 'Address Pool of Network', '192.168.20.2-192.168.20.254'],
        ['Select certificate', 'Select Certificate', 'none', ['none']],
        ['Select SMTP server', 'IP Address of SMTP Server', '0.0.0.0'],
        ['Setup DNS configuration', 'DNS Servers', '8.8.8.8,8.8.4.4'],
        ['DNS name of local HotSpot server', 'DNS Name', ''],
        ['Create local HotSpot user', 'Name / Password', ''],
    ];
    const setupPaint = () => {
        const screen = setupScreens[setupStep];
        document.querySelector('[data-setup-label]').textContent = screen?.[0] || 'Setup has completed successfully';
        document.querySelector('[data-setup-field-label]').textContent = screen?.[1] || '';
        const input = document.querySelector('[data-setup-input]'), select = document.querySelector('[data-setup-select]');
        input.hidden = !screen || Boolean(screen[3]) || setupStep === 7; select.hidden = !screen?.[3];
        document.querySelector('[data-setup-user-fields]')?.remove();
        if (screen?.[3]) { select.replaceChildren(...screen[3].map((text) => { const option = document.createElement('option'); option.textContent = text; return option; })); select.value = setupDraft[setupStep] || screen[2]; }
        else if (screen) input.value = setupDraft[setupStep] ?? screen[2];
        if (setupStep === 7) {
            const wrapper = document.createElement('div'); wrapper.dataset.setupUserFields = '';
            for (const [label, name, type] of [['Name', 'name', 'text'], ['Password', 'password', 'password']]) { const row = document.createElement('label'); row.textContent = label; const field = document.createElement('input'); field.type = type; field.dataset.setupCredential = name; field.value = setupDraft[7]?.[name] || (name === 'name' ? 'admin' : ''); row.append(field); wrapper.append(row); }
            windows.get('hotspot-setup').querySelector('.ch2-window-content').append(wrapper);
        }
        document.querySelector('[data-setup-back]').disabled = setupStep === 0 || setupStep === 8;
        document.querySelector('[data-setup-next]').textContent = setupStep === 8 ? 'OK' : 'Next';
        guide.refresh();
    };
    const guidePlan = () => {
        const shared = parameters.profiles;
        if (state.stage === 'wireless') return [
            ['Klik Wireless pada menu kiri WinBox. Pada tab WiFi Interfaces, klik baris wlan1 satu kali untuk memilihnya.', action('wlan:selected') || model.wirelessValid(state)],
            ['Klik tombol centang ✓ di atas tabel untuk mengaktifkan wlan1. Huruf X (disabled) pada baris harus hilang.', state.wireless.enabled],
            ['Klik dua kali baris wlan1. Pada jendela Interface <wlan1>, klik tab Wireless.', action('radio:wireless') || model.wirelessValid(state)],
            ['Pada tab Wireless, pilih Mode ap bridge. Isi SSID SMKN1-Amuntai, lalu klik OK. SSID ini yang nanti dipilih pada HP.', model.wirelessValid(state)],
        ];
        if (state.stage === 'security') return [
            ['Klik Wireless → tab Security Profiles, lalu tombol + untuk membuat profile baru.', action('open:security-edit') || model.securityValid(state)],
            ['Isi Name user, Mode dynamic keys. Centang WPA PSK dan WPA2 PSK. Isi WPA Pre-Shared Key dan WPA2 Pre-Shared Key dengan Sekolah123. Klik OK. Jika ada koreksi Pak Amat, perbaiki kolom yang disebutkan.', model.securityValid(state)],
            ['Kembali ke tab WiFi Interfaces. Klik dua kali wlan1, lalu tab Wireless. Pilih Security Profile user dan klik OK. Profile harus diterapkan, bukan hanya dibuat.', model.wifiReady(state)],
        ];
        if (state.stage === 'hotspot') return [
            ['Klik IP → Hotspot. Pada tab Servers, klik Hotspot Setup. Wizard dimulai dari HotSpot Interface.', action('open:hotspot-setup') || model.hotspotValid(state)],
            ...setupScreens.map((screen, index) => [index === 6 ? 'Pada DNS Name, ketik hotspot-tkj.com lalu klik Next. Nama ini digunakan untuk alamat portal login.' : index === 7 ? 'Pada Create local HotSpot user, isi Name admin dan Password admin, lalu klik Next.' : 'Pada layar ' + screen[0] + ', ' + (index === 0 ? 'pilih wlan1' : 'pertahankan ' + screen[1] + ': ' + screen[2]) + ', lalu klik Next. Jika belum hijau, pastikan tombol Next pada wizard yang diklik.', model.hotspotValid(state) || setupStep > index]),
            ['Setelah Setup has completed successfully tampil, klik OK. Baris hotspot1 akan terlihat di tabel Servers.', model.hotspotValid(state) && setupConfirmed],
        ];
        if (state.stage === 'connect') return [
            ['Klik HP uji · Wi-Fi sekolah di dekat taskbar. Pada layar utama HP, buka Pengaturan Wi-Fi. Pastikan Gunakan Wi-Fi menyala, lalu pilih jaringan SMKN1-Amuntai.', action('phone:network') || state.initialLogin],
            ['Isi Password Wi-Fi Sekolah123 lalu klik Connect. Periksa HP menerima IP 192.168.20.10 dan gateway 192.168.20.1. Browser portal hotspot-tkj.com terbuka setelah WiFi terhubung.', state.phoneConnected || state.initialLogin],
            ['Pada browser HP, isi Username admin dan Password admin, lalu klik Log in. Ini akun HotSpot, bukan password WiFi. Status sesi akan muncul setelah autentikasi berhasil.', state.initialLogin],
        ];
        if (state.stage === 'portal') return [
            ['Klik Kembali ke PC · WinBox jika HP terbuka. Buka Files pada menu kiri. Klik □ pada judul utama WinBox untuk mengecilkan jendelanya, lalu seret hotspot/login.html ke desktop yang terlihat di belakang WinBox.', state.exported],
            ['Klik Desktop PC di taskbar. Klik kanan file login.html, lalu pilih Open with Notepad. Pada layar sentuh klik file untuk menampilkan pilihan yang sama.', action('notepad:open') || state.edited],
            ['Di Notepad, cari <div align="center">. Tepat di bawahnya tambahkan <h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>. Tekan Ctrl+S atau klik Simpan.', state.edited],
            ['Tutup Notepad. Klik WinBox pada taskbar, buka Files, dan klik □ pada judul WinBox agar desktop terlihat. Seret file login.html dari desktop ke kotak unggah pada File List. Konfirmasi penggantian file ketika diminta.', state.uploaded && model.loginHtmlValid(state.portalHtml)],
            ['Buka HP uji. Klik Wi-Fi pada navigasi bawah HP, lalu Lupakan jaringan / hubungkan ulang. Pilih SMKN1-Amuntai, masukkan Sekolah123 dan Connect lagi. Pastikan browser kini menampilkan sambutan sekolah sebelum login.', state.portalVerified && state.uploaded],
        ];
        if (state.stage === 'profiles') return names.flatMap((name) => [
            ['Klik IP → Hotspot → tab User Profiles, lalu tombol + untuk profile ' + name + '.', model.profileValid(state, name) || (open('profile-edit') && editingProfile === name)],
            ['Isi Name ' + name + ', Shared Users ' + shared[name].shared + ', Rate Limit ' + shared[name].rate + ', lalu klik OK. Shared Users membatasi sesi bersamaan per akun; Rate Limit membatasi kecepatannya.', model.profileValid(state, name)],
        ]);
        if (state.stage === 'users') return names.flatMap((name) => [
            ['Klik IP → Hotspot → Users → +. Buat Name ' + name + ', Password ' + shared[name].password + ', pilih Profile ' + name + ', lalu klik OK.', model.userValid(state, name)],
            ['Buka HP uji. Jika akun lain masih login, klik Log out. Isi Username ' + name + ', Password ' + shared[name].password + ', lalu Log in. Periksa detail sesi menampilkan Profile ' + name + ', Shared Users ' + shared[name].shared + ', dan Rate Limit ' + shared[name].rate + '.', Boolean(state.verified[name])],
            ['Klik Kembali ke PC · WinBox → IP → Hotspot → Active. Klik baris sesi ' + name + ' untuk mencocokkan User, Profile, IP dan Rate Limit. Setelah benar, langkah berikutnya muncul otomatis.', action('active:' + name)],
        ]);
        return [[state.stage === 'intro' ? 'Ikuti arahan Pak Amat sebelum membangun WiFi sekolah.' : state.stage === 'quiz' ? 'Jawab lima soal, lalu klik Simpan hasil Chapter 4.' : 'Chapter 4 selesai. Kembali ke peta untuk melihat progres.', state.stage === 'finish']];
    };
    const guide = window.NetGuardStepGuide.create({ list: document.querySelector('[data-guide-list]'), root: scene, getKey: () => state.stage + ':' + revision, getPlan: guidePlan });
    const paintHotspot = () => {
        const table = document.querySelector('[data-hotspot-table]');
        const records = hotspotTab === 'Servers' ? (state.hotspot ? [['hotspot1', 'wlan1', 'hsprof1', '192.168.20.1']] : []) : hotspotTab === 'User Profiles' ? names.filter((name) => state.profiles[name]).map((name) => [name, state.profiles[name].shared, state.profiles[name].rate]) : hotspotTab === 'Users' ? [...(state.hotspot ? [['admin', 'all', 'default']] : []), ...names.filter((name) => state.users[name]).map((name) => [name, 'all', state.users[name].profile])] : hotspotTab === 'Active' ? (session ? [[session.name, '192.168.20.10', session.profile, session.rate]] : []) : hotspotTab === 'Server Profiles' && state.hotspot ? [['hsprof1', parameters.dnsName, 'hotspot']] : [];
        const headers = { Servers: ['Name', 'Interface', 'Profile', 'Address'], 'User Profiles': ['Name', 'Shared Users', 'Rate Limit'], Users: ['Name', 'Server', 'Profile'], Active: ['User', 'Address', 'Profile', 'Rate Limit'], 'Server Profiles': ['Name', 'DNS Name', 'HTML Directory'] }[hotspotTab] || ['Name', 'Address', 'Status'];
        const heading = document.createElement('div'); heading.className = 'ch4-table-head'; headers.forEach((text) => { const cell = document.createElement('span'); cell.textContent = text; heading.append(cell); });
        const rows = records.map((values) => { const row = document.createElement('button'); row.type = 'button'; row.className = 'ch4-data-row'; values.forEach((text) => { const cell = document.createElement('span'); cell.textContent = text; row.append(cell); }); row.addEventListener('click', () => { if (hotspotTab === 'Active' && session && state.verified[session.name]) record('active:' + session.name); }); row.addEventListener('dblclick', () => { if (hotspotTab === 'User Profiles') editProfile(values[0]); if (hotspotTab === 'Users' && values[0] !== 'admin') editUser(values[0]); }); return row; });
        table.replaceChildren(heading, ...rows); document.querySelector('[data-hotspot-count]').textContent = records.length + ' items';
    };
    const render = () => {
        updateBackAvailability();
        const count = stages.filter(done).length;
        document.querySelector('[data-progress-label]').textContent = count + ' / ' + stages.length;
        document.querySelector('[data-progress]').max = stages.length; document.querySelector('[data-progress]').value = count;
        document.querySelector('[data-task-heading]').textContent = info[state.stage]?.[0] || 'Chapter 4';
        document.querySelector('[data-module-section]').textContent = 'Bab 4 · ' + (info[state.stage]?.[0] || 'Evaluasi');
        document.querySelector('[data-task-count]').textContent = (done(state.stage) ? '✓ Selesai' : 'Sedang dikerjakan');
        const summary = document.createElement('li'); summary.classList.toggle('is-done', done(state.stage)); summary.textContent = state.stage === 'profiles' || state.stage === 'users' ? names.map((name) => name + ': ' + parameters.profiles[name].shared + ' sesi · ' + parameters.profiles[name].rate).join(' | ') : state.stage === 'security' ? 'user · dynamic keys · WPA/WPA2 PSK · Sekolah123' : state.stage === 'hotspot' ? 'wlan1 · hotspot-tkj.com · admin/admin' : 'SSID: SMKN1-Amuntai · Password WiFi: Sekolah123';
        document.querySelector('[data-task-list]').replaceChildren(summary);
        document.querySelector('[data-wlan-row]').classList.toggle('is-selected', selectedWlan);
        document.querySelector('[data-wlan-row]').classList.toggle('is-disabled', !state.wireless.enabled);
        document.querySelector('[data-wlan-flags]').textContent = state.wireless.enabled ? 'R' : 'X';
        document.querySelector('[data-ssid-row]').textContent = state.wireless.ssid;
        document.querySelector('[data-security-row]').textContent = state.wireless.security;
        document.querySelector('[data-security-record]').hidden = !state.security;
        document.querySelector('[data-login-file]').hidden = !model.hotspotValid(state);
        document.querySelectorAll('[data-wireless-panel]').forEach((node) => { node.hidden = node.dataset.wirelessPanel !== wirelessTab; });
        document.querySelectorAll('[data-wireless-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.wirelessTab === wirelessTab));
        document.querySelector('[data-wireless-settings]').hidden = radioTab !== 'wireless';
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
        if (stages.includes(state.stage) && done(state.stage) && (state.stage !== 'users' || names.every((name) => action('active:' + name))) && announced !== state.stage && overlay.hidden && !learning.open && prologue.hidden) {
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
    const editWireless = () => { field('wlan-name').value = 'wlan1'; field('mode').value = state.wireless.mode; field('ssid').value = state.wireless.ssid; field('security').value = state.wireless.security; radioTab = 'general'; openWindow('wireless-edit'); render(); };
    document.querySelector('[data-wlan-row]').addEventListener('dblclick', editWireless);
    document.querySelector('[data-wlan-row]').addEventListener('keydown', (event) => { if (event.key === 'Enter') editWireless(); });
    for (const [selector, enabled] of [['[data-enable-wlan]', true], ['[data-disable-wlan]', false]]) document.querySelector(selector).addEventListener('click', () => { if (!selectedWlan) return explainError('Klik baris wlan1 terlebih dahulu agar terpilih, lalu klik tombol centang untuk mengaktifkannya.'); state.wireless.enabled = enabled; if (!enabled) { state.phoneConnected = false; session = null; state.verified = {}; } persist(); render(); });
    const editSecurity = () => { field('security-name').value = state.security?.name || ''; field('security-mode').value = state.security?.mode || 'none'; field('wpa').checked = Boolean(state.security?.wpa); field('wpa2').checked = Boolean(state.security?.wpa2); field('wpa-key').value = state.security?.key || ''; field('wpa2-key').value = state.security?.key2 || ''; openWindow('security-edit'); };
    document.querySelector('[data-add-security]').addEventListener('click', editSecurity);
    document.querySelector('[data-security-record]').addEventListener('dblclick', editSecurity);
    document.querySelectorAll('[data-hotspot-tab]').forEach((button) => button.addEventListener('click', () => { hotspotTab = button.dataset.hotspotTab; record('hotspot:' + hotspotTab); render(); }));
    const editProfile = (name = null) => { editingProfile = name || names.find((name) => !model.profileValid(state, name)) || 'kepalasekolah'; field('profile-name').value = name || ''; field('shared').value = name ? state.profiles[name].shared : '1'; field('rate').value = name ? state.profiles[name].rate : ''; openWindow('profile-edit'); };
    const editUser = (name = null) => { editingUser = name || names.find((name) => !model.userValid(state, name)) || 'kepalasekolah'; field('user-name').value = name || ''; field('user-password').value = name ? state.users[name].password : ''; field('user-profile').value = name ? state.users[name].profile : 'default'; openWindow('user-edit'); };
    document.querySelector('[data-hotspot-add]').addEventListener('click', () => { if (hotspotTab === 'User Profiles') editProfile(); else if (hotspotTab === 'Users') editUser(); else explainError('Untuk membuat server gunakan tab Servers → Hotspot Setup. Untuk profile pilih User Profiles → +, sedangkan akun dibuat melalui Users → +.'); });
    document.querySelectorAll('[data-edit-form]').forEach((form) => form.addEventListener('submit', (event) => event.preventDefault()));
    document.querySelectorAll('[data-save-form]').forEach((button) => button.addEventListener('click', () => {
        const name = button.dataset.saveForm;
        if (name === 'wireless-edit') {
            if (!state.wireless.enabled) return explainError('wlan1 masih disabled. Tutup jendela, pilih baris wlan1 pada tab WiFi Interfaces, lalu klik centang ✓.');
            if (value('mode') !== 'ap bridge' || value('ssid') !== parameters.ssid || value('wlan-name') !== 'wlan1') return explainError('Pada tab Wireless, pilih Mode ap bridge dan isi SSID SMKN1-Amuntai. Biarkan Name wlan1 pada tab General.');
            if (state.stage !== 'wireless' && value('security') !== 'user') return explainError('Pilih Security Profile user pada tab Wireless agar wlan1 memakai password yang sudah dibuat.');
            if (value('security') === 'user' && !model.securityValid(state)) return explainError('Security Profile user belum tersedia. Buat dahulu melalui Wireless → Security Profiles → +.');
            state.wireless = { enabled: true, mode: value('mode'), ssid: value('ssid'), security: value('security') };
        } else if (name === 'security-edit') {
            const security = { name: value('security-name'), mode: value('security-mode'), wpa: field('wpa').checked, wpa2: field('wpa2').checked, key: field('wpa-key').value, key2: field('wpa2-key').value };
            if (!model.securityValid({ security })) return explainError('Isi Name user, Mode dynamic keys, centang WPA PSK dan WPA2 PSK, lalu isi kedua Pre-Shared Key dengan Sekolah123. Password WiFi ini dipakai saat HP bergabung ke jaringan.');
            state.security = security;
        } else if (name === 'profile-edit') {
            const id = value('profile-name'), target = parameters.profiles[id];
            if (!target) return explainError('Gunakan nama profile kepalasekolah, guru, atau siswa. Ikuti nama pada petunjuk aktif.');
            if (Number(value('shared')) !== target.shared || value('rate') !== target.rate) return explainError('Profile ' + id + ' membutuhkan Shared Users ' + target.shared + ' dan Rate Limit ' + target.rate + '. Isi rx/tx lengkap dengan huruf k dan tanda /.');
            if (editingProfile && state.profiles[editingProfile] && editingProfile !== id) delete state.profiles[editingProfile];
            state.profiles[id] = { shared: Number(value('shared')), rate: value('rate') };
        } else if (name === 'user-edit') {
            const id = value('user-name'), target = parameters.profiles[id];
            if (!target || field('user-password').value !== target.password || value('user-profile') !== id || !model.profileValid(state, id)) return explainError('Buat akun dengan pasangan yang tepat: kepalasekolah/123 → profile kepalasekolah; guru/456 → profile guru; siswa/789 → profile siswa. Profile harus sudah dibuat terlebih dahulu.');
            state.users[id] = { password: field('user-password').value, profile: id }; state.verified[id] = false;
        }
        if (!button.hasAttribute('data-apply')) windows.get(name).hidden = true;
        persist(); render(); message('Pengaturan tersimpan.', 'success');
    }));
    document.querySelector('[data-hotspot-setup]').addEventListener('click', () => { if (hotspotTab !== 'Servers') return explainError('Pilih tab Servers terlebih dahulu, lalu klik Hotspot Setup.'); if (!model.wifiReady(state)) return explainError('Selesaikan wlan1 dan Security Profile user terlebih dahulu.'); setupStep = 0; setupDraft = []; setupConfirmed = false; openWindow('hotspot-setup'); setupPaint(); });
    document.querySelector('[data-setup-back]').addEventListener('click', () => { if (setupStep > 0 && setupStep < 8) { setupStep--; setupPaint(); } });
    document.querySelector('[data-setup-next]').addEventListener('click', () => {
        if (setupStep === 8) { setupConfirmed = true; state.hotspotConfirmed = true; windows.get('hotspot-setup').hidden = true; persist(); render(); return; }
        if (setupStep === 7) {
            const user = document.querySelector('[data-setup-credential="name"]').value.trim(), password = document.querySelector('[data-setup-credential="password"]').value;
            if (user !== 'admin' || password !== 'admin') return explainError('Isi Name admin dan Password admin untuk akun HotSpot awal. Ini tidak sama dengan password WiFi Sekolah123.');
            setupDraft[7] = { name: user, password }; state.hotspot = { interface: setupDraft[0], dnsName: setupDraft[6], user, password };
        } else {
            const current = setupScreens[setupStep]; const actual = current[3] ? document.querySelector('[data-setup-select]').value : document.querySelector('[data-setup-input]').value.trim();
            const expected = setupStep === 6 ? parameters.dnsName : current[2];
            if (actual !== expected) return explainError(current[1] + ' belum sesuai. ' + (setupStep === 6 ? 'Ketik hotspot-tkj.com tanpa http:// atau spasi.' : 'Gunakan ' + expected + ' pada layar ini, lalu klik Next.'));
            setupDraft[setupStep] = actual;
        }
        setupStep++; persist(); setupPaint(); render();
    });
    const openPhoneBrowser = () => {
        if (!phoneWifiEnabled || !state.phoneConnected) return explainError('HP belum terhubung ke Wi-Fi. Pada HP, buka Pengaturan Wi-Fi, aktifkan Gunakan Wi-Fi, pilih SMKN1-Amuntai, lalu Connect dengan password Sekolah123. Setelah itu halaman login HotSpot dapat dibuka.');
        if (!model.hotspotValid(state)) return explainError('HP sudah terhubung ke Wi-Fi, tetapi portal belum tersedia. Kembali ke WinBox → IP → Hotspot → Servers dan selesaikan Hotspot Setup pada wlan1.');
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
        if (!model.wifiReady(state)) return explainError('WiFi belum siap. Periksa Wireless: wlan1 aktif, Mode ap bridge, SSID SMKN1-Amuntai, Security Profile user.');
        if (document.querySelector('[data-wifi-password]').value !== parameters.wifiPassword) return explainError('Password WiFi belum benar. Masukkan Sekolah123 untuk bergabung ke SSID SMKN1-Amuntai. Akun admin/admin dimasukkan pada browser portal setelah WiFi terhubung.');
        state.phoneConnected = true; phoneScreen = model.hotspotValid(state) ? 'browser' : 'wifi'; document.querySelector('[data-wifi-connect]').hidden = true;
        document.querySelector('[data-phone-status]').textContent = 'Terhubung ke ' + parameters.ssid + '\nIP: 192.168.20.10\nGateway/DNS: 192.168.20.1';
        if (state.uploaded && model.loginHtmlValid(state.portalHtml)) state.portalVerified = true;
        persist(); render(); message('HP terhubung. Lanjutkan login pada browser portal.', 'success');
    });
    document.querySelector('[data-phone-forget]').addEventListener('click', () => { state.phoneConnected = false; session = null; phoneScreen = 'wifi'; document.querySelector('[data-wifi-password]').value = ''; document.querySelector('[data-wifi-connect]').hidden = true; document.querySelector('[data-phone-status]').textContent = 'Jaringan dilupakan. Pilih SSID sekolah dan hubungkan kembali.'; persist(); render(); });
    document.querySelector('[data-phone-login]').addEventListener('submit', (event) => {
        event.preventDefault(); const name = document.querySelector('[data-phone-user]').value.trim(); const password = document.querySelector('[data-phone-password]').value;
        const result = model.authenticate(state, name, password, session?.name === name ? 1 : 0);
        if (!result.ok) return explainError(result.reason === 'credentials' ? 'Username, password atau profile belum cocok. Akun awal admin/admin; akun lain harus mengikuti daftar tugas dan User Profile yang sudah dibuat.' : result.reason === 'sessions' ? 'Shared Users akun ini sudah mencapai batas sesi. Log out sesi sebelumnya pada HP sebelum login lagi.' : 'Hubungkan HP ke WiFi sekolah dan pastikan HotSpot Setup pada wlan1 sudah selesai.');
        session = { name, ...result }; if (name === 'admin') state.initialLogin = true; else state.verified[name] = true;
        document.querySelector('[data-session-details]').textContent = 'Login berhasil\nUser: ' + name + '\nIP: 192.168.20.10\nProfile: ' + result.profile + '\nShared Users: ' + result.shared + '\nRate Limit rx/tx: ' + result.rate;
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
    upload.addEventListener('drop', (event) => { event.preventDefault(); event.stopPropagation(); if (event.dataTransfer.getData('text/plain') !== 'desktop-login-html' || !state.edited || !model.loginHtmlValid(downloadedHtml)) return explainError('Simpan perubahan login.html di Notepad dahulu, lalu seret file desktop ke File List.'); say('File hotspot/login.html akan diganti dengan versi desktop. Klik untuk menerapkan halaman login yang baru.', () => { state.portalHtml = downloadedHtml; state.uploaded = true; state.portalVerified = false; persist(); render(); message('Halaman login di router sudah diganti. Hubungkan ulang WiFi HP untuk memeriksa sambutannya.', 'success'); }); });
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
        ['Siapkan identitas WiFi', 'Aktifkan wlan1, gunakan mode ap bridge dan SSID SMKN1-Amuntai. Buat Security Profile user dengan password Sekolah123.'],
        ['Dua pintu masuk yang berbeda', 'Password WiFi menghubungkan HP ke wireless. Akun HotSpot dipakai sesudahnya pada halaman login hotspot-tkj.com.'],
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
