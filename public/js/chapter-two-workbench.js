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
    const learningDialog = document.querySelector('[data-learning-dialog]');
    const quizDialog = document.querySelector('[data-quiz-dialog]');
    const finishDialog = document.querySelector('[data-finish-dialog]');
    const persistedFields = [...document.querySelectorAll('.ch2-window input:not([readonly]), .ch2-window select')];
    let topLayer = 10;
    let editingVlan = null;
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
        identity: chapterOne.identitySaved ? 'Router' : (chapterOne.identityInput || 'Router'),
        interfaces: {
            ether1: chapterOne.interfaceNames?.ether1 || 'ether1-internet',
            ether2: chapterOne.interfaceNames?.ether2 || 'ether2-vlan',
            ether3: chapterOne.interfaceNames?.ether3 || 'ether3-local',
        },
        vlan: { student: false, teacher: false }, wan: false,
        addresses: { local: false, student: false, teacher: false, wireless: false },
        pools: { student: '', teacher: '' }, clients: { student: false, teacher: false },
    };
    const state = { ...defaults, ...saved,
        interfaces: { ...defaults.interfaces, ...saved?.interfaces },
        vlan: { ...defaults.vlan, ...saved?.vlan },
        addresses: { ...defaults.addresses, ...saved?.addresses },
        pools: { ...defaults.pools, ...saved?.pools },
        clients: { ...defaults.clients, ...saved?.clients },
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
        dialogueCount.textContent = `${dialogueIndex + 1} / ${dialogueLines.length} · KLIK UNTUK LANJUT`;
    };
    const openDialogue = (lines, onContinue) => {
        dialogueLines = lines;
        dialogueIndex = 0;
        dialogueContinue = onContinue;
        dialogue.hidden = false;
        paintDialogueLine();
        dialogue.classList.add('is-speaking');
    };
    const continueDialogue = () => {
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
        const next = dialogueContinue;
        dialogueContinue = null;
        next?.();
    };
    dialogueNext.addEventListener('click', continueDialogue);
    dialogueNext.addEventListener('keydown', (event) => {
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
    const normal = (value) => value.trim().toLowerCase().replaceAll(' ', '');
    const completeVlan = () => state.vlan.student && state.vlan.teacher;
    const completeAddresses = () => Object.values(state.addresses).every(Boolean);
    const completePools = () => Boolean(state.pools.student && state.pools.teacher);
    const completeClients = () => state.clients.student && state.clients.teacher;
    const progressCount = () => [completeVlan(), state.wan, completeAddresses(), completePools(), completeClients()].filter(Boolean).length;
    const isCurrentTaskDone = () => ({ vlan: completeVlan(), wan: state.wan, addresses: completeAddresses(), dhcp: completePools(), verify: completeClients() })[state.stage] || false;

    const stageInformation = {
        intro: ['LANJUTAN CHAPTER 01 · PAK AMAT', 'Router sudah siap. Sekarang kita buat VLAN.', 'Sesi WinBox dari Chapter 1 masih terbuka. Pelajari dahulu apa itu VLAN sebelum menambahkannya pada router.', 'Pelajari VLAN →'],
        vlan: ['MISI 01 / 05 · INTERFACES → VLAN', 'Buat VLAN siswa dan guru', 'Di Interfaces → VLAN, buat vlan1-siswa ID 10 dan vlan2-guru ID 20. Keduanya menggunakan ether2-vlan sebagai interface induk.', 'Buka Interfaces → VLAN'],
        wan: ['MISI 02 / 05 · IP → DHCP CLIENT', 'Minta konfigurasi WAN dari ISP', 'Router menjadi DHCP Client pada ether1-internet. Pilih interface yang mengarah ke penyedia lalu periksa status bound.', 'Buka DHCP Client'],
        addresses: ['MISI 03 / 05 · IP → ADDRESSES', 'Pasangkan IP gateway pada interface', 'Tambahkan empat alamat gateway sesuai lembar skenario. Siswa dan guru harus berada pada subnet berbeda.', 'Buka IP → Addresses'],
        dhcp: ['MISI 04 / 05 · IP → DHCP SERVER', 'Bagikan alamat pada kedua VLAN', 'Jalankan DHCP Setup untuk siswa dan guru. Pool yang dibagikan harus satu subnet dengan gateway masing-masing.', 'Buka DHCP Server'],
        verify: ['MISI 05 / 05 · PENGUJIAN', 'Periksa IP yang diterima klien', 'Minta alamat pada PC siswa dan PC guru, lalu bandingkan subnet dan gateway keduanya.', 'Buka Leases / Klien'],
        quiz: ['EVALUASI CHAPTER 02', 'Konfigurasi sudah selesai. Uji pemahamanmu.', 'Kamu sudah menyiapkan VLAN, IP gateway, DHCP Client, dan DHCP Server. Jawab lima soal untuk menyimpan hasil Chapter 2 ke akun.', 'Buka evaluasi →'],
        finish: ['CHAPTER 02 SELESAI', 'Bagus! Jaringan sekolah sudah terbagi rapi.', 'Hasil evaluasi tersimpan di akun. Seluruh menu WinBox yang sudah dibuka tetap bisa kamu periksa kembali.', 'Lihat apresiasi →'],
    };
    const guideInformation = {
        intro: ['Dengarkan arahan Pak Amat.', 'Pelajari pengertian dan topologi VLAN.', 'Klik lanjut untuk mulai praktik di WinBox.'],
        vlan: ['Buka Interfaces → VLAN.', 'Buat vlan1-siswa · ID 10.', 'Buat vlan2-guru · ID 20.'],
        wan: ['Buka IP → DHCP Client.', 'Pilih ether1-internet.', 'Simpan dan pastikan status bound.'],
        addresses: ['Buka IP → Addresses.', 'Pilih interface sesuai skenario.', 'Pasang empat alamat gateway /24.'],
        dhcp: ['Buka IP → DHCP Server.', 'Jalankan setup untuk VLAN siswa.', 'Ulangi untuk VLAN guru.'],
        verify: ['Buka Leases / Klien.', 'Minta IP untuk PC siswa.', 'Ulangi dan cocokkan subnet PC guru.'],
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
    const unlockStage = { vlan: 'vlan', wan: 'wan', addresses: 'addresses', dhcp: 'dhcp', clients: 'verify' };
    const canOpen = (name) => !unlockStage[name] || state.highest >= stages.indexOf(unlockStage[name]);

    const renderTask = () => {
        const done = isCurrentTaskDone();
        const result = done ? finishedInformation[state.stage] : null;
        document.querySelector('[data-guide-list]').replaceChildren(...guideInformation[state.stage].map((step) => {
            const item = document.createElement('li');
            item.textContent = step;
            return item;
        }));
        document.querySelectorAll('[data-previous]').forEach((button) => { button.hidden = state.stage === 'intro'; });
        const progress = progressCount();
        document.querySelector('[data-progress-label]').textContent = `${progress} / 5`;
        document.querySelector('[data-progress]').value = progress;
        document.querySelectorAll('[data-unlock]').forEach((button) => {
            button.disabled = !canOpen(button.dataset.openWindow);
            button.title = button.disabled ? 'Terbuka setelah arahan Pak Amat pada misi ini' : '';
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
            const prefix = group === 'student' ? 40 : 60;
            const host = Number(state.pools[group].match(/^192\.168\.\d+\.(\d+)/)?.[1] || 10);
            document.querySelector(`[data-client-ip="${group}"]`).textContent = state.clients[group] ? `192.168.${prefix}.${host}` : 'Belum mendapat IP';
            document.querySelector(`[data-client="${group}"]`).classList.toggle('is-connected', state.clients[group]);
            document.querySelector(`[data-request-ip="${group}"]`).textContent = state.clients[group] ? 'Perbarui alamat' : 'Minta alamat';
        }
        document.querySelector('[data-vlan-empty]').hidden = completeVlan() || state.vlan.student || state.vlan.teacher;
        document.querySelector('[data-vlan-count]').textContent = `${Number(state.vlan.student) + Number(state.vlan.teacher)} items`;
        for (const key of Object.keys(state.addresses)) document.querySelector(`[data-address-row="${key}"]`).hidden = !state.addresses[key];
        document.querySelector('[data-address-count]').textContent = `${Object.values(state.addresses).filter(Boolean).length} items`;
        document.querySelector('[data-pool-count]').textContent = `${Number(Boolean(state.pools.student)) + Number(Boolean(state.pools.teacher))} items`;
        document.querySelector('[data-wan-status]').textContent = state.wan ? 'bound · alamat WAN diterima' : 'belum terhubung';
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
    const focusWindow = (name) => { windows.get(name).style.zIndex = String(++topLayer); };
    const openWindow = (name) => {
        if (!canOpen(name)) return message('Ikuti dulu langkah Pak Amat untuk membuka menu ini.', 'error');
        const node = windows.get(name);
        if (!node) return;
        node.hidden = false;
        removeTaskbarButton(name);
        focusWindow(name);
        node.querySelector('input:not([readonly]),select,button')?.focus({ preventScroll: true });
    };
    const closeWindow = (name) => { windows.get(name).hidden = true; removeTaskbarButton(name); };
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

    document.querySelectorAll('[data-open-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.openWindow)));
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeWindow(button.dataset.close)));
    document.querySelectorAll('[data-minimize]').forEach((button) => button.addEventListener('click', () => minimizeWindow(button.dataset.minimize)));
    windows.forEach((node, name) => {
        node.addEventListener('pointerdown', () => focusWindow(name));
        const header = node.querySelector('header');
        header.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button')) return;
            const startX = event.clientX; const startY = event.clientY;
            const currentLeft = node.offsetLeft; const currentTop = node.offsetTop;
            header.setPointerCapture(event.pointerId);
            const move = (moveEvent) => {
                const bounds = node.parentElement.getBoundingClientRect();
                node.style.left = `${Math.max(0, Math.min(bounds.width - 110, currentLeft + moveEvent.clientX - startX))}px`;
                node.style.top = `${Math.max(0, Math.min(bounds.height - 45, currentTop + moveEvent.clientY - startY))}px`;
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

    document.querySelectorAll('[data-new-vlan]').forEach((button) => button.addEventListener('click', () => {
        editingVlan = button.dataset.newVlan === 'auto'
            ? (state.vlan.student ? 'teacher' : 'student')
            : button.dataset.newVlan;
        if (state.vlan[editingVlan]) return;
        document.querySelector('[data-vlan-name]').value = editingVlan === 'student' ? 'vlan1-siswa' : 'vlan2-guru';
        document.querySelector('[data-vlan-id]').value = editingVlan === 'student' ? '10' : '20';
        document.querySelector('[data-vlan-parent]').value = '';
        openWindow('vlan-edit');
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
    document.querySelector('[data-save-address]').addEventListener('click', () => {
        const iface = document.querySelector('[data-address-interface]').value;
        const expected = addresses[iface];
        const entered = normal(document.querySelector('[data-address-input]').value);
        if (!expected || entered !== expected[1]) return message('Alamat atau interface belum cocok. Periksa lembar skenario; gateway harus berada pada segmen yang benar dan memakai /24.', 'error');
        state.addresses[expected[0]] = true;
        document.querySelector('[data-address-input]').value = '';
        document.querySelector('[data-address-interface]').value = '';
        persist(); render();
        message(completeAddresses() ? 'Empat gateway benar. Selanjutnya konfigurasi DHCP Server.' : `${iface} mendapat ${expected[1]}. Tambahkan alamat interface berikutnya.`, 'success');
    });
    const validPool = (value, subnet) => {
        const match = normal(value).match(/^192\.168\.(\d{1,3})\.(\d{1,3})-192\.168\.(\d{1,3})\.(\d{1,3})$/);
        if (!match) return false;
        const firstSubnet = Number(match[1]); const firstHost = Number(match[2]); const lastSubnet = Number(match[3]); const lastHost = Number(match[4]);
        return firstSubnet === subnet && lastSubnet === subnet && firstHost >= 2 && lastHost <= 254 && lastHost > firstHost;
    };
    document.querySelector('[data-save-pool]').addEventListener('click', () => {
        const iface = document.querySelector('[data-pool-interface]').value;
        const group = iface === 'vlan1-siswa' ? 'student' : iface === 'vlan2-guru' ? 'teacher' : null;
        const range = normal(document.querySelector('[data-pool-range]').value);
        if (!group || !validPool(range, group === 'student' ? 40 : 60)) return message('Pool harus berada di subnet VLAN yang dipilih. Siswa 192.168.40.x, guru 192.168.60.x; jangan bagikan gateway .1.', 'error');
        state.pools[group] = range;
        document.querySelector('[data-pool-interface]').value = '';
        document.querySelector('[data-pool-range]').value = '';
        persist(); render();
        message(completePools() ? 'DHCP Server siswa dan guru siap. Sekarang uji klien.' : `DHCP Setup ${iface} selesai. Tambahkan VLAN berikutnya.`, 'success');
    });
    document.querySelectorAll('[data-request-ip]').forEach((button) => button.addEventListener('click', () => {
        const group = button.dataset.requestIp;
        const card = document.querySelector(`[data-client="${group}"]`);
        card.classList.add('is-requesting'); button.disabled = true;
        window.setTimeout(() => {
            state.clients[group] = true; card.classList.remove('is-requesting'); button.disabled = false;
            persist(); render();
            message(completeClients() ? 'PC siswa dan guru menerima alamat serta gateway yang sesuai. Buka rekap dari arahan Pak Amat.' : `PC ${group === 'student' ? 'siswa' : 'guru'} mendapat alamat dari VLAN yang benar. Uji PC berikutnya.`, 'success');
        }, 650);
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
        if (selections.some((selection) => !selection)) return message('Jawab kelima soal dahulu.', 'error');
        const submit = document.querySelector('[data-submit-quiz]');
        submit.disabled = true;
        try {
            const response = await fetch(scene.dataset.completeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, body: JSON.stringify({ answers: selections.map((item) => Number(item.value)) }) });
            const result = await response.json();
            if (!response.ok) return message(result.message || 'Jawaban belum tepat. Pelajari kembali materi dan coba lagi.', 'error');
            scene.dataset.completed = 'true'; quizDialog.close(); setStage('finish'); finishDialog.showModal();
            message('Hebat! Chapter 2 selesai dan progres tersimpan di akun.', 'success');
        } catch { message('Hasil belum tersimpan. Periksa koneksi lalu coba lagi.', 'error'); }
        finally { submit.disabled = false; }
    });

    restoreDrafts(); render();
    if (state.stage === 'intro' && !isCurrentTaskDone()) {
        openDialogue([
            'Di Chapter sebelumnya kamu sudah menyiapkan perangkat dan menghubungkan router. Sekarang kita lanjut mengatur jaringan sekolah.',
            'Kita akan memisahkan jaringan siswa dan guru supaya perangkat dari tiap kelompok berada pada segmen yang tepat.',
            'Sebelum praktik, pelajari dulu apa itu VLAN dan bagaimana topologi jaringan kita akan bekerja.',
        ], mainAction);
    } else if (!isCurrentTaskDone()) {
        const [, title, text] = stageInformation[state.stage];
        openDialogue([`${title} ${text}`], mainAction);
    }
    if (state.stage === 'finish' && completionOnServer) message('Chapter 2 sudah selesai. Kamu tetap bisa meninjau WinBox dan menu konfigurasinya.', 'success');
})();
