(() => {
    'use strict';
    const scene = document.querySelector('.ch3-scene');
    if (!scene) return;
    const model = window.NetGuardChapterThree;
    const evaluation = window.NetGuardEvaluation;
    const key = 'netguard.chapter-three.v1.' + scene.dataset.userId;
    const read = (storageKey) => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } };
    const saved = read(key);
    const previous = read('netguard.chapter-two.v2.' + scene.dataset.userId);
    const completed = scene.dataset.completed === 'true';
    const groups = ['student', 'teacher'];
    const initialLan = Object.fromEntries(groups.map((group) => {
        const prefix = group === 'student' ? 40 : 60;
        const pool = previous?.pools?.[group] || '192.168.' + prefix + '.10-192.168.' + prefix + '.50';
        return [group, { pool, address: previous?.clientLeases?.[group]?.address || pool.split('-')[0], gateway: '192.168.' + prefix + '.1', ready: previous ? Boolean(previous.vlan?.[group] && previous.addresses?.[group] && previous.pools?.[group] && !previous.addressDisabled?.[group] && !previous.dhcpDisabled?.[group]) : true }];
    }));
    const state = {
        stage: completed ? 'finish' : 'intro', highest: completed ? 5 : 0, prologueComplete: false,
        wan: { link: true, bound: previous ? Boolean(previous.wan) : true, defaultRoute: previous ? Boolean(previous.wan) : true },
        wanChecked: completed, dns: { servers: completed ? ['8.8.8.8', '8.8.4.4'] : [], remote: completed }, nat: completed ? { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade', disabled: false, packets: 16 } : null,
        routerTests: { ip: completed, domain: completed }, clientTests: { student: completed, teacher: completed }, lan: initialLan,
        ...saved,
    };
    const stageNames = ['wan', 'dns', 'nat', 'router', 'clients'];
    if (!['intro', ...stageNames, 'quiz', 'finish'].includes(state.stage)) state.stage = 'intro';
    state.routerTests = { ip: completed, domain: completed, ...saved?.routerTests };
    state.clientTests = { student: completed, teacher: completed, ...saved?.clientTests };
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
    let replaying = false;
    let pendingRouterTest = false;
    const pendingClients = new Set();
    const info = {
        wan: { title: 'Periksa jalur keluar router', section: '§3.2 dan §3.5', lesson: 'DHCP Client pada ether1-internet dapat menerima IP, gateway, dan default route dari ISP. Periksa status bound dan route 0.0.0.0/0 terlebih dahulu. Pada simulasi ini, WAN memakai 192.0.2.2/24 dan gateway ISP 192.0.2.1.', steps: ['Buka IP → DHCP Client. Pastikan ether1-internet berstatus bound. Jika belum, klik Renew.', 'Buka IP → Routes. Cari tujuan 0.0.0.0/0, gateway 192.0.2.1 melalui ether1-internet, dengan tanda A (active).', 'Setelah keduanya benar, klik Periksa WAN & route di bawah.'], action: 'Periksa WAN & route' },
        dns: { title: 'Atur DNS router', section: '§3.3', lesson: 'DNS menerjemahkan nama domain menjadi alamat IP. Sesuai modul, gunakan 8.8.8.8 dan 8.8.4.4. Allow Remote Requests membuat router menjawab pertanyaan DNS dari PC pada jaringan lokal.', steps: ['Buka IP → DNS.', 'Isi Servers pertama: 8.8.8.8. Isi Servers kedua: 8.8.4.4.', 'Centang Allow Remote Requests, lalu klik OK atau Apply.'], action: 'Buka IP → DNS' },
        nat: { title: 'Buat NAT masquerade', section: '§3.4', lesson: 'IP pribadi siswa dan guru perlu diterjemahkan saat keluar ke WAN. Aturan srcnat dengan action masquerade memakai alamat pada ether1-internet. Aturan ini diperlukan untuk klien; router bisa ping internet meskipun NAT belum dibuat.', steps: ['Buka IP → Firewall → tab NAT, lalu klik +.', 'Pada tab General, pilih Chain: srcnat dan Out. Interface: ether1-internet. Src. Address dan Dst. Address dibiarkan kosong.', 'Buka tab Action, pilih masquerade, lalu klik OK.'], action: 'Buka Firewall → NAT' },
        router: { title: 'Uji internet dari router', section: '§3.5 langkah 1–5', lesson: 'Uji alamat IP terlebih dahulu, kemudian nama domain. Jika ping IP berhasil tetapi nama gagal, periksa DNS. Pengujian nama dari New Terminal berjalan dari router, sehingga tidak tertukar dengan DNS komputer yang menjalankan WinBox.', steps: ['Klik New Terminal pada menu kiri.', 'Ketik ping 8.8.8.8 count=4 lalu tekan Enter. Hasil harus menerima 4 balasan.', 'Ketik ping example.com count=4 lalu tekan Enter. Jika nama gagal sementara IP berhasil, periksa pengaturan DNS.'], action: 'Buka New Terminal' },
        clients: { title: 'Uji internet PC siswa dan guru', section: '§3.5 langkah 6–7', lesson: 'Setelah router berhasil, uji dari klien. Klien harus memiliki IP dan gateway yang benar, memperoleh layanan DNS, dan melewati NAT masquerade. PC uji pada simulasi ini memakai gateway VLAN masing-masing sebagai DNS.', steps: ['Pastikan dua pengujian router sudah tercentang.', 'Klik Uji internet PC siswa, lalu Uji internet PC guru di bawah.', 'Periksa hasil: IP, gateway, DNS, ping IP internet, dan akses nama domain harus berhasil. Kedua target harus hijau.'], action: 'Uji kedua PC di bawah' },
    };
    const persist = () => {
        try { localStorage.setItem(key, JSON.stringify({ ...state, answers: [...document.querySelectorAll('[data-quiz-form] input:checked')].map((node) => Number(node.value)) })); return true; } catch { return false; }
    };
    const message = (text, kind = '') => { const node = document.querySelector('[data-feedback]'); node.textContent = text; node.dataset.kind = kind; };
    const say = (text, callback = null) => {
        window.clearInterval(dialogueTimer);
        dialogueCallback = callback;
        dialogueFullText = text;
        if (overlay.hidden) returnFocus = document.activeElement;
        surface.inert = true; overlay.hidden = false;
        const body = overlay.querySelector('[data-dialogue-text]');
        body.textContent = '';
        overlay.querySelector('[data-dialogue-count]').textContent = 'KLIK DI MANA SAJA UNTUK LANJUT';
        overlay.querySelector('[data-ch2-dialogue-next]').focus({ preventScroll: true });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { body.textContent = text; dialogueTimer = null; return; }
        let position = 0;
        dialogueTimer = window.setInterval(() => { position += 3; body.textContent = text.slice(0, position); if (position >= text.length) { window.clearInterval(dialogueTimer); dialogueTimer = null; } }, 20);
    };
    const advanceDialogue = () => {
        if (overlay.hidden) return;
        if (dialogueTimer) { window.clearInterval(dialogueTimer); dialogueTimer = null; overlay.querySelector('[data-dialogue-text]').textContent = dialogueFullText; return; }
        overlay.hidden = true; surface.inert = false;
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        const callback = dialogueCallback; dialogueCallback = null; callback?.();
    };
    overlay.addEventListener('click', (event) => { event.stopPropagation(); advanceDialogue(); });
    document.addEventListener('keydown', (event) => { if (!overlay.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); advanceDialogue(); } });
    const reasonText = {
        link: 'Link ether1-internet belum aktif. Periksa sambungan WAN terlebih dahulu.',
        wan: 'DHCP Client WAN belum mendapat konfigurasi. Buka IP → DHCP Client dan klik Renew sampai status bound.',
        route: 'Default route belum aktif. Periksa IP → Routes: harus ada 0.0.0.0/0 melalui gateway ISP 192.0.2.1.',
        dns: 'DNS router belum sesuai. Buka IP → DNS, isi 8.8.8.8 dan 8.8.4.4, lalu simpan. Ping IP dapat berhasil meskipun nama domain belum bisa diterjemahkan.',
        remote: 'Router belum melayani DNS untuk PC. Aktifkan Allow Remote Requests pada IP → DNS, lalu uji ulang klien.',
        nat: 'Router sudah memiliki jalur internet, tetapi NAT klien belum benar. Periksa IP → Firewall → NAT: chain srcnat, Out. Interface ether1-internet, action masquerade, dan aturan harus aktif.',
        lan: 'IP atau gateway klien belum sesuai VLAN. Periksa konfigurasi Chapter 2: siswa 192.168.40.x dengan gateway 192.168.40.1, guru 192.168.60.x dengan gateway 192.168.60.1.',
        target: 'Pada latihan ini, gunakan tujuan 8.8.8.8 untuk uji IP dan example.com untuk uji nama domain.',
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
        }
        if (name === 'terminal') document.querySelector('[data-terminal-command]').focus({ preventScroll: true });
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
    const reopen = document.createElement('button'); reopen.type = 'button'; reopen.className = 'winbox-reopen'; reopen.textContent = 'Buka WinBox'; reopen.hidden = true; app.parentElement.append(reopen);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => { app.hidden = true; reopen.hidden = false; }));
    reopen.addEventListener('click', () => { app.hidden = false; reopen.hidden = true; });
    document.querySelector('[data-ch2-app-size]').addEventListener('click', () => scene.classList.toggle('is-restored'));
    const done = (stageName) => ({ wan: state.wanChecked && model.wanReady(state), dns: model.dnsValid(state) && state.dns.remote, nat: model.natValid(state), router: state.routerTests.ip && state.routerTests.domain && model.routerTest(state, 'example.com').ok, clients: groups.every((group) => state.clientTests[group] && model.clientTest(state, group).ok) })[stageName] || false;
    const taskItems = (stageName) => {
        if (stageName === 'wan') return [['Link WAN', 'ether1-internet tersambung', state.wanChecked && state.wan.link], ['DHCP Client', 'Status bound · 192.0.2.2/24', state.wanChecked && state.wan.bound], ['Default route', '0.0.0.0/0 → 192.0.2.1', state.wanChecked && state.wan.defaultRoute]];
        if (stageName === 'dns') return [['Servers', '8.8.8.8 dan 8.8.4.4', model.dnsValid(state)], ['Allow Remote Requests', 'Centang agar PC dapat memakai DNS router', state.dns.remote]];
        if (stageName === 'nat') return [['NAT aktif', 'srcnat · ether1-internet · masquerade', model.natValid(state)]];
        if (stageName === 'router') return [['Ping alamat IP', 'ping 8.8.8.8 count=4', state.routerTests.ip && model.routerTest(state, '8.8.8.8').ok], ['Ping nama domain', 'ping example.com count=4', state.routerTests.domain && model.routerTest(state, 'example.com').ok]];
        if (stageName === 'clients') return groups.map((group) => ['Internet PC ' + (group === 'student' ? 'siswa' : 'guru'), 'IP ' + state.lan[group].address + ' · gateway/DNS ' + state.lan[group].gateway, state.clientTests[group] && model.clientTest(state, group).ok]);
        return stageNames.map((name) => [info[name].title, info[name].section, done(name)]);
    };
    const render = () => {
        const count = stageNames.filter(done).length;
        document.querySelector('[data-progress-label]').textContent = count + ' / 5'; document.querySelector('[data-progress]').value = count;
        const current = info[state.stage];
        document.querySelector('[data-guide-list]').replaceChildren(...(current?.steps || ['Selesaikan lima misi internet secara berurutan.', 'Pelajari materi sebelum praktik dan ikuti nilai parameter di panel ini.']).map((text) => { const item = document.createElement('li'); item.textContent = text; return item; }));
        document.querySelector('[data-module-section]').textContent = 'Chapter 3 · ' + (current?.section || 'Rekap dan evaluasi');
        document.querySelector('[data-task-heading]').textContent = current?.title || 'Misi Chapter 3';
        const items = taskItems(state.stage);
        document.querySelector('[data-task-count]').textContent = items.filter((item) => item[2]).length + ' / ' + items.length + ' selesai';
        document.querySelector('[data-task-list]').replaceChildren(...items.map(([title, detail, isDone], index) => {
            const row = document.createElement('li'); row.classList.toggle('is-done', Boolean(isDone));
            const mark = document.createElement('span'); mark.className = 'ch2-vlan-task__mark'; mark.textContent = isDone ? '✓' : String(index + 1);
            const body = document.createElement('div'), heading = document.createElement('b'), note = document.createElement('small'), status = document.createElement('span'); heading.textContent = title; note.textContent = detail; status.className = 'ch2-vlan-task__status'; status.textContent = isDone ? 'Selesai' : 'Belum selesai'; body.append(heading, note, status); row.append(mark, body); return row;
        }));
        const main = document.querySelector('[data-main-action]');
        main.textContent = state.stage === 'intro' ? 'Pelajari jalur internet →' : state.stage === 'quiz' ? 'Buka evaluasi →' : state.stage === 'finish' ? 'Lihat hasil Chapter 3' : done(state.stage) ? 'Lanjut ke tahap berikutnya →' : current.action;
        document.querySelector('[data-client-tests]').hidden = state.stage !== 'clients';
        document.querySelectorAll('[data-test-client]').forEach((button) => { button.hidden = Boolean(state.clientTests[button.dataset.testClient] && model.clientTest(state, button.dataset.testClient).ok); button.disabled = pendingClients.has(button.dataset.testClient); });
        document.querySelector('[data-previous]').hidden = ['intro', 'finish'].includes(state.stage);
        document.querySelector('[data-wan-status]').textContent = state.wan.bound ? 'bound' : 'searching'; document.querySelector('[data-wan-address]').textContent = state.wan.bound ? '192.0.2.2/24' : '0.0.0.0';
        document.querySelector('[data-default-route]').hidden = !state.wan.defaultRoute; document.querySelector('[data-route-count]').textContent = state.wan.defaultRoute ? '5 items' : '4 items';
        const natRow = document.querySelector('[data-nat-row]'); natRow.hidden = !state.nat; natRow.classList.toggle('is-selected', selectedNat && Boolean(state.nat)); natRow.classList.toggle('is-disabled', Boolean(state.nat?.disabled)); natRow.setAttribute('aria-pressed', String(selectedNat && Boolean(state.nat))); document.querySelector('[data-nat-count]').textContent = state.nat ? '1 item' : '0 items';
        document.querySelectorAll('[data-nat-tool]').forEach((button) => { button.disabled = !state.nat || !selectedNat || (button.dataset.natTool === 'enable' ? !state.nat.disabled : button.dataset.natTool === 'disable' && state.nat.disabled); });
        document.querySelector('[data-nat-packets]').textContent = String(state.nat?.packets || 0); document.querySelector('[data-nat-bytes]').textContent = ((state.nat?.packets || 0) * 64) + ' B';
    };
    const setStage = (name) => { state.stage = name; state.highest = Math.max(state.highest, stageNames.indexOf(name)); persist(); render(); document.querySelector('.ch3-guide').scrollTo({ top: 0, behavior: 'auto' }); };
    const teach = (name) => { nextLesson = name; document.querySelector('[data-learning-title]').textContent = info[name].title; const text = document.createElement('p'); text.textContent = info[name].lesson; document.querySelector('[data-learning-body]').replaceChildren(text); learning.showModal(); };
    const mainAction = () => {
        if (state.stage === 'intro') return teach('wan');
        if (state.stage === 'quiz') return quiz.showModal();
        if (state.stage === 'finish') return finish.showModal();
        if (done(state.stage)) { const next = stageNames[stageNames.indexOf(state.stage) + 1]; if (next) teach(next); else { setStage('quiz'); quiz.showModal(); } return; }
        if (state.stage === 'wan') { if (!model.wanReady(state)) return say(reasonText[!state.wan.link ? 'link' : !state.wan.bound ? 'wan' : 'route']); state.wanChecked = true; persist(); render(); message('WAN bound dan default route aktif. Lanjutkan ke DNS.', 'success'); return; }
        if (state.stage === 'clients') { document.querySelector('[data-client-tests]').scrollIntoView({ block: 'nearest' }); return; }
        openWindow({ dns: 'dns', nat: 'firewall', router: 'terminal' }[state.stage]);
    };
    document.querySelector('[data-main-action]').addEventListener('click', mainAction);
    document.querySelector('[data-close-learning]').addEventListener('click', () => learning.close());
    document.querySelector('[data-learning-continue]').addEventListener('click', () => { learning.close(); setStage(nextLesson); say(info[nextLesson].lesson); nextLesson = null; });
    document.querySelector('[data-previous]').addEventListener('click', () => { const index = state.stage === 'quiz' ? 4 : stageNames.indexOf(state.stage) - 1; setStage(index < 0 ? 'intro' : stageNames[index]); });
    document.querySelector('[data-save]').addEventListener('click', () => message(persist() ? 'Progres latihan tersimpan. Hasil evaluasi disimpan ke akun setelah semua jawaban benar.' : 'Penyimpanan browser tidak tersedia. Hasil evaluasi tetap dapat disimpan ke akun.', 'success'));
    document.querySelector('[data-renew-wan]').addEventListener('click', () => { state.wan = { link: true, bound: true, defaultRoute: true }; state.wanChecked = false; state.routerTests = { ip: false, domain: false }; state.clientTests = { student: false, teacher: false }; persist(); render(); message('DHCP Client bound. Route 0.0.0.0/0 diterima otomatis dari ISP.', 'success'); });
    document.querySelectorAll('[data-save-dns]').forEach((button) => button.addEventListener('click', () => {
        const servers = [...document.querySelectorAll('[data-dns-server]')].map((node) => node.value.trim()); const remote = document.querySelector('[data-dns-remote]').checked;
        if (!model.dnsValid({ dns: { servers } })) return say('Servers belum sesuai modul. Isi kolom pertama 8.8.8.8 dan kolom kedua 8.8.4.4. Jangan memasukkan alamat gateway pada kedua kolom ini.', () => document.querySelector('[data-dns-server="0"]').focus());
        if (!remote) return say('Centang Allow Remote Requests. Router sudah punya DNS, tetapi PC pada latihan ini juga perlu meminta resolusi nama melalui router.', () => document.querySelector('[data-dns-remote]').focus());
        state.dns = { servers, remote }; state.routerTests.domain = false; state.clientTests = { student: false, teacher: false }; persist(); render(); if (button.dataset.saveDns === 'ok') closeWindow('dns'); message('DNS tersimpan: 8.8.8.8, 8.8.4.4, Allow Remote Requests aktif.', 'success');
    }));
    const natTab = (tab) => { document.querySelectorAll('[data-nat-panel]').forEach((node) => { node.hidden = node.dataset.natPanel !== tab; }); document.querySelectorAll('[data-nat-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.natTab === tab)); };
    document.querySelectorAll('[data-nat-tab]').forEach((button) => button.addEventListener('click', () => natTab(button.dataset.natTab)));
    const editNat = () => { document.querySelector('[data-nat-chain]').value = state.nat?.chain || 'srcnat'; document.querySelector('[data-nat-out]').value = state.nat?.out || ''; document.querySelector('[data-nat-action]').value = state.nat?.action || 'accept'; document.querySelector('[data-nat-source]').value = ''; document.querySelector('[data-nat-destination]').value = ''; natTab('general'); openWindow('nat-edit'); };
    document.querySelector('[data-new-nat]').addEventListener('click', editNat);
    document.querySelector('[data-nat-row]').addEventListener('click', () => { selectedNat = true; render(); });
    document.querySelector('[data-nat-row]').addEventListener('dblclick', editNat);
    document.querySelector('[data-nat-row]').addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); selectedNat = true; render(); if (event.key === 'Enter') editNat(); } });
    document.querySelectorAll('[data-save-nat]').forEach((button) => button.addEventListener('click', () => {
        const rule = { chain: document.querySelector('[data-nat-chain]').value, out: document.querySelector('[data-nat-out]').value, action: document.querySelector('[data-nat-action]').value, disabled: false, packets: 0 };
        if (rule.chain !== 'srcnat') return say('Chain belum tepat. Trafik jaringan lokal keluar menuju internet memakai chain srcnat, bukan dstnat. Perbaiki di tab General.', () => { natTab('general'); document.querySelector('[data-nat-chain]').focus(); });
        if (rule.out !== 'ether1-internet') return say('Out. Interface harus ether1-internet, yaitu port WAN ke ISP. ether2-vlan menuju switch dan ether3-local menuju PC, sehingga keduanya bukan jalur keluar internet.', () => { natTab('general'); document.querySelector('[data-nat-out]').focus(); });
        if (rule.action !== 'masquerade') return say('Pilih masquerade pada tab Action. Action accept hanya mengizinkan trafik dan tidak menerjemahkan alamat lokal menjadi alamat WAN.', () => { natTab('action'); document.querySelector('[data-nat-action]').focus(); });
        if (document.querySelector('[data-nat-source]').value.trim() || document.querySelector('[data-nat-destination]').value.trim()) return say('Pada latihan ini, kosongkan Src. Address dan Dst. Address supaya aturan mencakup kedua VLAN. Batasi jalur keluarnya dengan Out. Interface ether1-internet.', () => natTab('general'));
        state.nat = rule; selectedNat = true; state.clientTests = { student: false, teacher: false }; persist(); render(); if (button.dataset.saveNat === 'ok') closeWindow('nat-edit'); message('NAT srcnat masquerade aktif pada ether1-internet.', 'success');
    }));
    document.querySelectorAll('[data-nat-tool]').forEach((button) => button.addEventListener('click', () => { if (!state.nat || !selectedNat) return; if (button.dataset.natTool === 'remove') { state.nat = null; selectedNat = false; } else state.nat.disabled = button.dataset.natTool === 'disable'; state.clientTests = { student: false, teacher: false }; persist(); render(); }));
    const appendTerminal = (text) => { const output = document.querySelector('[data-terminal-output]'); output.textContent = (output.textContent + text).slice(-12000); output.scrollTop = output.scrollHeight; };
    const runRouterTest = (target, terminal = true) => {
        if (pendingRouterTest) return;
        pendingRouterTest = true;
        window.setTimeout(() => {
            pendingRouterTest = false;
            const result = model.routerTest(state, target);
            const lines = result.ok ? '  SEQ HOST                 SIZE TTL TIME\n' + Array.from({ length: 4 }, (_, i) => '    ' + i + ' ' + result.address.padEnd(20) + ' 56  57  ' + (12 + i) + 'ms').join('\n') + '\n  sent=4 received=4 packet-loss=0%\n' : result.reason === 'dns' ? '  invalid value for argument address: could not get answer from dns resolver\n' : '  sent=4 received=0 packet-loss=100%\n  request timed out\n';
            if (terminal) appendTerminal(lines); else document.querySelector('[data-ping-output]').textContent = lines;
            if (!result.ok) { say(reasonText[result.reason]); return; }
            if (terminal) state.routerTests[result.kind] = true;
            else if (result.kind === 'ip') state.routerTests.ip = true;
            persist(); render(); message(result.kind === 'ip' ? 'Ping IP router berhasil. Berikutnya uji nama melalui New Terminal.' : 'Router berhasil menguji IP dan nama. Selanjutnya periksa akses klien.', 'success');
        }, 650);
    };
    document.querySelector('[data-terminal-form]').addEventListener('submit', (event) => {
        event.preventDefault(); if (pendingRouterTest) return;
        const input = document.querySelector('[data-terminal-command]'); const command = input.value.trim(); input.value = ''; appendTerminal('[admin@Router] > ' + command + '\n');
        const match = command.match(/^\/?(?:tool\/)?ping\s+(?:address=)?(8\.8\.8\.8|example\.com)(?:\s+count=4)?$/i);
        if (!match) { appendTerminal('  Gunakan: ping 8.8.8.8 count=4 atau ping example.com count=4\n'); return; }
        runRouterTest(match[1].toLowerCase());
    });
    document.querySelector('[data-start-ping]').addEventListener('click', () => { const target = document.querySelector('[data-ping-address]').value.trim(); if (target !== '8.8.8.8') return say('Gunakan Tools → Ping untuk alamat 8.8.8.8. Untuk memastikan DNS router bekerja, buka New Terminal dan ketik ping example.com count=4.'); runRouterTest(target, false); });
    document.querySelectorAll('[data-test-client]').forEach((button) => button.addEventListener('click', () => {
        const group = button.dataset.testClient; if (pendingClients.has(group)) return;
        if (!done('router')) return say('Uji router terlebih dahulu melalui New Terminal: ping 8.8.8.8 count=4 dan ping example.com count=4. Setelah dua target berhasil, baru uji PC.');
        pendingClients.add(group); render(); document.querySelector('[data-client-output]').textContent = 'PC ' + (group === 'student' ? 'siswa' : 'guru') + ': menguji koneksi…';
        window.setTimeout(() => {
            pendingClients.delete(group); const result = model.clientTest(state, group); state.clientTests[group] = result.ok;
            if (!result.ok) { persist(); render(); document.querySelector('[data-client-output]').textContent = 'Pengujian gagal. Periksa arahan Pak Amat.'; say(reasonText[result.reason]); return; }
            state.nat.packets = (state.nat.packets || 0) + 8;
            document.querySelector('[data-client-output]').textContent = 'PC ' + (group === 'student' ? 'siswa' : 'guru') + '\nIP: ' + result.address + '\nGateway: ' + result.gateway + '\nDNS: ' + result.dns + '\nPing 8.8.8.8: 4/4 berhasil\nNama example.com: berhasil\nAkses internet: berhasil (simulasi)'; persist(); render(); message(done('clients') ? 'PC siswa dan guru berhasil. Lanjutkan ke evaluasi.' : 'PC ini berhasil. Uji PC berikutnya.', 'success');
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
        ['Jaringan lokal sudah siap', 'Siswa dan guru sudah mendapat IP dari DHCP Server. Namun, memiliki IP lokal belum membuktikan bahwa komputer dapat mengakses internet.'],
        ['Cari jalur keluar router', 'Periksa link ether1-internet, DHCP Client WAN, dan default route. Jika router belum mempunyai jalur keluar, pengujian dari klien juga akan gagal.'],
        ['Nama tujuan perlu DNS', 'Sesuai modul, gunakan DNS 8.8.8.8 dan 8.8.4.4. Aktifkan Allow Remote Requests agar PC dapat memakai layanan DNS dari router.'],
        ['Terjemahkan alamat saat keluar', 'Aturan NAT memakai chain srcnat, Out. Interface ether1-internet, dan action masquerade. Periksa ketiganya sebelum menyimpan.'],
        ['Buktikan dari router sampai klien', 'Uji IP internet, lalu nama domain dari router. Setelah router berhasil, uji PC siswa dan guru. Pak Amat akan membantu menjelaskan bila ada konfigurasi yang salah.'],
    ];
    const paintPrologue = () => { document.querySelector('[data-ch2-prologue-title]').textContent = scenes[prologueIndex][0]; document.querySelector('[data-ch2-prologue-text]').textContent = scenes[prologueIndex][1]; document.querySelector('[data-ch2-prologue-count]').textContent = 'ADEGAN ' + String(prologueIndex + 1).padStart(2, '0') + ' / 05'; document.querySelector('[data-ch2-prologue-progress]').style.width = ((prologueIndex + 1) / 5 * 100) + '%'; };
    const startPrologue = (replay = false) => { replaying = replay; prologueIndex = 0; prologue.hidden = false; scene.classList.add('is-prologue'); surface.inert = true; paintPrologue(); prologue.focus(); };
    const advancePrologue = () => { if (prologue.hidden) return; if (prologueIndex < scenes.length - 1) { prologueIndex++; paintPrologue(); return; } prologue.hidden = true; scene.classList.remove('is-prologue'); surface.inert = false; state.prologueComplete = true; persist(); if (!replaying) say('Selamat datang di Chapter 3. Kita lanjutkan konfigurasi dari Chapter 2. Klik Pelajari jalur internet untuk mulai memeriksa WAN.'); };
    prologue.addEventListener('click', advancePrologue); prologue.addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key) && !event.repeat) { event.preventDefault(); event.stopPropagation(); advancePrologue(); } }); document.querySelector('[data-replay-prologue]').addEventListener('click', () => startPrologue(true));
    (saved?.answers || []).forEach((answer, index) => { const node = document.querySelector('[name="answer-' + (index + 1) + '"][value="' + answer + '"]'); if (node) node.checked = true; });
    evaluation.showResult(state.evaluationResult || (completed ? { correctAnswers: 5, totalQuestions: 5 } : null)); render();
    if (!state.prologueComplete && state.stage === 'intro') startPrologue(); else { prologue.hidden = true; scene.classList.remove('is-prologue'); if (state.stage === 'finish') finish.showModal(); }
})();
