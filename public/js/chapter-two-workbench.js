(() => {
    'use strict';

    const scene = document.querySelector('.ch2-scene');
    if (!scene) return;

    const stages = ['intro', 'vlan', 'wan', 'addresses', 'dhcp', 'verify', 'quiz', 'finish'];
    const studentId = scene.dataset.userId;
    const storageKey = `netguard.chapter-two.v2.${studentId}`;
    const oldStorageKey = `netguard.chapter-two.v1.${studentId}`;
    const chapterOneKey = `netguard.chapter-one.v1.${studentId}`;
    const completionOnServer = scene.dataset.completed === 'true';
    const windows = new Map([...document.querySelectorAll('[data-window]')].map((node) => [node.dataset.window, node]));
    const feedback = [...document.querySelectorAll('[data-feedback]')];
    const dialogue = document.querySelector('[data-ch2-dialogue]');
    const dialogueText = document.querySelector('[data-dialogue-text]');
    const dialogueCount = document.querySelector('[data-dialogue-count]');
    const dialogueNext = document.querySelector('[data-ch2-dialogue-next]');
    const labSurface = scene.querySelector('.lab-scroll');
    let dialogueReturnFocus = null;
    const learningDialog = document.querySelector('[data-learning-dialog]');
    const quizDialog = document.querySelector('[data-quiz-dialog]');
    const finishDialog = document.querySelector('[data-finish-dialog]');
    const evaluation = window.NetGuardEvaluation;
    const persistedFields = [...document.querySelectorAll('.ch2-window input:not([readonly]):not([data-address-network]):not([data-address-find]):not([data-dhcp-field]):not([data-dhcp-find]):not([data-lease-find]), .ch2-window select')];
    let topLayer = 10;
    let editingVlan = null;
    let selectedVlan = null;
    let selectedAddress = null;
    let editingAddress = null;
    let commentAddress = null;
    let draftAddressDisabled = false;
    let selectedDhcp = null;
    let selectedLease = null;
    const requestingClients = new Set();
    let dhcpStep = 0;
    let dhcpSetupGroup = null;
    let editingInterface = null;
    let pendingStage = null;
    let dialogueLines = [];
    let dialogueIndex = 0;
    let dialogueContinue = null;
    let dialogueTypingTimer = null;
    let isDialogueTyping = false;
    let announcedStage = null;

    const readStorage = (key) => {
        try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; }
    };
    const chapterOne = readStorage(chapterOneKey) || {};
    const saved = readStorage(storageKey);
    const legacy = !saved ? readStorage(oldStorageKey) : null;
    const defaults = {
        stage: completionOnServer ? 'finish' : 'intro', highest: completionOnServer ? 7 : 0,
        prologueIndex: 0, prologueComplete: false,
        identity: chapterOne.identitySaved ? 'Router' : (chapterOne.identityInput || 'Router'),
        interfaces: {
            ether1: chapterOne.interfaceNames?.ether1 || 'ether1-internet',
            ether2: chapterOne.interfaceNames?.ether2 || 'ether2-vlan',
            ether3: chapterOne.interfaceNames?.ether3 || 'ether3-local',
        },
        vlan: { student: false, teacher: false }, wan: false,
        addresses: { local: false, student: false, teacher: false, wireless: false },
        addressDisabled: {}, addressComments: {},
        dhcpSettings: {}, dhcpDisabled: {},
        clientLeases: {}, clientStatic: {},
        pools: { student: '', teacher: '' }, clients: { student: false, teacher: false },
    };
    const state = { ...defaults, ...saved,
        interfaces: { ...defaults.interfaces, ...saved?.interfaces },
        vlan: { ...defaults.vlan, ...saved?.vlan },
        addresses: { ...defaults.addresses, ...saved?.addresses },
        addressDisabled: { ...defaults.addressDisabled, ...saved?.addressDisabled },
        addressComments: { ...defaults.addressComments, ...saved?.addressComments },
        dhcpSettings: { ...defaults.dhcpSettings, ...saved?.dhcpSettings },
        dhcpDisabled: { ...defaults.dhcpDisabled, ...saved?.dhcpDisabled },
        pools: { ...defaults.pools, ...saved?.pools },
        clients: { ...defaults.clients, ...saved?.clients },
        clientLeases: { ...defaults.clientLeases, ...saved?.clientLeases },
        clientStatic: { ...defaults.clientStatic, ...saved?.clientStatic },
    };

    if (legacy) {
        const legacyStage = legacy.stage === 'lesson' ? 'intro' : legacy.stage === 'recap' ? 'quiz' : legacy.stage;
        if (stages.includes(legacyStage)) state.stage = legacyStage;
        const oldStages = ['intro', 'lesson', 'vlan', 'wan', 'addresses', 'dhcp', 'verify', 'recap', 'quiz', 'finish'];
        const oldHighestStage = oldStages[Math.min(9, Math.max(0, Number(legacy.highest) || 0))];
        state.highest = Math.max(0, stages.indexOf(oldHighestStage === 'lesson' ? 'intro' : oldHighestStage === 'recap' ? 'quiz' : oldHighestStage));
        if (state.highest >= 2) state.vlan = { student: true, teacher: true };
        if (state.highest >= 3) state.wan = true;
        if (state.highest >= 4) state.addresses = { local: true, student: true, teacher: true, wireless: true };
        if (state.highest >= 5) {
            state.pools.student = legacy.fields?.[12] || '192.168.40.10-192.168.40.50';
            state.pools.teacher = legacy.fields?.[14] || '192.168.60.10-192.168.60.50';
        }
        state.clients = { student: Boolean(legacy.clients?.student), teacher: Boolean(legacy.clients?.teacher) };
    }
    if (completionOnServer) state.highest = 7;
    if (!completionOnServer && state.stage === 'finish') state.stage = 'quiz';
    if (!stages.includes(state.stage)) state.stage = 'intro';
    state.highest = Math.max(stages.indexOf(state.stage), Math.min(7, Math.max(0, Number(state.highest) || 0)));

    const message = (text, kind = 'info') => { feedback.forEach((node) => { node.textContent = text; node.dataset.kind = kind; }); };
    const finishDialogueTyping = () => {
        if (dialogueTypingTimer !== null) window.clearInterval(dialogueTypingTimer);
        dialogueTypingTimer = null;
        isDialogueTyping = false;
        dialogueText.classList.remove('is-typing');
        dialogueText.textContent = dialogueLines[dialogueIndex];
    };
    const paintDialogueLine = () => {
        if (dialogueTypingTimer !== null) window.clearInterval(dialogueTypingTimer);
        dialogueText.textContent = '';
        dialogueText.classList.add('is-typing');
        isDialogueTyping = true;
        let position = 0;
        dialogueTypingTimer = window.setInterval(() => {
            position++;
            dialogueText.textContent = dialogueLines[dialogueIndex].slice(0, position);
            if (position >= dialogueLines[dialogueIndex].length) finishDialogueTyping();
        }, 24);
        dialogueCount.textContent = `${dialogueIndex + 1} / ${dialogueLines.length} · KLIK DI MANA SAJA UNTUK LANJUT`;
    };
    const openDialogue = (lines, onContinue) => {
        dialogueLines = lines;
        dialogueIndex = 0;
        dialogueContinue = onContinue;
        if (dialogue.hidden) dialogueReturnFocus = document.activeElement;
        labSurface.inert = true;
        dialogue.hidden = false;
        dialogueNext.focus({ preventScroll: true });
        paintDialogueLine();
        dialogue.classList.add('is-speaking');
    };
    const continueDialogue = () => {
        if (dialogue.hidden) return;
        if (isDialogueTyping) {
            finishDialogueTyping();
            return;
        }
        if (dialogueIndex + 1 < dialogueLines.length) {
            dialogueIndex++;
            paintDialogueLine();
            return;
        }
        dialogue.classList.remove('is-speaking');
        dialogue.hidden = true;
        labSurface.inert = false;
        if (dialogueReturnFocus?.isConnected) dialogueReturnFocus.focus({ preventScroll: true });
        dialogueReturnFocus = null;
        const next = dialogueContinue;
        dialogueContinue = null;
        next?.();
    };
    dialogue.addEventListener('click', (event) => {
        event.stopPropagation();
        continueDialogue();
    });
    document.addEventListener('keydown', (event) => {
        if (dialogue.hidden || event.repeat) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            continueDialogue();
        }
    });
    const persist = () => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({
                ...state,
                fieldValues: persistedFields.map((field) => field.value),
                answers: [1, 2, 3, 4, 5].map((number) => document.querySelector(`input[name="answer-${number}"]:checked`)?.value ?? null),
            }));
            return true;
        } catch { return false; }
    };
    const chapterPrologue = document.querySelector('[data-ch2-prologue]');
    const prologueTitle = document.querySelector('[data-ch2-prologue-title]');
    const prologueText = document.querySelector('[data-ch2-prologue-text]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const chapterPrologueScenes = [
        { kicker: 'PROLOG · 01', title: 'Jalur fisik sudah siap', text: 'Router dan jalur fisik dari Chapter 1 sudah siap. Sekarang jaringan sekolah perlu dibagi sesuai kebutuhan siswa dan guru, lalu setiap klien harus memperoleh konfigurasi IP yang tepat.', pose: 'menugaskan' },
        { kicker: 'PEMBAGIAN JARINGAN · 02', title: 'Siswa dan guru, dua segmen', text: 'Satu jalur menuju switch akan membawa dua jaringan logis. Buat vlan1-siswa dengan ID 10 dan vlan2-guru dengan ID 20. Keduanya memakai ether2-vlan sebagai interface induk.', pose: 'ngasih_arahan' },
        { kicker: 'JALUR WAN · 03', title: 'Router menerima konfigurasi dari ISP', text: 'Di sisi penyedia, router berperan sebagai DHCP Client. Layanan ini dipasang pada ether1-internet agar router menerima konfigurasi jaringan secara otomatis. Setelah disimpan, periksa statusnya.', pose: 'memberitahu' },
        { kicker: 'ALAMAT JARINGAN · 04', title: 'Gateway dan alamat otomatis', text: 'Pasang IP gateway pada interface lokal, VLAN siswa, VLAN guru, dan wireless sesuai skenario. Kemudian siapkan DHCP Server dengan rentang alamat yang berada pada subnet masing-masing segmen.', pose: 'ngasih_arahan' },
        { kicker: 'TARGET MISI · 05', title: 'Periksa hasil dari sisi klien', text: 'Pastikan kedua VLAN memiliki ID yang benar dan alamat gateway berada pada interface yang tepat. Klien harus menerima IP dari rentang DHCP yang sesuai, dengan gateway yang sama seperti alamat router pada segmennya.', pose: 'mantap' },
    ];
    const chapterOpeningDialogue = [
        'Router dan jalur fisik sudah siap. Pada Chapter 2, tugasmu adalah membentuk segmen jaringan sesuai kebutuhan siswa dan guru, lalu memberikan konfigurasi IP kepada klien.',
        'Kita mulai dengan VLAN siswa dan guru pada ether2-vlan. Setelah itu, atur DHCP Client di ether1-internet, pasang IP gateway pada interface yang tepat, dan siapkan DHCP Server sesuai subnetnya.',
        'Terakhir, periksa alamat dan gateway yang diterima klien. Gunakan nilai pada skenario latihan, lalu pastikan PC siswa dan guru berada pada segmen yang benar. Mari kita pelajari VLAN terlebih dahulu.',
    ];
    let prologueIndex = Math.max(0, Math.min(chapterPrologueScenes.length - 1, Number(state.prologueIndex) || 0));
    let prologueTimer = null;
    let prologueTyping = false;
    let replayingPrologue = false;
    let prologueReturnFocus = null;
    const finishPrologueTyping = () => {
        if (prologueTimer !== null) window.clearInterval(prologueTimer);
        prologueTimer = null;
        prologueTyping = false;
        prologueTitle.textContent = chapterPrologueScenes[prologueIndex].title;
        prologueText.textContent = chapterPrologueScenes[prologueIndex].text;
        prologueTitle.classList.remove('is-typing');
        prologueText.classList.remove('is-typing');
    };
    const renderPrologueScene = () => {
        const story = chapterPrologueScenes[prologueIndex];
        if (prologueTimer !== null) window.clearInterval(prologueTimer);
        document.querySelector('[data-ch2-prologue-kicker]').textContent = story.kicker;
        document.querySelector('[data-ch2-prologue-avatar]').src = scene.dataset.teacherBase + '/' + story.pose + '.png';
        document.querySelector('[data-ch2-prologue-count]').textContent = 'ADEGAN ' + String(prologueIndex + 1).padStart(2, '0') + ' / ' + String(chapterPrologueScenes.length).padStart(2, '0');
        document.querySelector('[data-ch2-prologue-progress]').style.width = ((prologueIndex + 1) / chapterPrologueScenes.length * 100) + '%';
        const panel = document.querySelector('[data-ch2-prologue-story]');
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
        prologueTitle.textContent = '';
        prologueText.textContent = '';
        prologueTitle.classList.add('is-typing');
        prologueText.classList.remove('is-typing');
        prologueTyping = true;
        if (reducedMotion.matches) { finishPrologueTyping(); return; }
        let position = 0;
        prologueTimer = window.setInterval(() => {
            position++;
            if (position <= story.title.length) {
                prologueTitle.textContent = story.title.slice(0, position);
                return;
            }
            prologueTitle.classList.remove('is-typing');
            prologueText.classList.add('is-typing');
            prologueText.textContent = story.text.slice(0, position - story.title.length);
            if (position >= story.title.length + story.text.length) finishPrologueTyping();
        }, 24);
    };
    const startChapterPrologue = (replay = false) => {
        replayingPrologue = replay;
        prologueReturnFocus = document.activeElement;
        prologueIndex = replay ? 0 : Math.max(0, Math.min(chapterPrologueScenes.length - 1, Number(state.prologueIndex) || 0));
        labSurface.inert = true;
        chapterPrologue.hidden = false;
        scene.classList.add('is-prologue');
        chapterPrologue.focus({ preventScroll: true });
        renderPrologueScene();
    };
    const advanceChapterPrologue = () => {
        if (chapterPrologue.hidden) return;
        if (prologueTyping) { finishPrologueTyping(); return; }
        if (prologueIndex + 1 < chapterPrologueScenes.length) {
            prologueIndex++;
            if (!replayingPrologue) { state.prologueIndex = prologueIndex; persist(); }
            renderPrologueScene();
            return;
        }
        chapterPrologue.hidden = true;
        scene.classList.remove('is-prologue');
        labSurface.inert = false;
        if (!replayingPrologue) { state.prologueComplete = true; persist(); }
        if (prologueReturnFocus?.isConnected) prologueReturnFocus.focus({ preventScroll: true });
        openDialogue(chapterOpeningDialogue, replayingPrologue ? null : mainAction);
    };
    chapterPrologue.addEventListener('click', (event) => { event.stopPropagation(); advanceChapterPrologue(); });
    chapterPrologue.addEventListener('keydown', (event) => {
        if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        event.stopPropagation();
        advanceChapterPrologue();
    });
    document.querySelector('[data-replay-prologue]').addEventListener('click', () => startChapterPrologue(true));

    const normal = (value) => value.trim().toLowerCase().replaceAll(' ', '');
    const completeVlan = () => state.vlan.student && state.vlan.teacher;
    const completeAddresses = () => Object.entries(state.addresses).every(([group, exists]) => exists && !state.addressDisabled[group]);
    const completePools = () => Boolean(state.pools.student && state.pools.teacher && !state.dhcpDisabled.student && !state.dhcpDisabled.teacher);
    const clientLease = (group) => state.clientLeases[group] || {
        address: state.pools[group].split('-')[0] || '',
        gateway: '192.168.' + (group === 'student' ? 40 : 60) + '.1',
        server: group === 'student' ? 'dhcp1' : 'dhcp2',
        lease: state.dhcpSettings[group]?.lease || '10m',
    };
    const clientNetworkReady = (group) => Boolean(state.vlan[group] && state.pools[group] && !state.dhcpDisabled[group] && state.addresses[group] && !state.addressDisabled[group]);
    const clientLeaseIsValid = (group) => {
        if (!state.clients[group] || !clientNetworkReady(group)) return false;
        const lease = clientLease(group);
        const prefix = group === 'student' ? 40 : 60;
        const match = lease.address.match(/^192\.168\.(\d+)\.(\d+)$/);
        const start = Number(state.pools[group].split('-')[0]?.split('.').at(-1));
        const end = Number(state.pools[group].split('-')[1]?.split('.').at(-1));
        return Boolean(match && Number(match[1]) === prefix && start >= 2 && end <= 254 && end >= start && Number(match[2]) >= start && Number(match[2]) <= end && lease.gateway === '192.168.' + prefix + '.1' && lease.server === (group === 'student' ? 'dhcp1' : 'dhcp2'));
    };
    const completeClients = () => clientLeaseIsValid('student') && clientLeaseIsValid('teacher');
    const progressCount = () => [completeVlan(), state.wan, completeAddresses(), completePools(), completeClients()].filter(Boolean).length;
    const isCurrentTaskDone = () => ({ vlan: completeVlan(), wan: state.wan, addresses: completeAddresses(), dhcp: completePools(), verify: completeClients() })[state.stage] || false;

    const stageInformation = {
        intro: ['LANJUTAN CHAPTER 01 · PAK AMAT', 'Router sudah siap. Sekarang kita buat VLAN.', 'Sesi WinBox dari Chapter 1 masih terbuka. Pelajari dahulu apa itu VLAN sebelum menambahkannya pada router.', 'Pelajari VLAN →'],
        vlan: ['MISI 01 / 05 · INTERFACES → VLAN', 'Buat VLAN siswa dan guru', 'Di Interfaces → VLAN, buat vlan1-siswa ID 10 dan vlan2-guru ID 20. Keduanya menggunakan ether2-vlan sebagai interface induk.', 'Buka Interfaces → VLAN'],
        wan: ['MISI 02 / 05 · IP → DHCP CLIENT', 'Minta konfigurasi WAN dari ISP', 'Router menjadi DHCP Client pada ether1-internet. Pilih interface yang mengarah ke penyedia lalu periksa status bound.', 'Buka DHCP Client'],
        addresses: ['MISI 03 / 05 · IP → ADDRESSES', 'Pasangkan IP gateway pada interface', 'Tambahkan empat alamat gateway sesuai petunjuk di panel kanan. Cocokkan alamat IP dengan interface tujuannya.', 'Buka IP → Addresses'],
        dhcp: ['MISI 04 / 05 · IP → DHCP SERVER', 'Bagikan alamat pada kedua VLAN', 'Jalankan DHCP Setup untuk siswa dan guru. Pool yang dibagikan harus satu subnet dengan gateway masing-masing.', 'Buka DHCP Server'],
        verify: ['MISI 05 / 05 · PENGUJIAN', 'Periksa IP yang diterima klien', 'Minta alamat pada PC siswa dan PC guru, lalu bandingkan subnet dan gateway keduanya.', 'Buka Leases / Klien'],
        quiz: ['EVALUASI CHAPTER 02', 'Konfigurasi sudah selesai. Uji pemahamanmu.', 'Kamu sudah menyiapkan VLAN, IP gateway, DHCP Client, dan DHCP Server. Jawab lima soal untuk menyimpan hasil Chapter 2 ke akun.', 'Buka evaluasi →'],
        finish: ['CHAPTER 02 SELESAI', 'Bagus! Jaringan sekolah sudah terbagi rapi.', 'Hasil evaluasi tersimpan di akun. Seluruh menu WinBox yang sudah dibuka tetap bisa kamu periksa kembali.', 'Lihat apresiasi →'],
    };
    const guideInformation = {
        intro: ['Dengarkan arahan Pak Amat.', 'Pelajari pengertian dan topologi VLAN.', 'Klik lanjut untuk mulai praktik di WinBox.'],
        vlan: ['Klik Interfaces di menu kiri, lalu pilih tab VLAN.', 'Klik +, isi Name, VLAN ID, dan Interface sesuai target di bawah, lalu klik OK. Ulangi untuk VLAN kedua.', 'Untuk menghapus, klik baris VLAN pada tabel, lalu klik tombol −.'],
        wan: ['Buka IP → DHCP Client.', 'Pilih ether1-internet.', 'Simpan dan pastikan status bound.'],
        addresses: [
            'Buka IP → Addresses, lalu klik tombol +. Pada jendela New Address, isi Address dan pilih Interface sesuai target. Klik OK untuk menyimpan, atau Apply agar jendela tetap terbuka.',
            'Untuk siswa dan guru, pilih interface VLAN masing-masing, bukan ether2-vlan. Ulangi sampai keempat target tercentang. Untuk menghapus IP, pilih barisnya lalu klik − merah.',
        ],
        dhcp: ['Buat DHCP untuk siswa terlebih dahulu, lalu ulangi untuk guru.', 'Ikuti petunjuk pengisian di bawah. Petunjuk berubah sesuai layar DHCP Setup yang sedang terbuka.'],
        verify: ['Buka IP → DHCP Server → Leases. Tabel ini menampilkan PC yang sudah menerima IP dari router.', 'Di bawah, klik Minta IP PC siswa, lalu Minta IP PC guru. Tunggu sampai setiap target berwarna hijau dan bertanda ✓.', 'Pada tabel Leases, cocokkan Host Name, Address, Server dan Status: siswa harus 192.168.40.x dari dhcp1; guru 192.168.60.x dari dhcp2. Status keduanya harus bound (IP diterima).'],
        quiz: ['Tinjau kembali konfigurasi.', 'Jawab lima soal evaluasi.', 'Kirim jawaban untuk menyimpan hasil.'],
        finish: ['Chapter 02 selesai.', 'Periksa kembali hasil konfigurasi.', 'Lanjutkan petualangan dari peta chapter.'],
    };
    const finishedInformation = {
        vlan: ['VLAN siswa dan guru sudah terpasang.', 'Selanjutnya router perlu menerima alamat dari ISP pada jalur WAN.', 'Pelajari DHCP Client →'],
        wan: ['DHCP Client sudah bound.', 'Sekarang pasangkan alamat IP gateway ke interface lokal, siswa, guru, dan wireless.', 'Pelajari IP gateway →'],
        addresses: ['Semua gateway sudah tepat.', 'Berikutnya, siapkan DHCP Server agar klien mendapat alamat secara otomatis.', 'Pelajari DHCP Server →'],
        dhcp: ['DHCP Server siap melayani klien.', 'Mari pastikan PC siswa dan guru memperoleh alamat dari subnet yang benar.', 'Pelajari cara menguji →'],
        verify: ['Kedua PC mendapat alamat yang benar!', 'Pak Amat akan merangkum hasil praktik sebelum evaluasi.', 'Lihat rekap →'],
    };
    const unlockStage = { vlan: 'vlan', wan: 'wan', addresses: 'addresses', 'address-edit': 'addresses', 'address-comment': 'addresses', dhcp: 'dhcp', 'dhcp-setup': 'dhcp', clients: 'verify' };
    const canOpen = (name) => !unlockStage[name] || state.highest >= stages.indexOf(unlockStage[name]);

    const renderAddressChecklist = () => {
        document.querySelector('[data-address-checklist]').hidden = state.stage !== 'addresses';
        let completedAddresses = 0;
        ['local', 'student', 'teacher', 'wireless'].forEach((group, index) => {
            const isComplete = Boolean(state.addresses[group] && !state.addressDisabled[group]);
            document.querySelector('[data-address-task="' + group + '"]').classList.toggle('is-done', isComplete);
            document.querySelector('[data-address-task-mark="' + group + '"]').textContent = isComplete ? '✓' : String(index + 1);
            document.querySelector('[data-address-task-status="' + group + '"]').textContent = isComplete ? 'Selesai' : 'Belum selesai';
            if (isComplete) completedAddresses++;
        });
        document.querySelector('[data-address-task-count]').textContent = completedAddresses + ' / 4 selesai';
    };

    const dhcpStepInstruction = (group, step) => {
        const student = group === 'student';
        const prefix = student ? 40 : 60;
        const name = student ? 'siswa' : 'guru';
        const iface = student ? 'vlan1-siswa' : 'vlan2-guru';
        const start = '192.168.' + prefix + '.10';
        const end = '192.168.' + prefix + '.50';
        return [
            { title: 'Pilih interface DHCP ' + name, text: 'Pada kolom DHCP Server Interface, pilih VLAN untuk ' + name + '. Jangan pilih ether2-vlan atau port internet.', values: [['DHCP Server Interface', iface]], action: 'Setelah memilih interface, klik Next.' },
            { title: 'Isi alamat jaringan ' + name, text: 'DHCP Address Space adalah jaringan tempat komputer ' + name + ' mendapat IP. Periksa kolomnya; ubah jika berbeda dari nilai ini.', values: [['DHCP Address Space', '192.168.' + prefix + '.0/24']], action: 'Pastikan alamat berakhir .0/24, lalu klik Next.' },
            { title: 'Isi gateway ' + name, text: 'Gateway adalah IP router pada VLAN ' + name + '. Alamat ini sudah dipasang pada ' + iface + ' di tahap sebelumnya.', values: [['Gateway for DHCP Network', '192.168.' + prefix + '.1']], action: 'Pastikan alamat berakhir .1, lalu klik Next.' },
            { title: 'Isi rentang IP untuk komputer ' + name, text: 'Addresses to Give Out adalah rentang IP yang boleh dibagikan ke komputer. Hapus rentang bawaan, lalu ketik nilai lengkap di bawah memakai tanda minus (-).', values: [['IP awal', start], ['IP akhir', end], ['Ketik di Addresses to Give Out', start + '-' + end]], action: 'Gunakan rentang .10 sampai .50. Jangan masukkan gateway .1. Setelah diisi, klik Next.' },
            { title: 'Lewati DNS pada latihan ini', text: 'DNS belum ditentukan pada tahap ini. Kosongkan kolom DNS Servers; tidak perlu mengetik alamat apa pun.', values: [['DNS Servers', '(kosongkan)']], action: 'Biarkan kosong, lalu klik Next.' },
            { title: 'Isi lama peminjaman IP', text: 'Lease Time menentukan berapa lama komputer boleh memakai alamat IP. Ketik 10m, artinya 10 menit.', values: [['Lease Time', '10m']], action: 'Klik Next. Jika muncul “Setup has completed successfully”, klik OK.' },
            { title: 'DHCP ' + name + ' berhasil dibuat', text: 'Semua langkah untuk VLAN ' + name + ' sudah tersimpan. Target di bawah sekarang tercentang hijau.', values: [], action: group === 'student' && !state.pools.teacher ? 'Klik OK, lalu klik DHCP Setup lagi untuk membuat DHCP guru.' : 'Klik OK untuk menutup jendela hasil setup.' },
        ][step];
    };
    const renderDhcpGuide = (scrollToTop = false) => {
        const card = document.querySelector('[data-dhcp-instruction]');
        card.hidden = state.stage !== 'dhcp';
        if (card.hidden) return;
        const setupOpen = !windows.get('dhcp-setup').hidden;
        const selected = document.querySelector('[data-pool-interface]').value;
        const group = setupOpen && selected === 'vlan2-guru' ? 'teacher' : setupOpen && selected === 'vlan1-siswa' ? 'student' : !state.pools.student || state.dhcpDisabled.student ? 'student' : 'teacher';
        const instruction = !setupOpen && completePools()
            ? { title: 'DHCP siswa dan guru sudah selesai', text: '', values: [], action: 'Kedua target sudah tercentang. Lanjutkan ke pengujian PC melalui arahan Pak Amat.' }
            : dhcpStepInstruction(group, setupOpen ? dhcpStep : 0);
        document.querySelector('[data-dhcp-instruction-step]').textContent = setupOpen ? 'ISI DI LAYAR SEKARANG · ' + Math.min(dhcpStep + 1, 6) + ' / 6' : 'MULAI DARI SINI';
        document.querySelector('[data-dhcp-instruction-title]').textContent = instruction.title;
        document.querySelector('[data-dhcp-instruction-text]').textContent = setupOpen || completePools() ? instruction.text : 'Buka IP → DHCP Server, lalu klik tombol DHCP Setup. Pada layar pertama, pilih interface berikut.';
        const rows = instruction.values.flatMap(([label, value]) => {
            const term = document.createElement('dt'); term.textContent = label;
            const detail = document.createElement('dd');
            const code = document.createElement('code'); code.textContent = value; detail.append(code);
            return [term, detail];
        });
        document.querySelector('[data-dhcp-instruction-values]').replaceChildren(...rows);
        document.querySelector('[data-dhcp-instruction-action]').textContent = instruction.action;
        if (scrollToTop) document.querySelector('.ch2-guide').scrollTo({ top: 0, behavior: 'auto' });
    };
    const renderDhcpChecklist = () => {
        document.querySelector('[data-dhcp-checklist]').hidden = state.stage !== 'dhcp';
        let completed = 0;
        ['student', 'teacher'].forEach((group, index) => {
            const done = Boolean(state.pools[group] && !state.dhcpDisabled[group]);
            document.querySelector('[data-dhcp-task="' + group + '"]').classList.toggle('is-done', done);
            document.querySelector('[data-dhcp-task-mark="' + group + '"]').textContent = done ? '✓' : String(index + 1);
            document.querySelector('[data-dhcp-task-status="' + group + '"]').textContent = done ? 'Selesai' : state.pools[group] ? 'Server nonaktif' : 'Belum selesai';
            const range = state.pools[group];
            document.querySelector('[data-dhcp-task-range="' + group + '"]').textContent = range ? 'Rentang tersimpan: ' + range : 'Addresses to Give Out: 192.168.' + (group === 'student' ? 40 : 60) + '.10-192.168.' + (group === 'student' ? 40 : 60) + '.50';
            if (done) completed++;
        });
        document.querySelector('[data-dhcp-task-count]').textContent = completed + ' / 2 selesai';
    };
    const renderLeaseState = () => {
        document.querySelector('[data-client-checklist]').hidden = state.stage !== 'verify';
        const search = document.querySelector('[data-lease-find]').value.trim().toLowerCase();
        let completed = 0;
        let visible = 0;
        ['student', 'teacher'].forEach((group, index) => {
            const valid = clientLeaseIsValid(group);
            const requesting = requestingClients.has(group);
            const lease = clientLease(group);
            const card = document.querySelector('[data-client="' + group + '"]');
            card.classList.toggle('is-done', valid);
            card.classList.toggle('is-requesting', requesting);
            document.querySelector('[data-client-mark="' + group + '"]').textContent = valid ? '✓' : String(index + 1);
            document.querySelector('[data-client-ip="' + group + '"]').textContent = state.clients[group] ? lease.address : 'Belum mendapat IP';
            document.querySelector('[data-client-expected="' + group + '"]').textContent = 'Rentang IP yang benar: ' + (state.pools[group] || 'DHCP Server belum dibuat');
            document.querySelector('[data-client-status="' + group + '"]').textContent = requesting ? 'Sedang meminta IP…' : valid ? 'Selesai · bound · IP dan gateway sesuai' : state.clients[group] ? 'Konfigurasi berubah · uji ulang' : 'Belum diuji';
            const request = document.querySelector('[data-request-ip="' + group + '"]');
            request.textContent = requesting ? 'Menunggu jawaban DHCP…' : 'Minta IP PC ' + (index ? 'guru' : 'siswa');
            request.hidden = valid && !requesting;
            request.disabled = requesting;
            const row = document.querySelector('[data-lease-row="' + group + '"]');
            const mac = '02:00:00:00:00:' + (index ? '20' : '10');
            row.hidden = !state.clients[group] || !(lease.address + ' ' + mac + ' PC-' + (index ? 'Guru' : 'Siswa') + ' ' + lease.server).toLowerCase().includes(search);
            row.classList.toggle('is-selected', selectedLease === group && Boolean(state.clients[group]));
            row.setAttribute('aria-pressed', String(selectedLease === group && Boolean(state.clients[group])));
            row.querySelector('span').textContent = row.hidden ? '' : String(visible++);
            document.querySelector('[data-lease-flags="' + group + '"]').textContent = state.clientStatic[group] ? '' : 'D';
            document.querySelector('[data-lease-address="' + group + '"]').textContent = lease.address;
            document.querySelector('[data-lease-status="' + group + '"]').textContent = valid ? 'bound' : 'waiting';
            document.querySelector('[data-lease-expires="' + group + '"]').textContent = valid ? lease.lease : '';
            if (valid) completed++;
        });
        if (selectedLease && !state.clients[selectedLease]) selectedLease = null;
        document.querySelector('[data-remove-lease]').disabled = !selectedLease;
        document.querySelector('[data-make-lease-static]').disabled = !selectedLease || Boolean(state.clientStatic[selectedLease]);
        document.querySelector('[data-client-task-count]').textContent = completed + ' / 2 selesai';
        const total = Number(Boolean(state.clients.student)) + Number(Boolean(state.clients.teacher));
        document.querySelector('[data-lease-count]').textContent = search ? visible + ' of ' + total + ' items' : total + ' items';
    };
    const renderTask = () => {
        renderLeaseState();
        renderDhcpChecklist();
        renderDhcpGuide();
        renderAddressChecklist();
        const done = isCurrentTaskDone();
        const result = done ? finishedInformation[state.stage] : null;
        document.querySelector('[data-guide-list]').replaceChildren(...guideInformation[state.stage].map((step) => {
            const item = document.createElement('li');
            item.textContent = step;
            return item;
        }));
        document.querySelector('[data-vlan-checklist]').hidden = state.stage !== 'vlan';
        let completedVlans = 0;
        ['student', 'teacher'].forEach((group, index) => {
            const isComplete = Boolean(state.vlan[group]);
            document.querySelector('[data-vlan-task="' + group + '"]').classList.toggle('is-done', isComplete);
            document.querySelector('[data-vlan-task-mark="' + group + '"]').textContent = isComplete ? '✓' : String(index + 1);
            document.querySelector('[data-vlan-task-status="' + group + '"]').textContent = isComplete ? 'Selesai' : 'Belum selesai';
            if (isComplete) completedVlans++;
        });
        document.querySelector('[data-vlan-task-count]').textContent = completedVlans + ' / 2 selesai';
        document.querySelectorAll('[data-previous]').forEach((button) => { button.hidden = state.stage === 'intro'; });
        const progress = progressCount();
        document.querySelector('[data-progress-label]').textContent = `${progress} / 5`;
        document.querySelector('[data-progress]').value = progress;
        document.querySelectorAll('[data-unlock]').forEach((button) => {
            button.disabled = !canOpen(button.dataset.openWindow);
            button.title = button.disabled ? 'Terbuka setelah arahan Pak Amat pada misi ini' : '';
        });
    };
    const renderVlanSelection = () => {
        if (selectedVlan && !state.vlan[selectedVlan]) selectedVlan = null;
        document.querySelectorAll('[data-vlan-row]').forEach((row) => {
            const isSelected = Boolean(state.vlan[row.dataset.vlanRow] && selectedVlan === row.dataset.vlanRow);
            row.classList.toggle('is-selected', isSelected);
            row.setAttribute('aria-pressed', String(isSelected));
        });
        const removeButton = document.querySelector('[data-vlan-tool="remove"]');
        removeButton.disabled = !selectedVlan;
        removeButton.title = selectedVlan ? 'Hapus VLAN yang dipilih' : 'Pilih baris VLAN terlebih dahulu';
    };
    const renderAddressSelection = () => {
        if (selectedAddress && !state.addresses[selectedAddress]) selectedAddress = null;
        document.querySelectorAll('[data-address-row]').forEach((row) => {
            const isSelected = Boolean(state.addresses[row.dataset.addressRow] && selectedAddress === row.dataset.addressRow);
            row.classList.toggle('is-selected', isSelected);
            row.setAttribute('aria-pressed', String(isSelected));
        });
        const removeButton = document.querySelector('[data-remove-address]');
        removeButton.disabled = !selectedAddress;
        removeButton.title = selectedAddress ? 'Hapus IP address yang dipilih' : 'Pilih baris IP address terlebih dahulu';
        document.querySelectorAll('[data-address-tool]').forEach((button) => {
            button.disabled = !selectedAddress || (button.dataset.addressTool === 'enable' ? !state.addressDisabled[selectedAddress] : button.dataset.addressTool === 'disable' && Boolean(state.addressDisabled[selectedAddress]));
        });
    };
    const renderLists = () => {
        document.querySelector('[data-router-identity]').textContent = state.identity;
        document.querySelector('[data-identity-input]').value = state.identity;
        for (const [key, name] of Object.entries(state.interfaces)) document.querySelector(`[data-interface-name="${key}"]`).textContent = name;
        for (const group of ['student', 'teacher']) {
            document.querySelector(`[data-vlan-row="${group}"]`).hidden = !state.vlan[group];
            document.querySelector(`[data-pool-row="${group}"]`).hidden = !state.pools[group];
            document.querySelector(`[data-pool-display="${group}"]`).textContent = state.pools[group] || '—';
        }
        document.querySelector('[data-vlan-empty]').hidden = completeVlan() || state.vlan.student || state.vlan.teacher;
        document.querySelector('[data-vlan-count]').textContent = `${Number(state.vlan.student) + Number(state.vlan.teacher)} items`;
        for (const key of Object.keys(state.addresses)) document.querySelector(`[data-address-row="${key}"]`).hidden = !state.addresses[key];
        document.querySelector('[data-address-count]').textContent = `${Object.values(state.addresses).filter(Boolean).length} items`;
        document.querySelector('[data-pool-count]').textContent = `${Number(Boolean(state.pools.student)) + Number(Boolean(state.pools.teacher))} items`;
        document.querySelector('[data-wan-status]').textContent = state.wan ? 'bound · alamat WAN diterima' : 'belum terhubung';
        renderVlanSelection();
        renderAddressSelection();
        renderAddressRows();
        renderDhcpList();
    };
    const render = () => {
        renderTask();
        renderLists();
        const result = finishedInformation[state.stage];
        if (isCurrentTaskDone() && result && announcedStage !== state.stage) {
            announcedStage = state.stage;
            openDialogue([`${result[0]} ${result[1]}`], mainAction);
        } else if (!isCurrentTaskDone()) {
            announcedStage = null;
        }
    };

    const restoreDrafts = () => {
        const values = saved?.fieldValues || legacy?.fields;
        if (Array.isArray(values) && saved) persistedFields.forEach((field, index) => {
            if (typeof values[index] === 'string') field.value = values[index];
        });
        if (legacy?.fields) {
            const legacyFields = legacy.fields;
            const mapping = [
                ['[data-vlan-name]', 0], ['[data-vlan-id]', 1], ['[data-vlan-parent]', 2],
                ['[data-wan-interface]', 6], ['[data-address-input]', 7], ['[data-pool-interface]', 11], ['[data-pool-range]', 12],
            ];
            mapping.forEach(([selector, index]) => {
                const field = document.querySelector(selector);
                if (field && typeof legacyFields[index] === 'string') field.value = legacyFields[index];
            });
        }
        (saved?.answers || legacy?.answers || []).forEach((answer, index) => {
            const input = [...document.querySelectorAll(`input[name="answer-${index + 1}"]`)].find((item) => item.value === answer);
            if (input) input.checked = true;
        });
    };

    const taskbar = document.querySelector('[data-taskbar]');
    const removeTaskbarButton = (name) => taskbar.querySelector(`[data-restore="${name}"]`)?.remove();
    const focusWindow = (name) => {
        windows.forEach((node, key) => node.classList.toggle('is-focused', key === name));
        windows.get(name).style.zIndex = String(++topLayer);
        document.querySelectorAll('.ch2-nav [data-open-window]').forEach((button) => button.classList.toggle('is-active', button.dataset.openWindow === name));
    };
    const closeNavigationMenus = () => {
        document.querySelectorAll('[data-ch2-submenu]').forEach((menu) => { menu.hidden = true; });
        document.querySelectorAll('[data-ch2-menu]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    };
    const openWindow = (name) => {
        if (!canOpen(name)) return message('Ikuti dulu langkah Pak Amat untuk membuka menu ini.', 'error');
        const node = windows.get(name);
        if (!node) return;
        closeNavigationMenus();
        if (name === 'vlan') windows.get('interfaces').hidden = true;
        if (name === 'interfaces') windows.get('vlan').hidden = true;
        if (name === 'clients') windows.get('dhcp').hidden = true;
        if (name === 'dhcp') windows.get('clients').hidden = true;
        node.hidden = false;
        removeTaskbarButton(name);
        focusWindow(name);
        node.querySelector('input:not([readonly]),select,button')?.focus({ preventScroll: true });
    };
    const closeWindow = (name) => { windows.get(name).hidden = true; removeTaskbarButton(name); if (name === 'dhcp-setup') renderDhcpGuide(); };
    const minimizeWindow = (name) => {
        const node = windows.get(name);
        node.hidden = true;
        removeTaskbarButton(name);
        const button = document.createElement('button');
        button.type = 'button'; button.dataset.restore = name; button.textContent = node.querySelector('header > span')?.textContent || name;
        button.addEventListener('click', () => openWindow(name));
        taskbar.append(button);
    };

    const setStage = (stage) => {
        if (!stages.includes(stage)) return;
        state.stage = stage;
        state.highest = Math.max(state.highest, stages.indexOf(stage));
        persist(); render();
        document.querySelector('.ch2-main').scrollTo({ top: 0, behavior: 'auto' });
        message('Ikuti arahan Pak Amat pada tampilan WinBox.', 'info');
        if (!isCurrentTaskDone()) {
            const [, title, text] = stageInformation[stage];
            openDialogue([`${title} ${text}`], mainAction);
        }
    };
    const conceptNext = { vlan: 'vlan', wan: 'wan', addresses: 'addresses', dhcp: 'dhcp', verify: 'verify', recap: 'quiz' };
    const showConcept = (name) => {
        pendingStage = conceptNext[name];
        const template = document.querySelector(`[data-concept="${name}"]`);
        document.querySelector('[data-learning-body]').replaceChildren(template.content.cloneNode(true));
        document.querySelector('[data-learning-continue]').textContent = name === 'recap' ? 'Mulai evaluasi →' : 'Mulai praktik di WinBox →';
        learningDialog.showModal();
    };
    const mainAction = () => {
        if (state.stage === 'intro') return showConcept('vlan');
        if (state.stage === 'finish') return finishDialog.showModal();
        if (state.stage === 'quiz') return quizDialog.showModal();
        if (isCurrentTaskDone()) {
            const following = { vlan: 'wan', wan: 'addresses', addresses: 'dhcp', dhcp: 'verify', verify: 'recap' };
            return showConcept(following[state.stage]);
        }
        openWindow(({ vlan: 'vlan', wan: 'wan', addresses: 'addresses', dhcp: 'dhcp', verify: 'clients' })[state.stage]);
    };

    document.querySelectorAll('[data-previous]').forEach((button) => button.addEventListener('click', () => {
        const index = Math.max(0, stages.indexOf(state.stage) - 1);
        setStage(stages[index]);
    }));
    document.querySelector('[data-save]').addEventListener('click', () => {
        const savedNow = persist();
        message(savedNow ? 'Progres tahap ini tersimpan di browser. Hasil chapter tersimpan di akun setelah evaluasi.' : 'Penyimpanan browser tidak tersedia. Selesaikan evaluasi agar hasil tersimpan di akun.', savedNow ? 'success' : 'error');
    });
    persistedFields.forEach((field) => field.addEventListener('input', persist));
    document.querySelectorAll('.ch2-quiz-dialog input').forEach((field) => field.addEventListener('change', persist));

    document.querySelectorAll('[data-ch2-menu]').forEach((button) => {
        button.addEventListener('click', () => {
            const menu = document.querySelector('[data-ch2-submenu="' + button.dataset.ch2Menu + '"]');
            const shouldOpen = menu.hidden;
            closeNavigationMenus();
            menu.hidden = !shouldOpen;
            button.setAttribute('aria-expanded', String(shouldOpen));
        });
    });
    document.addEventListener('pointerdown', (event) => { if (!event.target.closest('[data-ch2-submenu], [data-ch2-menu]')) closeNavigationMenus(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNavigationMenus(); });
    document.querySelector('[data-ch2-app-size]').addEventListener('click', () => document.querySelector('.ch2-routeros').classList.toggle('is-app-restored'));
    const winboxApp = document.querySelector('.ch2-routeros');
    const reopenWinbox = document.createElement('button');
    reopenWinbox.type = 'button';
    reopenWinbox.className = 'winbox-reopen';
    reopenWinbox.hidden = true;
    const winboxLogo = document.createElement('img');
    winboxLogo.src = winboxApp.querySelector('header img').src;
    winboxLogo.alt = '';
    reopenWinbox.append(winboxLogo, 'Buka WinBox');
    winboxApp.before(reopenWinbox);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => { winboxApp.hidden = true; reopenWinbox.hidden = false; }));
    reopenWinbox.addEventListener('click', () => { reopenWinbox.hidden = true; winboxApp.hidden = false; });
    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow)));
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeWindow(button.dataset.close)));
    document.querySelectorAll('[data-minimize]').forEach((button) => button.addEventListener('click', () => minimizeWindow(button.dataset.minimize)));
    windows.forEach((node, name) => {
        node.addEventListener('pointerdown', () => focusWindow(name));
        const header = node.querySelector('header');
        if (node.classList.contains('ch2-window--list') || name === 'routes') node.classList.add('is-maximized');
        const controls = header.querySelector('.ch2-window-controls');
        const maximize = document.createElement('button');
        maximize.type = 'button';
        maximize.textContent = '□';
        maximize.setAttribute('aria-label', 'Maksimalkan / pulihkan ' + header.firstElementChild.textContent);
        maximize.addEventListener('click', () => { node.classList.toggle('is-maximized'); node.style.left = ''; node.style.top = ''; });
        controls.insertBefore(maximize, controls.lastElementChild);
        const actions = node.querySelector('.ch2-window-actions');
        if (actions && !actions.querySelector('[data-close]')) {
            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.textContent = 'Cancel';
            cancel.addEventListener('click', () => closeWindow(name));
            actions.insertBefore(cancel, actions.children[1] || null);
        }
        header.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button') || node.classList.contains('is-maximized')) return;
            const startX = event.clientX; const startY = event.clientY;
            const currentLeft = node.offsetLeft; const currentTop = node.offsetTop;
            header.setPointerCapture(event.pointerId);
            const move = (moveEvent) => {
                const bounds = node.parentElement.getBoundingClientRect();
                node.style.left = `${Math.max(0, Math.min(bounds.width - node.offsetWidth, currentLeft + moveEvent.clientX - startX))}px`;
                node.style.top = `${Math.max(0, Math.min(bounds.height - node.offsetHeight, currentTop + moveEvent.clientY - startY))}px`;
            };
            const stop = () => { header.removeEventListener('pointermove', move); header.removeEventListener('pointerup', stop); header.removeEventListener('pointercancel', stop); };
            header.addEventListener('pointermove', move); header.addEventListener('pointerup', stop); header.addEventListener('pointercancel', stop);
        });
    });

    const syncChapterOne = () => {
        const snapshot = readStorage(chapterOneKey);
        if (!snapshot) return;
        snapshot.identitySaved = state.identity === 'Router';
        snapshot.identityInput = state.identity;
        snapshot.interfaceNames = { ...snapshot.interfaceNames, ...state.interfaces };
        snapshot.interfaceSaved = { ether1: state.interfaces.ether1 === 'ether1-internet', ether2: state.interfaces.ether2 === 'ether2-vlan', ether3: state.interfaces.ether3 === 'ether3-local' };
        try { window.localStorage.setItem(chapterOneKey, JSON.stringify(snapshot)); } catch { /* Chapter 2 still saves independently. */ }
    };
    document.querySelectorAll('[data-save-identity]').forEach((button) => button.addEventListener('click', () => {
        const name = document.querySelector('[data-identity-input]').value.trim();
        if (name !== 'Router') return message('Sebaiknya Identity tetap “Router”, supaya perangkat mudah dikenali saat konfigurasi jaringan.', 'error');
        state.identity = name; syncChapterOne(); persist(); render();
        message('Identity Router tersimpan. Kamu tetap bisa membuka System → Identity kapan saja.', 'success');
        if (button.textContent === 'OK') closeWindow('identity');
    }));
    document.querySelectorAll('[data-edit-interface]').forEach((button) => button.addEventListener('click', () => {
        editingInterface = button.dataset.editInterface;
        document.querySelector('[data-edit-title]').textContent = `Interface <${state.interfaces[editingInterface]}>`;
        document.querySelector('[data-interface-input]').value = state.interfaces[editingInterface];
        openWindow('edit');
    }));
    document.querySelectorAll('[data-save-interface]').forEach((button) => button.addEventListener('click', () => {
        if (!editingInterface) return;
        const expected = { ether1: 'ether1-internet', ether2: 'ether2-vlan', ether3: 'ether3-local' }[editingInterface];
        const typed = document.querySelector('[data-interface-input]').value.trim();
        if (typed !== expected) return message(`Sebaiknya namanya ${expected}. Nama sesuai fungsi memudahkan konfigurasi dan pemeriksaan jaringan.`, 'error');
        state.interfaces[editingInterface] = typed; syncChapterOne(); persist(); render();
        message(`${expected} tersimpan dan tetap tersedia di Interfaces.`, 'success');
        if (button.textContent === 'OK') closeWindow('edit');
    }));

    document.querySelectorAll('[data-vlan-row]').forEach((row) => {
        const selectVlan = () => {
            if (!state.vlan[row.dataset.vlanRow]) return;
            selectedVlan = row.dataset.vlanRow;
            renderVlanSelection();
        };
        row.addEventListener('click', selectVlan);
        row.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectVlan();
        });
    });
    document.querySelector('[data-vlan-tool="remove"]').addEventListener('click', () => {
        if (!selectedVlan || !state.vlan[selectedVlan]) return;
        const group = selectedVlan;
        const name = group === 'student' ? 'vlan1-siswa' : 'vlan2-guru';
        const hadDependentSettings = Boolean(state.addresses[group] || state.pools[group] || state.clients[group]);
        state.vlan[group] = false;
        state.addresses[group] = false;
        delete state.addressDisabled[group];
        delete state.addressComments[group];
        state.pools[group] = '';
        delete state.dhcpSettings[group];
        delete state.dhcpDisabled[group];
        state.clients[group] = false;
        selectedVlan = null;
        if (editingVlan === group) { editingVlan = null; closeWindow('vlan-edit'); }
        persist();
        render();
        message(name + ' dihapus.' + (hadDependentSettings ? ' IP gateway dan DHCP untuk VLAN ini perlu disiapkan ulang.' : ' Klik + untuk membuatnya kembali.'), 'success');
    });

    document.querySelectorAll('[data-new-vlan]').forEach((button) => button.addEventListener('click', () => {
        editingVlan = button.dataset.newVlan === 'auto'
            ? (state.vlan.student ? 'teacher' : 'student')
            : button.dataset.newVlan;
        if (state.vlan[editingVlan]) return;
        const nameInput = document.querySelector('[data-vlan-name]');
        nameInput.value = 'vlan1';
        document.querySelector('[data-vlan-id]').value = '1';
        document.querySelector('[data-vlan-parent]').value = '';
        openWindow('vlan-edit');
        nameInput.focus({ preventScroll: true });
        nameInput.select();
    }));
    document.querySelectorAll('[data-save-vlan]').forEach((button) => button.addEventListener('click', () => {
        if (!editingVlan) return;
        const expectedName = editingVlan === 'student' ? 'vlan1-siswa' : 'vlan2-guru';
        const expectedId = editingVlan === 'student' ? '10' : '20';
        if (normal(document.querySelector('[data-vlan-name]').value) !== expectedName || document.querySelector('[data-vlan-id]').value !== expectedId || document.querySelector('[data-vlan-parent]').value !== 'ether2-vlan') {
            return message(`Periksa VLAN ${editingVlan === 'student' ? 'siswa' : 'guru'}: Name ${expectedName}, ID ${expectedId}, dan Interface ether2-vlan.`, 'error');
        }
        state.vlan[editingVlan] = true; persist(); render();
        message(completeVlan() ? 'Kedua VLAN berhasil. Klik tombol instruksi Pak Amat untuk lanjut ke DHCP Client.' : 'VLAN pertama tersimpan. Tambahkan satu VLAN lagi di daftar.', 'success');
        if (button.textContent === 'OK') closeWindow('vlan-edit');
    }));
    document.querySelectorAll('[data-save-wan]').forEach((button) => button.addEventListener('click', () => {
        if (document.querySelector('[data-wan-interface]').value !== 'ether1-internet') return message('Pilih ether1-internet, karena port itu mengarah ke ISP. DHCP Client tidak dipasang pada VLAN siswa atau guru.', 'error');
        state.wan = true; persist(); render();
        message('DHCP Client bound pada ether1-internet. Lanjutkan ke IP gateway melalui arahan Pak Amat.', 'success');
        if (button.textContent === 'OK') closeWindow('wan');
    }));

    const addresses = {
        'ether3-local': ['local', '192.168.100.1/24'],
        'vlan1-siswa': ['student', '192.168.40.1/24'],
        'vlan2-guru': ['teacher', '192.168.60.1/24'],
        wlan1: ['wireless', '192.168.20.1/24'],
    };
    const addressInterfaces = { local: 'ether3-local', student: 'vlan1-siswa', teacher: 'vlan2-guru', wireless: 'wlan1' };
    const renderAddressRows = () => {
        const search = document.querySelector('[data-address-find]').value.trim().toLowerCase();
        let rowNumber = 0;
        document.querySelectorAll('[data-address-row]').forEach((row) => {
            const group = row.dataset.addressRow;
            const iface = addressInterfaces[group];
            const address = addresses[iface][1];
            const comment = state.addressComments[group] || '';
            row.hidden = !state.addresses[group] || ![address, iface, comment].some((value) => value.toLowerCase().includes(search));
            row.classList.toggle('is-disabled', Boolean(state.addressDisabled[group]));
            row.querySelector('span').textContent = row.hidden ? '' : String(rowNumber++);
            row.querySelector('strong').textContent = (state.addressDisabled[group] ? 'X ' : '') + address;
            row.title = comment;
            let note = row.querySelector('[data-address-row-comment]');
            if (comment && !note) {
                note = document.createElement('small');
                note.dataset.addressRowComment = '';
                row.append(note);
            }
            if (note) { note.textContent = ';;; ' + comment; note.hidden = !comment; }
        });
        const total = Object.values(state.addresses).filter(Boolean).length;
        document.querySelector('[data-address-count]').textContent = search ? rowNumber + ' of ' + total + ' items' : total + ' items';
    };
    const syncAddressEditor = () => {
        document.querySelector('[data-address-editor-tool="disable"]').textContent = draftAddressDisabled ? 'Enable' : 'Disable';
        document.querySelector('[data-address-edit-status]').textContent = draftAddressDisabled ? 'disabled' : 'enabled';
        document.querySelector('[data-address-editor-tool="remove"]').disabled = !editingAddress;
        document.querySelector('[data-address-editor-tool="comment"]').disabled = !editingAddress;
    };
    const removeSelectedAddress = () => {
        if (!selectedAddress || !state.addresses[selectedAddress]) return;
        const group = selectedAddress;
        state.addresses[group] = false;
        delete state.addressDisabled[group];
        delete state.addressComments[group];
        if (editingAddress === group) { editingAddress = null; closeWindow('address-edit'); }
        if (commentAddress === group) { commentAddress = null; closeWindow('address-comment'); }
        selectedAddress = null;
        persist(); render();
        message('IP address dihapus. Target gateway ini kembali belum selesai.', 'success');
    };
    const openAddressEditor = (group = null) => {
        if (group && !state.addresses[group]) return;
        editingAddress = group;
        draftAddressDisabled = Boolean(group && state.addressDisabled[group]);
        const address = group ? addresses[addressInterfaces[group]][1] : '';
        document.querySelector('[data-address-input]').value = address;
        document.querySelector('[data-address-network]').value = group ? address.split('.').slice(0, 3).join('.') + '.0' : '';
        document.querySelector('[data-address-interface]').value = group ? addressInterfaces[group] : '';
        document.querySelector('[data-address-edit-title]').textContent = group ? 'Address <' + address + '>' : 'New Address';
        syncAddressEditor();
        openWindow('address-edit');
        document.querySelector('[data-address-input]').focus({ preventScroll: true });
    };
    const openAddressComment = (group) => {
        if (!group || !state.addresses[group]) return;
        commentAddress = group;
        document.querySelector('[data-address-comment]').value = state.addressComments[group] || '';
        openWindow('address-comment');
        document.querySelector('[data-address-comment]').focus({ preventScroll: true });
    };
    document.querySelectorAll('[data-address-row]').forEach((row) => {
        const selectAddress = () => {
            if (!state.addresses[row.dataset.addressRow]) return;
            selectedAddress = row.dataset.addressRow;
            renderAddressSelection();
        };
        row.addEventListener('click', selectAddress);
        row.addEventListener('dblclick', () => openAddressEditor(row.dataset.addressRow));
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); selectAddress(); openAddressEditor(row.dataset.addressRow);
            } else if (event.key === ' ') {
                event.preventDefault(); selectAddress();
            } else if (event.key === 'Delete' && selectedAddress === row.dataset.addressRow) {
                event.preventDefault(); removeSelectedAddress();
            }
        });
    });
    document.querySelector('[data-remove-address]').addEventListener('click', removeSelectedAddress);
    document.querySelector('[data-address-find]').addEventListener('input', renderAddressRows);
    document.querySelectorAll('[data-address-tool]').forEach((button) => button.addEventListener('click', () => {
        if (!selectedAddress || !state.addresses[selectedAddress]) return;
        if (button.dataset.addressTool === 'comment') return openAddressComment(selectedAddress);
        state.addressDisabled[selectedAddress] = button.dataset.addressTool === 'disable';
        if (editingAddress === selectedAddress) { draftAddressDisabled = state.addressDisabled[selectedAddress]; syncAddressEditor(); }
        persist(); render();
    }));
    document.querySelector('[data-save-address-comment]').addEventListener('click', () => {
        if (!commentAddress || !state.addresses[commentAddress]) return;
        state.addressComments[commentAddress] = document.querySelector('[data-address-comment]').value.trim();
        closeWindow('address-comment');
        persist(); render();
    });
    document.querySelectorAll('[data-address-editor-tool]').forEach((button) => button.addEventListener('click', () => {
        if (button.dataset.addressEditorTool === 'disable') {
            draftAddressDisabled = !draftAddressDisabled; syncAddressEditor();
        } else if (button.dataset.addressEditorTool === 'copy') {
            editingAddress = null; document.querySelector('[data-address-edit-title]').textContent = 'New Address'; syncAddressEditor();
        } else if (button.dataset.addressEditorTool === 'comment') {
            openAddressComment(editingAddress);
        } else if (button.dataset.addressEditorTool === 'remove' && editingAddress) {
            selectedAddress = editingAddress; removeSelectedAddress();
        }
    }));
    const updateAddressNetwork = () => {
        const entered = normal(document.querySelector('[data-address-input]').value);
        const match = entered.match(/^(192\.168\.\d{1,3})\.\d{1,3}\/24$/);
        document.querySelector('[data-address-network]').value = match ? match[1] + '.0' : '';
    };
    document.querySelector('[data-address-input]').addEventListener('input', updateAddressNetwork);
    windows.get('address-edit').addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeWindow('address-edit'); }
        else if (event.key === 'Enter' && event.target.matches('input')) {
            event.preventDefault(); event.stopPropagation(); document.querySelector('[data-save-address="ok"]').click();
        }
    });
    document.querySelector('[data-new-address]').addEventListener('click', () => openAddressEditor());
    document.querySelectorAll('[data-save-address]').forEach((button) => button.addEventListener('click', () => {
        const iface = document.querySelector('[data-address-interface]').value;
        const expected = addresses[iface];
        const entered = normal(document.querySelector('[data-address-input]').value);
        if (!expected || entered !== expected[1]) {
            const intended = Object.entries(addresses).find(([, target]) => target[1] === entered);
            const destinations = {
                local: 'jaringan PC lokal melalui port ether3',
                student: 'jaringan siswa, yaitu VLAN 10 melalui port ether2',
                teacher: 'jaringan guru, yaitu VLAN 20 melalui port ether2',
                wireless: 'jaringan Wi-Fi',
            };
            let explanation;
            let focusSelector = '[data-address-input]';
            if (intended) {
                const [correctInterface, target] = intended;
                explanation = (iface ? 'Interface ' + iface + ' belum tepat.' : 'Kamu belum memilih interface.')
                    + ' IP ' + entered + ' adalah gateway untuk ' + destinations[target[0]]
                    + '. Pilih ' + correctInterface + ' pada kolom Interface, lalu simpan kembali.';
                focusSelector = '[data-address-interface]';
            } else if (expected) {
                explanation = 'IP ' + (entered || 'yang masih kosong') + ' belum sesuai untuk ' + iface
                    + '. Pada skenario ini, gunakan ' + expected[1] + ' untuk ' + destinations[expected[0]]
                    + '. Periksa kembali kolom Address, termasuk akhiran /24.';
            } else {
                explanation = 'Alamat IP dan interfacenya belum cocok dengan tugas kita. Lihat target IP gateway di sebelah kanan: ketik alamat lengkap dengan /24, lalu pilih interface yang tertulis pada target tersebut.';
            }
            openDialogue([explanation], () => document.querySelector(focusSelector).focus({ preventScroll: true }));
            return;
        }
        const expectedNetwork = expected[1].split('.').slice(0, 3).join('.') + '.0';
        const enteredNetwork = document.querySelector('[data-address-network]').value.trim();
        if (enteredNetwork && enteredNetwork !== expectedNetwork) return message('Network belum sesuai dengan alamat /24. Kosongkan agar dihitung otomatis.', 'error');
        if (state.addresses[expected[0]] && editingAddress !== expected[0]) return message('failure: already have such address', 'error');
        if (editingAddress && editingAddress !== expected[0]) {
            state.addresses[editingAddress] = false;
            state.addressComments[expected[0]] = state.addressComments[editingAddress] || '';
            delete state.addressComments[editingAddress];
            delete state.addressDisabled[editingAddress];
        }
        editingAddress = expected[0];
        selectedAddress = editingAddress;
        state.addresses[editingAddress] = true;
        state.addressDisabled[editingAddress] = draftAddressDisabled;
        document.querySelector('[data-address-network]').value = expectedNetwork;
        document.querySelector('[data-address-edit-title]').textContent = 'Address <' + expected[1] + '>';
        syncAddressEditor();
        if (button.dataset.saveAddress === 'ok') closeWindow('address-edit');
        persist(); render();
        message(completeAddresses() ? 'Empat gateway aktif dan benar. Selanjutnya konfigurasi DHCP Server.' : iface + ' tersimpan. Klik + untuk menambahkan alamat berikutnya.', 'success');
    }));
    const validPool = (value, subnet) => {
        const match = normal(value).match(/^192\.168\.(\d{1,3})\.(\d{1,3})-192\.168\.(\d{1,3})\.(\d{1,3})$/);
        if (!match) return false;
        const firstSubnet = Number(match[1]); const firstHost = Number(match[2]); const lastSubnet = Number(match[3]); const lastHost = Number(match[4]);
        return firstSubnet === subnet && lastSubnet === subnet && firstHost >= 2 && lastHost <= 254 && lastHost > firstHost;
    };
    const dhcpGroup = () => ({ 'vlan1-siswa': 'student', 'vlan2-guru': 'teacher' })[document.querySelector('[data-pool-interface]').value] || null;
    const renderDhcpList = () => {
        const search = document.querySelector('[data-dhcp-find]').value.trim().toLowerCase();
        if (selectedDhcp && !state.pools[selectedDhcp]) selectedDhcp = null;
        let visibleCount = 0;
        ['student', 'teacher'].forEach((group, index) => {
            const row = document.querySelector('[data-pool-row="' + group + '"]');
            const exists = Boolean(state.pools[group]);
            const selected = exists && selectedDhcp === group;
            row.hidden = !exists || !('dhcp' + (index + 1) + ' ' + addressInterfaces[group] + ' ' + state.pools[group]).toLowerCase().includes(search);
            row.classList.toggle('is-selected', selected);
            row.classList.toggle('is-disabled', Boolean(state.dhcpDisabled[group]));
            row.setAttribute('aria-pressed', String(selected));
            row.querySelector('span').textContent = row.hidden ? '' : (state.dhcpDisabled[group] ? 'X ' : '') + visibleCount++;
            document.querySelector('[data-pool-display="' + group + '"]').textContent = 'dhcp_pool' + index;
            document.querySelector('[data-pool-display="' + group + '"]').title = state.pools[group];
            document.querySelector('[data-dhcp-lease-display="' + group + '"]').textContent = state.dhcpSettings[group]?.lease || '10m';
            document.querySelector('[data-dhcp-network-row="' + group + '"]').hidden = !exists;
            document.querySelector('[data-dhcp-dns-display="' + group + '"]').textContent = state.dhcpSettings[group]?.dns || '';
        });
        document.querySelector('[data-dhcp-remove]').disabled = !selectedDhcp;
        document.querySelectorAll('[data-dhcp-tool]').forEach((button) => {
            button.disabled = !selectedDhcp || (button.dataset.dhcpTool === 'enable' ? !state.dhcpDisabled[selectedDhcp] : Boolean(state.dhcpDisabled[selectedDhcp]));
        });
        const total = Number(Boolean(state.pools.student)) + Number(Boolean(state.pools.teacher));
        document.querySelector('[data-pool-count]').textContent = search ? visibleCount + ' of ' + total + ' items' : total + ' items';
    };
    const paintDhcpStep = () => {
        document.querySelectorAll('[data-dhcp-step-panel]').forEach((panel) => { panel.hidden = Number(panel.dataset.dhcpStepPanel) !== dhcpStep; });
        document.querySelector('[data-dhcp-back]').disabled = dhcpStep === 0 || dhcpStep === 6;
        document.querySelector('[data-dhcp-next]').textContent = dhcpStep === 6 ? 'OK' : 'Next';
        document.querySelector('[data-dhcp-cancel]').hidden = dhcpStep === 6;
        renderDhcpGuide(true);
        const panel = document.querySelector('[data-dhcp-step-panel="' + dhcpStep + '"]');
        (panel.querySelector('input,select') || document.querySelector('[data-dhcp-next]')).focus({ preventScroll: true });
    };
    const explainDhcpError = (text, selector) => {
        openDialogue([text], () => document.querySelector(selector).focus({ preventScroll: true }));
        return false;
    };
    const validateDhcpStep = () => {
        const group = dhcpGroup();
        const iface = document.querySelector('[data-pool-interface]').value;
        const prefix = group === 'student' ? 40 : 60;
        const audience = group === 'student' ? 'siswa' : 'guru';
        if (dhcpStep === 0) {
            if (!group) return explainDhcpError((iface ? 'Interface ' + iface + ' belum tepat untuk tugas ini.' : 'Pilih interface terlebih dahulu.') + ' DHCP siswa harus dibuat pada vlan1-siswa, sedangkan DHCP guru pada vlan2-guru. Keduanya melewati port ether2, tetapi server dipasang pada interface VLAN masing-masing.', '[data-pool-interface]');
            if (!state.vlan[group] || !state.addresses[group] || state.addressDisabled[group]) return explainDhcpError('Gateway VLAN ' + audience + ' belum siap. Aktifkan ' + iface + ' dan pasang IP 192.168.' + prefix + '.1/24 melalui IP → Addresses sebelum menjalankan DHCP Setup.', '[data-pool-interface]');
            if (state.pools[group]) return explainDhcpError('DHCP Server pada ' + iface + ' sudah ada. Pilih VLAN yang belum selesai, atau hapus server yang lama sebelum membuat ulang.', '[data-pool-interface]');
        } else if (dhcpStep === 1 && normal(document.querySelector('[data-dhcp-space]').value) !== '192.168.' + prefix + '.0/24') {
            return explainDhcpError('Subnet ini belum sesuai dengan VLAN ' + audience + '. DHCP Address Space untuk ' + iface + ' adalah 192.168.' + prefix + '.0/24. Ini alamat jaringan, bukan alamat gateway .1.', '[data-dhcp-space]');
        } else if (dhcpStep === 2 && normal(document.querySelector('[data-dhcp-gateway]').value) !== '192.168.' + prefix + '.1') {
            return explainDhcpError('Gateway untuk VLAN ' + audience + ' harus 192.168.' + prefix + '.1, sesuai IP pada ' + iface + '. Klien akan memakai alamat ini sebagai pintu keluar jaringannya.', '[data-dhcp-gateway]');
        } else if (dhcpStep === 3 && !validPool(document.querySelector('[data-pool-range]').value, prefix)) {
            return explainDhcpError('Rentang IP belum cocok untuk VLAN ' + audience + '. Gunakan alamat dalam subnet 192.168.' + prefix + '.0/24, misalnya 192.168.' + prefix + '.10-192.168.' + prefix + '.50. Jangan masukkan gateway .1, alamat jaringan .0, atau broadcast .255.', '[data-pool-range]');
        } else if (dhcpStep === 4) {
            const dns = document.querySelector('[data-dhcp-dns]').value.trim();
            if (dns && !dns.split(',').every((value) => /^(\d{1,3}\.){3}\d{1,3}$/.test(value.trim()) && value.trim().split('.').every((part) => Number(part) <= 255))) return explainDhcpError('DNS Servers harus berupa alamat IP yang valid. Pisahkan beberapa server dengan koma. Jika DNS belum ditentukan pada tahap ini, kolom ini boleh dikosongkan.', '[data-dhcp-dns]');
        } else if (dhcpStep === 5) {
            const lease = document.querySelector('[data-dhcp-lease]').value.trim();
            if (!/^(?:\d+[wdhms])+$|^\d{1,3}:[0-5]\d:[0-5]\d$/.test(lease) || !/[1-9]/.test(lease)) return explainDhcpError('Lease Time menentukan lama peminjaman alamat. Gunakan durasi yang valid, misalnya 10m atau 00:10:00.', '[data-dhcp-lease]');
        }
        return true;
    };
    document.querySelector('[data-pool-interface]').addEventListener('change', () => renderDhcpGuide());
    document.querySelector('[data-start-dhcp]').addEventListener('click', () => {
        dhcpStep = 0; dhcpSetupGroup = null;
        document.querySelector('[data-pool-interface]').value = '';
        ['[data-dhcp-space]', '[data-dhcp-gateway]', '[data-pool-range]', '[data-dhcp-dns]', '[data-dhcp-lease]'].forEach((selector) => { document.querySelector(selector).value = ''; });
        openWindow('dhcp-setup'); paintDhcpStep();
    });
    document.querySelector('[data-dhcp-back]').addEventListener('click', () => {
        if (dhcpStep > 0 && dhcpStep < 6) { dhcpStep--; paintDhcpStep(); }
    });
    document.querySelector('[data-dhcp-next]').addEventListener('click', () => {
        if (dhcpStep === 6) {
            closeWindow('dhcp-setup');
            render();
            return;
        }
        if (!validateDhcpStep()) return;
        const group = dhcpGroup();
        if (dhcpStep === 0 && dhcpSetupGroup !== group) {
            const prefix = group === 'student' ? 40 : 60;
            document.querySelector('[data-dhcp-space]').value = '192.168.' + prefix + '.0/24';
            document.querySelector('[data-dhcp-gateway]').value = '192.168.' + prefix + '.1';
            document.querySelector('[data-pool-range]').value = '192.168.' + prefix + '.2-192.168.' + prefix + '.254';
            document.querySelector('[data-dhcp-dns]').value = '';
            document.querySelector('[data-dhcp-lease]').value = '10m';
            dhcpSetupGroup = group;
        }
        if (dhcpStep === 5) {
            if (!state.vlan[group] || !state.addresses[group] || state.addressDisabled[group] || state.pools[group]) {
                dhcpStep = 0; paintDhcpStep(); validateDhcpStep(); return;
            }
            state.pools[group] = normal(document.querySelector('[data-pool-range]').value);
            state.dhcpDisabled[group] = false;
            state.dhcpSettings[group] = {
                network: normal(document.querySelector('[data-dhcp-space]').value),
                gateway: normal(document.querySelector('[data-dhcp-gateway]').value),
                dns: document.querySelector('[data-dhcp-dns]').value.trim(),
                lease: document.querySelector('[data-dhcp-lease]').value.trim(),
            };
            selectedDhcp = group;
            persist(); renderTask(); renderLists();
            message('DHCP Setup ' + addressInterfaces[group] + ' selesai.', 'success');
        }
        dhcpStep++; paintDhcpStep();
    });
    document.querySelectorAll('[data-pool-row]').forEach((row) => {
        const select = () => { if (state.pools[row.dataset.poolRow]) { selectedDhcp = row.dataset.poolRow; renderDhcpList(); } };
        row.addEventListener('click', select);
        row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
    });
    document.querySelector('[data-dhcp-remove]').addEventListener('click', () => {
        if (!selectedDhcp || !state.pools[selectedDhcp]) return;
        state.pools[selectedDhcp] = ''; state.clients[selectedDhcp] = false;
        delete state.dhcpSettings[selectedDhcp]; delete state.dhcpDisabled[selectedDhcp];
        selectedDhcp = null; persist(); render();
        message('DHCP Server dihapus. Target ini perlu disiapkan ulang.', 'success');
    });
    document.querySelectorAll('[data-dhcp-tool]').forEach((button) => button.addEventListener('click', () => {
        if (!selectedDhcp || !state.pools[selectedDhcp]) return;
        state.dhcpDisabled[selectedDhcp] = button.dataset.dhcpTool === 'disable';
        if (state.dhcpDisabled[selectedDhcp]) state.clients[selectedDhcp] = false;
        persist(); render();
    }));
    document.querySelector('[data-dhcp-find]').addEventListener('input', renderDhcpList);
    windows.get('dhcp-setup').addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeWindow('dhcp-setup'); }
        else if (event.key === 'Enter' && event.target.matches('input,select')) {
            event.preventDefault(); event.stopPropagation(); document.querySelector('[data-dhcp-next]').click();
        }
    });
    document.querySelectorAll('[data-dhcp-tab]').forEach((button) => button.addEventListener('click', () => {
        const networks = button.dataset.dhcpTab === 'networks';
        document.querySelector('[data-dhcp-list]').hidden = networks;
        document.querySelector('[data-dhcp-networks]').hidden = !networks;
        document.querySelectorAll('[data-dhcp-tab]').forEach((tab) => tab.classList.toggle('is-active', tab === button));
    }));
    document.querySelectorAll('[data-request-ip]').forEach((button) => button.addEventListener('click', () => {
        const group = button.dataset.requestIp;
        if (requestingClients.has(group)) return;
        if (!clientNetworkReady(group)) {
            openDialogue(['PC ' + (group === 'student' ? 'siswa' : 'guru') + ' belum bisa memperoleh IP. Pastikan VLAN, IP gateway, dan DHCP Server untuk segmen ini sudah dibuat serta aktif. Periksa tahap sebelumnya, lalu uji lagi.']);
            return;
        }
        openWindow('clients');
        requestingClients.add(group); renderLeaseState();
        window.setTimeout(() => {
            requestingClients.delete(group);
            if (!clientNetworkReady(group)) {
                state.clients[group] = false;
                persist(); render();
                openDialogue(['Permintaan IP gagal karena konfigurasi VLAN, gateway, atau DHCP Server berubah saat PC menunggu. Periksa kembali konfigurasinya, lalu klik Minta IP sekali lagi.']);
                return;
            }
            state.clientLeases[group] = {
                address: state.pools[group].split('-')[0],
                gateway: '192.168.' + (group === 'student' ? 40 : 60) + '.1',
                server: group === 'student' ? 'dhcp1' : 'dhcp2',
                lease: state.dhcpSettings[group]?.lease || '10m',
            };
            state.clients[group] = true;
            if (!clientLeaseIsValid(group)) {
                state.clients[group] = false; persist(); render();
                openDialogue(['IP yang diterima belum sesuai dengan VLAN PC ini. Periksa rentang pool, gateway, dan interface DHCP Server sebelum menguji ulang.']);
                return;
            }
            persist(); render();
            message(completeClients() ? 'Kedua PC terverifikasi: IP berada dalam pool yang benar, gateway sesuai, dan status bound.' : 'PC ' + (group === 'student' ? 'siswa' : 'guru') + ' berhasil. Lihat baris Host Name dan Status bound di tabel Leases, lalu uji PC berikutnya.', 'success');
        }, 650);
    }));
    document.querySelectorAll('[data-lease-row]').forEach((row) => {
        const select = () => { if (state.clients[row.dataset.leaseRow]) { selectedLease = row.dataset.leaseRow; renderLeaseState(); } };
        row.addEventListener('click', select);
        row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
    });
    document.querySelector('[data-remove-lease]').addEventListener('click', () => {
        if (!selectedLease || !state.clients[selectedLease]) return;
        state.clients[selectedLease] = false;
        delete state.clientLeases[selectedLease]; delete state.clientStatic[selectedLease];
        selectedLease = null; persist(); render();
        message('Lease dihapus. Klik Minta IP pada PC yang bersangkutan untuk menguji ulang.', 'success');
    });
    document.querySelector('[data-make-lease-static]').addEventListener('click', () => {
        if (!selectedLease || !state.clients[selectedLease]) return;
        state.clientStatic[selectedLease] = true; persist(); renderLeaseState();
    });
    document.querySelector('[data-lease-find]').addEventListener('input', renderLeaseState);
    document.querySelectorAll('[data-dhcp-tab-link]').forEach((button) => button.addEventListener('click', () => {
        document.querySelector('[data-dhcp-tab="' + button.dataset.dhcpTabLink + '"]').click();
    }));

    document.querySelector('[data-close-learning]').addEventListener('click', () => learningDialog.close());
    document.querySelector('[data-learning-continue]').addEventListener('click', () => {
        learningDialog.close();
        if (!pendingStage) return;
        setStage(pendingStage);
        pendingStage = null;
    });
    document.querySelector('[data-close-quiz]').addEventListener('click', () => quizDialog.close());
    document.querySelector('[data-close-finish]').addEventListener('click', () => finishDialog.close());
    document.querySelector('[data-quiz-form]').addEventListener('submit', async (event) => {
        event.preventDefault();
        const selections = [1, 2, 3, 4, 5].map((number) => document.querySelector(`input[name="answer-${number}"]:checked`));
        if (selections.some((selection) => !selection)) return evaluation.showError('Jawab kelima soal dahulu.');
        const submit = document.querySelector('[data-submit-quiz]');
        evaluation.clear();
        submit.disabled = true;
        try {
            const response = await fetch(scene.dataset.completeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, body: JSON.stringify({ answers: selections.map((item) => Number(item.value)) }) });
            const result = await response.json();
            const summary = evaluation.showResult(result);
            if (summary) { state.evaluationResult = summary; persist(); }
            if (!response.ok) {
                if (!summary) evaluation.showError(result.message || 'Hasil belum dapat disimpan. Coba lagi.');
                quizDialog.scrollTo({ top: 0, behavior: 'auto' });
                return;
            }
            scene.dataset.completed = 'true'; quizDialog.close(); setStage('finish'); finishDialog.showModal();
            message('Hebat! Chapter 2 selesai dan progres tersimpan di akun.', 'success');
        } catch { evaluation.showError('Hasil belum tersimpan. Periksa koneksi lalu coba lagi.'); }
        finally { submit.disabled = false; }
    });

    document.querySelector('[data-quiz-form]').addEventListener('change', () => { evaluation.clear(); state.evaluationResult = null; persist(); });
    evaluation.showResult(state.evaluationResult || (completionOnServer ? { correctAnswers: 5, totalQuestions: 5 } : null));
    restoreDrafts(); render();
    if (state.stage === 'intro' && !state.prologueComplete && state.highest === 0) {
        startChapterPrologue();
    } else {
        chapterPrologue.hidden = true;
        scene.classList.remove('is-prologue');
        if (state.stage === 'intro') {
            openDialogue(chapterOpeningDialogue, mainAction);
        } else if (!isCurrentTaskDone()) {
            const [, title, text] = stageInformation[state.stage];
            openDialogue([title + ' ' + text], mainAction);
        }
    }
    if (state.stage === 'finish' && completionOnServer) message('Chapter 2 sudah selesai. Kamu tetap bisa meninjau WinBox dan menu konfigurasinya.', 'success');
})();
