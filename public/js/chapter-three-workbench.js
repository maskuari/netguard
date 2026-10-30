(() => {
    'use strict';
    const scene = document.querySelector('.ch3-scene');
    if (!scene) return;
    const navbar = window.NetGuardChapterNavbar;
    const updateBackAvailability = () => navbar.setBackEnabled(prologue.hidden || prologueIndex > 0);
    const model = window.NetGuardChapterThree;
    const evaluation = window.NetGuardEvaluation;
    const key = 'netguard.chapter-three.v1.' + scene.dataset.userId;
    const read = (storageKey) => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } };
    const saved = read(key);
    const previous = read('netguard.chapter-two.v2.' + scene.dataset.userId);
    const completed = scene.dataset.completed === 'true';
    const groups = ['local'];
    const initialLan = Object.fromEntries(groups.map((group) => {
        const prefix = 100;
        const pool = previous?.pools?.[group] || '192.168.' + prefix + '.2-192.168.' + prefix + '.254';
        return [group, { pool, address: previous?.clientLeases?.[group]?.address || pool.split('-')[0], gateway: '192.168.' + prefix + '.1', ready: previous ? Boolean(previous.addresses?.[group] && previous.pools?.[group] && !previous.addressDisabled?.[group] && !previous.dhcpDisabled?.[group]) : true }];
    }));
    const state = {
        stage: completed ? 'finish' : 'intro', highest: completed ? 4 : 0, prologueComplete: false,
        wan: { link: true, bound: previous ? Boolean(previous.wan) : true, defaultRoute: previous ? Boolean(previous.wan) : true },
        wanChecked: completed, dns: { servers: completed ? ['8.8.8.8', '8.8.4.4'] : [], remote: completed }, nat: completed ? { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade', disabled: false, packets: 16 } : null,
        routerTests: { ip: completed, domain: completed }, clientTests: { local: completed }, lan: initialLan,
        ...saved,
    };
    state.lan.local = initialLan.local;
    state.guideActions = { ...saved?.guideActions };
    state.wanInspected = { client: completed, route: completed, ...saved?.wanInspected };
    state.wanChecked = state.wanInspected.client && state.wanInspected.route && model.wanReady(state);
    const stageNames = ['dns', 'nat', 'router', 'clients'];
    if (state.stage === 'wan') state.stage = 'dns';
    if (!['intro', ...stageNames, 'quiz', 'finish'].includes(state.stage)) state.stage = 'intro';
    state.routerTests = { ip: completed, domain: completed, ...saved?.routerTests };
    state.clientChecks = Object.fromEntries(groups.map((group) => [group, { config: completed, ip: completed, domain: completed, ...saved?.clientChecks?.[group] }]));
    state.clientTests = Object.fromEntries(groups.map((group) => [group, Boolean(state.clientChecks[group].config && state.clientChecks[group].ip && state.clientChecks[group].domain && model.clientTest(state, group).ok)]));
    if (!completed && ['quiz', 'finish'].includes(state.stage) && !groups.every((group) => state.clientTests[group])) state.stage = 'clients';
    const windows = new Map([...document.querySelectorAll('[data-window]')].map((node) => [node.dataset.window, node]));
    const quiz = document.querySelector('[data-quiz-dialog]');
    const finish = document.querySelector('[data-finish-dialog]');
    const learning = document.querySelector('[data-learning-dialog]');
    const overlay = document.querySelector('[data-ch2-dialogue]');
    const surface = scene.querySelector('.lab-scroll');
    const prologue = document.querySelector('[data-ch2-prologue]');
    let selectedNat = false;
    let topLayer = 20;
    let nextLesson = null;
    let dialogueCallback = null;
    let dialogueTimer = null;
    let dialogueFullText = '';
    let returnFocus = null;
    let prologueIndex = 0;
    let prologueTimer = null;
    let prologueTyping = false;
    let replaying = false;
    let pendingRouterTest = false;
    let missionCompletionTimer = null;
    let announcedMission = null;
    let guideStage = null;
    let guideIndex = 0;
    let guideAdvanceTimer = null;
    let stepGuide = null;
    const pendingClients = new Set();
    let clientTestRevision = 0;
    const invalidateClientTests = () => {
        clientTestRevision++;
        pendingClients.clear();
        state.clientTests = { local: false };
        state.clientChecks = Object.fromEntries(groups.map((group) => [group, { config: false, ip: false, domain: false }]));
    };
    const info = {
        dns: { title: 'Atur DNS router', section: 'Pengaturan DNS router', lesson: 'DNS (Domain Name System) membantu perangkat mencari alamat IP dari nama situs. Contohnya, saat PC siswa membuka google.com, PC meminta alamat situs itu kepada server DNS, lalu memakai jawaban tersebut untuk menghubungi situsnya.\n\nPada jaringan sekolah ini, kita memakai Google Public DNS: 8.8.8.8 dan 8.8.4.4. Masukkan keduanya pada kolom Servers. Angka tersebut adalah alamat server DNS yang membantu pencarian, bukan alamat IP situs google.com.\n\nAllow Remote Requests diaktifkan agar router dapat menjawab permintaan DNS dari komputer sekolah. Jika tidak diaktifkan, layanan DNS router hanya melayani router itu sendiri. DNS yang benar membantu pencarian nama situs; akses internet akan kita uji setelah aturan NAT disiapkan.', steps: ['Klik IP pada menu kiri WinBox, lalu klik DNS.', 'Di jendela DNS Settings, isi kotak Servers pertama dengan 8.8.8.8 dan kotak kedua dengan 8.8.4.4.', 'Klik kotak Allow Remote Requests sampai tercentang, lalu klik OK untuk menyimpan.', 'Periksa target Servers dan Allow Remote Requests di panel ini. Keduanya harus hijau dan bertanda ✓.'], action: 'Buka IP → DNS' },
        nat: { title: 'Buat NAT masquerade', section: 'NAT masquerade', lesson: 'IP pribadi siswa dan guru perlu diterjemahkan saat keluar ke WAN. Aturan srcnat dengan action masquerade memakai alamat pada ether1-internet. Aturan ini diperlukan untuk klien; router bisa ping internet meskipun NAT belum dibuat.', steps: ['Klik IP pada menu kiri WinBox, lalu klik Firewall. Di jendela Firewall, klik tab NAT, kemudian tombol + di atas tabel.', 'Di jendela aturan baru, klik tab General. Pilih Chain: srcnat dan Out. Interface: ether1-internet. Biarkan Src. Address dan Dst. Address kosong.', 'Klik tab Action, lalu pilih masquerade pada kolom Action. Klik OK untuk menyimpan aturan.', 'Lihat baris aturan yang muncul di tabel NAT. Target NAT aktif pada panel ini harus hijau dan bertanda ✓.'], action: 'Buka Firewall → NAT' },
        router: { title: 'Uji internet dari router', section: 'Pengujian internet dari router', lesson: 'Periksa status bound pada DHCP Client dan jalur keluar pada Routes terlebih dahulu. Setelah itu uji alamat IP, kemudian nama domain. Jika ping IP berhasil tetapi nama gagal, periksa DNS. Pengujian nama dari New Terminal berjalan dari router, sehingga tidak tertukar dengan DNS komputer yang menjalankan WinBox.', steps: ['Klik New Terminal pada menu kiri WinBox. Klik kolom ketik setelah tulisan [admin@Router] >.', 'Ketik ping 8.8.8.8 count=4, lalu tekan Enter. Tunggu hasil sent=4 received=4 packet-loss=0% pada terminal.', 'Di kolom ketik yang sama, ketik ping google.com count=4, lalu tekan Enter. Tunggu hasil received=4 lagi.', 'Periksa target Ping alamat IP dan Ping nama domain di panel ini. Keduanya harus hijau dan bertanda ✓. Jika uji nama gagal, klik IP → DNS untuk memeriksa server DNS.'], action: 'Buka New Terminal' },
        clients: { title: 'Uji internet dari PC lab', section: 'Pengujian PC konfigurasi', lesson: 'PC yang kita nyalakan sejak awal tetap terhubung ke ether3-local. WinBox dipakai untuk mengatur router, sedangkan Command Prompt berjalan pada komputer itu sendiri.\n\nKlik Desktop PC pada taskbar di bawah layar PC, lalu buka ikon Command Prompt. Jalankan ipconfig /all untuk memeriksa IP 192.168.100.x dan gateway 192.168.100.1. Kemudian ketik ping 8.8.8.8, dilanjutkan ping google.com.\n\nReply from dan Received = 4, Lost = 0 (0% loss) menunjukkan balasan diterima. Jika pengujian gagal, ikuti koreksi Pak Amat. Untuk memperbaiki router, kembali ke desktop lalu buka WinBox; setelah disimpan, buka CMD lagi dan ulangi pengujian.', steps: [], action: 'Buka Command Prompt pada PC lab' },
    };
    const persist = () => {
        try { localStorage.setItem(key, JSON.stringify({ ...state, answers: [...document.querySelectorAll('[data-quiz-form] input:checked')].map((node) => Number(node.value)) })); return true; } catch { return false; }
    };
    const message = (text, kind = '') => { const node = document.querySelector('[data-feedback]'); node.textContent = text; node.dataset.kind = kind; if (kind === 'error' || kind === 'success') window.NetGuardAudio?.play(kind === 'error' ? 'error' : 'correct'); };
    const say = (text, callback = null) => {
        window.clearInterval(dialogueTimer);
        dialogueCallback = callback;
        dialogueFullText = text;
        if (overlay.hidden) returnFocus = document.activeElement;
        surface.inert = true; overlay.hidden = false;
        updateBackAvailability();
        const body = overlay.querySelector('[data-dialogue-text]');
        body.textContent = '';
        overlay.querySelector('[data-dialogue-count]').textContent = 'KLIK DI MANA SAJA UNTUK LANJUT';
        overlay.querySelector('[data-ch2-dialogue-next]').focus({ preventScroll: true });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { body.textContent = text; dialogueTimer = null; return; }
        let position = 0;
        dialogueTimer = window.setInterval(() => { position += 3; body.textContent = text.slice(0, position); if (position >= text.length) { window.clearInterval(dialogueTimer); dialogueTimer = null; } }, 20);
    };
    const explainError = (text, callback = null) => { window.NetGuardAudio?.play('error'); say(text, callback); };
    const advanceDialogue = () => {
        if (overlay.hidden) return;
        if (dialogueTimer) { window.clearInterval(dialogueTimer); dialogueTimer = null; overlay.querySelector('[data-dialogue-text]').textContent = dialogueFullText; return; }
        overlay.hidden = true; surface.inert = false;
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        const callback = dialogueCallback; dialogueCallback = null; callback?.(); render();
    };
    overlay.addEventListener('click', (event) => { event.stopPropagation(); advanceDialogue(); });
    document.addEventListener('keydown', (event) => { if (!overlay.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); advanceDialogue(); } });
    const reasonText = {
        link: 'Link ether1-internet belum aktif. Periksa sambungan WAN terlebih dahulu.',
        wan: 'Router belum menerima IP dari penyedia internet. Klik IP → DHCP Client, klik baris ether1-internet, lalu klik Renew. Tunggu Status bound dan Address 192.0.2.2/24, lalu klik kembali baris itu. Address 0.0.0.0 berarti IP belum diterima; jangan lanjut ke Routes dulu.',
        route: 'Jalur keluar belum tersedia. Klik IP → DHCP Client, pilih baris ether1-internet, lalu klik Renew. Setelah Status bound dan Address 192.0.2.2/24 muncul, klik baris itu, lalu buka IP → Routes. Cari Dst. Address 0.0.0.0/0 melalui Gateway 192.0.2.1%ether1-internet. Angka 0.0.0.0/0 di tabel Routes adalah tujuan rute default, bukan IP router yang kosong.',
        dns: 'DNS router belum sesuai. Buka IP → DNS, isi 8.8.8.8 dan 8.8.4.4, lalu simpan. Ping IP dapat berhasil meskipun nama domain belum bisa diterjemahkan.',
        remote: 'Router belum melayani DNS untuk PC. Aktifkan Allow Remote Requests pada IP → DNS, lalu uji ulang klien.',
        nat: 'Router sudah memiliki jalur internet, tetapi NAT klien belum benar. Periksa IP → Firewall → NAT: chain srcnat, Out. Interface ether1-internet, action masquerade, dan aturan harus aktif.',
        lan: 'PC lab belum memperoleh konfigurasi lokal yang benar. IP PC harus 192.168.100.x dengan gateway 192.168.100.1. Pengaturan ini berasal dari IP → Addresses pada ether3-local dan IP → DHCP Server untuk ether3-local yang disiapkan pada Chapter 2. Periksa kedua pengaturan tersebut sebelum mengulang ipconfig /all pada PC lab.',
        target: 'Untuk memeriksa jaringan sekolah, uji alamat IP 8.8.8.8 terlebih dahulu, lalu nama situs google.com.',
    };
    const closeMenus = () => { document.querySelectorAll('[data-ch2-submenu]').forEach((node) => { node.hidden = true; }); document.querySelectorAll('[data-ch2-menu]').forEach((node) => node.setAttribute('aria-expanded', 'false')); };
    const focusWindow = (name) => { windows.forEach((node, keyName) => node.classList.toggle('is-focused', keyName === name)); windows.get(name).style.zIndex = String(++topLayer); };
    const openWindow = (name) => {
        const node = windows.get(name); if (!node) return;
        closeMenus(); node.hidden = false; focusWindow(name);
        document.querySelector('[data-taskbar] [data-restore="' + name + '"]')?.remove();
        if (name === 'dns') {
            document.querySelectorAll('[data-dns-server]').forEach((input, index) => { input.value = state.dns.servers[index] || ''; });
            document.querySelector('[data-dns-remote]').checked = state.dns.remote;
            document.querySelector('[data-dns-second]').hidden = state.dns.servers.length < 2;
        }
        if (name === 'terminal') document.querySelector('[data-terminal-command]').focus({ preventScroll: true });
        recordGuideAction('open:' + name);
    };
    const closeWindow = (name) => { windows.get(name).hidden = true; };
    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow)));
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeWindow(button.dataset.close)));
    document.querySelectorAll('[data-maximize]').forEach((button) => button.addEventListener('click', () => windows.get(button.dataset.maximize).classList.toggle('is-maximized')));
    document.querySelectorAll('[data-minimize]').forEach((button) => button.addEventListener('click', () => {
        const name = button.dataset.minimize; closeWindow(name);
        if (document.querySelector('[data-taskbar] [data-restore="' + name + '"]')) return;
        const restore = document.createElement('button'); restore.type = 'button'; restore.dataset.restore = name; restore.textContent = windows.get(name).querySelector('header > span').textContent;
        restore.addEventListener('click', () => openWindow(name)); document.querySelector('[data-taskbar]').append(restore);
    }));
    windows.forEach((node, name) => {
        if (node.classList.contains('ch2-window--list')) node.classList.add('is-maximized');
        node.addEventListener('pointerdown', () => focusWindow(name));
        const header = node.querySelector('header');
        header.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button') || node.classList.contains('is-maximized')) return;
            const x = event.clientX, y = event.clientY, left = node.offsetLeft, top = node.offsetTop;
            header.setPointerCapture(event.pointerId);
            const move = (next) => { const bounds = node.parentElement.getBoundingClientRect(); node.style.left = Math.max(0, Math.min(bounds.width - node.offsetWidth, left + next.clientX - x)) + 'px'; node.style.top = Math.max(0, Math.min(bounds.height - node.offsetHeight, top + next.clientY - y)) + 'px'; };
            const stop = () => { header.removeEventListener('pointermove', move); header.removeEventListener('pointerup', stop); header.removeEventListener('pointercancel', stop); };
            header.addEventListener('pointermove', move); header.addEventListener('pointerup', stop); header.addEventListener('pointercancel', stop);
        });
    });
    document.querySelectorAll('[data-ch2-menu]').forEach((button) => button.addEventListener('click', () => {
        const menu = document.querySelector('[data-ch2-submenu="' + button.dataset.ch2Menu + '"]');
        const wasOpen = !menu.hidden; closeMenus(); if (wasOpen) return;
        menu.hidden = false; menu.style.top = Math.max(0, Math.min(button.offsetTop, menu.parentElement.clientHeight - menu.offsetHeight)) + 'px'; button.setAttribute('aria-expanded', 'true');
    }));
    document.addEventListener('click', (event) => { if (!event.target.closest('.ch2-nav')) closeMenus(); });
    const app = document.querySelector('.ch2-routeros');
    const pcDesktop = window.NetGuardPcDesktop.create({
        onOpenWinbox: () => { app.hidden = false; },
        onHome: () => recordGuideAction('desktop:local'),
        onCmd: () => { recordGuideAction('desktop:local'); recordGuideAction('cmd:local'); },
        handleCommands: false,
    });
    pcDesktop.setAvailable(true);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => { app.hidden = true; pcDesktop.showDesktop(); }));
    document.querySelector('[data-ch2-app-size]').addEventListener('click', () => scene.classList.toggle('is-restored'));
    const done = (stageName) => ({ dns: model.dnsValid(state) && state.dns.remote, nat: model.natValid(state), router: state.wanChecked && state.routerTests.ip && state.routerTests.domain && model.routerTest(state, 'google.com').ok, clients: groups.every((group) => state.clientTests[group] && model.clientTest(state, group).ok) })[stageName] || false;
    const taskItems = (stageName) => {
        if (stageName === 'dns') return [['Servers', '8.8.8.8 dan 8.8.4.4', model.dnsValid(state)], ['Allow Remote Requests', 'Centang agar PC dapat memakai DNS router', state.dns.remote]];
        if (stageName === 'nat') return [['NAT aktif', 'srcnat · ether1-internet · masquerade', model.natValid(state)]];
        if (stageName === 'router') return [['DHCP Client WAN', 'IP WAN 192.0.2.2/24 · Status bound', state.wanInspected.client && state.wan.link && state.wan.bound], ['Default route', 'Tujuan jaringan luar → gateway ISP 192.0.2.1', state.wanInspected.route && model.wanReady(state)], ['Ping alamat IP', 'ping 8.8.8.8 count=4', state.routerTests.ip && model.routerTest(state, '8.8.8.8').ok], ['Ping nama domain', 'ping google.com count=4', state.routerTests.domain && model.routerTest(state, 'google.com').ok]];
        if (stageName === 'clients') return groups.map((group) => ['Internet PC lab', 'IP ' + state.lan[group].address + ' · gateway/DNS ' + state.lan[group].gateway, state.clientTests[group] && model.clientTest(state, group).ok]);
        return stageNames.map((name) => [info[name].title, info[name].section, done(name)]);
    };
    const guidePlan = () => {
        const actions = state.guideActions[state.stage] || {};
        const value = (selector) => document.querySelector(selector).value.trim();
        const dnsDraft = { dns: { servers: [...document.querySelectorAll('[data-dns-server]')].map((input) => input.value.trim()) } };
        const natGeneral = value('[data-nat-chain]') === 'srcnat' && value('[data-nat-out]') === 'ether1-internet' && !value('[data-nat-source]') && !value('[data-nat-destination]');
        const wanSteps = () => [
            ['Klik IP di deretan menu kiri WinBox. Pada daftar yang terbuka di sebelahnya, klik DHCP Client.\n\nJendela DHCP Client akan menampilkan koneksi router ke penyedia internet. Setelah jendela terbuka, petunjuk berikutnya akan menunjukkan letak status yang harus diperiksa.', actions['open:wan']],
            ['Di tabel DHCP Client, cari baris ether1-internet. Periksa kolom Status dan Address: hasil yang benar adalah bound dan 192.0.2.2/24. Inilah IP router pada jalur internet.\n\nJika Address masih 0.0.0.0 atau Status searching, klik baris ether1-internet lalu klik Renew di atas tabel. Tunggu sampai bound dan IP muncul. IP WAN diminta otomatis dari penyedia internet, jadi tidak perlu membuat IP manual melalui Addresses.\n\nSetelah kedua kolom benar, klik kembali baris ether1-internet untuk menandai pemeriksaan selesai.', state.wanInspected.client && state.wan.link && state.wan.bound],
            ['IP WAN router sudah diperiksa pada DHCP Client. Sekarang klik IP pada menu kiri, lalu klik Routes untuk membuka Route List.\n\nKita akan memeriksa jalur pengiriman data ke jaringan luar. Dst. Address adalah tujuan jaringan, sedangkan Gateway adalah perangkat berikutnya yang menerima data dari router.', actions['open:routes']],
            ['Cari 0.0.0.0/0 pada kolom Dst. Address. Ini berarti semua tujuan yang tidak memiliki rute lebih khusus, bukan IP router yang kosong. Jangan mengganti angka ini dengan IP WAN.\n\nPada baris yang sama, pastikan Gateway 192.0.2.1%ether1-internet dan Flags memuat A (aktif). Jika benar, klik baris tersebut untuk menandai pemeriksaan rute selesai.\n\nJika rute belum ada: klik IP → DHCP Client, pilih baris ether1-internet, klik Renew, tunggu bound dan Address 192.0.2.2/24, lalu klik kembali barisnya. Buka IP → Routes lagi.\n\nCentang hijau ini hanya menyatakan rute sudah diperiksa. Setelahnya kita tetap harus menguji koneksi lewat ping di New Terminal.', state.wanInspected.client && state.wanInspected.route && model.wanReady(state)],
        ];
        if (state.stage === 'dns') return [
            ['Lakukan: klik IP di menu kiri WinBox, lalu pilih DNS.\n\nYang muncul: jendela DNS Settings untuk mengisi alamat server DNS.', actions['open:dns']],
            ['Lakukan: klik kolom Servers dan ketik 8.8.8.8. Klik panah kecil ▾ di sebelah kolom itu untuk menampilkan kotak kedua, lalu isi 8.8.4.4.\n\nJika belum hijau: periksa kedua alamat. Jangan menambahkan /24 dan jangan mengetik pada Dynamic Servers.', model.dnsValid(state) || model.dnsValid(dnsDraft)],
            ['Lakukan: klik kotak Allow Remote Requests sampai muncul tanda centang.\n\nTujuannya: mengizinkan komputer sekolah meminta layanan DNS kepada router. Jika sudah tercentang, biarkan tetap tercentang.', state.dns.remote || document.querySelector('[data-dns-remote]').checked],
            ['Lakukan: klik OK di sisi kanan jendela untuk menyimpan. Apply juga menyimpan, tetapi jendelanya tetap terbuka.\n\nJika muncul koreksi Pak Amat: perbaiki kolom yang disebutkan, lalu klik OK lagi. Target DNS harus hijau sebelum lanjut.', done('dns')],
        ];
        if (state.stage === 'nat') return [
            ['Klik IP di menu kiri WinBox, lalu pilih Firewall. Jendela Firewall akan terbuka.\n\nKita akan membuat aturan NAT agar alamat IP lokal komputer sekolah dapat diterjemahkan saat koneksinya keluar melalui port internet.', actions['open:firewall']],
            ['Di bagian atas jendela Firewall, klik tab NAT. Lalu klik tombol + pada deretan tombol di atas tabel.\n\nJendela aturan baru akan terbuka. Jika belum muncul, pastikan yang diklik adalah tombol + pada tab NAT, bukan tombol pada jendela lain.', actions['open:nat-edit']],
            ['Di jendela aturan baru, klik tab General. Klik pilihan Chain dan pilih srcnat. Klik Out. Interface dan pilih ether1-internet, yaitu port menuju penyedia internet.\n\nBiarkan Src. Address dan Dst. Address kosong. Jika langkah belum hijau, periksa keempat kolom tersebut. ether2-vlan dan ether3-local bukan port keluar menuju internet.', model.natValid(state) || natGeneral],
            ['Di bagian atas jendela aturan NAT yang sedang diedit, klik tab Action di sebelah tab General.\n\nTab ini menentukan tindakan yang dilakukan terhadap trafik. Pengaturan Chain dan Out. Interface yang tadi diisi tetap tersimpan dalam formulir, jadi tidak perlu dibuat ulang.', actions['nat:action']],
            ['Klik daftar pilihan Action, lalu pilih masquerade. Pilihan ini menerjemahkan alamat lokal klien menjadi alamat pada jalur internet router.\n\nJika masih tertulis accept, ubah ke masquerade. accept hanya mengizinkan trafik dan tidak melakukan penerjemahan alamat yang kita perlukan.', model.natValid(state) || value('[data-nat-action]') === 'masquerade'],
            ['Klik OK di sisi kanan jendela aturan untuk menyimpan. Aturan akan muncul sebagai satu baris di tabel NAT dan target NAT aktif menjadi hijau.\n\nJika Pak Amat memberi koreksi, perbaiki kolom atau tab yang disebutkan, lalu simpan lagi. Jangan klik + lagi karena formulir aturan yang sedang dikerjakan masih ada.', done('nat')],
        ];
        if (state.stage === 'router') return [
            ...wanSteps(),
            ['Klik New Terminal pada deretan menu kiri WinBox. Jendela terminal akan terbuka dengan tempat mengetik setelah tulisan [admin@Router] >.\n\nPerintah yang dijalankan di sini menguji koneksi dari router, bukan dari komputer sekolah.', actions['open:terminal']],
            ['Klik kolom ketik setelah [admin@Router] >. Ketik ping 8.8.8.8 count=4 lalu tekan Enter. Tunggu hasil sent=4 received=4 packet-loss=0%; artinya keempat paket uji mendapat balasan.\n\nJika perintah tidak dikenali, ketik ulang persis seperti contoh. Jika hasilnya request timed out atau received=0, ikuti koreksi Pak Amat: periksa IP → DHCP Client dan IP → Routes, lalu jalankan perintah ping yang sama lagi.', state.routerTests.ip && model.routerTest(state, '8.8.8.8').ok],
            ['Pada kolom terminal yang sama, ketik ping google.com count=4 lalu tekan Enter. Hasil yang benar kembali menunjukkan received=4 dan packet-loss=0%. Ini memeriksa apakah router bisa mencari alamat dari nama domain sekaligus menjangkaunya.\n\nJika muncul pesan dns resolver atau nama tidak ditemukan, klik IP → DNS. Periksa Servers 8.8.8.8 dan 8.8.4.4, klik OK, lalu buka New Terminal dan ulangi perintah tadi.', state.routerTests.domain && model.routerTest(state, 'google.com').ok],
        ];
        if (state.stage === 'clients') {
            const checks = state.clientChecks.local;
            return [
                ['Klik Desktop PC pada taskbar di bawah layar PC. Ini adalah PC yang sama sejak Chapter 1, terhubung ke port ether3-local.\n\nKonfigurasi dan jendela WinBox tetap tersimpan ketika kembali ke desktop.', actions['desktop:local']],
                ['Pada desktop PC lab, klik ikon Command Prompt di samping WinBox. Jendela hitam dengan awalan C:\\Users\\Lab> akan terbuka.\n\nPerintah di CMD dijalankan dari PC, sedangkan New Terminal di WinBox menjalankan perintah dari router.', actions['cmd:local']],
                ['Ketik ipconfig /all pada baris Command Prompt lalu tekan Enter. Periksa IPv4 Address 192.168.100.x, Subnet Mask 255.255.255.0, serta Default Gateway 192.168.100.1.\n\nAlamat ini berasal dari DHCP pada ether3-local yang disiapkan sebelumnya. IP PC ini berbeda dari IP WAN router dan IP VLAN siswa/guru. Jika Address masih 0.0.0.0, ikuti koreksi Pak Amat sebelum melanjutkan.', checks.config && model.clientCommand(state, 'local', 'ipconfig /all').ok],
                ['Pada Command Prompt PC lab, ketik ping 8.8.8.8 lalu tekan Enter. Tunggu empat balasan Reply from dan ringkasan Received = 4, Lost = 0 (0% loss).\n\nJika CMD tidak terlihat, klik Desktop PC lalu ikon Command Prompt. Jika Request timed out, ikuti koreksi Pak Amat, lalu ulangi perintah.', checks.ip && model.clientTest(state, 'local', '8.8.8.8').ok],
                ['Pada CMD yang sama, ketik ping google.com lalu tekan Enter. Tunggu Received = 4, Lost = 0 (0% loss).\n\nIni memeriksa pencarian nama Google melalui DNS dan koneksi dari PC lab. Jika gagal karena DNS, klik Desktop PC → WinBox → IP → DNS. Simpan perbaikannya, lalu kembali ke Desktop PC → Command Prompt dan ulangi pengujian.', checks.domain && state.clientTests.local && model.clientTest(state, 'local').ok],
            ];
        }
        return [];
    };
    const renderGuide = () => {
        if (!stepGuide) stepGuide = window.NetGuardStepGuide.create({
            list: document.querySelector('[data-guide-list]'),
            getKey: () => state.stage + ':' + resetRevision,
            getPlan: () => {
                const plan = guidePlan();
                if (plan.length) return plan;
                const text = state.stage === 'intro' ? 'Kita mulai dari pengaturan DNS. Ikuti percakapan Pak Amat, lalu klik Mulai praktik pada penjelasan yang muncul.' : state.stage === 'quiz' ? 'Jawab semua soal pada evaluasi, lalu klik Simpan hasil Chapter 3.' : 'Chapter selesai. Lihat hasil evaluasi atau kembali ke peta chapter melalui panah kiri pada navbar.';
                return [[text, state.stage === 'finish']];
            },
            root: scene,
        });
        else stepGuide.refresh();
    };
    const recordGuideAction = (action) => {
        if (!stageNames.includes(state.stage)) return;
        state.guideActions[state.stage] = { ...state.guideActions[state.stage], [action]: true };
        persist(); renderGuide();
    };
    const render = () => {
        updateBackAvailability();
        const count = stageNames.filter(done).length;
        document.querySelector('[data-progress-label]').textContent = count + ' / ' + stageNames.length; document.querySelector('[data-progress]').max = stageNames.length; document.querySelector('[data-progress]').value = count;
        const current = info[state.stage];
        renderGuide();
        document.querySelector('[data-module-section]').textContent = 'Bab 3 · ' + (current?.section || 'Rekap dan evaluasi');
        document.querySelector('[data-task-heading]').textContent = current?.title || 'Misi Chapter 3';
        const items = taskItems(state.stage);
        document.querySelector('[data-task-count]').textContent = items.filter((item) => item[2]).length + ' / ' + items.length + ' selesai';
        document.querySelector('[data-task-list]').replaceChildren(...items.map(([title, detail, isDone], index) => {
            const row = document.createElement('li'); row.classList.toggle('is-done', Boolean(isDone));
            const mark = document.createElement('span'); mark.className = 'ch2-vlan-task__mark'; mark.textContent = isDone ? '✓' : String(index + 1);
            const body = document.createElement('div'), heading = document.createElement('b'), note = document.createElement('small'), status = document.createElement('span'); heading.textContent = title; note.textContent = detail; status.className = 'ch2-vlan-task__status'; status.textContent = isDone ? 'Selesai' : 'Belum selesai'; body.append(heading, note, status); row.append(mark, body); return row;
        }));
        document.querySelectorAll('[data-client-command]').forEach((input) => { input.disabled = pendingClients.has(input.dataset.clientCommand); });
        document.querySelectorAll('[data-client-busy]').forEach((status) => { status.textContent = pendingClients.has(status.dataset.clientBusy) ? 'Perintah sedang berjalan…' : ''; });
        document.querySelector('[data-previous]').hidden = ['intro', 'finish'].includes(state.stage);
        document.querySelector('[data-wan-status]').textContent = state.wan.bound ? 'bound' : 'searching'; document.querySelector('[data-wan-address]').textContent = state.wan.bound ? '192.0.2.2/24' : '0.0.0.0';
        document.querySelector('[data-default-route]').hidden = !model.wanReady(state); document.querySelector('[data-route-count]').textContent = model.wanReady(state) ? '5 items' : '4 items';
        const natRow = document.querySelector('[data-nat-row]'); natRow.hidden = !state.nat; natRow.classList.toggle('is-selected', selectedNat && Boolean(state.nat)); natRow.classList.toggle('is-disabled', Boolean(state.nat?.disabled)); natRow.setAttribute('aria-pressed', String(selectedNat && Boolean(state.nat))); document.querySelector('[data-nat-count]').textContent = state.nat ? '1 item' : '0 items';
        document.querySelectorAll('[data-nat-tool]').forEach((button) => { button.disabled = !state.nat || !selectedNat || (button.dataset.natTool === 'enable' ? !state.nat.disabled : button.dataset.natTool === 'disable' && state.nat.disabled); });
        document.querySelector('[data-nat-packets]').textContent = String(state.nat?.packets || 0); document.querySelector('[data-nat-bytes]').textContent = ((state.nat?.packets || 0) * 64) + ' B';
        document.querySelectorAll('[data-inspect-wan]').forEach((row) => {
            const inspected = Boolean(state.wanInspected[row.dataset.inspectWan]);
            row.classList.toggle('is-selected', inspected);
            row.setAttribute('aria-pressed', String(inspected));
        });
        queueMissionCompletion();
    };
    const setStage = (name) => { if (name !== 'clients') pcDesktop.hideDesktop(); state.stage = name; state.highest = Math.max(state.highest, stageNames.indexOf(name)); persist(); render(); document.querySelector('.ch3-guide').scrollTo({ top: 0, behavior: 'auto' }); };
    const showLesson = (name) => {
        nextLesson = name;
        document.querySelector('[data-learning-title]').textContent = name === 'dns' ? 'Apa itu DNS?' : info[name].title;
        const introduction = {
            dns: 'Kita akan membuka IP → DNS dan mengisi dua server DNS.',
            nat: 'Kita akan membuat aturan baru melalui IP → Firewall → NAT.',
            router: 'Setelah DNS dan NAT disimpan, kita akan memeriksa DHCP Client dan Routes, lalu menjalankan ping dari New Terminal.',
            clients: 'Kita akan membuka Command Prompt pada PC lab yang sama untuk menguji koneksi dari komputer setelah router berhasil.',
        };
        const content = name === 'dns' ? info[name].lesson.split('\n\n') : [introduction[name], ...info[name].lesson.split('\n\n')];
        const paragraphs = content.map((content) => {
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            return paragraph;
        });
        document.querySelector('[data-learning-body]').replaceChildren(...paragraphs);
        learning.showModal();
    };
    const teach = (name) => {
        if (name === 'dns') {
            say('Sekarang kita akan mengatur DNS router sekolah. Tujuannya agar komputer bisa mencari alamat IP dari nama situs, misalnya google.com. Kita gunakan server DNS Google, yaitu 8.8.8.8 dan 8.8.4.4. Mari mulai dari menu IP → DNS.', () => showLesson('dns'));
            return;
        }
        if (name === 'clients') {
            say('Koneksi router sudah berhasil. Sekarang kita uji dari PC lab yang kita gunakan sejak awal. Klik Desktop PC pada taskbar di bawah layar PC lalu buka Command Prompt. Periksa IP dengan ipconfig /all, kemudian jalankan ping ke 8.8.8.8 dan google.com. Kita pastikan koneksi berhasil dari komputer juga, bukan hanya dari router.', () => showLesson('clients'));
            return;
        }
        showLesson(name);
    };
    const queueMissionCompletion = () => {
        if (missionCompletionTimer !== null) { window.clearTimeout(missionCompletionTimer); missionCompletionTimer = null; }
        const stage = state.stage;
        if (!stageNames.includes(stage) || !done(stage) || announcedMission === stage || learning.open || !overlay.hidden || !prologue.hidden) return;
        const revision = resetRevision;
        missionCompletionTimer = window.setTimeout(() => {
            missionCompletionTimer = null;
            if (revision !== resetRevision || state.stage !== stage || !done(stage) || learning.open || !overlay.hidden) return;
            announcedMission = stage;
            const next = stageNames[stageNames.indexOf(stage) + 1];
            say(info[stage].title + ' sudah selesai. Semua target tahap ini sudah tercentang hijau.', () => {
                if (next) teach(next);
                else { setStage('quiz'); quiz.showModal(); }
            });
        }, 650);
    };
    const beginLesson = () => {
        if (!nextLesson) return;
        const destination = nextLesson; nextLesson = null;
        learning.close(); setStage(destination);
    };
    document.querySelector('[data-close-learning]').addEventListener('click', beginLesson);
    document.querySelector('[data-learning-continue]').addEventListener('click', beginLesson);
    learning.addEventListener('cancel', (event) => { event.preventDefault(); beginLesson(); });
    let resetRevision = 0;
    const resetFromStage = (destination) => {
        resetRevision++;
        const order = ['intro', ...stageNames, 'quiz', 'finish'];
        const index = order.indexOf(destination);
        const resets = (name) => order.indexOf(name) >= index;
        stageNames.filter(resets).forEach((name) => { delete state.guideActions[name]; });
        if (guideAdvanceTimer !== null) window.clearTimeout(guideAdvanceTimer);
        guideAdvanceTimer = null; guideStage = null; guideIndex = 0;
        if (resets('router')) { state.wanChecked = false; state.wanInspected = { client: false, route: false }; }
        if (missionCompletionTimer !== null) window.clearTimeout(missionCompletionTimer);
        missionCompletionTimer = null; announcedMission = null;
        if (resets('dns')) {
            state.dns = { servers: [], remote: false };
            document.querySelectorAll('[data-dns-server]').forEach((node) => { node.value = ''; });
            document.querySelector('[data-dns-remote]').checked = false;
        }
        if (resets('nat')) { state.nat = null; selectedNat = false; }
        if (resets('router')) { state.routerTests = { ip: false, domain: false }; pendingRouterTest = false; }
        if (resets('clients')) {
            state.clientTests = { local: false };
            state.clientChecks = { local: { config: false, ip: false, domain: false } };
            pendingClients.clear();
            document.querySelectorAll('[data-client-cmd]').forEach((node) => { node.hidden = true; });
            document.querySelectorAll('[data-client-terminal]').forEach((node) => { node.textContent = 'Microsoft Windows [Version 10.0.19045]\n'; });
        }
        state.highest = Math.max(0, stageNames.indexOf(destination));
        state.evaluationResult = null; evaluation.clear();
        document.querySelectorAll('[data-quiz-form] input').forEach((node) => { node.checked = false; });
    };

    const goToPreviousStep = () => {
        if (!prologue.hidden) {
            if (prologueIndex > 0) { prologueIndex--; paintPrologue(); }
            return;
        }
        if (learning.open) { learning.close(); return; }
        if (!overlay.hidden) {
            window.clearInterval(dialogueTimer); dialogueTimer = null;
            overlay.hidden = true; surface.inert = false; dialogueCallback = null;
            if (state.stage !== 'intro') { updateBackAvailability(); return; }
        }
        if (state.stage === 'intro') {
            startPrologue(true); prologueIndex = scenes.length - 1; paintPrologue(); return;
        }
        if (quiz.open) quiz.close();
        if (finish.open) finish.close();
        windows.forEach((node, name) => closeWindow(name));
        const order = ['intro', ...stageNames, 'quiz', 'finish'];
        const destination = order[Math.max(0, order.indexOf(state.stage) - 1)];
        resetFromStage(destination);
        setStage(destination);
        if (state.stage === 'intro') startPrologue();
        else if (stageNames.includes(state.stage)) teach(state.stage);
        else if (state.stage === 'quiz') quiz.showModal();
    };
    navbar.bindPrevious(goToPreviousStep);
    document.querySelector('[data-previous]').addEventListener('click', goToPreviousStep);
    document.querySelector('[data-save]').addEventListener('click', () => message(persist() ? 'Progres latihan tersimpan. Hasil evaluasi disimpan ke akun setelah semua jawaban benar.' : 'Penyimpanan browser tidak tersedia. Hasil evaluasi tetap dapat disimpan ke akun.', 'success'));
    const inspectWan = (part) => {
        if (state.stage !== 'router') return;
        if (!state.wan.link) return explainError(reasonText.link);
        if (!state.wan.bound) return explainError(reasonText.wan);
        if (part === 'route' && !state.wanInspected.client) return explainError('Periksa IP router terlebih dahulu: klik IP → DHCP Client. Pada baris ether1-internet, pastikan Status bound dan Address 192.0.2.2/24, lalu klik barisnya. Setelah target DHCP Client hijau, kembali ke IP → Routes.');
        if (part === 'route' && !model.wanReady(state)) return explainError(reasonText.route);
        state.wanInspected[part] = true;
        state.wanChecked = state.wanInspected.client && state.wanInspected.route && model.wanReady(state);
        persist(); render();
    };
    document.querySelectorAll('[data-inspect-wan]').forEach((row) => {
        row.addEventListener('click', () => inspectWan(row.dataset.inspectWan));
        row.addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); inspectWan(row.dataset.inspectWan); } });
    });
    document.querySelector('[data-renew-wan]').addEventListener('click', () => { state.wan = { link: true, bound: true, defaultRoute: true }; state.wanChecked = false; state.wanInspected = { client: false, route: false }; state.routerTests = { ip: false, domain: false }; invalidateClientTests(); persist(); render(); message('DHCP Client bound. Route 0.0.0.0/0 diterima otomatis dari ISP.', 'success'); });
    document.querySelectorAll('[data-dns-server], [data-dns-remote], [data-nat-chain], [data-nat-out], [data-nat-source], [data-nat-destination], [data-nat-action]').forEach((input) => {
        input.addEventListener('input', renderGuide);
        input.addEventListener('change', renderGuide);
    });
    document.querySelector('[data-add-dns-server]').addEventListener('click', () => {
        document.querySelector('[data-dns-second]').hidden = false;
        document.querySelector('[data-dns-server="1"]').focus();
        renderGuide();
    });
    document.querySelectorAll('[data-save-dns]').forEach((button) => button.addEventListener('click', () => {
        const servers = [...document.querySelectorAll('[data-dns-server]')].map((node) => node.value.trim()); const remote = document.querySelector('[data-dns-remote]').checked;
        if (!model.dnsValid({ dns: { servers } })) return explainError('Alamat server DNS belum tepat. Isi kolom pertama 8.8.8.8 dan kolom kedua 8.8.4.4. Jangan memasukkan alamat gateway pada kedua kolom ini.', () => document.querySelector('[data-dns-server="0"]').focus());
        if (!remote) return explainError('Centang Allow Remote Requests. Router sudah punya DNS, tetapi PC pada latihan ini juga perlu meminta resolusi nama melalui router.', () => document.querySelector('[data-dns-remote]').focus());
        state.dns = { servers, remote }; state.routerTests.domain = false; invalidateClientTests(); persist(); render(); if (button.dataset.saveDns === 'ok') closeWindow('dns'); message('DNS tersimpan: 8.8.8.8, 8.8.4.4, Allow Remote Requests aktif.', 'success');
    }));
    document.querySelectorAll('[data-firewall-tab]').forEach((button) => button.addEventListener('click', () => {
        const tab = button.dataset.firewallTab;
        document.querySelectorAll('[data-firewall-panel]').forEach((panel) => { panel.hidden = panel.dataset.firewallPanel !== tab; });
        document.querySelectorAll('[data-firewall-tab]').forEach((item) => item.classList.toggle('is-active', item.dataset.firewallTab === tab));
        recordGuideAction('firewall:' + tab);
    }));
    const natTab = (tab) => { document.querySelectorAll('[data-nat-panel]').forEach((node) => { node.hidden = node.dataset.natPanel !== tab; }); document.querySelectorAll('[data-nat-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.natTab === tab)); };
    document.querySelectorAll('[data-nat-tab]').forEach((button) => button.addEventListener('click', () => { natTab(button.dataset.natTab); recordGuideAction('nat:' + button.dataset.natTab); }));
    const editNat = () => { document.querySelector('[data-nat-chain]').value = state.nat?.chain || 'srcnat'; document.querySelector('[data-nat-out]').value = state.nat?.out || ''; document.querySelector('[data-nat-action]').value = state.nat?.action || 'accept'; document.querySelector('[data-nat-source]').value = ''; document.querySelector('[data-nat-destination]').value = ''; natTab('general'); openWindow('nat-edit'); };
    document.querySelector('[data-new-nat]').addEventListener('click', editNat);
    document.querySelector('[data-nat-row]').addEventListener('click', () => { selectedNat = true; render(); });
    document.querySelector('[data-nat-row]').addEventListener('dblclick', editNat);
    document.querySelector('[data-nat-row]').addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); selectedNat = true; render(); if (event.key === 'Enter') editNat(); } });
    document.querySelectorAll('[data-save-nat]').forEach((button) => button.addEventListener('click', () => {
        const rule = { chain: document.querySelector('[data-nat-chain]').value, out: document.querySelector('[data-nat-out]').value, action: document.querySelector('[data-nat-action]').value, disabled: false, packets: 0 };
        if (rule.chain !== 'srcnat') return explainError('Chain belum tepat. Trafik jaringan lokal keluar menuju internet memakai chain srcnat, bukan dstnat. Perbaiki di tab General.', () => { natTab('general'); document.querySelector('[data-nat-chain]').focus(); });
        if (rule.out !== 'ether1-internet') return explainError('Out. Interface harus ether1-internet, yaitu port WAN ke ISP. ether2-vlan menuju switch dan ether3-local menuju PC, sehingga keduanya bukan jalur keluar internet.', () => { natTab('general'); document.querySelector('[data-nat-out]').focus(); });
        if (rule.action !== 'masquerade') return explainError('Pilih masquerade pada tab Action. Action accept hanya mengizinkan trafik dan tidak menerjemahkan alamat lokal menjadi alamat WAN.', () => { natTab('action'); document.querySelector('[data-nat-action]').focus(); });
        if (document.querySelector('[data-nat-source]').value.trim() || document.querySelector('[data-nat-destination]').value.trim()) return explainError('Untuk aturan jaringan sekolah ini, kosongkan Src. Address dan Dst. Address supaya aturan mencakup kedua VLAN. Batasi jalur keluarnya dengan Out. Interface ether1-internet.', () => natTab('general'));
        state.nat = rule; selectedNat = true; invalidateClientTests(); persist(); render(); if (button.dataset.saveNat === 'ok') closeWindow('nat-edit'); message('NAT srcnat masquerade aktif pada ether1-internet.', 'success');
    }));
    document.querySelectorAll('[data-nat-tool]').forEach((button) => button.addEventListener('click', () => { if (!state.nat || !selectedNat) return; if (button.dataset.natTool === 'remove') { state.nat = null; selectedNat = false; } else state.nat.disabled = button.dataset.natTool === 'disable'; invalidateClientTests(); persist(); render(); }));
    const appendTerminal = (text) => { const output = document.querySelector('[data-terminal-output]'); output.textContent = (output.textContent + text).slice(-12000); output.scrollTop = output.scrollHeight; };
    const runRouterTest = (target, terminal = true) => {
        if (pendingRouterTest) return;
        pendingRouterTest = true;
        const revision = resetRevision;
        window.setTimeout(() => {
            if (revision !== resetRevision) return;
            pendingRouterTest = false;
            const result = model.routerTest(state, target);
            const lines = result.ok ? '  SEQ HOST                 SIZE TTL TIME\n' + Array.from({ length: 4 }, (_, i) => '    ' + i + ' ' + result.address.padEnd(20) + ' 56  57  ' + (12 + i) + 'ms').join('\n') + '\n  sent=4 received=4 packet-loss=0%\n' : result.reason === 'dns' ? '  invalid value for argument address: could not get answer from dns resolver\n' : '  sent=4 received=0 packet-loss=100%\n  request timed out\n';
            if (terminal) appendTerminal(lines); else document.querySelector('[data-ping-output]').textContent = lines;
            if (!result.ok) { explainError(reasonText[result.reason]); return; }
            if (terminal) state.routerTests[result.kind] = true;
            else if (result.kind === 'ip') state.routerTests.ip = true;
            persist(); render(); message(result.kind === 'ip' ? 'Ping IP router berhasil. Berikutnya uji nama melalui New Terminal.' : 'Router berhasil menguji IP dan nama. Selanjutnya periksa akses klien.', 'success');
        }, 650);
    };
    document.querySelector('[data-terminal-form]').addEventListener('submit', (event) => {
        event.preventDefault(); if (pendingRouterTest) return;
        const input = document.querySelector('[data-terminal-command]'); const command = input.value.trim(); input.value = ''; appendTerminal('[admin@Router] > ' + command + '\n');
        const match = command.match(/^\/?(?:tool\/)?ping\s+(?:address=)?(8\.8\.8\.8|google\.com)(?:\s+count=4)?$/i);
        if (!match) { window.NetGuardAudio?.play('error'); appendTerminal('  Gunakan: ping 8.8.8.8 count=4 atau ping google.com count=4\n'); return; }
        runRouterTest(match[1].toLowerCase());
    });
    document.querySelector('[data-start-ping]').addEventListener('click', () => { const target = document.querySelector('[data-ping-address]').value.trim(); if (target !== '8.8.8.8') return explainError('Gunakan Tools → Ping untuk alamat 8.8.8.8. Untuk memastikan DNS router bekerja, buka New Terminal dan ketik ping google.com count=4.'); runRouterTest(target, false); });
    const appendClientTerminal = (group, text) => {
        const output = document.querySelector('[data-client-terminal="' + group + '"]');
        output.textContent = (output.textContent + text).slice(-16000);
        output.parentElement.scrollTop = output.parentElement.scrollHeight;
    };
    document.querySelectorAll('[data-client-command-form]').forEach((form) => form.addEventListener('submit', (event) => {
        event.preventDefault();
        const group = form.dataset.clientCommandForm;
        if (pendingClients.has(group)) return;
        const input = form.querySelector('input');
        const command = input.value.trim();
        if (!command) return;
        input.value = '';
        appendClientTerminal(group, 'C:\\Users\\Lab> ' + command + '\n');
        if (!done('router')) return explainError('Selesaikan pengujian dari router dahulu. Klik Desktop PC → WinBox, buka New Terminal, lalu jalankan ping 8.8.8.8 dan ping google.com. Setelah kedua hasil router berhasil, kembali ke Command Prompt PC.');
        const parsed = model.clientCommand(state, group, command);
        if (parsed.reason === 'command') {
            appendClientTerminal(group, 'Perintah tidak dikenali. Gunakan ipconfig /all, ping 8.8.8.8, atau ping google.com.\n');
            return explainError('Ketik perintah pada Command Prompt PC: mulai dengan ipconfig /all untuk melihat IP, lalu ping 8.8.8.8, kemudian ping google.com. Tekan Enter setelah setiap perintah.');
        }
        if (parsed.kind !== 'config' && !state.clientChecks[group].config) return explainError('Periksa alamat komputer ini dahulu. Ketik ipconfig /all lalu tekan Enter. Setelah alamat IP dan gateway sesuai, jalankan ping 8.8.8.8.');
        if (parsed.kind === 'domain' && !state.clientChecks[group].ip) return explainError('Uji jalur IP dahulu pada PC ini: ketik ping 8.8.8.8 lalu tekan Enter. Setelah empat balasan diterima, ketik ping google.com untuk memeriksa DNS.');
        pendingClients.add(group); render();
        const revision = resetRevision;
        const clientRevision = clientTestRevision;
        window.setTimeout(() => {
            if (revision !== resetRevision || clientRevision !== clientTestRevision) return;
            pendingClients.delete(group);
            const result = model.clientCommand(state, group, command);
            const lan = state.lan[group];
            if (result.kind === 'config') {
                const address = lan.ready ? lan.address : '0.0.0.0';
                const gateway = lan.ready ? lan.gateway : '0.0.0.0';
                appendClientTerminal(group, 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ' + address + '\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : ' + gateway + '\n   DNS Servers . . . . . . . . . . . : ' + gateway + '\n\n');
            } else if (result.ok) {
                appendClientTerminal(group, 'Pinging ' + (result.kind === 'domain' ? 'google.com [' + result.targetAddress + ']' : result.targetAddress) + ' with 32 bytes of data:\n' + Array.from({ length: 4 }, (_, index) => 'Reply from ' + result.targetAddress + ': bytes=32 time=' + (12 + index) + 'ms TTL=57').join('\n') + '\n\nPing statistics for ' + result.targetAddress + ':\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n\n');
                state.nat.packets = (state.nat.packets || 0) + 4;
            } else {
                appendClientTerminal(group, ['dns', 'remote'].includes(result.reason) ? 'Ping request could not find host google.com. Please check the name and try again.\n' : 'Request timed out.\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)\n');
            }
            state.clientChecks[group][result.kind] = result.ok;
            if (!result.ok) {
                if (result.kind === 'config') state.clientChecks[group] = { config: false, ip: false, domain: false };
                if (result.kind === 'ip') state.clientChecks[group].domain = false;
            }
            state.clientTests[group] = Boolean(state.clientChecks[group].config && state.clientChecks[group].ip && state.clientChecks[group].domain && model.clientTest(state, group).ok);
            persist(); render();
            if (!result.ok) explainError(reasonText[result.reason], () => input.focus());
            else { message(result.kind === 'config' ? 'IP PC sesuai. Berikutnya jalankan ping 8.8.8.8 pada Command Prompt ini.' : result.kind === 'ip' ? 'Empat balasan diterima. Berikutnya ketik ping google.com pada PC yang sama.' : 'Ping google.com berhasil dari PC lab.', 'success'); input.focus(); }
        }, 650);
    }));
    document.querySelector('[data-close-quiz]').addEventListener('click', () => quiz.close()); document.querySelector('[data-close-finish]').addEventListener('click', () => finish.close());
    document.querySelector('[data-quiz-form]').addEventListener('change', () => { evaluation.clear(); state.evaluationResult = null; persist(); });
    document.querySelector('[data-quiz-form]').addEventListener('submit', async (event) => {
        event.preventDefault(); const answers = [1, 2, 3, 4, 5].map((n) => document.querySelector('[name="answer-' + n + '"]:checked'));
        if (answers.some((answer) => !answer)) return evaluation.showError('Jawab kelima soal terlebih dahulu.');
        const button = document.querySelector('[data-submit-quiz]'); button.disabled = true; evaluation.clear();
        try {
            const response = await fetch(scene.dataset.completeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, body: JSON.stringify({ answers: answers.map((node) => Number(node.value)) }) });
            const result = await response.json(); const summary = evaluation.showResult(result); if (summary) { state.evaluationResult = summary; persist(); }
            if (!response.ok) { if (!summary) evaluation.showError(result.message || 'Hasil belum dapat disimpan.'); quiz.scrollTo({ top: 0 }); return; }
            scene.dataset.completed = 'true'; quiz.close(); setStage('finish'); finish.showModal(); message('Chapter 3 selesai. Progres tersimpan ke akun.', 'success');
        } catch { evaluation.showError('Koneksi terputus. Coba simpan hasil sekali lagi.'); } finally { button.disabled = false; }
    });
    const scenes = [
        ['Jaringan lokal sudah siap', 'Alamat IP dan DHCP sudah disiapkan di Chapter 2. Sekarang kita akan mengatur DNS, membuat NAT, lalu menguji akses internet.'],
        ['Mulai dari DNS', 'Kita akan mengisi server DNS 8.8.8.8 dan 8.8.4.4 agar router dapat mencari alamat dari nama situs. Allow Remote Requests diaktifkan agar PC dapat meminta layanan DNS ke router.'],
        ['Lanjutkan dengan NAT', 'Setelah DNS disimpan, kita membuat aturan masquerade pada IP → Firewall → NAT. Pilih ether1-internet sebagai jalur keluar.'],
        ['Uji koneksi dari router', 'Setelah konfigurasi selesai, periksa status bound dan default route. Kemudian jalankan ping ke alamat IP dan nama domain dari New Terminal.'],
        ['Terakhir, uji dari PC lab', 'Kembali ke desktop PC yang kita gunakan sejak awal, buka Command Prompt, periksa IP komputer, lalu jalankan ping ke alamat IP dan nama situs.'],
    ];
    const finishPrologueTyping = () => {
        if (prologueTimer !== null) window.clearInterval(prologueTimer);
        prologueTimer = null;
        prologueTyping = false;
        document.querySelector('[data-ch2-prologue-title]').textContent = scenes[prologueIndex][0];
        document.querySelector('[data-ch2-prologue-text]').textContent = scenes[prologueIndex][1];
        document.querySelector('[data-ch2-prologue-title]').classList.remove('is-typing');
        document.querySelector('[data-ch2-prologue-text]').classList.remove('is-typing');
    };
    const paintPrologue = () => {
        updateBackAvailability();
        if (prologueTimer !== null) window.clearInterval(prologueTimer);
        const [title, text] = scenes[prologueIndex];
        const heading = document.querySelector('[data-ch2-prologue-title]');
        const body = document.querySelector('[data-ch2-prologue-text]');
        document.querySelector('[data-ch2-prologue-kicker]').textContent = 'PROLOG · ' + String(prologueIndex + 1).padStart(2, '0');
        document.querySelector('[data-ch2-prologue-count]').textContent = 'ADEGAN ' + String(prologueIndex + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');
        document.querySelector('[data-ch2-prologue-progress]').style.width = ((prologueIndex + 1) / scenes.length * 100) + '%';
        heading.textContent = ''; body.textContent = '';
        heading.classList.add('is-typing'); body.classList.remove('is-typing');
        prologueTyping = true;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finishPrologueTyping(); return; }
        let position = 0;
        prologueTimer = window.setInterval(() => {
            position++;
            if (position <= title.length) {
                heading.textContent = title.slice(0, position);
                return;
            }
            heading.classList.remove('is-typing'); body.classList.add('is-typing');
            body.textContent = text.slice(0, position - title.length);
            if (position >= title.length + text.length) finishPrologueTyping();
        }, 24);
    };
    const startPrologue = (replay = false) => { replaying = replay; prologueIndex = 0; prologue.hidden = false; scene.classList.add('is-prologue'); surface.inert = true; paintPrologue(); prologue.focus(); };
    const advancePrologue = () => { if (prologue.hidden) return; if (prologueTyping) { finishPrologueTyping(); return; } if (prologueIndex < scenes.length - 1) { prologueIndex++; paintPrologue(); return; } prologue.hidden = true; scene.classList.remove('is-prologue'); surface.inert = false; state.prologueComplete = true; persist(); if (!replaying || state.stage === 'intro') teach('dns'); else render(); };
    prologue.addEventListener('click', advancePrologue); prologue.addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key) && !event.repeat) { event.preventDefault(); event.stopPropagation(); advancePrologue(); } }); document.querySelector('[data-replay-prologue]').addEventListener('click', () => startPrologue(true));
    (saved?.answers || []).forEach((answer, index) => { const node = document.querySelector('[name="answer-' + (index + 1) + '"][value="' + answer + '"]'); if (node) node.checked = true; });
    evaluation.showResult(state.evaluationResult || (completed ? { correctAnswers: 5, totalQuestions: 5 } : null));
    render();
    if (!state.prologueComplete && state.stage === 'intro') startPrologue(); else { prologue.hidden = true; scene.classList.remove('is-prologue'); if (state.stage === 'finish') finish.showModal(); else if (state.stage === 'intro') teach('dns'); else if (state.stage === 'quiz') quiz.showModal(); else render(); }
})();
