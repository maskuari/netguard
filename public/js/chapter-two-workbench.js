(() => {
    'use strict';

    const scene = document.querySelector('.ch2-scene');
    if (!scene) return;

    const navbar = window.NetGuardChapterNavbar;
    const updateBackAvailability = () => navbar.setBackEnabled(chapterPrologue.hidden || prologueIndex > 0);

    const stages = ['intro', 'vlan', 'wan', 'addresses', 'dhcp', 'quiz', 'finish'];
    const dhcpGroups = ['local', 'student', 'teacher', 'wireless'];
    const dhcpPrefixes = { local: 100, student: 40, teacher: 60, wireless: 20 };
    const dhcpNames = { local: 'PC lokal', student: 'siswa', teacher: 'guru', wireless: 'Wi-Fi' };
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
    const persistedFields = [...document.querySelectorAll('.ch2-window input:not([data-wan-field]):not([readonly]):not([data-address-network]):not([data-address-find]):not([data-dhcp-field]):not([data-dhcp-find]):not([data-lease-find]), .ch2-window select:not([data-wan-field])')];
    let topLayer = 10;
    let editingVlan = null;
    let selectedVlan = null;
    let selectedWan = false;
    let wanDraftDisabled = false;
    let wanCopyDraft = false;
    let wanBindingRevision = 0;
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
    let wanCompletionTimer = null;
    let progressiveGuide = null;

    const readStorage = (key) => {
        try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; }
    };
    const chapterOne = readStorage(chapterOneKey) || {};
    const saved = readStorage(storageKey);
    const legacy = !saved ? readStorage(oldStorageKey) : null;
    const defaults = {
        stage: completionOnServer ? 'finish' : 'intro', highest: completionOnServer ? 7 : 0,
        prologueIndex: 0, prologueComplete: false,
        identity: chapterOne.identityInput || (chapterOne.identitySaved ? 'Router' : 'MikroTik'),
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
        pools: { local: '', student: '', teacher: '', wireless: '' }, clients: { student: false, teacher: false },
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
    if (state.stage === 'verify' || (!completionOnServer && ['quiz', 'finish'].includes(state.stage) && dhcpGroups.some((group) => !state.pools[group] || state.dhcpDisabled[group]))) state.stage = 'dhcp';
    if (!stages.includes(state.stage)) state.stage = 'intro';
    state.highest = Math.max(stages.indexOf(state.stage), Math.min(7, Math.max(0, Number(state.highest) || 0)));

    state.wanClient = saved?.wanClient || (state.wan ? { peerDns: true, peerNtp: true, defaultRoute: 'yes', distance: 1, options: 'hostname,clientid', disabled: false, bound: true, comment: '' } : null);
    state.wan = Boolean(state.wanClient?.bound && !state.wanClient.disabled && state.wanClient.defaultRoute !== 'no');
    const message = (text, kind = 'info') => {
        feedback.forEach((node) => { node.textContent = text; node.dataset.kind = kind; });
        if (kind === 'error' || kind === 'success') window.NetGuardAudio?.play(kind === 'error' ? 'error' : 'correct');
        if (kind === 'error') openDialogue([text]);
    };
    const finishDialogueTyping = () => {
        if (dialogueTypingTimer !== null) window.clearInterval(dialogueTypingTimer);
        dialogueTypingTimer = null;
        isDialogueTyping = false;
        dialogueText.classList.remove('is-typing');
        dialogueText.textContent = dialogueLines[dialogueIndex];
    };
    const paintDialogueLine = () => {
        updateBackAvailability();
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
        updateBackAvailability();
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

    const normal = (value) => value.trim().toLowerCase().replaceAll(' ', '');
    const completeVlan = () => state.vlan.student && state.vlan.teacher;
    const completeAddresses = () => Object.entries(state.addresses).every(([group, exists]) => exists && !state.addressDisabled[group]);
    const completePools = () => dhcpGroups.every((group) => Boolean(state.pools[group] && !state.dhcpDisabled[group]));
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
    const progressCount = () => [completeVlan(), state.wan, completeAddresses(), completePools()].filter(Boolean).length;
    const isCurrentTaskDone = () => ({ vlan: completeVlan(), wan: state.wan, addresses: completeAddresses(), dhcp: completePools() })[state.stage] || false;

    const stageInformation = {
        intro: ['LANJUTAN CHAPTER 01 · PAK AMAT', 'Router sudah siap. Sekarang kita buat VLAN.', 'Sesi WinBox dari Chapter 1 masih terbuka. Pelajari dahulu apa itu VLAN sebelum menambahkannya pada router.', 'Pelajari VLAN →'],
        vlan: ['MISI 01 / 04 · INTERFACES → VLAN', 'Buat VLAN siswa dan guru', 'Di Interfaces → VLAN, buat vlan1-siswa ID 10 dan vlan2-guru ID 20. Keduanya menggunakan ether2-vlan sebagai interface induk.', 'Buka Interfaces → VLAN'],
        wan: ['MISI 02 / 04 · IP → DHCP CLIENT', 'Tambahkan DHCP Client pada jalur internet', 'Buka IP → DHCP Client, klik +, pilih ether1-internet, lalu klik OK. Router akan meminta konfigurasi IP dari penyedia internet secara otomatis.', 'Buka DHCP Client'],
        addresses: ['MISI 03 / 04 · IP → ADDRESSES', 'Pasangkan IP gateway pada interface', 'Tambahkan empat alamat gateway sesuai petunjuk di panel kanan. Cocokkan alamat IP dengan interface tujuannya.', 'Buka IP → Addresses'],
        dhcp: ['MISI 04 / 04 · IP → DHCP SERVER', 'Siapkan DHCP untuk empat interface', 'Jalankan DHCP Setup untuk ether3-local, vlan1-siswa, vlan2-guru, dan wlan1. Ikuti petunjuk pengisian tiap layar.', 'Buka DHCP Server'],
        quiz: ['EVALUASI CHAPTER 02', 'Konfigurasi sudah selesai. Uji pemahamanmu.', 'Kamu sudah menyiapkan VLAN, IP gateway, DHCP Client, dan DHCP Server. Jawab lima soal untuk menyimpan hasil Chapter 2 ke akun.', 'Buka evaluasi →'],
        finish: ['CHAPTER 02 SELESAI', 'Bagus! Jaringan sekolah sudah terbagi rapi.', 'Hasil evaluasi tersimpan di akun. Seluruh menu WinBox yang sudah dibuka tetap bisa kamu periksa kembali.', 'Lihat apresiasi →'],
    };
    const guideInformation = {
        intro: ['Dengarkan arahan Pak Amat.', 'Pelajari pengertian dan topologi VLAN.', 'Klik lanjut untuk mulai praktik di WinBox.'],
        vlan: ['Klik Interfaces di menu kiri, lalu pilih tab VLAN.', 'Klik +, isi Name, VLAN ID, dan Interface sesuai target di bawah, lalu klik OK. Ulangi untuk VLAN kedua.', 'Untuk menghapus, klik baris VLAN pada tabel, lalu klik tombol −.'],
        wan: ['Klik IP pada menu kiri WinBox, lalu pilih DHCP Client. Pada jendela yang terbuka, klik tombol + di atas tabel.', 'Di jendela New DHCP Client, pilih Interface: ether1-internet. Biarkan pilihan lainnya tetap bawaan: Use Peer DNS dan Use Peer NTP tercentang, Add Default Route: yes.', 'Klik OK untuk menyimpan. Router meminta alamat IP secara otomatis; target akan hijau setelah konfigurasi berhasil.', 'Kolom Status pada tabel menunjukkan hasil permintaan IP. bound berarti konfigurasi diterima. Jika masih searching, klik baris ether1-internet, lalu klik Renew di atas tabel dan tunggu hasilnya.'],
        addresses: [
            'Buka IP → Addresses, lalu klik tombol +. Pada jendela New Address, isi Address dan pilih Interface sesuai target. Klik OK untuk menyimpan, atau Apply agar jendela tetap terbuka.',
            'Untuk siswa dan guru, pilih interface VLAN masing-masing, bukan ether2-vlan. Ulangi sampai keempat target tercentang. Untuk menghapus IP, pilih barisnya lalu klik − merah.',
        ],
        dhcp: ['Jalankan DHCP Setup pada ether3-local, lalu ulangi untuk vlan1-siswa, vlan2-guru, dan wlan1.', 'Ikuti petunjuk pengisian di bawah. Petunjuk berubah sesuai layar DHCP Setup yang sedang terbuka.'],
        quiz: ['Tinjau kembali konfigurasi.', 'Jawab lima soal evaluasi.', 'Kirim jawaban untuk menyimpan hasil.'],
        finish: ['Chapter 02 selesai.', 'Periksa kembali hasil konfigurasi.', 'Lanjutkan petualangan dari peta chapter.'],
    };
    const finishedInformation = {
        vlan: ['VLAN siswa dan guru sudah terpasang.', 'Selanjutnya router perlu menerima alamat dari ISP pada jalur WAN.', 'Pelajari DHCP Client →'],
        wan: ['DHCP Client pada ether1-internet sudah tersimpan.', 'Router sudah menerima konfigurasi IP dari penyedia internet. Berikutnya kita menambahkan IP Address untuk PC lokal, siswa, guru, dan Wi-Fi.', 'Pelajari IP gateway →'],
        addresses: ['Semua gateway sudah tepat.', 'Berikutnya, siapkan DHCP Server agar klien mendapat alamat secara otomatis.', 'Pelajari DHCP Server →'],
        dhcp: ['DHCP Server siap melayani klien.', 'DHCP sudah disiapkan pada empat interface. Pelajari rekap sebelum evaluasi.', 'Pelajari cara menguji →'],
    };
    const unlockStage = { vlan: 'vlan', wan: 'wan', 'wan-edit': 'wan', 'wan-comment': 'wan', addresses: 'addresses', 'address-edit': 'addresses', 'address-comment': 'addresses', dhcp: 'dhcp', 'dhcp-setup': 'dhcp', clients: 'dhcp' };
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
        const prefix = dhcpPrefixes[group];
        const name = dhcpNames[group];
        const iface = addressInterfaces[group];
        const start = '192.168.' + prefix + (group === 'local' ? '.2' : '.10');
        const end = '192.168.' + prefix + (group === 'local' ? '.254' : '.50');
        return [
            { title: 'Pilih interface DHCP ' + name, text: 'Pilih interface ' + iface + ' sesuai segmen ' + name + '. Jangan pilih ether1-internet atau ether2-vlan.', values: [['DHCP Server Interface', iface]], action: 'Setelah memilih interface, klik Next.' },
            { title: 'Isi alamat jaringan ' + name, text: 'DHCP Address Space adalah jaringan tempat komputer ' + name + ' mendapat IP. Periksa kolomnya; ubah jika berbeda dari nilai ini.', values: [['DHCP Address Space', '192.168.' + prefix + '.0/24']], action: 'Pastikan alamat berakhir .0/24, lalu klik Next.' },
            { title: 'Isi gateway ' + name, text: 'Gateway adalah IP router pada segmen ' + name + '. Alamat ini sudah dipasang pada ' + iface + ' di tahap sebelumnya.', values: [['Gateway for DHCP Network', '192.168.' + prefix + '.1']], action: 'Pastikan alamat berakhir .1, lalu klik Next.' },
            { title: 'Isi rentang IP untuk komputer ' + name, text: group === 'local' ? 'Pertahankan rentang bawaan untuk PC lokal.' : 'Di jaringan sekolah ini, kita menyiapkan 41 alamat untuk klien, dari .10 sampai .50. DHCP hanya membagikan alamat dalam rentang tersebut; alamat lainnya tetap di luar pembagian otomatis.', values: [['IP awal', start], ['IP akhir', end], ['Ketik di Addresses to Give Out', start + '-' + end]], action: group === 'local' ? 'Pertahankan rentang bawaan untuk PC lokal, lalu klik Next.' : 'Isi rentang .10 sampai .50. Jangan masukkan gateway .1, lalu klik Next.' },
            { title: 'Pertahankan DNS bawaan', text: 'Pertahankan DNS bawaan pada langkah ini. Tidak ada alamat DNS khusus yang harus diketik.', values: [['DNS Servers', 'Biarkan nilai bawaan yang muncul']], action: 'Tidak perlu mengganti nilainya. Jika kosong, biarkan kosong, lalu klik Next.' },
            { title: 'Isi lama peminjaman IP', text: 'Lease Time menentukan berapa lama komputer boleh memakai alamat IP. Ketik 10m, artinya 10 menit.', values: [['Lease Time', '10m']], action: 'Klik Next. Jika muncul “Setup has completed successfully”, klik OK.' },
            { title: 'DHCP ' + name + ' berhasil dibuat', text: 'Semua langkah untuk segmen ' + name + ' sudah tersimpan. Target di bawah sekarang tercentang hijau.', values: [], action: 'Klik OK, lalu ulangi DHCP Setup untuk interface yang targetnya belum tercentang.' },
        ][step];
    };
    const renderDhcpGuide = () => {
        document.querySelector('[data-dhcp-instruction]').hidden = true;
        progressiveGuide?.refresh();
    };
    const renderDhcpChecklist = () => {
        document.querySelector('[data-dhcp-checklist]').hidden = state.stage !== 'dhcp';
        let completed = 0;
        dhcpGroups.forEach((group, index) => {
            const done = Boolean(state.pools[group] && !state.dhcpDisabled[group]);
            document.querySelector('[data-dhcp-task="' + group + '"]').classList.toggle('is-done', done);
            document.querySelector('[data-dhcp-task-mark="' + group + '"]').textContent = done ? '✓' : String(index + 1);
            document.querySelector('[data-dhcp-task-status="' + group + '"]').textContent = done ? 'Selesai' : state.pools[group] ? 'Server nonaktif' : 'Belum selesai';
            const range = state.pools[group];
            document.querySelector('[data-dhcp-task-range="' + group + '"]').textContent = range ? 'Rentang tersimpan: ' + range : 'Addresses to Give Out: 192.168.' + dhcpPrefixes[group] + (group === 'local' ? '.2-192.168.100.254' : '.10-192.168.' + dhcpPrefixes[group] + '.50');
            if (done) completed++;
        });
        document.querySelector('[data-dhcp-task-count]').textContent = completed + ' / 4 selesai';
    };
    const renderLeaseState = () => {
        const search = document.querySelector('[data-lease-find]').value.trim().toLowerCase();
        let visible = 0;
        ['student', 'teacher'].forEach((group, index) => {
            const valid = clientLeaseIsValid(group);
            const lease = clientLease(group);
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
        });
        if (selectedLease && !state.clients[selectedLease]) selectedLease = null;
        document.querySelector('[data-remove-lease]').disabled = !selectedLease;
        document.querySelector('[data-make-lease-static]').disabled = !selectedLease || Boolean(state.clientStatic[selectedLease]);
        const total = Number(Boolean(state.clients.student)) + Number(Boolean(state.clients.teacher));
        document.querySelector('[data-lease-count]').textContent = search ? visible + ' of ' + total + ' items' : total + ' items';
    };
    const renderTask = () => {
        updateBackAvailability();
        const wanComplete = Boolean(state.wan);
        document.querySelector('[data-wan-checklist]').hidden = state.stage !== 'wan';
        document.querySelector('[data-wan-task]').classList.toggle('is-done', wanComplete);
        document.querySelector('[data-wan-task-mark]').textContent = wanComplete ? '✓' : '1';
        document.querySelector('[data-wan-task-status]').textContent = wanComplete ? 'Selesai · konfigurasi diterima' : 'Belum selesai';
        document.querySelector('[data-wan-task-count]').textContent = (wanComplete ? '1' : '0') + ' / 1 selesai';
        renderLeaseState();
        renderDhcpChecklist();
        renderDhcpGuide();
        renderAddressChecklist();
        const done = isCurrentTaskDone();
        const missionAction = document.querySelector('[data-mission-action]');
        missionAction.hidden = !done && !['intro', 'quiz', 'finish'].includes(state.stage);
        missionAction.textContent = state.stage === 'intro' ? 'Pelajari VLAN →' : state.stage === 'quiz' ? 'Buka evaluasi →' : state.stage === 'finish' ? 'Lihat hasil Chapter 2' : 'Pelajari tahap berikutnya →';
        const result = done ? finishedInformation[state.stage] : null;
        progressiveGuide?.refresh();
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
        document.querySelector('[data-progress-label]').textContent = `${progress} / 4`;
        document.querySelector('[data-progress]').max = 4;
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
        renderWanClient();
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
            if (state.stage === 'wan') {
                const client = state.wanClient;
                wanCompletionTimer = window.setTimeout(() => {
                    wanCompletionTimer = null;
                    if (state.stage !== 'wan' || state.wanClient !== client || !isCurrentTaskDone()) return;
                    if (!dialogue.hidden || learningDialog.open || windows.get('wan').hidden) return;
                    openDialogue([result[0] + ' ' + result[1]], mainAction);
                }, 1500);
            } else {
                openDialogue([result[0] + ' ' + result[1]], mainAction);
            }
        } else if (!isCurrentTaskDone()) {
            if (wanCompletionTimer !== null) { window.clearTimeout(wanCompletionTimer); wanCompletionTimer = null; }
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
    const clearWorkspace = () => {
        windows.forEach((node) => {
            node.hidden = true; node.removeAttribute('data-player-open'); node.classList.remove('is-focused');
        });
        taskbar.replaceChildren();
        closeNavigationMenus();
        document.querySelectorAll('.ch2-nav [data-open-window]').forEach((button) => button.classList.remove('is-active'));
    };
    const openWindow = (name, playerAction = false) => {
        if (!playerAction) return;
        if (name === 'vlan' && windows.get('interfaces').hidden && windows.get('vlan').hidden && !taskbar.querySelector('[data-restore="vlan"]')) {
            return message('Klik Interfaces pada menu kiri terlebih dahulu, lalu pilih tab VLAN.', 'info');
        }
        if (!canOpen(name)) return message('Ikuti dulu langkah Pak Amat untuk membuka menu ini.', 'error');
        const node = windows.get(name);
        if (!node) return;
        closeNavigationMenus();
        if (name === 'vlan') windows.get('interfaces').hidden = true;
        if (name === 'interfaces') windows.get('vlan').hidden = true;
        if (name === 'clients') windows.get('dhcp').hidden = true;
        if (name === 'dhcp') windows.get('clients').hidden = true;
        node.setAttribute('data-player-open', 'true');
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
        button.addEventListener('click', () => openWindow(name, true));
        taskbar.append(button);
    };

    const setStage = (stage, announce = true) => {
        if (!stages.includes(stage)) return;
        if (wanCompletionTimer !== null) { window.clearTimeout(wanCompletionTimer); wanCompletionTimer = null; }
        state.stage = stage;
        state.highest = Math.max(state.highest, stages.indexOf(stage));
        persist(); render();
        document.querySelector('.ch2-main').scrollTo({ top: 0, behavior: 'auto' });
        message('Ikuti arahan Pak Amat pada tampilan WinBox.', 'info');
        if (announce && !['quiz', 'finish'].includes(stage) && !isCurrentTaskDone()) {
            const [, title, text] = stageInformation[stage];
            openDialogue([`${title} ${text}`], mainAction);
        }
    };
    const conceptNext = { vlan: 'vlan', wan: 'wan', addresses: 'addresses', dhcp: 'dhcp', recap: 'quiz' };
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
            const following = { vlan: 'wan', wan: 'addresses', addresses: 'dhcp', dhcp: 'recap' };
            return showConcept(following[state.stage]);
        }
        const navigation = {
            vlan: 'Klik Interfaces pada menu kiri → tab VLAN → tombol + untuk membuat VLAN.',
            wan: 'Klik IP pada menu kiri → DHCP Client untuk mengatur koneksi WAN.',
            addresses: 'Klik IP pada menu kiri → Addresses → tombol + untuk menambah IP gateway.',
            dhcp: 'Klik IP pada menu kiri → DHCP Server → DHCP Setup untuk mulai konfigurasi.',
        };
        message(navigation[state.stage] || 'Ikuti langkah di panel kanan.', 'info');
    };

    let resetRevision = 0;
    const resetFromStage = (destination) => {
        resetRevision++;
        const index = stages.indexOf(destination);
        const resets = (name) => stages.indexOf(name) >= index;
        if (resets('vlan')) state.vlan = { ...defaults.vlan };
        if (resets('wan')) { state.wan = false; state.wanClient = null; selectedWan = false; wanBindingRevision++; }
        if (resets('addresses')) {
            state.addresses = { ...defaults.addresses }; state.addressDisabled = {}; state.addressComments = {};
        }
        if (resets('dhcp')) {
            state.pools = { ...defaults.pools }; state.dhcpSettings = {}; state.dhcpDisabled = {};
        }
        if (resets('dhcp')) {
            state.clients = { ...defaults.clients }; state.clientLeases = {}; state.clientStatic = {};
            requestingClients.clear();
        }
        selectedVlan = null; editingVlan = null; selectedAddress = null; editingAddress = null; selectedDhcp = null; selectedLease = null;
        state.highest = Math.max(0, index);
        state.evaluationResult = null; evaluation.clear();
        document.querySelectorAll('[data-quiz-form] input').forEach((node) => { node.checked = false; });
        const windowStages = { vlan: 'vlan', 'vlan-edit': 'vlan', wan: 'wan', addresses: 'addresses', 'address-edit': 'addresses', dhcp: 'dhcp', 'dhcp-setup': 'dhcp' };
        persistedFields.forEach((field) => {
            const owner = field.closest('[data-window]')?.dataset.window;
            if (windowStages[owner] && resets(windowStages[owner])) {
                if (field.tagName === 'SELECT') field.selectedIndex = 0;
                else if (field.type === 'checkbox') field.checked = field.defaultChecked;
                else field.value = field.defaultValue;
            }
        });
    };

    const goToPreviousStep = () => {
        if (!chapterPrologue.hidden) {
            if (prologueIndex === 0) return;
            prologueIndex--;
            if (!replayingPrologue) state.prologueIndex = prologueIndex;
            renderPrologueScene(); persist(); return;
        }
        if (learningDialog.open) { learningDialog.close(); return; }
        if (!dialogue.hidden) {
            if (dialogueIndex > 0) { dialogueIndex--; paintDialogueLine(); return; }
            finishDialogueTyping(); dialogue.hidden = true;
            dialogue.classList.remove('is-speaking'); labSurface.inert = false;
            dialogueContinue = null;
            if (state.stage !== 'intro') { updateBackAvailability(); return; }
        }
        if (state.stage === 'intro') {
            state.prologueIndex = chapterPrologueScenes.length - 1;
            startChapterPrologue(); return;
        }
        if (quizDialog.open) quizDialog.close();
        if (finishDialog.open) finishDialog.close();
        windows.forEach((node, name) => closeWindow(name));
        const destination = stages[Math.max(0, stages.indexOf(state.stage) - 1)];
        resetFromStage(destination);
        setStage(destination, false);

        if (destination === 'quiz') quizDialog.showModal();
    };
    navbar.bindPrevious(goToPreviousStep);
    document.querySelectorAll('[data-previous]').forEach((button) => button.addEventListener('click', goToPreviousStep));
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
    const pcDesktop = window.NetGuardPcDesktop.create({
        onOpenWinbox: () => { winboxApp.hidden = false; },
        getNetwork: () => state.addresses.local && state.pools.local && !state.addressDisabled.local && !state.dhcpDisabled.local ? { address: state.pools.local.split('-')[0], gateway: '192.168.100.1' } : null,
        onError: (text) => message(text, 'error'),
    });
    pcDesktop.setAvailable(true);
    document.querySelectorAll('[data-ch2-app-hide]').forEach((button) => button.addEventListener('click', () => { winboxApp.hidden = true; pcDesktop.showDesktop(); }));
    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow, true)));
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
        openWindow('edit', true);
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
        openWindow('vlan-edit', true);
        nameInput.focus({ preventScroll: true });
        nameInput.select();
    }));
    document.querySelectorAll('[data-save-vlan]').forEach((button) => button.addEventListener('click', () => {
        if (!editingVlan) return;
        const expectedName = editingVlan === 'student' ? 'vlan1-siswa' : 'vlan2-guru';
        const expectedId = editingVlan === 'student' ? '10' : '20';
        const mistakes = [];
        if (normal(document.querySelector('[data-vlan-name]').value) !== expectedName) mistakes.push('Kolom Name belum tepat. Isi dengan ' + expectedName + '.');
        if (document.querySelector('[data-vlan-id]').value !== expectedId) mistakes.push('VLAN ID harus ' + expectedId + ' untuk VLAN ' + (editingVlan === 'student' ? 'siswa' : 'guru') + '.');
        if (document.querySelector('[data-vlan-parent]').value !== 'ether2-vlan') mistakes.push('Interface induk harus ether2-vlan, yaitu jalur trunk menuju hEX. ether1-internet adalah jalur ISP sehingga tidak dipilih untuk VLAN ini.');
        if (mistakes.length) return message(mistakes.join(' ') + ' Perbaiki kolom tersebut, lalu klik OK atau Apply lagi.', 'error');
        state.vlan[editingVlan] = true; persist(); render();
        message(completeVlan() ? 'Kedua VLAN berhasil. Klik tombol instruksi Pak Amat untuk lanjut ke DHCP Client.' : 'VLAN pertama tersimpan. Tambahkan satu VLAN lagi di daftar.', 'success');
        if (button.textContent === 'OK') closeWindow('vlan-edit');
    }));
    const wanTab = (name) => {
        document.querySelectorAll('[data-wan-panel]').forEach((node) => { node.hidden = node.dataset.wanPanel !== name; });
        document.querySelectorAll('[data-wan-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.wanTab === name));
    };
    const renderWanClient = () => {
        const client = state.wanClient;
        const status = !client || client.disabled ? 'stopped' : client.bound ? 'bound' : 'searching...';
        const bound = Boolean(client?.bound && !client.disabled);
        const row = document.querySelector('[data-wan-row]');
        row.hidden = !client || !('ether1-internet ' + status).includes(document.querySelector('[data-wan-find]').value.trim().toLowerCase());
        row.classList.toggle('is-selected', selectedWan && Boolean(client));
        row.classList.toggle('is-disabled', Boolean(client?.disabled));
        row.setAttribute('aria-pressed', String(selectedWan && Boolean(client)));
        row.title = client?.comment || '';
        document.querySelector('[data-wan-status]').textContent = status;
        document.querySelector('[data-wan-status]').classList.toggle('is-bound-highlight', bound && state.stage === 'wan');
        document.querySelector('[data-wan-edit-status]').classList.toggle('is-bound-highlight', bound && state.stage === 'wan');
        document.querySelector('[data-wan-status]').title = bound ? 'bound: router berhasil menerima konfigurasi dari ISP' : status;
        document.querySelector('[data-wan-list-dns]').textContent = client?.peerDns ? 'yes' : 'no';
        document.querySelector('[data-wan-list-route]').textContent = client?.defaultRoute || 'yes';
        document.querySelector('[data-wan-list-address]').textContent = bound ? '192.0.2.2/24' : '';
        document.querySelector('[data-wan-list-expires]').textContent = bound ? '00:09:59' : '';
        document.querySelector('[data-wan-count]').textContent = client ? '1 item' : '0 items';
        const details = { status, address: bound ? '192.0.2.2/24' : '', gateway: bound ? '192.0.2.1' : '', server: bound ? '192.0.2.1' : '', dns: bound && client.peerDns ? '192.0.2.1' : '', expires: bound ? '00:09:59' : '' };
        document.querySelectorAll('[data-wan-detail]').forEach((node) => { node.value = details[node.dataset.wanDetail]; });
        document.querySelector('[data-wan-edit-enabled]').textContent = (client ? client.disabled : wanDraftDisabled) ? 'disabled' : 'enabled';
        document.querySelector('[data-wan-edit-status]').textContent = 'Status: ' + status;
        document.querySelector('[data-wan-edit-title]').textContent = client ? 'DHCP Client <ether1-internet>' : 'New DHCP Client';
        document.querySelectorAll('[data-wan-tool]').forEach((button) => { button.disabled = !client || !selectedWan || (button.dataset.wanTool === 'enable' && !client.disabled) || (button.dataset.wanTool === 'disable' && client.disabled); });
        document.querySelectorAll('[data-wan-editor-tool]').forEach((button) => {
            const tool = button.dataset.wanEditorTool;
            button.disabled = !client && !['disable'].includes(tool);
            if (tool === 'disable') button.textContent = (client ? client.disabled : wanDraftDisabled) ? 'Enable' : 'Disable';
        });
    };
    const openWanEditor = () => {
        const client = state.wanClient;
        wanCopyDraft = false;
        wanDraftDisabled = Boolean(client?.disabled);
        document.querySelector('[data-wan-interface]').value = 'ether1-internet';
        document.querySelector('[data-wan-peer-dns]').checked = client?.peerDns ?? true;
        document.querySelector('[data-wan-peer-ntp]').checked = client?.peerNtp ?? true;
        document.querySelector('[data-wan-default-route]').value = client?.defaultRoute || 'yes';
        document.querySelector('[data-wan-distance]').value = String(client?.distance || 1);
        document.querySelector('[data-wan-options]').value = client?.options ?? 'hostname,clientid';
        wanTab('dhcp'); renderWanClient(); openWindow('wan-edit', true);
    };
    const bindWanClient = () => {
        const revision = ++wanBindingRevision;
        const reset = resetRevision;
        const client = state.wanClient;
        if (!client || client.disabled) return;
        client.bound = false; state.wan = false; persist(); render();
        window.setTimeout(() => {
            if (revision !== wanBindingRevision || reset !== resetRevision || state.wanClient !== client || client.disabled) return;
            client.bound = true; state.wan = client.defaultRoute !== 'no';
            persist(); render();
            message(state.wan ? 'DHCP Client tersimpan dan telah menerima konfigurasi IP dari penyedia internet. Status bound di tabel menunjukkan hasilnya; target selesai secara otomatis.' : 'Alamat WAN sudah diterima. Untuk latihan ini, ubah Add Default Route menjadi yes agar router punya jalur keluar.', state.wan ? 'success' : 'info');
        }, 650);
    };
    document.querySelector('[data-new-wan]').addEventListener('click', () => {
        if (state.wanClient) { selectedWan = true; renderWanClient(); return message('DHCP Client ether1-internet sudah ada. Klik dua kali barisnya untuk mengubah pengaturan.', 'info'); }
        openWanEditor();
    });
    document.querySelectorAll('[data-wan-tab]').forEach((button) => button.addEventListener('click', () => wanTab(button.dataset.wanTab)));
    const wanRow = document.querySelector('[data-wan-row]');
    wanRow.addEventListener('click', () => { selectedWan = true; renderWanClient(); });
    wanRow.addEventListener('dblclick', openWanEditor);
    wanRow.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); selectedWan = true; openWanEditor(); } });
    wanRow.addEventListener('pointerup', (event) => { if (event.pointerType === 'touch') { selectedWan = true; openWanEditor(); } });
    document.querySelector('[data-wan-find]').addEventListener('input', renderWanClient);
    document.querySelectorAll('[data-save-wan]').forEach((button) => button.addEventListener('click', () => {
        if (wanCopyDraft && state.wanClient && document.querySelector('[data-wan-interface]').value === 'ether1-internet') return message('DHCP Client pada ether1-internet sudah ada. Tutup form salinan, lalu klik dua kali baris client yang ada untuk mengubahnya. Satu interface tidak memerlukan dua DHCP Client.', 'error');
        if (document.querySelector('[data-wan-interface]').value !== 'ether1-internet') return explainDhcpError('Pilih ether1-internet untuk DHCP Client ISP. Port ether2 menuju hEX, ether3 menuju PC lokal, dan wlan1 untuk Wi-Fi. Ubah Interface sesuai jalur kabel ISP.', '[data-wan-interface]');
        const distance = Number(document.querySelector('[data-wan-distance]').value);
        if (!Number.isInteger(distance) || distance < 1 || distance > 255) return message('Default Route Distance harus antara 1 dan 255.', 'error');
        state.wanClient = { peerDns: document.querySelector('[data-wan-peer-dns]').checked, peerNtp: document.querySelector('[data-wan-peer-ntp]').checked, defaultRoute: document.querySelector('[data-wan-default-route]').value, distance, options: document.querySelector('[data-wan-options]').value.trim(), disabled: wanDraftDisabled, bound: false, comment: state.wanClient?.comment || '' };
        state.wan = false; selectedWan = true;
        if (button.dataset.saveWan === 'ok') closeWindow('wan-edit');
        persist(); render(); bindWanClient();
    }));
    const wanTool = (tool) => {
        const client = state.wanClient;
        if (tool === 'disable' && !client) { wanDraftDisabled = !wanDraftDisabled; renderWanClient(); return; }
        if (!client) return;
        if (tool === 'comment') { document.querySelector('[data-wan-comment]').value = client.comment || ''; openWindow('wan-comment', true); return; }
        if (tool === 'copy') {
            openWanEditor(); wanCopyDraft = true;
            document.querySelector('[data-wan-edit-title]').textContent = 'New DHCP Client';
            return;
        }
        if (tool === 'remove') { state.wanClient = null; state.wan = false; selectedWan = false; wanBindingRevision++; closeWindow('wan-edit'); }
        if (tool === 'enable' || tool === 'disable') {
            client.disabled = tool === 'enable' ? false : !client.disabled; wanDraftDisabled = client.disabled;
            client.bound = false; state.wan = false; wanBindingRevision++;
            if (!client.disabled) bindWanClient();
        }
        if (tool === 'release' || tool === 'renew') bindWanClient();
        persist(); render();
    };
    document.querySelectorAll('[data-wan-tool], [data-wan-editor-tool]').forEach((button) => button.addEventListener('click', () => wanTool(button.dataset.wanTool || button.dataset.wanEditorTool)));
    document.querySelector('[data-save-wan-comment]').addEventListener('click', () => {
        if (state.wanClient) state.wanClient.comment = document.querySelector('[data-wan-comment]').value;
        closeWindow('wan-comment'); persist(); render();
    });

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
        openWindow('address-edit', true);
        document.querySelector('[data-address-input]').focus({ preventScroll: true });
    };
    const openAddressComment = (group) => {
        if (!group || !state.addresses[group]) return;
        commentAddress = group;
        document.querySelector('[data-address-comment]').value = state.addressComments[group] || '';
        openWindow('address-comment', true);
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
            window.NetGuardAudio?.play('error');
            openDialogue([explanation], () => document.querySelector(focusSelector).focus({ preventScroll: true }));
            return;
        }
        const expectedNetwork = expected[1].split('.').slice(0, 3).join('.') + '.0';
        const enteredNetwork = document.querySelector('[data-address-network]').value.trim();
        if (enteredNetwork && enteredNetwork !== expectedNetwork) return message('Network belum sesuai dengan alamat /24. Kosongkan agar dihitung otomatis.', 'error');
        if (state.addresses[expected[0]] && editingAddress !== expected[0]) return message('Alamat IP ini sudah ada pada daftar. Klik dua kali baris alamat tersebut untuk mengubahnya, atau hapus baris lama sebelum menambahkan kembali.', 'error');
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
    const dhcpGroup = () => ({ 'ether3-local': 'local', 'vlan1-siswa': 'student', 'vlan2-guru': 'teacher', wlan1: 'wireless' })[document.querySelector('[data-pool-interface]').value] || null;
    const renderDhcpList = () => {
        const search = document.querySelector('[data-dhcp-find]').value.trim().toLowerCase();
        if (selectedDhcp && !state.pools[selectedDhcp]) selectedDhcp = null;
        let visibleCount = 0;
        dhcpGroups.forEach((group, index) => {
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
        const total = dhcpGroups.filter((group) => state.pools[group]).length;
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
        window.NetGuardAudio?.play('error');
        openDialogue([text], () => document.querySelector(selector).focus({ preventScroll: true }));
        return false;
    };
    const validateDhcpStep = () => {
        const group = dhcpGroup();
        const iface = document.querySelector('[data-pool-interface]').value;
        const prefix = dhcpPrefixes[group];
        const audience = dhcpNames[group];
        if (dhcpStep === 0) {
            if (!group) return explainDhcpError((iface ? 'Interface ' + iface + ' belum tepat untuk tugas ini.' : 'Pilih interface terlebih dahulu.') + ' Gunakan ether3-local untuk PC lokal, vlan1-siswa untuk siswa, vlan2-guru untuk guru, dan wlan1 untuk Wi-Fi.', '[data-pool-interface]');
            if ((['student', 'teacher'].includes(group) && !state.vlan[group]) || !state.addresses[group] || state.addressDisabled[group]) return explainDhcpError('Gateway segmen ' + audience + ' belum siap. Aktifkan ' + iface + ' dan pasang IP 192.168.' + prefix + '.1/24 melalui IP → Addresses sebelum menjalankan DHCP Setup.', '[data-pool-interface]');
            if (state.pools[group]) return explainDhcpError('DHCP Server pada ' + iface + ' sudah ada. Pilih VLAN yang belum selesai, atau hapus server yang lama sebelum membuat ulang.', '[data-pool-interface]');
        } else if (dhcpStep === 1 && normal(document.querySelector('[data-dhcp-space]').value) !== '192.168.' + prefix + '.0/24') {
            return explainDhcpError('Subnet ini belum sesuai dengan segmen ' + audience + '. DHCP Address Space untuk ' + iface + ' adalah 192.168.' + prefix + '.0/24. Ini alamat jaringan, bukan alamat gateway .1.', '[data-dhcp-space]');
        } else if (dhcpStep === 2 && normal(document.querySelector('[data-dhcp-gateway]').value) !== '192.168.' + prefix + '.1') {
            return explainDhcpError('Gateway untuk segmen ' + audience + ' harus 192.168.' + prefix + '.1, sesuai IP pada ' + iface + '. Klien akan memakai alamat ini sebagai pintu keluar jaringannya.', '[data-dhcp-gateway]');
        } else if (dhcpStep === 3) {
            const range = normal(document.querySelector('[data-pool-range]').value);
            if (!validPool(range, prefix)) return explainDhcpError('Rentang IP belum valid untuk segmen ' + audience + '. Gunakan dua alamat dalam subnet 192.168.' + prefix + '.0/24, dengan IP awal lebih kecil dari IP akhir. Jangan masukkan gateway .1, alamat jaringan .0, atau broadcast .255.', '[data-pool-range]');
            const targetRange = '192.168.' + prefix + '.10-192.168.' + prefix + '.50';
            if (group !== 'local' && range !== targetRange) return explainDhcpError('Rentang yang kamu isi belum sesuai alokasi jaringan sekolah ini. Ubah menjadi ' + targetRange + '. Kita menyiapkan 41 alamat untuk klien, dari .10 sampai .50. Alamat lainnya tidak ikut dibagikan otomatis. Setelah diubah, klik Next.', '[data-pool-range]');
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
        openWindow('dhcp-setup', true); paintDhcpStep();
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
            const prefix = dhcpPrefixes[group];
            document.querySelector('[data-dhcp-space]').value = '192.168.' + prefix + '.0/24';
            document.querySelector('[data-dhcp-gateway]').value = '192.168.' + prefix + '.1';
            document.querySelector('[data-pool-range]').value = '192.168.' + prefix + '.2-192.168.' + prefix + '.254';
            document.querySelector('[data-dhcp-dns]').value = '';
            document.querySelector('[data-dhcp-lease]').value = '10m';
            dhcpSetupGroup = group;
        }
        if (dhcpStep === 5) {
            if ((['student', 'teacher'].includes(group) && !state.vlan[group]) || !state.addresses[group] || state.addressDisabled[group] || state.pools[group]) {
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
        message('Lease dihapus.', 'success');
    });
    document.querySelector('[data-make-lease-static]').addEventListener('click', () => {
        if (!selectedLease || !state.clients[selectedLease]) return;
        state.clientStatic[selectedLease] = true; persist(); renderLeaseState();
    });
    document.querySelector('[data-lease-find]').addEventListener('input', renderLeaseState);
    document.querySelectorAll('[data-dhcp-tab-link]').forEach((button) => button.addEventListener('click', () => {
        document.querySelector('[data-dhcp-tab="' + button.dataset.dhcpTabLink + '"]').click();
    }));

    document.querySelector('[data-review-material]').addEventListener('click', () => {
        const concept = { intro: 'vlan', vlan: 'vlan', wan: 'wan', addresses: 'addresses', dhcp: 'dhcp',  quiz: 'recap', finish: 'recap' }[state.stage];
        showConcept(concept);
        pendingStage = state.stage;
        document.querySelector('[data-learning-continue]').textContent = 'Kembali ke tahap ini →';
    });
    document.querySelector('[data-mission-action]').addEventListener('click', mainAction);
    document.querySelector('[data-close-learning]').addEventListener('click', () => learningDialog.close());
    document.querySelector('[data-learning-continue]').addEventListener('click', () => {
        learningDialog.close();
        if (!pendingStage) return;
        const destination = pendingStage;
        pendingStage = null;
        if (destination !== state.stage) {
            setStage(destination);
            if (destination === 'quiz') quizDialog.showModal();
        } else message('Lanjutkan tahap ini melalui menu WinBox. Progresmu tetap tersimpan.', 'info');
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
            scene.dataset.completed = 'true'; quizDialog.close(); setStage('finish', false); finishDialog.showModal();
            message('Hebat! Chapter 2 selesai dan progres tersimpan di akun.', 'success');
        } catch { evaluation.showError('Hasil belum tersimpan. Periksa koneksi lalu coba lagi.'); }
        finally { submit.disabled = false; }
    });

    document.querySelector('[data-quiz-form]').addEventListener('change', () => { evaluation.clear(); state.evaluationResult = null; persist(); });
    evaluation.showResult(state.evaluationResult || (completionOnServer ? { correctAnswers: 5, totalQuestions: 5 } : null));
    clearWorkspace();
    restoreDrafts(); render();
    if (state.wanClient && !state.wanClient.disabled && !state.wanClient.bound) bindWanClient();
    if (state.stage === 'intro' && !state.prologueComplete && state.highest === 0) {
        startChapterPrologue();
    } else {
        chapterPrologue.hidden = true;
        scene.classList.remove('is-prologue');
        if (state.stage === 'intro') {
            openDialogue(chapterOpeningDialogue, mainAction);
        } else if (state.stage === 'quiz') {
            quizDialog.showModal();
        } else if (state.stage !== 'finish' && !isCurrentTaskDone()) {
            const [, title, text] = stageInformation[state.stage];
            openDialogue([title + ' ' + text], mainAction);
        }
    }
    if (state.stage === 'finish' && completionOnServer) message('Chapter 2 sudah selesai. Kamu tetap bisa meninjau WinBox dan menu konfigurasinya.', 'success');
    const getChapterTwoGuidePlan = () => {
        const open = (name) => Boolean(windows.get(name) && !windows.get(name).hidden);
        const value = (selector) => normal(document.querySelector(selector)?.value || '');
        if (state.stage === 'vlan') return [
            ['Klik Interfaces pada menu kiri WinBox. Jendela Interface List akan terbuka.\n\nDi bagian atas jendela, pilih tab VLAN untuk membuat jaringan siswa dan guru pada jalur menuju switch.', open('interfaces') || open('vlan') || completeVlan()],
            ['Klik tab VLAN pada jendela Interface List. Tabel VLAN akan terlihat.\n\nGunakan tombol + di atas tabel VLAN untuk menambahkan interface baru, bukan tombol pada tab lain.', open('vlan') || completeVlan()],
            ...['student', 'teacher'].flatMap((group) => {
                const name = group === 'student' ? 'vlan1-siswa' : 'vlan2-guru';
                const id = group === 'student' ? '10' : '20';
                const saved = Boolean(state.vlan[group]);
                const editing = editingVlan === group && open('vlan-edit');
                return [
                    ['Klik tombol + di atas tabel VLAN untuk membuat ' + name + '. Jendela New Interface VLAN akan muncul.\n\nJika jendela lain masih terbuka, tutup atau selesaikan terlebih dahulu. Jangan mengubah VLAN yang sudah benar.', saved || editing],
                    ['Isi Name: ' + name + ', VLAN ID: ' + id + ', lalu pilih Interface: ether2-vlan.\n\nInterface induk ini adalah jalur trunk ke hEX. Jika langkah belum hijau, periksa ejaan, angka ID, dan pilihan interface.', saved || (editing && value('[data-vlan-name]') === name && value('[data-vlan-id]') === id && value('[data-vlan-parent]') === 'ether2-vlan')],
                    ['Klik OK untuk menyimpan ' + name + '. Baris VLAN akan muncul di tabel dan targetnya berubah hijau.\n\nJika Pak Amat memberi koreksi, perbaiki kolom yang disebutkan lalu klik OK lagi. Ulangi proses untuk VLAN berikutnya.', saved],
                ];
            }),
        ];
        if (state.stage === 'wan') return [
            ['Klik IP pada menu kiri WinBox, lalu pilih DHCP Client. Jendela daftar DHCP Client akan terbuka.\n\nKita akan menambahkan client agar router meminta konfigurasi IP dari penyedia internet.', open('wan') || Boolean(state.wanClient)],
            ['Klik tombol + di atas tabel DHCP Client. Jendela New DHCP Client akan terbuka.\n\nJika sudah ada baris ether1-internet, klik dua kali baris itu untuk memeriksa pengaturannya; tidak perlu membuat client kedua.', open('wan-edit') || Boolean(state.wanClient)],
            ['Pada tab DHCP, pilih Interface: ether1-internet. Biarkan Use Peer DNS dan Use Peer NTP tercentang, serta Add Default Route: yes.\n\nPort ini menuju penyedia internet. Jangan pilih ether2-vlan atau ether3-local.', Boolean(state.wan) || (open('wan-edit') && value('[data-wan-interface]') === 'ether1-internet' && document.querySelector('[data-wan-peer-dns]').checked && document.querySelector('[data-wan-peer-ntp]').checked && value('[data-wan-default-route]') === 'yes')],
            ['Klik OK atau Apply untuk menyimpan. Tunggu kolom Status pada daftar DHCP Client berubah menjadi bound; artinya router sudah menerima konfigurasi IP.\n\nJika masih searching, klik baris ether1-internet lalu klik Renew di atas tabel. Target hijau muncul otomatis setelah konfigurasi berhasil.', Boolean(state.wan)],
        ];
        if (state.stage === 'addresses') return [
            ['Klik IP di menu kiri WinBox, lalu pilih Addresses. Jendela Address List akan terbuka.\n\nDi sini kita memasangkan alamat gateway dengan interface lokal, VLAN siswa, VLAN guru, dan Wi-Fi.', open('addresses') || completeAddresses()],
            ...dhcpGroups.flatMap((group) => {
                const iface = addressInterfaces[group];
                const address = '192.168.' + dhcpPrefixes[group] + '.1/24';
                const saved = Boolean(state.addresses[group] && !state.addressDisabled[group]);
                return [
                    ['Pada daftar Addresses, klik tombol + untuk menambahkan gateway ' + dhcpNames[group] + '. Jendela New Address akan muncul.\n\nJika alamat ini sudah ada, klik dua kali barisnya untuk mengedit.', saved || open('address-edit')],
                    ['Isi Address: ' + address + ', lalu pilih Interface: ' + iface + '. Biarkan Network kosong agar dihitung otomatis.\n\nJangan hilangkan /24. Untuk siswa dan guru, pilih nama VLAN yang tepat, bukan ether2-vlan.', saved || (open('address-edit') && value('[data-address-input]') === address && value('[data-address-interface]') === iface)],
                    ['Klik OK untuk menyimpan gateway ' + dhcpNames[group] + '. Jika memakai Apply, periksa Network terisi otomatis, lalu klik OK untuk menutup jendela sebelum menambah alamat lain.\n\nTarget ' + iface + ' akan hijau setelah alamat yang benar tersimpan. Jika ada koreksi, perbaiki alamat atau interface lalu simpan kembali.', saved],
                ];
            }),
        ];
        if (state.stage === 'dhcp') {
            const setupOpen = open('dhcp-setup');
            const selected = dhcpGroup();
            const firstMissing = dhcpGroups.find((group) => !state.pools[group] || state.dhcpDisabled[group]);
            return [
                ['Klik IP pada menu kiri WinBox, lalu pilih DHCP Server. Pada tab DHCP, cari tombol DHCP Setup di atas tabel.\n\nKita mulai dari ether3-local, lalu vlan1-siswa, vlan2-guru, dan wlan1.', open('dhcp') || setupOpen || completePools()],
                ...dhcpGroups.flatMap((group) => {
                    const saved = Boolean(state.pools[group] && !state.dhcpDisabled[group]);
                    const active = setupOpen && (selected === group || (!selected && firstMissing === group));
                    const instructions = Array.from({ length: 6 }, (_, step) => {
                        const instruction = dhcpStepInstruction(group, step);
                        const values = instruction.values.map(([label, text]) => label + ': ' + text).join('\n');
                        return [instruction.title + '. ' + instruction.text + '\n\n' + values + '\n\n' + instruction.action + ' Jika Pak Amat memberi koreksi, perbaiki kolom pada layar ini, lalu klik Next lagi.', saved || (active && dhcpStep > step)];
                    });
                    return [
                        ['Pada jendela DHCP Server, klik DHCP Setup untuk menyiapkan ' + addressInterfaces[group] + ' (' + dhcpNames[group] + ').\n\nWizard dimulai dari pilihan DHCP Server Interface. Server yang sudah selesai tidak perlu dibuat lagi.', saved || active],
                        ...instructions,
                        ['Pastikan tulisan Setup has completed successfully muncul, lalu klik OK. Ini menutup wizard DHCP ' + dhcpNames[group] + '.\n\nTargetnya harus hijau. Berikutnya buka DHCP Setup lagi untuk interface yang belum selesai.', saved && !(setupOpen && selected === group)],
                    ];
                }),
            ];
        }
        const text = state.stage === 'intro' ? 'Ikuti percakapan Pak Amat tentang jaringan sekolah. Setelah penjelasan VLAN muncul, klik Mulai praktik di WinBox.\n\nPetunjuk akan tampil satu per satu sesuai tindakanmu di menu WinBox.' : state.stage === 'quiz' ? 'Pilih satu jawaban untuk setiap soal, lalu klik Simpan hasil Chapter 2. Jika ada jawaban salah, perbaiki lalu kirim kembali.' : 'Chapter 2 selesai. Lihat hasil evaluasi atau kembali ke peta chapter melalui panah kiri pada navbar.';
        return [[text, state.stage === 'finish']];
    };
    progressiveGuide = window.NetGuardStepGuide.create({ list: document.querySelector('[data-guide-list]'), getKey: () => state.stage + ':' + resetRevision, getPlan: getChapterTwoGuidePlan, root: scene });
})();
