(() => {
    'use strict';

    const scene = document.querySelector('.chapter-one-scene');
    if (!scene) return;

    const stageInfo = {
        story: { mission: 0, label: 'MISI 01 / 05', title: 'Jaringan sekolah menunggu bantuanmu', subtitle: 'Dengarkan tugas dari Pak Amat sebelum masuk ke lab.', teacher: 'Sekolah kita membutuhkan jaringan yang rapi. Hari ini kamu jadi Junior Network Engineer!', pose: 'menugaskan', section: '§1.1–1.2', guide: ['Dengarkan cerita sekolah.', 'Kenali masalah jaringan di lab.', 'Terima tugas dari Pak Amat.'] },
        devices: { mission: 0, label: 'MISI 01 / 05', title: 'Kenali perangkat dan alat', subtitle: 'Sentuh setiap alat untuk memahami fungsinya.', teacher: 'Nama alat dan fungsinya harus kamu pahami sebelum merakit jaringan. Klik satu per satu, ya!', pose: 'ngasih_arahan', section: '§1.3–1.4', guide: ['Kenali hAP dan hEX.', 'Periksa PC, kabel UTP, dan RJ45.', 'Pelajari tang crimping dan LAN tester.'] },
        lesson: { mission: 1, label: 'MATERI 02 / 05', title: 'Pahami kabel straight dan T568B', subtitle: 'Pelajari konsep dan urutan warna sebelum mulai merakit.', teacher: 'Kabel straight memakai susunan pin yang sama pada kedua ujung. Pelajari urutan T568B sebelum menyiapkan kabel.', pose: 'ngasih_arahan', section: '§1.5', guide: ['Pahami arti kabel straight.', 'Hafalkan urutan warna T568B.', 'Gunakan susunan yang sama di kedua ujung.'] },
        prep: { mission: 1, label: 'MISI 02 / 05', title: 'Mulai merakit kabel straight', subtitle: 'Siapkan kabel sebelum menyusun delapan inti.', teacher: 'Pertama potong kabel, kupas jaket secukupnya, lalu luruskan delapan inti. Jangan sampai inti rusak.', pose: 'memberitahu', section: '§1.5–1.6', guide: ['Potong kabel sesuai kebutuhan.', 'Kupas jaket luar.', 'Urai dan luruskan inti.'] },
        wiring: { mission: 1, label: 'MISI 02 / 05', title: 'Susun delapan warna T568B', subtitle: 'Isi pin 1–8 pada Ujung A dan Ujung B.', teacher: 'Kabel straight memakai urutan yang sama pada kedua ujung. Perhatikan petunjuk T568B di atas slot.', pose: 'ngasih_arahan', section: '§1.5–1.6', guide: ['Susun warna pin 1–8 di Ujung A.', 'Ulangi urutan yang sama di Ujung B.', 'Periksa sebelum memasang RJ45.'] },
        terminate: { mission: 1, label: 'MISI 02 / 05', title: 'Pasang RJ45 dan crimp kedua ujung', subtitle: 'Potong rata, masukkan semua inti, lalu tekan tang crimping.', teacher: 'Pastikan semua inti mencapai ujung konektor. Setelah itu tekan tang sampai pin dan pengunci jaket terpasang.', pose: 'memberitahu', section: '§1.6', guide: ['Rapikan dan potong ujung rata.', 'Masukkan semua inti ke RJ45.', 'Crimp Ujung A, lalu ulangi pada Ujung B.'] },
        tester: { mission: 1, label: 'MISI 02 / 05', title: 'Uji hasil dengan LAN tester', subtitle: 'MAIN dan REMOTE harus menyala 1–8 dengan urutan sama.', teacher: 'Jangan gunakan kabel sebelum lulus uji. Jika ada lampu mati, periksa atau crimp ulang konektornya.', pose: 'ngasih_arahan', section: '§1.7', guide: ['Hubungkan kedua ujung ke tester.', 'Nyalakan tester.', 'Bandingkan urutan lampu 1–8.'] },
        topology: { mission: 2, label: 'MISI 03 / 05', title: 'Pasang topologi awal sekolah', subtitle: 'Tentukan jalur internet, hEX, dan PC pada port hAP.', teacher: 'Modul menetapkan Internet di port 1, hEX di port 2 sebagai jalur trunk, dan PC konfigurasi di port 3.', pose: 'ngasih_arahan', section: '§1.9', guide: ['ether1 → Internet / ISP.', 'ether2 → port 1 hEX.', 'ether3 → PC konfigurasi.'] },
        pc: { mission: 3, label: 'MISI 04 / 05', title: 'Masuk ke PC lab', subtitle: 'Nyalakan komputer, tunggu desktop, lalu buka WinBox.', teacher: 'Koneksi fisik sudah siap. Sekarang nyalakan PC dan buka WinBox seperti saat praktik di lab.', pose: 'bicara_santai', section: '§1.10', guide: ['Tekan tombol daya PC.', 'Tunggu sistem siap.', 'Buka WinBox dari desktop.'] },
        winbox: { mission: 3, label: 'MISI 04 / 05', title: 'Temukan router di WinBox', subtitle: 'Refresh Neighbors, pilih MAC Address, lalu Connect.', teacher: 'Pilih MAC Address router yang muncul. Pada perangkat latihan ini login admin dan password kosong, sesuai modul.', pose: 'ngasih_arahan', section: '§1.10', guide: ['Refresh tab Neighbors.', 'Pilih MAC Address hAP.', 'Login admin dan Connect.'] },
        config: { mission: 4, label: 'MISI 05 / 05', title: 'Atur Identity dan Interfaces', subtitle: 'Nama router dan tiga interface harus sesuai perannya.', teacher: 'Ubah identity menjadi Router. Lalu beri nama ether1-internet, ether2-vlan, dan ether3-local.', pose: 'ngasih_arahan', section: '§1.11–1.12', guide: ['System → Identity: Router.', 'Interfaces: ubah ether1–ether3.', 'Periksa lagi kecocokan nama dan port.'] },
        quiz: { mission: 4, label: 'MISI 05 / 05', title: 'Evaluasi Chapter 1', subtitle: 'Tunjukkan bahwa kamu memahami hasil konfigurasi.', teacher: 'Pahami alasan setiap langkah. Jawab lima soal, lalu sistem akan menyimpan progres chaptermu.', pose: 'mikir', section: 'Rekap Chapter 1', guide: ['Jawab lima soal pemahaman.', 'Periksa kembali jika ada yang keliru.', 'Selesaikan chapter untuk menyimpan progres.'] },
        finish: { mission: 5, label: 'CHAPTER SELESAI', title: 'Misi pertama berhasil!', subtitle: 'Jaringan fisik dan konfigurasi awal sudah siap.', teacher: 'Kerja bagus! Kabel, port, WinBox, identity, dan interface sudah siap untuk misi berikutnya.', pose: 'mantap', section: 'Chapter 1 selesai', guide: ['Kabel straight lulus LAN tester.', 'Topologi awal sesuai modul.', 'Router siap dikonfigurasi lebih lanjut.'] },
    };

    const openingDialogue = [
        { speaker: 'teacher', text: 'Sekolah ingin membangun jaringan untuk lab TKJ. Komputernya sudah siap, tetapi belum saling terhubung. Bapak perlu bantuanmu.' },
        { speaker: 'student', text: 'Siap, Pak Amat. Saya mulai dari mana?' },
        { speaker: 'teacher', text: 'Sebelum merakit jaringan, kita kenali dulu alat dan perangkatnya: router MikroTik, PC, kabel UTP, konektor RJ45, tang crimping, dan LAN tester.' },
        { speaker: 'student', text: 'Baik, Pak. Saya akan pelajari alatnya dulu sebelum mulai menyambungkan perangkat.' },
        { speaker: 'teacher', text: 'Bagus. Setelah semua alat dikenal, kita susun kabel straight T568B, crimp kedua ujungnya, lalu uji dengan LAN tester.' },
        { speaker: 'student', text: 'Siap, Pak Amat. Saya akan periksa setiap langkah dengan teliti.' },
    ];
    const synopsisScenes = [
        { kicker: 'PROLOG · 01', title: 'Pagi yang tidak biasa di lab TKJ', text: 'Pagi itu, ruang praktik sudah ramai. Deretan komputer menyala, tetapi belum satu pun dapat berkomunikasi dengan komputer lain. Murid-murid menunggu sebelum praktik jaringan dimulai.', pose: 'menugaskan' },
        { kicker: 'MASALAH · 02', title: 'Satu lab, banyak komputer, tanpa jaringan', text: 'Pak Amat menjelaskan bahwa sekolah ingin menyiapkan lab agar semua perangkat bisa dipakai belajar bersama. Tanpa sambungan yang benar, latihan MikroTik hari ini tidak akan berjalan.', pose: 'ngasih_arahan' },
        { kicker: 'PERLENGKAPAN · 03', title: 'Perangkatnya sudah siap. Kabelnya belum.', text: 'Router MikroTik hAP dan hEX sudah berada di meja. Ada kabel UTP, konektor RJ45, tang crimping, dan LAN tester. Sekarang kamu perlu mengenali alat-alat itu dan merakit sambungan pertamanya.', pose: 'memberitahu' },
        { kicker: 'TANTANGAN · 04', title: 'Bangun jalur jaringan dari awal', text: 'Mulai dengan kabel straight: susun warna T568B pada kedua ujung, pasang konektor, crimp dengan rapi, lalu pastikan urutan pin 1 sampai 8 lulus di LAN tester. Satu susunan yang keliru bisa memutus seluruh jalur.', pose: 'ngasih_arahan' },
        { kicker: 'MISI · 05', title: 'Jadilah Junior Network Engineer', text: 'Setelah kabel siap, hubungkan Internet ke ether1, hEX ke ether2, dan PC konfigurasi ke ether3. Nyalakan PC, buka WinBox, temukan router, lalu atur Identity serta nama interface sesuai fungsinya. Pak Amat menunggu laporanmu.', pose: 'menugaskan' },
    ];
    const missionDialogue = {
        prep: [
            { speaker: 'teacher', text: 'Sekarang kita rakit kabel straight. Potong dan kupas jaket luar, luruskan inti, lalu susun warna T568B pada kedua ujung.' },
            { speaker: 'student', text: 'Saya akan samakan urutan delapan warna pada Ujung A dan B, lalu periksa dengan LAN tester.' },
        ],
        topology: [
            { speaker: 'teacher', text: 'Kabel sudah lulus uji. Hubungkan Internet ke port 1 hAP, hEX ke port 2, dan PC konfigurasi ke port 3.' },
            { speaker: 'student', text: 'Saya pilih tujuan setiap port sesuai topologi di modul, Pak.' },
        ],
        pc: [
            { speaker: 'teacher', text: 'Sambungan fisik siap. Nyalakan PC lab, tunggu desktop muncul, lalu buka WinBox.' },
            { speaker: 'student', text: 'Siap. Saya tunggu PC selesai boot sebelum mencari router.' },
        ],
        config: [
            { speaker: 'teacher', text: 'Kita sudah masuk WinBox. Klik System lalu Identity, isi Router. Setelah itu buka Interfaces dan ubah nama ether1 sampai ether3.' },
            { speaker: 'student', text: 'Identity Router, ether1-internet, ether2-vlan, dan ether3-local. Saya kerjakan satu per satu.' },
        ],
    };
    const cableBriefingDialogue = [
        { speaker: 'teacher', text: 'Semua alat sudah kamu kenali. Tugas berikutnya adalah membuat kabel straight agar perangkat di lab dapat terhubung. Kita siapkan kabel, susun warna T568B pada kedua ujung, pasang konektor RJ45, crimp, lalu uji dengan LAN tester. Sebelum praktik, pelajari dulu arti kabel straight dan urutan warnanya.' },
        { speaker: 'student', text: 'Baik, Pak Amat. Saya pahami fungsi kabel dan urutan T568B dulu, lalu mulai merakitnya.' },
    ];
    const deviceInfo = {
        hap: 'MikroTik hAP adalah router utama. Di misi ini ia menghubungkan jalur internet, hEX, dan PC konfigurasi.',
        hex: 'MikroTik hEX adalah perangkat Ethernet. Pada skenario modul, ia dipakai di sisi switch/managed Ethernet—bukan hub.',
        pc: 'PC menjalankan WinBox untuk menemukan router lewat Neighbors dan melakukan konfigurasi.',
        cable: 'Kabel UTP mempunyai empat pasang inti berpilin. Keduanya akan dibuat straight dengan T568B.',
        rj45: 'Konektor RJ45 (8P8C) menempatkan delapan inti pada delapan posisi pin.',
        crimper: 'Tang crimping menekan pin RJ45 ke inti kabel dan mengunci jaket kabel.',
        tester: 'LAN tester mengecek kontinuitas dan urutan pin 1–8 pada MAIN dan REMOTE.',
    };
    const colors = [
        { id: 'white-orange', label: 'Putih-Oranye' },
        { id: 'orange', label: 'Oranye' },
        { id: 'white-green', label: 'Putih-Hijau' },
        { id: 'blue', label: 'Biru' },
        { id: 'white-blue', label: 'Putih-Biru' },
        { id: 'green', label: 'Hijau' },
        { id: 'white-brown', label: 'Putih-Cokelat' },
        { id: 'brown', label: 'Cokelat' },
    ];
    const bankOrder = [3, 0, 6, 1, 5, 2, 7, 4];
    const expectedPorts = { 1: 'internet', 2: 'switch', 3: 'pc' };
    const expectedNames = { ether1: 'ether1-internet', ether2: 'ether2-vlan', ether3: 'ether3-local' };
    const simulatorDetails = {
        pc: { device: 'PC konfigurasi', link: 'ether3 → PC lab', target: 'Nyalakan komputer dan buka WinBox', action: 'Boot PC lab', status: 'Tunggu desktop siap, lalu buka ikon WinBox.' },
        winbox: { device: 'MikroTik hAP', link: 'Neighbors → MAC Address', target: 'Connect sebagai admin', action: 'Temukan router', status: 'Refresh Neighbors, pilih perangkat hAP, lalu Connect.' },
        config: { device: 'RouterOS · hAP', link: 'Identity + ether1–ether3', target: 'Router / internet / vlan / local', action: 'Atur Identity dan Interfaces', status: 'Buka System → Identity, kemudian Interfaces.' },
    };

    const stageNodes = [...document.querySelectorAll('[data-stage]')];
    const continueButton = document.querySelector('[data-continue]');
    const feedback = document.querySelector('[data-feedback]');
    const teacherText = document.querySelector('[data-teacher-text]');
    const teacherImage = document.querySelector('[data-teacher-image]');
    const guideList = document.querySelector('[data-guide-list]');
    const progress = document.querySelector('[data-progress]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stage = 'story';
    let dialogueLines = [];
    let dialogueIndex = 0;
    let dialogueComplete = null;
    const shownMissionDialogue = new Set();
    let prepStep = 0;
    let wireEnd = 0;
    const wirePlacements = [Array(8).fill(null), Array(8).fill(null)];
    let terminateEnd = 0;
    let terminateStep = 0;
    let testerMain = false;
    let testerRemote = false;
    let testerPassed = false;
    let pcPowered = false;
    let pcBooting = false;
    let stageRevision = 0;
    let testerInterval = null;
    let configCelebrated = false;
    let neighborsLoaded = false;
    let macSelected = false;
    let identitySaved = false;
    const interfaceSaved = { ether1: false, ether2: false, ether3: false };
    let editingInterface = null;
    let elapsed = 0;
    const progressStorageKey = 'netguard.chapter-one.v1.' + scene.dataset.userId;
    let savedProgress = null;
    try {
        const storedProgress = JSON.parse(window.localStorage.getItem(progressStorageKey) || 'null');
        if (storedProgress && storedProgress.version === 1 && Object.prototype.hasOwnProperty.call(stageInfo, storedProgress.stage)) {
            savedProgress = storedProgress;
        }
    } catch {
        savedProgress = null;
    }

    const setFeedback = (message, kind = '') => {
        feedback.textContent = message;
        feedback.dataset.kind = kind;
        if (['pc', 'winbox', 'config'].includes(stage)) {
            document.querySelector('[data-simulator-status]').textContent = message;
        }
        saveProgress();
    };

    const setSimulatorStatus = (message) => {
        document.querySelector('[data-simulator-status]').textContent = message;
    };

    const showContinue = (nextStage, label = 'Lanjut →') => {
        continueButton.hidden = false;
        continueButton.disabled = false;
        continueButton.textContent = label;
        continueButton.dataset.next = nextStage;
        const simulatorNext = document.querySelector('[data-simulator-next]');
        simulatorNext.hidden = !['pc', 'winbox', 'config'].includes(stage);
        simulatorNext.textContent = label;
        saveProgress();
    };

    const hideContinue = () => {
        continueButton.hidden = true;
        continueButton.dataset.next = '';
        document.querySelector('[data-simulator-next]').hidden = true;
    };

    const setStage = (nextStage) => {
        stageRevision++;
        window.clearInterval(testerInterval);
        testerInterval = null;
        pcBooting = false;
        stage = nextStage;
        const info = stageInfo[stage];
        document.querySelector('.lab-board').dataset.currentStage = stage;
        const isSimulatorStage = ['pc', 'winbox', 'config'].includes(stage);
        scene.classList.toggle('is-simulator-stage', isSimulatorStage);
        const labLayout = document.querySelector('.lab-layout');
        labLayout.classList.toggle('is-simulator', isSimulatorStage);
        document.querySelector('[data-simulator-topology]').hidden = !isSimulatorStage;
        document.querySelector('[data-simulator-bottom]').hidden = !isSimulatorStage;
        if (isSimulatorStage) {
            const simulation = simulatorDetails[stage];
            document.querySelector('.lab-heading strong').textContent = 'MIKROTIK LAB: PRACTICAL SIMULATION';
            document.querySelector('.lab-heading small').textContent = 'Belajar · Konfigurasi · Kuasai';
            document.querySelector('[data-simulator-mission]').textContent = info.subtitle;
            document.querySelector('[data-simulator-device]').textContent = simulation.device;
            document.querySelector('[data-simulator-link]').textContent = simulation.link;
            document.querySelector('[data-simulator-target]').textContent = simulation.target;
            document.querySelector('[data-simulator-action]').textContent = simulation.action;
            document.querySelector('[data-simulator-status]').textContent = simulation.status;
            document.querySelector('[data-simulator-teacher]').src = scene.dataset.teacherBase + '/' + info.pose + '.png';
            document.querySelector('[data-simulator-teacher-text]').textContent = info.teacher;
        } else {
            document.querySelector('.lab-heading strong').textContent = 'Lab Chapter 01';
            document.querySelector('.lab-heading small').textContent = 'Perangkat & Konfigurasi Awal Router';
        }
        stageNodes.forEach((node) => { node.hidden = node.dataset.stage !== stage; });
        document.querySelector('[data-stage-label]').textContent = info.label;
        document.querySelector('[data-stage-title]').textContent = info.title;
        document.querySelector('[data-stage-subtitle]').textContent = info.subtitle;
        document.querySelector('[data-module-section]').textContent = 'Chapter 1 · ' + info.section;
        teacherText.textContent = info.teacher;
        teacherImage.src = scene.dataset.teacherBase + '/' + info.pose + '.png';
        guideList.replaceChildren(...info.guide.map((line) => {
            const item = document.createElement('li');
            item.textContent = line;
            return item;
        }));
        document.querySelectorAll('[data-mission-step]').forEach((step) => {
            const index = Number(step.dataset.missionStep);
            step.classList.toggle('is-complete', index < info.mission);
            step.classList.toggle('is-current', index === info.mission);
        });
        progress.value = info.mission;
        document.querySelector('[data-mission-count]').textContent = info.mission + ' / 5';
        hideContinue();
        setFeedback('Ikuti petunjuk di papan misi.');
        if (stage === 'prep') {
            document.querySelectorAll('[data-prep-action]').forEach((button, index) => {
                button.classList.toggle('is-done', index < prepStep);
                button.disabled = index < prepStep;
            });
            document.querySelectorAll('[data-prep-step]').forEach((step, index) => step.classList.toggle('is-done', index < prepStep));
            const prepWorkbench = document.querySelector('[data-prep-workbench]');
            const prepPhase = ['coil', 'cut', 'stripped', 'sorted'][prepStep];
            prepWorkbench.dataset.phase = prepPhase;
            const prepTitles = ['Kabel masih tergulung', 'Kabel dipotong sesuai kebutuhan', 'Alat kupas membuka jaket luar', 'Delapan inti sudah lurus dan siap disusun'];
            const prepNotes = ['Potong kabel sesuai panjang yang dibutuhkan.', 'Panjang kabel sudah siap. Berikutnya kupas jaket luar secukupnya.', 'Jaket terbuka tanpa melukai delapan inti kabel.', 'Lanjutkan ke puzzle warna T568B.'];
            prepWorkbench.querySelector('[data-prep-visual-title]').textContent = prepTitles[prepStep];
            prepWorkbench.querySelector('[data-prep-visual-note]').textContent = prepNotes[prepStep];
            if (prepStep === 3) showContinue('wiring', 'Lanjut ke susun warna →');
        }
        if (stage === 'wiring') renderWiring();
        if (stage === 'terminate') renderTerminate();
        if (stage === 'tester') renderTesterState();
        if (stage === 'topology') renderTopology();
        if (stage === 'pc') renderPcState();
        if (stage === 'config') {
            showConfigPanel('home');
            updateConfigCompletion();
        }
        if (stage === 'finish') setFeedback('Progres Chapter 1 tersimpan. Hebat!', 'success');
        if (stage !== 'story') {
            document.querySelector('.lab-main').scrollTo({ top: 0, behavior: 'instant' });
        }
        if (missionDialogue[stage] && !shownMissionDialogue.has(stage)) {
            shownMissionDialogue.add(stage);
            openDialogue(missionDialogue[stage]);
        }
        saveProgress();
    };

    const previousStage = { lesson: 'devices', prep: 'lesson', wiring: 'prep', terminate: 'wiring', tester: 'terminate', topology: 'tester', pc: 'topology', winbox: 'pc', config: 'winbox', quiz: 'config', finish: 'quiz' };
    document.querySelector('[data-lab-back]').addEventListener('click', () => {
        const destination = previousStage[stage];
        if (!destination) {
            window.location.assign(document.querySelector('[data-lab-back]').dataset.backUrl);
            return;
        }
        if (stage === 'tester') {
            terminateEnd = 1;
            terminateStep = 2;
        }
        setStage(destination);
    });

    continueButton.addEventListener('click', () => {
        if (continueButton.dataset.next === 'lesson-briefing') {
            openDialogue(cableBriefingDialogue, () => setStage('lesson'));
            return;
        }
        if (continueButton.dataset.next === 'quiz' && !configCelebrated) {
            celebrateConfiguration();
            return;
        }
        if (continueButton.dataset.next) setStage(continueButton.dataset.next);
    });
    document.querySelector('[data-lesson-next]').addEventListener('click', () => {
        openDialogue([
            { speaker: 'teacher', text: 'Bagus. Sekarang praktik: potong kabel sesuai kebutuhan, kupas jaket luar secukupnya, lalu uraikan dan luruskan delapan inti. Setelah siap, susun T568B yang sama pada Ujung A dan Ujung B.' },
        ], () => setStage('prep'));
    });
    document.querySelector('[data-simulator-next]').addEventListener('click', () => continueButton.click());

    const prologue = document.querySelector('[data-prologue]');
    const synopsis = document.querySelector('[data-synopsis]');
    const dialogue = document.querySelector('[data-dialogue]');
    let dialogueTypingTimer = null;
    let isDialogueTyping = false;
    const dialogueText = dialogue.querySelector('[data-dialogue-text]');
    let dialogueEquipment = null;
    const finishDialogueTyping = () => {
        if (dialogueTypingTimer !== null) window.clearInterval(dialogueTypingTimer);
        dialogueTypingTimer = null;
        isDialogueTyping = false;
        dialogueText.textContent = dialogueText.dataset.fullText || '';
    };
    const typeDialogueLine = (text) => {
        if (dialogueTypingTimer !== null) window.clearInterval(dialogueTypingTimer);
        dialogueText.dataset.fullText = text;
        dialogueText.textContent = '';
        isDialogueTyping = true;
        let position = 0;
        dialogueTypingTimer = window.setInterval(() => {
            position++;
            dialogueText.textContent = text.slice(0, position);
            if (position >= text.length) finishDialogueTyping();
        }, 34);
    };
    const renderDialogue = () => {
        const line = dialogueLines[dialogueIndex];
        const isTeacher = line.speaker === 'teacher';
        dialogue.classList.toggle('is-student', !isTeacher);
        dialogue.querySelector('[data-dialogue-speaker]').textContent = isTeacher ? 'PAK AMAT · GURU TKJ' : scene.dataset.studentName;
        const teacherPortrait = dialogue.querySelector('[data-dialogue-teacher]');
        const studentPortrait = dialogue.querySelector('[data-dialogue-student]');
        teacherPortrait.hidden = !isTeacher;
        studentPortrait.hidden = isTeacher;
        teacherPortrait.classList.toggle('is-speaking', isTeacher);
        studentPortrait.classList.toggle('is-speaking', !isTeacher);
        const equipment = line.equipment || dialogueEquipment;
        const equipmentPanel = dialogue.querySelector('[data-dialogue-equipment]');
        equipmentPanel.hidden = !equipment;
        dialogue.classList.toggle('has-equipment', Boolean(equipment));
        if (equipment) {
            const equipmentImage = dialogue.querySelector('[data-dialogue-equipment-image]');
            equipmentImage.src = equipment.image;
            equipmentImage.alt = equipment.name;
        } else {
            const equipmentImage = dialogue.querySelector('[data-dialogue-equipment-image]');
            equipmentImage.removeAttribute('src');
            equipmentImage.alt = '';
        }
        dialogue.querySelector('[data-dialogue-count]').textContent = (dialogueIndex + 1) + ' / ' + dialogueLines.length + ' · KLIK UNTUK LANJUT';
        typeDialogueLine(line.text);
    };
    const openDialogue = (lines, onComplete = null, equipment = null) => {
        dialogueLines = lines;
        dialogueIndex = 0;
        dialogueComplete = onComplete;
        dialogueEquipment = equipment;
        synopsis.hidden = true;
        prologue.hidden = false;
        dialogue.hidden = false;
        scene.classList.add('is-dialogue-open');
        renderDialogue();
        if (!reducedMotion.matches) {
            dialogue.animate(
                [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' },
            );
        }
    };
    const advanceDialogue = () => {
        if (isDialogueTyping) {
            finishDialogueTyping();
            return;
        }
        if (++dialogueIndex < dialogueLines.length) {
            renderDialogue();
            return;
        }
        dialogue.hidden = true;
        prologue.hidden = true;
        scene.classList.remove('is-dialogue-open');
        const completed = dialogueComplete;
        dialogueComplete = null;
        if (completed) completed();
    };
    let synopsisIndex = 0;
    let synopsisTypingTimer = null;
    let isSynopsisTyping = false;
    const synopsisTitle = document.querySelector('[data-synopsis-title]');
    const synopsisText = document.querySelector('[data-synopsis-text]');
    const finishSynopsisTyping = () => {
        if (synopsisTypingTimer !== null) window.clearInterval(synopsisTypingTimer);
        synopsisTypingTimer = null;
        isSynopsisTyping = false;
        synopsisTitle.textContent = synopsisTitle.dataset.fullText || '';
        synopsisText.textContent = synopsisText.dataset.fullText || '';
        synopsisTitle.classList.remove('is-typing');
        synopsisText.classList.remove('is-typing');
    };
    const typeSynopsisContent = (title, text) => {
        if (synopsisTypingTimer !== null) window.clearInterval(synopsisTypingTimer);
        synopsisTitle.dataset.fullText = title;
        synopsisText.dataset.fullText = text;
        synopsisTitle.textContent = '';
        synopsisText.textContent = '';
        synopsisTitle.classList.add('is-typing');
        synopsisText.classList.remove('is-typing');
        isSynopsisTyping = true;
        let activeText = title;
        let position = 0;
        synopsisTypingTimer = window.setInterval(() => {
            position++;
            if (activeText === title) {
                synopsisTitle.textContent = title.slice(0, position);
            } else {
                synopsisText.textContent = text.slice(0, position);
            }
            if (position >= activeText.length) {
                if (activeText === title) {
                    activeText = text;
                    position = 0;
                    synopsisTitle.classList.remove('is-typing');
                    synopsisText.classList.add('is-typing');
                    return;
                }
                finishSynopsisTyping();
            }
        }, 36);
    };
    const renderSynopsisScene = () => {
        const story = synopsisScenes[synopsisIndex];
        document.querySelector('[data-synopsis-kicker]').textContent = story.kicker;
        document.querySelector('[data-synopsis-count]').textContent = 'ADEGAN ' + String(synopsisIndex + 1).padStart(2, '0') + ' / ' + String(synopsisScenes.length).padStart(2, '0');
        document.querySelector('[data-synopsis-progress]').style.width = ((synopsisIndex + 1) / synopsisScenes.length * 100) + '%';
        document.querySelector('[data-synopsis-avatar]').src = scene.dataset.teacherBase + '/' + story.pose + '.png';
        const character = document.querySelector('.chapter-prologue__character');
        character.classList.remove('is-changing');
        void character.offsetWidth;
        character.classList.add('is-changing');
        document.querySelector('[data-synopsis-dot]').classList.remove('is-pulsing');
        void synopsisTitle.offsetWidth;
        document.querySelector('[data-synopsis-dot]').classList.add('is-pulsing');
        const panel = document.querySelector('[data-synopsis-scene]');
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
        typeSynopsisContent(story.title, story.text);
    };
    const advanceSynopsis = () => {
        if (isSynopsisTyping) {
            finishSynopsisTyping();
            return;
        }
        synopsisIndex++;
        if (synopsisIndex >= synopsisScenes.length) {
            synopsis.hidden = true;
            openDialogue(openingDialogue, () => {
                scene.classList.remove('is-prologue');
                shownMissionDialogue.add('devices');
                setStage('devices');
            });
            saveProgress();
            return;
        }
        saveProgress();
        renderSynopsisScene();
    };
    synopsis.addEventListener('click', advanceSynopsis);
    document.addEventListener('keydown', (event) => {
        if (scene.classList.contains('is-prologue') && !dialogue.hidden && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            advanceDialogue();
        } else if (scene.classList.contains('is-prologue') && !synopsis.hidden && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            advanceSynopsis();
        }
    });
    dialogue.addEventListener('click', advanceDialogue);

    const visitedDevices = new Set();
    const saveProgress = () => {
        const quizForm = document.querySelector('[data-quiz-form]');
        const quizAnswers = quizForm ? Array.from({ length: 5 }, (_, index) => quizForm.querySelector('input[name="answer-' + (index + 1) + '"]:checked')?.value ?? null) : [];
        const configPanel = activeConfigPanel;
        const progressSnapshot = {
            version: 1,
            stage,
            continueNext: continueButton.dataset.next || null,
            synopsisIndex,
            openingDialogue: stage === 'story' && synopsisIndex >= synopsisScenes.length && !dialogue.hidden,
            visitedDevices: [...visitedDevices],
            selectedDevice: document.querySelector('.device-card.is-selected')?.dataset.device ?? null,
            prepStep,
            wireEnd,
            wirePlacements,
            terminateEnd,
            terminateStep,
            testerMain,
            testerRemote,
            testerPassed,
            portSelections: Object.fromEntries([...document.querySelectorAll('[data-port]')].map((port) => [port.dataset.port, port.value])),
            pcPowered,
            configCelebrated,
            neighborsLoaded,
            macSelected,
            identitySaved,
            identityInput: document.querySelector('[data-identity-input]')?.value ?? '',
            interfaceSaved,
            interfaceNames: Object.fromEntries(['ether1', 'ether2', 'ether3'].map((name) => [name, document.querySelector('[data-interface-name="' + name + '"]')?.textContent ?? name])),
            editingInterface,
            interfaceInput: document.querySelector('[data-interface-input]')?.value ?? '',
            configPanel,
            quizAnswers,
            elapsed,
        };

        try {
            window.localStorage.setItem(progressStorageKey, JSON.stringify(progressSnapshot));
            return true;
        } catch {
            return false;
        }
    };
    document.querySelector('[data-save-progress]').addEventListener('click', (event) => {
        const button = event.currentTarget;
        const didSave = saveProgress();
        const label = button.querySelector('.lab-save-progress__label');
        const originalLabel = label.textContent;
        label.textContent = didSave ? 'Tersimpan ✓' : 'Gagal menyimpan';
        window.setTimeout(() => { label.textContent = originalLabel; }, 1800);
    });
    document.querySelectorAll('[data-device]').forEach((button) => {
        button.addEventListener('click', () => {
            visitedDevices.add(button.dataset.device);
            document.querySelectorAll('[data-device]').forEach((device) => {
                device.classList.toggle('is-visited', visitedDevices.has(device.dataset.device));
                device.classList.toggle('is-selected', device === button);
            });
            const explanation = deviceInfo[button.dataset.device];
            document.querySelector('[data-device-detail]').textContent = explanation;
            document.querySelector('[data-device-name]').textContent = button.querySelector('b').textContent;
            const isHap = button.dataset.device === 'hap';
            const devicePreview = document.querySelector('[data-device-preview]');
            const hapRotator = document.querySelector('[data-hap-rotator]');
            devicePreview.hidden = isHap;
            hapRotator.hidden = !isHap;
            if (isHap && !hapSprite.src) {
                const loadHapSprite = () => { hapSprite.src = hapCanvas.dataset.sprite; };
                if ('requestIdleCallback' in window) window.requestIdleCallback(loadHapSprite, { timeout: 900 });
                else window.setTimeout(loadHapSprite, 0);
            }
            if (!isHap) devicePreview.src = button.querySelector('img').src;
            document.querySelector('[data-device-tip]').textContent = isHap ? 'Geser hAP untuk melihat 16 sudut perangkat, atau tekan tombol panah kiri/kanan.' : 'Perhatikan bentuk dan fungsi alat sebelum melanjutkan misi.';
            teacherText.textContent = explanation;
            openDialogue([{ speaker: 'teacher', text: explanation }], null, {
                image: button.querySelector('img').src,
                name: button.querySelector('b').textContent,
            });
            setFeedback(visitedDevices.size + ' dari 7 alat sudah dikenali.', 'success');
            if (visitedDevices.size === 7) showContinue('lesson-briefing', 'Lanjutkan misi →');
        });
    });

    const hapCanvas = document.querySelector('[data-hap-rotator]');
    const hapContext = hapCanvas.getContext('2d');
    const hapSprite = new Image();
    hapSprite.decoding = 'async';
    hapSprite.fetchPriority = 'low';
    let hapFrame = 0;
    let hapPointerX = null;
    let hapDragDistance = 0;
    const drawHapFrame = () => {
        if (!hapSprite.complete || !hapSprite.naturalWidth) return;
        const cellWidth = hapSprite.naturalWidth / 4;
        const cellHeight = hapSprite.naturalHeight / 4;
        const sourceX = (hapFrame % 4) * cellWidth;
        const sourceY = Math.floor(hapFrame / 4) * cellHeight;
        hapContext.clearRect(0, 0, hapCanvas.width, hapCanvas.height);
        hapContext.drawImage(hapSprite, sourceX, sourceY, cellWidth, cellHeight * .88, 25, 12, hapCanvas.width - 50, hapCanvas.height - 24);
    };
    hapSprite.onload = drawHapFrame;
    hapCanvas.addEventListener('pointerdown', (event) => {
        if (!hapSprite.src) hapSprite.src = hapCanvas.dataset.sprite;
        hapPointerX = event.clientX;
        hapDragDistance = 0;
        hapCanvas.setPointerCapture(event.pointerId);
    });
    hapCanvas.addEventListener('pointermove', (event) => {
        if (hapPointerX === null) return;
        hapDragDistance += event.clientX - hapPointerX;
        hapPointerX = event.clientX;
        while (Math.abs(hapDragDistance) >= 20) {
            hapFrame = (hapFrame + (hapDragDistance > 0 ? 15 : 1)) % 16;
            hapDragDistance += hapDragDistance > 0 ? -20 : 20;
            drawHapFrame();
        }
    });
    hapCanvas.addEventListener('pointerup', () => { hapPointerX = null; });
    hapCanvas.addEventListener('pointercancel', () => { hapPointerX = null; });
    hapCanvas.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        if (!hapSprite.src) hapSprite.src = hapCanvas.dataset.sprite;
        hapFrame = (hapFrame + (event.key === 'ArrowLeft' ? 15 : 1)) % 16;
        drawHapFrame();
    });

    const prepActions = ['cut', 'strip', 'straighten'];
    document.querySelectorAll('[data-prep-action]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (button.dataset.prepAction !== prepActions[prepStep]) {
                setFeedback('Ikuti urutan modul: potong kabel, kupas jaket, lalu luruskan inti.', 'error');
                return;
            }
            const workbench = document.querySelector('[data-prep-workbench]');
            const duration = reducedMotion.matches ? 160 : 1050;
            const phaseByAction = { cut: 'cutting', strip: 'stripping', straighten: 'straightening' };
            const titleByAction = { cut: ['Kabel dipotong sesuai kebutuhan', 'Panjang kabel sudah siap. Berikutnya kupas jaket luar secukupnya.'], strip: ['Alat kupas membuka jaket luar', 'Jaket terbuka tanpa melukai delapan inti kabel.'], straighten: ['Delapan inti sedang dirapikan', 'Warna inti sudah siap disusun menurut standar T568B.'] };
            button.disabled = true;
            workbench.dataset.phase = phaseByAction[button.dataset.prepAction];
            setFeedback(button.dataset.prepAction === 'cut' ? 'Gunting memotong kabel sesuai panjang yang dibutuhkan...' : button.dataset.prepAction === 'strip' ? 'Stripper bergerak mengupas jaket luar kabel...' : 'Inti kabel diurai, diluruskan, lalu disiapkan untuk puzzle warna...');
            await new Promise((resolve) => window.setTimeout(resolve, duration));
            if (button.dataset.prepAction === 'cut') workbench.dataset.phase = 'cut';
            if (button.dataset.prepAction === 'strip') workbench.dataset.phase = 'stripped';
            if (button.dataset.prepAction === 'straighten') workbench.dataset.phase = 'sorted';
            workbench.querySelector('[data-prep-visual-title]').textContent = titleByAction[button.dataset.prepAction][0];
            workbench.querySelector('[data-prep-visual-note]').textContent = titleByAction[button.dataset.prepAction][1];
            button.classList.add('is-done');
            document.querySelector('[data-prep-step="' + prepStep + '"]').classList.add('is-done');
            prepStep++;
            setFeedback('Langkah persiapan ' + prepStep + ' dari 3 selesai.', 'success');
            if (prepStep === 3) window.setTimeout(() => setStage('wiring'), reducedMotion.matches ? 100 : 750);
        });
    });

    const makeSwatch = (colorId) => {
        const swatch = document.createElement('span');
        swatch.className = 'wire-swatch wire-swatch--' + colorId;
        swatch.setAttribute('aria-hidden', 'true');
        return swatch;
    };

    const addWire = (colorId, targetIndex = -1) => {
        const current = wirePlacements[wireEnd];
        if (current.includes(colorId)) return;
        const index = targetIndex >= 0 ? targetIndex : current.indexOf(null);
        if (index < 0 || current[index] !== null) return;
        current[index] = colorId;
        renderWiring();
        setFeedback('Pin ' + (index + 1) + ' terisi. Ketuk slot untuk melepas warna.');
    };

    const renderWiring = () => {
        const current = wirePlacements[wireEnd];
        const slots = document.querySelector('[data-wire-slots]');
        const bank = document.querySelector('[data-wire-bank]');
        const guide = document.querySelector('[data-wire-guide]');
        document.querySelector('[data-wire-end]').textContent = 'Ujung ' + (wireEnd === 0 ? 'A' : 'B');
        document.querySelector('[data-wire-count]').textContent = current.filter(Boolean).length + ' / 8';
        slots.replaceChildren();
        bank.replaceChildren();
        guide.replaceChildren();

        colors.forEach((color, index) => {
            const hint = document.createElement('span');
            hint.append(makeSwatch(color.id), document.createTextNode((index + 1) + '. ' + color.label));
            guide.append(hint);
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.className = 'wire-slot' + (current[index] ? ' is-filled' : '');
            slot.setAttribute('aria-label', 'Pin ' + (index + 1) + ': ' + (current[index] ? colors.find((entry) => entry.id === current[index]).label : 'kosong'));
            const number = document.createElement('b');
            number.textContent = String(index + 1);
            slot.append(number);
            if (current[index]) {
                slot.append(makeSwatch(current[index]));
                slot.addEventListener('click', () => {
                    current[index] = null;
                    renderWiring();
                    saveProgress();
                });
            }
            slot.addEventListener('dragover', (event) => event.preventDefault());
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                addWire(event.dataTransfer.getData('text/plain'), index);
            });
            slots.append(slot);
        });

        bankOrder.forEach((colorIndex) => {
            const color = colors[colorIndex];
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'wire-chip';
            chip.disabled = current.includes(color.id);
            chip.draggable = !chip.disabled;
            chip.append(makeSwatch(color.id), document.createTextNode(color.label));
            chip.addEventListener('click', () => addWire(color.id));
            chip.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', color.id));
            bank.append(chip);
        });
    };

    document.querySelector('[data-check-wire]').addEventListener('click', () => {
        const current = wirePlacements[wireEnd];
        if (current.some((color) => color === null)) {
            setFeedback('Isi dulu semua delapan pin sebelum diperiksa.', 'error');
            return;
        }
        const firstWrong = current.findIndex((color, index) => color !== colors[index].id);
        if (firstWrong >= 0) {
            document.querySelectorAll('.wire-slot')[firstWrong].classList.add('is-wrong');
            setFeedback('Urutan belum tepat. Periksa kembali pin ' + (firstWrong + 1) + ' dengan petunjuk T568B.', 'error');
            return;
        }
        if (wireEnd === 0) {
            wireEnd = 1;
            renderWiring();
            setFeedback('Ujung A benar! Sekarang susun Ujung B dengan urutan T568B yang sama.', 'success');
            teacherText.textContent = 'Bagus! Kabel straight memerlukan urutan T568B yang sama juga di Ujung B.';
            return;
        }
        setFeedback('Kedua ujung memakai T568B yang sama. Siap memasang RJ45!', 'success');
        window.setTimeout(() => setStage('terminate'), reducedMotion.matches ? 100 : 650);
    });

    const terminateSteps = [
        { title: 'Rapikan dan potong rata', description: 'Potong ujung delapan inti agar panjangnya rata sebelum masuk ke konektor RJ45.', action: 'Potong rata delapan inti' },
        { title: 'Masukkan semua inti ke RJ45', description: 'Pastikan setiap inti tetap berurutan dan mencapai ujung konektor.', action: 'Masukkan ke konektor RJ45' },
        { title: 'Tekan tang crimping', description: 'Tekan hingga pin menjepit inti dan pengunci jaket terpasang.', action: 'Crimp konektor sekarang' },
    ];
    const renderTerminate = () => {
        const step = terminateSteps[Math.min(terminateStep, terminateSteps.length - 1)];
        const visual = document.querySelector('[data-terminate-visual]');
        visual.dataset.phase = ['trim', 'insert', 'crimp'][terminateStep] || 'finished';
        visual.dataset.end = terminateEnd === 0 ? 'A' : 'B';
        document.querySelector('[data-terminate-action]').disabled = false;
        setTerminateFrame(Math.min(terminateStep, 2) * 4);
        document.querySelector('[data-frame-caption]').textContent = step.title;
        [0, 1, 2].forEach((index) => visual.classList.toggle('is-step-complete-' + index, index < terminateStep));
        document.querySelector('[data-terminate-end]').textContent = 'UJUNG ' + (terminateEnd === 0 ? 'A' : 'B');
        document.querySelector('[data-terminate-title]').textContent = step.title;
        document.querySelector('[data-terminate-description]').textContent = step.description;
        document.querySelector('[data-terminate-action]').textContent = step.action;
        document.querySelectorAll('[data-terminate-dot]').forEach((dot) => {
            dot.classList.toggle('is-done', Number(dot.dataset.terminateDot) < terminateStep);
            dot.classList.toggle('is-current', Number(dot.dataset.terminateDot) === terminateStep);
        });
    };

    const setTerminateFrame = (index) => {
        const frame = document.querySelector('[data-terminate-frames]');
        frame.style.backgroundPosition = ((index % 4) / 3 * 100) + '% ' + (Math.floor(index / 4) / 2 * 100) + '%';
        frame.dataset.frame = String(index);
    };
    document.querySelector('[data-terminate-action]').addEventListener('click', async (event) => {
        const actionButton = event.currentTarget;
        if (actionButton.disabled) return;
        const revision = stageRevision;
        const step = Math.min(terminateStep, 2);
        actionButton.disabled = true;
        const captions = [
            ['Ujung inti belum rata', 'Alat pemotong mendekat', 'Ujung delapan inti dipotong', 'Semua inti sudah sama panjang'],
            ['Arahkan inti ke belakang konektor', 'Dorong inti ke jalur RJ45', 'Pastikan inti mencapai ujung', 'Jaket kabel masuk ke pengunci'],
            ['Pasang RJ45 pada lubang tang', 'Tekan kedua gagang tang', 'Pin menjepit inti kabel', 'Buka tang: konektor terkunci'],
        ];
        for (let frame = 0; frame < 4; frame++) {
            if (revision !== stageRevision) return;
            setTerminateFrame(step * 4 + frame);
            document.querySelector('[data-frame-caption]').textContent = captions[step][frame];
            await new Promise((resolve) => window.setTimeout(resolve, reducedMotion.matches ? 180 : 550));
        }
        if (revision !== stageRevision) return;
        terminateStep++;
        if (terminateStep < 3) {
            renderTerminate();
            setFeedback('Langkah selesai. Lanjutkan pemasangan pada ujung ini.', 'success');
        } else if (terminateEnd === 0) {
            terminateEnd = 1;
            terminateStep = 0;
            openDialogue([{ speaker: 'teacher', text: 'Bagus, konektor Ujung A sudah terkunci. Sekarang lakukan langkah yang sama pada Ujung B. Pastikan susunan T568B tetap sama di kedua ujung.' }], renderTerminate);
            saveProgress();
        } else {
            setFeedback('Kedua konektor selesai dicrimp.', 'success');
            openDialogue([{ speaker: 'teacher', text: 'Rapi! Kedua konektor sudah terpasang. Sekarang kita periksa kabel dengan LAN tester. Hubungkan Ujung A ke MAIN dan Ujung B ke REMOTE, lalu perhatikan urutan lampu 1 sampai 8.' }], () => setStage('tester'));
        }
    });

    const renderTesterLeds = () => {
        document.querySelectorAll('[data-tester-leds]').forEach((container) => {
            container.replaceChildren(...Array.from({ length: 8 }, (_, index) => {
                const led = document.createElement('span');
                led.textContent = String(index + 1);
                return led;
            }));
        });
        document.querySelectorAll('[data-tester-hardware]').forEach((container) => {
            container.replaceChildren(...Array.from({ length: 8 }, (_, index) => {
                const led = document.createElement('i');
                led.dataset.testerHardwareLed = String(index + 1);
                led.setAttribute('aria-label', 'Indikator ' + (index + 1));
                return led;
            }));
        });
    };
    let selectedTesterEnd = null;
    let testerDragActive = false;
    const connectTesterEnd = (end, port) => {
        if (end !== port) {
            setFeedback('Ujung kabel tidak sesuai. Cocokkan Ujung A ke MAIN dan Ujung B ke REMOTE.', 'error');
            return;
        }
        if (end === 'main') testerMain = true;
        if (end === 'remote') testerRemote = true;
        selectedTesterEnd = null;
        document.querySelector('[data-tester-port="' + port + '"]').classList.add('is-connected');
        document.querySelector('[data-tester-port-state="' + port + '"]').textContent = 'UJUNG ' + (port === 'main' ? 'A' : 'B') + ' TERPASANG';
        document.querySelector('[data-tester-inserted="' + port + '"]').classList.add('is-visible');
        document.querySelector('[data-tester-path="' + port + '"]').classList.add('is-visible');
        const cableEnd = document.querySelector('[data-tester-end="' + end + '"]');
        cableEnd.classList.add('is-connected');
        cableEnd.setAttribute('aria-pressed', 'true');
        document.querySelector('[data-tester-power]').disabled = !(testerMain && testerRemote);
        saveProgress();
        setFeedback(testerMain && testerRemote ? 'Kedua konektor masuk ke port tester. Tekan Tes kabel.' : 'Konektor masuk ke port tester. Sekarang sambungkan ujung satunya.', 'success');
    };
    document.querySelectorAll('[data-tester-end]').forEach((endButton) => {
        endButton.addEventListener('dragstart', (event) => {
            testerDragActive = true;
            selectedTesterEnd = endButton.dataset.testerEnd;
            event.dataTransfer.setData('text/plain', selectedTesterEnd);
            event.dataTransfer.effectAllowed = 'move';
            endButton.classList.add('is-dragging');
        });
        endButton.addEventListener('dragend', () => {
            endButton.classList.remove('is-dragging');
            window.setTimeout(() => { testerDragActive = false; }, 0);
        });
        endButton.addEventListener('click', () => {
            if (testerDragActive || endButton.classList.contains('is-connected')) return;
            selectedTesterEnd = endButton.dataset.testerEnd;
            document.querySelectorAll('[data-tester-end]').forEach((button) => button.classList.toggle('is-selected', button === endButton));
            setFeedback('Ujung ' + (selectedTesterEnd === 'main' ? 'A' : 'B') + ' dipilih. Ketuk port ' + (selectedTesterEnd === 'main' ? 'MAIN' : 'REMOTE') + ' untuk memasangnya.');
        });
    });
    document.querySelectorAll('[data-tester-port]').forEach((portButton) => {
        portButton.addEventListener('dragover', (event) => { event.preventDefault(); portButton.classList.add('is-drop-target'); });
        portButton.addEventListener('dragleave', () => portButton.classList.remove('is-drop-target'));
        portButton.addEventListener('drop', (event) => {
            event.preventDefault();
            portButton.classList.remove('is-drop-target');
            connectTesterEnd(event.dataTransfer.getData('text/plain') || selectedTesterEnd, portButton.dataset.testerPort);
        });
        portButton.addEventListener('click', () => {
            if (selectedTesterEnd) connectTesterEnd(selectedTesterEnd, portButton.dataset.testerPort);
        });
    });
    const renderTesterState = () => {
        renderTesterLeds();
        document.querySelectorAll('[data-tester-end]').forEach((button) => {
            const end = button.dataset.testerEnd;
            const connected = end === 'main' ? testerMain : testerRemote;
            button.classList.toggle('is-connected', connected);
            button.setAttribute('aria-pressed', String(connected));
            document.querySelector('[data-tester-port-state="' + end + '"]').textContent = connected ? 'UJUNG ' + (end === 'main' ? 'A' : 'B') + ' TERPASANG' : 'LETAKKAN UJUNG ' + (end === 'main' ? 'A' : 'B');
            document.querySelector('[data-tester-port="' + end + '"]').classList.toggle('is-connected', connected);
            document.querySelector('[data-tester-inserted="' + end + '"]').classList.toggle('is-visible', connected);
            document.querySelector('[data-tester-path="' + end + '"]').classList.toggle('is-visible', connected);
        });
        const button = document.querySelector('[data-tester-power]');
        button.disabled = !(testerMain && testerRemote);
        button.textContent = testerPassed ? '↻ Tes ulang kabel' : '▶ Tes kabel';
        document.querySelector('[data-tester-result]').textContent = testerPassed ? 'LULUS · MAIN dan REMOTE menunjukkan urutan 1–8 yang sama.' : 'Hubungkan kedua ujung kabel, lalu tekan Tes kabel untuk memeriksa pin 1–8.';
        document.querySelector('.tester-layout').classList.toggle('is-testing', testerPassed);
        document.querySelectorAll('[data-tester-leds] span, [data-tester-hardware-led]').forEach((led) => led.classList.toggle('is-passed', testerPassed));
        if (testerPassed) showContinue('topology', 'Susun topologi →');
    };
    document.querySelector('[data-tester-power]').addEventListener('click', () => {
        if (testerInterval !== null || !testerMain || !testerRemote) return;
        const powerButton = document.querySelector('[data-tester-power]');
        const revision = stageRevision;
        const firstPass = !testerPassed;
        powerButton.disabled = true;
        powerButton.textContent = 'Menguji pin 1–8…';
        hideContinue();
        renderTesterLeds();
        document.querySelector('.tester-layout').classList.add('is-testing');
        const groups = ['[data-tester-leds="main"]', '[data-tester-leds="remote"]', '[data-tester-hardware="main"]', '[data-tester-hardware="remote"]'].map((selector) => [...document.querySelector(selector).children]);
        let pin = 0;
        const tick = () => {
            if (revision !== stageRevision) { window.clearInterval(testerInterval); testerInterval = null; return; }
            groups.forEach((leds) => leds.forEach((led) => led.classList.remove('is-on')));
            if (pin === 8) {
                window.clearInterval(testerInterval);
                testerInterval = null;
                testerPassed = true;
                groups.forEach((leds) => leds.forEach((led) => led.classList.add('is-passed')));
                powerButton.disabled = false;
                powerButton.textContent = '↻ Tes ulang kabel';
                document.querySelector('[data-tester-result]').textContent = 'LULUS · MAIN dan REMOTE menunjukkan urutan 1–8 yang sama.';
                setFeedback('Kabel straight lulus uji LAN tester!', 'success');
                showContinue('topology', 'Susun topologi →');
                if (firstPass) openDialogue([{ speaker: 'teacher', text: 'Kerja bagus! Lampu MAIN dan REMOTE menyala berurutan dari 1 sampai 8. Itu berarti sambungan setiap pin tersambung sesuai urutannya. Kabel straight siap kita gunakan untuk menghubungkan perangkat.' }]);
                return;
            }
            groups.forEach((leds) => leds[pin].classList.add('is-on'));
            document.querySelector('[data-tester-result]').textContent = 'Memeriksa pin ' + (pin + 1) + ' dari 8 · MAIN ↔ REMOTE';
            pin++;
        };
        tick();
        testerInterval = window.setInterval(tick, 420);
    });

    const cableLabels = { internet: 'Internet / ISP', switch: 'Port 1 hEX', pc: 'PC konfigurasi' };
    let selectedTopologyCable = null;
    const renderTopology = () => {
        document.querySelectorAll('[data-port]').forEach((input) => {
            const socket = document.querySelector('[data-topology-socket="' + input.dataset.port + '"]');
            socket.classList.toggle('is-connected', Boolean(input.value));
            socket.classList.remove('is-wrong');
            socket.setAttribute('aria-label', 'ether' + input.dataset.port + ': ' + (cableLabels[input.value] || 'Kosong'));
            document.querySelector('[data-port-label="' + input.dataset.port + '"]').textContent = cableLabels[input.value] || 'Kosong';
        });
        document.querySelectorAll('[data-topology-cable]').forEach((button) => {
            const port = [...document.querySelectorAll('[data-port]')].find((input) => input.value === button.dataset.topologyCable);
            button.classList.toggle('is-connected', Boolean(port));
            button.classList.toggle('is-selected', selectedTopologyCable === button.dataset.topologyCable);
            button.setAttribute('aria-pressed', String(selectedTopologyCable === button.dataset.topologyCable));
            button.querySelector('[data-cable-status]').textContent = port ? 'Terpasang di ether' + port.dataset.port : 'Seret ke port hAP';
        });
    };
    const attachTopologyCable = (cable, port) => {
        if (!cableLabels[cable]) return;
        document.querySelectorAll('[data-port]').forEach((input) => { if (input.value === cable) input.value = ''; });
        document.querySelector('[data-port="' + port + '"]').value = cable;
        selectedTopologyCable = null;
        renderTopology();
        setFeedback(cableLabels[cable] + ' terpasang di ether' + port + '. Periksa sambungan setelah semua kabel terpasang.');
    };
    document.querySelectorAll('[data-topology-cable]').forEach((button) => {
        button.addEventListener('dragstart', (event) => { selectedTopologyCable = button.dataset.topologyCable; event.dataTransfer.setData('text/plain', selectedTopologyCable); event.dataTransfer.effectAllowed = 'move'; });
        button.addEventListener('click', () => { selectedTopologyCable = button.dataset.topologyCable; renderTopology(); });
    });
    document.querySelectorAll('[data-topology-socket]').forEach((socket) => {
        socket.addEventListener('dragover', (event) => { event.preventDefault(); socket.classList.add('is-drop-target'); });
        socket.addEventListener('dragleave', () => socket.classList.remove('is-drop-target'));
        socket.addEventListener('drop', (event) => { event.preventDefault(); socket.classList.remove('is-drop-target'); attachTopologyCable(event.dataTransfer.getData('text/plain'), socket.dataset.topologySocket); });
        socket.addEventListener('click', () => {
            if (selectedTopologyCable) attachTopologyCable(selectedTopologyCable, socket.dataset.topologySocket);
            else { document.querySelector('[data-port="' + socket.dataset.topologySocket + '"]').value = ''; renderTopology(); saveProgress(); }
        });
    });
    document.querySelector('[data-check-topology]').addEventListener('click', () => {
        const incorrect = [...document.querySelectorAll('[data-port]')].filter((input) => input.value !== expectedPorts[input.dataset.port]);
        incorrect.forEach((input) => document.querySelector('[data-topology-socket="' + input.dataset.port + '"]').classList.add('is-wrong'));
        if (incorrect.length) {
            openDialogue([{ speaker: 'teacher', text: 'Mari periksa lagi. Kabel Internet masuk ke ether1, port 1 hEX dihubungkan ke ether2, dan PC konfigurasi ke ether3. Pilih kabel lalu pindahkan ke port yang sesuai. Pembagian ini memudahkan konfigurasi berikutnya.' }]);
            return;
        }
        openDialogue([{ speaker: 'teacher', text: 'Bagus! Internet, hEX, dan PC sudah terhubung ke port yang sesuai. Kita siap masuk ke PC. Tekan tombol daya, tunggu desktop muncul, lalu buka WinBox.' }], () => setStage('pc'));
    });

    const renderPcState = () => {
        document.querySelector('.pc-screen__off').hidden = pcPowered || pcBooting;
        document.querySelector('.pc-screen__boot').hidden = !pcBooting;
        document.querySelector('.pc-screen__desktop').hidden = !pcPowered;
        const powerButton = document.querySelector('[data-power-pc]');
        powerButton.disabled = pcBooting;
        powerButton.querySelector('span').textContent = pcBooting ? 'Menyalakan…' : pcPowered ? 'PC menyala' : 'Nyalakan PC';
    };
    document.querySelector('[data-power-pc]').addEventListener('click', async () => {
        if (pcBooting) return;
        if (pcPowered) { renderPcState(); return; }
        const revision = stageRevision;
        pcBooting = true;
        renderPcState();
        setFeedback('PC sedang menyala. Tunggu desktop muncul…');
        await new Promise((resolve) => window.setTimeout(resolve, reducedMotion.matches ? 200 : 1800));
        if (revision !== stageRevision) return;
        pcBooting = false;
        pcPowered = true;
        renderPcState();
        setFeedback('PC siap. Klik ikon WinBox pada desktop.', 'success');
    });
    document.querySelector('[data-open-winbox]').addEventListener('click', () => { if (pcPowered) setStage('winbox'); });

    document.querySelector('[data-refresh-neighbors]').addEventListener('click', (event) => {
        const refreshButton = event.currentTarget;
        const revision = stageRevision;
        refreshButton.disabled = true;
        document.querySelector('[data-neighbor-status]').textContent = 'Mencari perangkat pada jaringan lokal...';
        setSimulatorStatus('WinBox sedang memindai perangkat di jaringan lokal.');
        window.setTimeout(() => {
            refreshButton.disabled = false;
            if (revision !== stageRevision) return;
            neighborsLoaded = true;
            document.querySelector('[data-neighbor-row]').hidden = false;
            document.querySelector('[data-neighbor-status]').textContent = '1 perangkat ditemukan';
            setFeedback('Router ditemukan. Klik MAC Address pada baris perangkat.', 'success');
            setSimulatorStatus('hAP ditemukan. Pilih MAC Address untuk membuka dialog koneksi.');
        }, reducedMotion.matches ? 150 : 1000);
    });
    document.querySelector('[data-neighbor-row]').addEventListener('click', (event) => {
        if (!neighborsLoaded) return;
        macSelected = true;
        event.currentTarget.classList.add('is-selected');
        document.querySelector('[data-connect-to]').value = '48:A9:8A:1C:01:01';
        document.querySelector('[data-connect-dialog]').hidden = false;
        setFeedback('MAC Address terpilih. Periksa login lalu tekan Connect.', 'success');
        setSimulatorStatus('Periksa MAC Address, isi admin, lalu hubungkan router latihan.');
    });
    document.querySelector('[data-close-connect]').addEventListener('click', () => {
        document.querySelector('[data-connect-dialog]').hidden = true;
    });
    document.querySelector('[data-connect-winbox]').addEventListener('click', () => {
        if (!macSelected) {
            setFeedback('Refresh Neighbors lalu pilih MAC Address router terlebih dahulu.', 'error');
            return;
        }
        if (document.querySelector('[data-winbox-login]').value.trim() !== 'admin' || document.querySelector('[data-winbox-password]').value !== '') {
            setFeedback('Sesuai perangkat latihan pada modul: login admin, password kosong.', 'error');
            return;
        }
        setFeedback('WinBox terhubung ke router melalui MAC Address.', 'success');
        setSimulatorStatus('Router terhubung. Pak Amat akan mengarahkan konfigurasi awal.');
        const revision = stageRevision;
        window.setTimeout(() => { if (revision === stageRevision) setStage('config'); }, reducedMotion.matches ? 100 : 550);
    });

    let activeConfigPanel = 'home';
    let windowOrder = 5;
    const minimizedWindows = new Set();
    const windowTitles = { identity: 'Identity', interfaces: 'Interface List', edit: 'Interface' };
    const renderWindowTaskbar = () => {
        const taskbar = document.querySelector('[data-window-taskbar]');
        taskbar.replaceChildren(...[...minimizedWindows].map((name) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = windowTitles[name];
            button.setAttribute('aria-label', 'Pulihkan jendela ' + windowTitles[name]);
            button.addEventListener('click', () => showConfigPanel(name));
            return button;
        }));
    };
    const closeConfigWindow = (name, minimize = false) => {
        document.querySelector('[data-config-panel="' + name + '"]').hidden = true;
        if (!minimize && name === 'identity') document.querySelector('[data-identity-input]').value = identitySaved ? 'Router' : 'MikroTik';
        if (!minimize && name === 'edit' && editingInterface) document.querySelector('[data-interface-input]').value = document.querySelector('[data-interface-name="' + editingInterface + '"]').textContent;
        if (minimize) minimizedWindows.add(name);
        else minimizedWindows.delete(name);
        activeConfigPanel = 'home';
        renderWindowTaskbar();
        saveProgress();
    };
    const showConfigPanel = (panel) => {
        document.querySelector('[data-config-panel="home"]').hidden = false;
        document.querySelector('[data-config-panel="system"]').hidden = true;
        if (panel === 'system') {
            const submenu = document.querySelector('[data-config-nav="identity"]');
            submenu.hidden = !submenu.hidden;
            return;
        }
        if (windowTitles[panel]) {
            const target = document.querySelector('[data-config-panel="' + panel + '"]');
            target.hidden = false;
            target.style.zIndex = String(++windowOrder);
            minimizedWindows.delete(panel);
        }
        activeConfigPanel = panel;
        document.querySelectorAll('[data-config-nav]').forEach((button) => button.classList.toggle('is-active', button.dataset.configNav === panel));
        renderWindowTaskbar();
        saveProgress();
    };
    document.querySelector('[data-config-nav="identity"]').hidden = true;
    document.querySelectorAll('.winbox-child[data-config-panel]').forEach((windowNode) => {
        const name = windowNode.dataset.configPanel;
        const titlebar = windowNode.querySelector('header');
        const controls = titlebar.lastElementChild?.tagName === 'SPAN' && !titlebar.lastElementChild.hasAttribute('data-edit-title') ? titlebar.lastElementChild : document.createElement('span');
        controls.className = 'winbox-window-controls';
        controls.replaceChildren();
        [['minimize', '−', 'Minimalkan'], ['maximize', '□', 'Maksimalkan / pulihkan'], ['close', '×', 'Tutup']].forEach(([action, icon, label]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = icon;
            button.setAttribute('aria-label', label + ' ' + windowTitles[name]);
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                if (action === 'maximize') windowNode.classList.toggle('is-maximized');
                else closeConfigWindow(name, action === 'minimize');
            });
            controls.append(button);
        });
        titlebar.append(controls);
        windowNode.addEventListener('pointerdown', () => { windowNode.style.zIndex = String(++windowOrder); activeConfigPanel = name; });
        let drag = null;
        titlebar.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button') || windowNode.classList.contains('is-maximized')) return;
            const box = windowNode.getBoundingClientRect();
            const desktop = windowNode.parentElement.getBoundingClientRect();
            drag = { x: event.clientX, y: event.clientY, left: box.left - desktop.left, top: box.top - desktop.top };
            titlebar.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        titlebar.addEventListener('pointermove', (event) => {
            if (!drag) return;
            const desktop = windowNode.parentElement;
            const left = Math.max(0, Math.min(desktop.clientWidth - windowNode.offsetWidth, drag.left + event.clientX - drag.x));
            const top = Math.max(0, Math.min(desktop.clientHeight - windowNode.offsetHeight - 32, drag.top + event.clientY - drag.y));
            windowNode.style.left = left + 'px';
            windowNode.style.top = top + 'px';
        });
        titlebar.addEventListener('pointerup', () => { drag = null; });
        titlebar.addEventListener('pointercancel', () => { drag = null; });
        titlebar.addEventListener('lostpointercapture', () => { drag = null; });
        if (name !== 'interfaces') {
            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.textContent = 'Cancel';
            cancel.addEventListener('click', () => closeConfigWindow(name));
            windowNode.querySelector('.winbox-child__actions').append(cancel);
        }
    });
    document.querySelectorAll('.routeros, .winbox-window').forEach((app) => {
        const titlebar = app.querySelector(':scope > header');
        const controls = titlebar.lastElementChild;
        controls.className = 'winbox-window-controls';
        controls.replaceChildren();
        const launcher = document.createElement('button');
        launcher.type = 'button';
        launcher.className = 'winbox-reopen';
        launcher.hidden = true;
        const icon = document.createElement('img');
        icon.src = document.querySelector('[data-open-winbox] img').src;
        icon.alt = '';
        launcher.append(icon, 'Buka WinBox');
        app.before(launcher);
        launcher.addEventListener('click', () => { app.hidden = false; launcher.hidden = true; });
        [['−', 'Minimalkan WinBox'], ['×', 'Tutup WinBox']].forEach(([symbol, label]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = symbol;
            button.setAttribute('aria-label', label);
            button.addEventListener('click', () => { app.hidden = true; launcher.hidden = false; });
            controls.append(button);
        });
    });
    document.querySelectorAll('[data-config-nav]').forEach((button) => {
        button.addEventListener('click', () => showConfigPanel(button.dataset.configNav));
    });
    const teacherResponse = (text, onComplete = null) => openDialogue([{ speaker: 'teacher', text }], onComplete);
    const saveIdentity = (event) => {
        if (document.querySelector('[data-identity-input]').value.trim() !== 'Router') {
            setFeedback('Gunakan nama Router sesuai rancangan jaringan.', 'error');
            teacherResponse('Nama ini belum sesuai rancangan kita. Sebaiknya gunakan Router untuk perangkat utama. Nama yang konsisten memudahkan kita mengenali perangkat saat membuka WinBox dan melakukan konfigurasi jaringan. Coba ubah kolom Name menjadi Router, ya.');
            return;
        }
        identitySaved = true;
        document.querySelector('[data-router-identity]').textContent = 'Router';
        document.querySelector('[data-config-check="identity"]').classList.add('is-done');
        document.querySelector('[data-config-check="identity"]').textContent = '✓ Identity: Router';
        if (event.currentTarget.textContent === 'OK') closeConfigWindow('identity');
        setFeedback('Identity Router tersimpan. Buka Interfaces untuk menamai port.', 'success');
        updateConfigCompletion();
        if (Object.values(interfaceSaved).every(Boolean) && !configCelebrated) celebrateConfiguration();
        else teacherResponse('Bagus! Nama Router sudah tersimpan. Dengan nama ini, perangkat utama mudah dikenali. Selanjutnya buka Interfaces dan beri nama setiap port sesuai jalurnya.');
    };
    document.querySelectorAll('[data-save-identity]').forEach((button) => button.addEventListener('click', saveIdentity));
    document.querySelectorAll('[data-edit-interface]').forEach((button) => {
        button.addEventListener('click', () => {
            editingInterface = button.dataset.editInterface;
            document.querySelector('[data-edit-title]').textContent = 'Interface <' + editingInterface + '>';
            document.querySelector('[data-interface-input]').value = document.querySelector('[data-interface-name="' + editingInterface + '"]').textContent;
            showConfigPanel('edit');
            document.querySelector('[data-interface-input]').focus();
            saveProgress();
        });
    });
    const interfacePurposes = { ether1: 'jalur menuju Internet', ether2: 'jalur VLAN menuju hEX', ether3: 'jalur lokal menuju PC konfigurasi' };
    const saveInterface = (event) => {
        if (!editingInterface) return;
        const value = document.querySelector('[data-interface-input]').value.trim();
        const expected = expectedNames[editingInterface];
        if (value !== expected) {
            setFeedback('Saran nama: ' + expected, 'error');
            teacherResponse('Sebaiknya beri nama ' + expected + '. Port ' + editingInterface + ' kita gunakan sebagai ' + interfacePurposes[editingInterface] + '. Nama yang menjelaskan fungsi port akan memudahkan konfigurasi dan pemeriksaan jaringan nanti. Silakan sesuaikan kolom Name.');
            return;
        }
        interfaceSaved[editingInterface] = true;
        document.querySelector('[data-interface-name="' + editingInterface + '"]').textContent = value;
        document.querySelector('[data-config-check="' + editingInterface + '"]').classList.add('is-done');
        document.querySelector('[data-config-check="' + editingInterface + '"]').textContent = '✓ ' + value;
        if (event.currentTarget.textContent === 'OK') closeConfigWindow('edit');
        setFeedback(value + ' berhasil disimpan.', 'success');
        updateConfigCompletion();
        if (identitySaved && Object.values(interfaceSaved).every(Boolean) && !configCelebrated) celebrateConfiguration();
        else teacherResponse('Tepat! ' + value + ' sudah tersimpan. Sekarang fungsi port ini mudah dikenali. Periksa penamaan port yang lain sampai semua sesuai rancangan.');
    };
    document.querySelectorAll('[data-save-interface]').forEach((button) => button.addEventListener('click', saveInterface));
    document.querySelector('[data-quiz-form]').addEventListener('change', saveProgress);
    document.querySelector('[data-identity-input]').addEventListener('input', saveProgress);
    document.querySelector('[data-interface-input]').addEventListener('input', saveProgress);
    function updateConfigCompletion() {
        if (identitySaved && Object.values(interfaceSaved).every(Boolean)) {
            teacherText.textContent = 'Semua konfigurasi awal selesai. Kerja bagus!';
            showContinue('quiz', 'Kerjakan evaluasi →');
        }
    }
    function celebrateConfiguration() {
        openDialogue([
            { speaker: 'teacher', text: 'Hebat! Kamu sudah menyelesaikan seluruh praktik Chapter 1. Kabel straight lulus uji, perangkat tersambung pada port yang benar, dan WinBox berhasil dipakai untuk mengatur nama router serta interface.' },
            { speaker: 'teacher', text: 'Bapak bangga dengan ketelitianmu. Fondasi jaringan sekolah sudah siap. Sekarang kita lanjut ke evaluasi untuk memastikan kamu memahami alasan di balik setiap langkah tadi. Klik Kerjakan evaluasi saat kamu siap.' },
        ], () => { configCelebrated = true; updateConfigCompletion(); saveProgress(); });
    }

    document.querySelector('[data-quiz-form]').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const answers = Array.from({ length: 5 }, (_, index) => form.querySelector('input[name="answer-' + (index + 1) + '"]:checked'));
        if (answers.some((answer) => !answer)) {
            setFeedback('Jawab semua lima soal sebelum menyimpan hasil.', 'error');
            return;
        }
        const submit = document.querySelector('[data-submit-quiz]');
        submit.disabled = true;
        submit.textContent = 'Menyimpan hasil...';
        try {
            const response = await fetch(scene.dataset.completeUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ answers: answers.map((answer) => Number(answer.value)) }),
            });
            const result = await response.json();
            if (!response.ok) {
                setFeedback(result.score === undefined ? (result.message || 'Hasil belum dapat disimpan. Coba lagi.') : result.message + ' Nilai: ' + result.score + '/5.', 'error');
                return;
            }
            setStage('finish');
        } catch {
            setFeedback('Koneksi terputus. Coba simpan hasil sekali lagi.', 'error');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Simpan hasil Chapter 1';
        }
    });

    const restoreProgress = () => {
        if (!savedProgress) {
            synopsisIndex = 0;
            renderSynopsisScene();
            setStage('story');
            return;
        }

        synopsisIndex = Math.max(0, Math.min(synopsisScenes.length, Number(savedProgress.synopsisIndex) || 0));
        elapsed = Math.max(0, Number(savedProgress.elapsed) || 0);
        if (savedProgress.stage === 'story') {
            scene.classList.add('is-prologue');
            prologue.hidden = false;
            if (savedProgress.openingDialogue) {
                synopsis.hidden = true;
                openDialogue(openingDialogue, () => {
                    scene.classList.remove('is-prologue');
                    shownMissionDialogue.add('devices');
                    setStage('devices');
                });
            } else {
                synopsis.hidden = false;
                renderSynopsisScene();
            }
            return;
        }

        if (Array.isArray(savedProgress.visitedDevices)) {
            savedProgress.visitedDevices.forEach((device) => {
                if (deviceInfo[device]) visitedDevices.add(device);
            });
        }
        prepStep = Math.max(0, Math.min(3, Number(savedProgress.prepStep) || 0));
        wireEnd = savedProgress.wireEnd === 1 ? 1 : 0;
        if (Array.isArray(savedProgress.wirePlacements)) {
            savedProgress.wirePlacements.slice(0, 2).forEach((placements, end) => {
                if (!Array.isArray(placements)) return;
                wirePlacements[end] = Array.from({ length: 8 }, (_, index) => {
                    const color = placements[index];
                    return colors.some((entry) => entry.id === color) ? color : null;
                });
            });
        }
        terminateEnd = savedProgress.terminateEnd === 1 ? 1 : 0;
        terminateStep = Math.max(0, Math.min(3, Number(savedProgress.terminateStep) || 0));
        testerMain = Boolean(savedProgress.testerMain);
        testerRemote = Boolean(savedProgress.testerRemote);
        testerPassed = Boolean(savedProgress.testerPassed);
        pcPowered = Boolean(savedProgress.pcPowered);
        configCelebrated = Boolean(savedProgress.configCelebrated);
        neighborsLoaded = Boolean(savedProgress.neighborsLoaded);
        macSelected = Boolean(savedProgress.macSelected);
        identitySaved = Boolean(savedProgress.identitySaved);
        interfaceSaved.ether1 = Boolean(savedProgress.interfaceSaved?.ether1);
        interfaceSaved.ether2 = Boolean(savedProgress.interfaceSaved?.ether2);
        interfaceSaved.ether3 = Boolean(savedProgress.interfaceSaved?.ether3);
        editingInterface = ['ether1', 'ether2', 'ether3'].includes(savedProgress.editingInterface) ? savedProgress.editingInterface : null;

        if (savedProgress.stage === 'terminate' && terminateStep >= 3) {
            if (terminateEnd === 1) {
                savedProgress.stage = 'tester';
                terminateStep = 0;
            } else {
                terminateEnd = 1;
                terminateStep = 0;
            }
        }

        document.querySelectorAll('[data-port]').forEach((port) => {
            port.value = savedProgress.portSelections?.[port.dataset.port] || '';
        });
        document.querySelector('[data-identity-input]').value = savedProgress.identityInput || '';
        document.querySelector('[data-interface-input]').value = savedProgress.interfaceInput || '';
        Object.entries(savedProgress.interfaceNames || {}).forEach(([name, value]) => {
            const nameNode = document.querySelector('[data-interface-name="' + name + '"]');
            if (nameNode && ['ether1', 'ether2', 'ether3'].includes(name)) nameNode.textContent = value;
        });
        (savedProgress.quizAnswers || []).forEach((answer, index) => {
            if (answer === null || answer === undefined) return;
            const option = document.querySelector('[data-quiz-form] input[name="answer-' + (index + 1) + '"][value="' + answer + '"]');
            if (option) option.checked = true;
        });

        scene.classList.remove('is-prologue');
        prologue.hidden = true;
        synopsis.hidden = true;
        dialogue.hidden = true;
        shownMissionDialogue.add(savedProgress.stage);
        setStage(savedProgress.stage);

        if (savedProgress.stage === 'devices') {
            document.querySelectorAll('[data-device]').forEach((button) => {
                button.classList.toggle('is-visited', visitedDevices.has(button.dataset.device));
                button.classList.toggle('is-selected', button.dataset.device === savedProgress.selectedDevice);
            });
            if (visitedDevices.size === 7) showContinue('lesson-briefing', 'Lanjutkan misi →');
        }
        if (savedProgress.stage === 'prep') {
            document.querySelectorAll('[data-prep-action]').forEach((button, index) => {
                button.classList.toggle('is-done', index < prepStep);
                button.disabled = index < prepStep;
            });
            document.querySelectorAll('[data-prep-step]').forEach((step, index) => step.classList.toggle('is-done', index < prepStep));
            const prepWorkbench = document.querySelector('[data-prep-workbench]');
            const prepPhase = ['coil', 'cut', 'stripped', 'sorted'][prepStep];
            prepWorkbench.dataset.phase = prepPhase;
            const prepTitles = ['Kabel masih tergulung', 'Kabel dipotong sesuai kebutuhan', 'Alat kupas membuka jaket luar', 'Delapan inti sudah lurus dan siap disusun'];
            const prepNotes = ['Potong kabel sesuai panjang yang dibutuhkan.', 'Panjang kabel sudah siap. Berikutnya kupas jaket luar secukupnya.', 'Jaket terbuka tanpa melukai delapan inti kabel.', 'Lanjutkan ke puzzle warna T568B.'];
            prepWorkbench.querySelector('[data-prep-visual-title]').textContent = prepTitles[prepStep];
            prepWorkbench.querySelector('[data-prep-visual-note]').textContent = prepNotes[prepStep];

        }
        if (savedProgress.stage === 'tester') {
            document.querySelectorAll('[data-tester-end]').forEach((button) => {
                const end = button.dataset.testerEnd;
                const isConnected = end === 'main' ? testerMain : testerRemote;
                button.classList.toggle('is-connected', isConnected);
                button.setAttribute('aria-pressed', String(isConnected));
                if (isConnected) {
                    document.querySelector('[data-tester-port="' + end + '"]').classList.add('is-connected');
                    document.querySelector('[data-tester-port-state="' + end + '"]').textContent = 'UJUNG ' + (end === 'main' ? 'A' : 'B') + ' TERPASANG';
                    document.querySelector('[data-tester-inserted="' + end + '"]').classList.add('is-visible');
                    document.querySelector('[data-tester-path="' + end + '"]').classList.add('is-visible');
                }
            });
            const powerButton = document.querySelector('[data-tester-power]');
            powerButton.disabled = !(testerMain && testerRemote);
            if (testerPassed) {
                document.querySelector('.tester-layout').classList.add('is-testing');
                document.querySelectorAll('[data-tester-leds] span').forEach((led) => led.classList.add('is-passed'));
                document.querySelectorAll('[data-tester-hardware-led]').forEach((led) => led.classList.add('is-passed'));
                document.querySelector('[data-tester-result]').textContent = 'LULUS · MAIN dan REMOTE menunjukkan urutan 1–8 yang sama. Kabel straight siap digunakan.';
                showContinue('topology', 'Susun topologi →');
            }
        }
        if (savedProgress.stage === 'pc' && pcPowered) {
            document.querySelector('.pc-screen__off').hidden = true;
            document.querySelector('.pc-screen__boot').hidden = true;
            document.querySelector('.pc-screen__desktop').hidden = false;
            renderPcState();
        }
        if (savedProgress.stage === 'winbox') {
            const neighborRow = document.querySelector('[data-neighbor-row]');
            neighborRow.hidden = !neighborsLoaded;
            document.querySelector('[data-neighbor-status]').textContent = neighborsLoaded ? '1 perangkat ditemukan' : 'Tekan Refresh untuk mencari router hAP di jaringan lokal.';
            if (macSelected) {
                neighborRow.classList.add('is-selected');
                document.querySelector('[data-connect-to]').value = '48:A9:8A:1C:01:01';
                document.querySelector('[data-connect-dialog]').hidden = false;
            }
        }
        if (savedProgress.stage === 'config') {
            document.querySelector('[data-router-identity]').textContent = identitySaved ? 'Router' : 'MikroTik';
            const identityCheck = document.querySelector('[data-config-check="identity"]');
            identityCheck.classList.toggle('is-done', identitySaved);
            identityCheck.textContent = identitySaved ? '✓ Identity: Router' : '○ Identity: Router';
            Object.entries(interfaceSaved).forEach(([name, isSaved]) => {
                const check = document.querySelector('[data-config-check="' + name + '"]');
                check.classList.toggle('is-done', isSaved);
                check.textContent = isSaved ? '✓ ' + expectedNames[name] : '○ ' + expectedNames[name];
            });
            if (editingInterface) {
                document.querySelector('[data-edit-title]').textContent = 'Edit Interface ' + editingInterface;
            }
            showConfigPanel(savedProgress.configPanel || 'identity');
            updateConfigCompletion();
        }

        saveProgress();
    };

    window.setInterval(() => {
        if (document.visibilityState === 'hidden' || stage === 'finish') return;
        elapsed++;
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        document.querySelector('[data-time]').textContent = minutes + ':' + seconds;
        if (elapsed % 10 === 0) saveProgress();
    }, 1000);

    restoreProgress();
})();
