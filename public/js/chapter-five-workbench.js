(() => {
    'use strict';

    const scene = document.querySelector('.ch5-scene');
    if (!scene) return;

    const studentId = scene.dataset.userId;
    const storageKey = 'netguard.chapter-five.v1.' + studentId;
    const chapterOneKey = 'netguard.chapter-one.v1.' + studentId;
    const chapterTwoKey = 'netguard.chapter-two.v2.' + studentId;
    const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
    const chapterOne = read(chapterOneKey) || {};
    const chapterTwo = read(chapterTwoKey) || {};
    const upstreamInterface = chapterTwo.interfaces?.ether2 || chapterOne.interfaceNames?.ether2 || 'ether2-vlan';
    document.querySelectorAll('[data-upstream-interface], [data-reference-uplink]').forEach((node) => { node.textContent = upstreamInterface; });

    const defaultState = {
        stage: 'bridge',
        prologueComplete: false,
        bridge: null,
        ports: { trunk: null, student: null, teacher: null },
        vlans: { student: null, teacher: null },
        tests: { student: { ipconfig: false, ping: false }, teacher: { ipconfig: false, ping: false } },
        activeClient: 'student',
        answers: [],
    };
    const saved = read(storageKey) || {};
    const state = {
        ...defaultState,
        ...saved,
        ports: { ...defaultState.ports, ...saved.ports },
        vlans: { ...defaultState.vlans, ...saved.vlans },
        tests: {
            student: { ...defaultState.tests.student, ...saved.tests?.student },
            teacher: { ...defaultState.tests.teacher, ...saved.tests?.teacher },
        },
    };
    const stages = ['bridge', 'ports', 'vlans', 'filtering', 'test', 'quiz', 'finish'];
    if (!stages.includes(state.stage)) state.stage = 'bridge';
    const bridgeWindow = document.querySelector('[data-window="bridge"]');
    const bridgeEditor = document.querySelector('[data-window="bridge-edit"]');
    const portEditor = document.querySelector('[data-window="port-edit"]');
    const vlanEditor = document.querySelector('[data-window="vlan-edit"]');
    const clientWorkspace = document.querySelector('[data-client-workspace]');
    const clientTerminal = document.querySelector('[data-client-terminal]');
    const quiz = document.querySelector('[data-quiz-dialog]');
    const finish = document.querySelector('[data-finish-dialog]');
    const learning = document.querySelector('[data-learning-dialog]');
    const prologue = document.querySelector('[data-ch5-prologue]');
    const dialogue = document.querySelector('[data-ch5-dialogue]');
    const surface = scene.querySelector('.lab-scroll');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const expectedPorts = [
        { key: 'trunk', interface: 'ether1', pvid: 1, frame: 'admit-only-vlan-tagged', role: 'port trunk dari router' },
        { key: 'student', interface: 'ether2', pvid: 10, frame: 'admit-only-untagged-and-priority-tagged', role: 'port access PC siswa' },
        { key: 'teacher', interface: 'ether3', pvid: 20, frame: 'admit-only-untagged-and-priority-tagged', role: 'port access PC guru' },
    ];
    const expectedVlans = [
        { key: 'student', id: 10, port: 'ether2', label: 'VLAN siswa' },
        { key: 'teacher', id: 20, port: 'ether3', label: 'VLAN guru' },
    ];
    const portValid = (key) => {
        const target = expectedPorts.find((item) => item.key === key);
        const item = state.ports[key];
        return Boolean(item && item.bridge === 'bridge1' && item.interface === target.interface && Number(item.pvid) === target.pvid && item.ingress && item.frame === target.frame);
    };
    const vlanValid = (key) => {
        const target = expectedVlans.find((item) => item.key === key);
        const item = state.vlans[key];
        return Boolean(item && item.bridge === 'bridge1' && Number(item.id) === target.id && item.tagged === 'ether1' && item.untagged === target.port);
    };
    const bridgeValid = () => Boolean(state.bridge?.name === 'bridge1' && state.bridge.protocol === 'rstp');
    const bridgeCreatedWithoutFiltering = () => bridgeValid() && !state.bridge.filtering;
    const portsValid = () => expectedPorts.every(({ key }) => portValid(key));
    const vlansValid = () => expectedVlans.every(({ key }) => vlanValid(key));
    const filteringValid = () => Boolean(state.bridge?.name === 'bridge1' && state.bridge.filtering && portsValid() && vlansValid());
    const clientPoolAddress = (key) => {
        const rawPool = String(chapterTwo.pools?.[key === 'student' ? 'student' : 'teacher'] || '');
        const firstPool = rawPool.split(',')[0].split('-')[0].trim();
        return /^\d{1,3}(\.\d{1,3}){3}$/.test(firstPool) ? firstPool : null;
    };
    const upstreamValid = (key) => {
        const group = key === 'student' ? 'student' : 'teacher';
        const requiredPrefix = key === 'student' ? '192.168.40.' : '192.168.60.';
        return Boolean(chapterTwo.vlan?.[group] && chapterTwo.addresses?.[group] && clientPoolAddress(key)?.startsWith(requiredPrefix) && !chapterTwo.dhcpDisabled?.[group]);
    };
    const endpointReady = (key) => Boolean(filteringValid() && portValid(key) && vlanValid(key) && upstreamValid(key));
    const allTestsComplete = () => ['student', 'teacher'].every((key) => endpointReady(key) && state.tests[key].ipconfig && state.tests[key].ping);
    const progressCount = () => [bridgeValid(), portsValid(), vlansValid(), filteringValid(), allTestsComplete()].filter(Boolean).length;
    let activeEditor = null;
    let portDraftRole = null;
    let vlanDraftKey = null;
    let bridgeEditMode = 'create';
    let bridgeTab = ['Bridges', 'Ports', 'VLANs', 'MSTIs', 'Filters', 'NAT', 'Hosts', 'MDB'].includes(state.activeBridgeTab) ? state.activeBridgeTab : 'Bridges';
    let currentClient = state.tests.student.ipconfig && state.tests.student.ping && state.activeClient === 'teacher' ? 'teacher' : 'student';
    let prologueIndex = 0;
    let prologueTimer = null;
    let prologueTyping = false;
    let prologueFullStory = null;
    let dialogueTimer = null;
    let dialogueLines = [];
    let dialogueIndex = 0;
    let dialogueTyping = false;
    let terminalRevision = 0;
    let topLayer = 30;

    const persist = () => {
        try {
            state.answers = [...document.querySelectorAll('[data-quiz-form] input:checked')].map((input) => Number(input.value));
            state.activeClient = currentClient;
            localStorage.setItem(storageKey, JSON.stringify(state));
            return true;
        } catch {
            feedback('Progres belum dapat disimpan di browser ini.', 'error');
            return false;
        }
    };
    const feedback = (text, kind = '') => {
        const node = document.querySelector('[data-feedback]');
        node.textContent = text;
        node.dataset.kind = kind;
        if (kind === 'error' || kind === 'success') window.NetGuardAudio?.play(kind === 'error' ? 'error' : 'correct');
    };
    const openDialogue = (lines) => {
        dialogueLines = lines;
        dialogueIndex = 0;
        surface.inert = true;
        dialogue.hidden = false;
        paintDialogue();
    };
    const paintDialogue = () => {
        const body = dialogue.querySelector('[data-ch5-dialogue-text]');
        dialogue.querySelector('[data-ch5-dialogue-count]').textContent = (dialogueIndex + 1) + ' / ' + dialogueLines.length + ' · KLIK DI MANA SAJA UNTUK LANJUT';
        body.textContent = '';
        dialogueTyping = !reducedMotion.matches;
        window.clearInterval(dialogueTimer);
        if (!dialogueTyping) { body.textContent = dialogueLines[dialogueIndex]; return; }
        let position = 0;
        dialogueTimer = window.setInterval(() => {
            position += 2;
            body.textContent = dialogueLines[dialogueIndex].slice(0, position);
            if (position >= dialogueLines[dialogueIndex].length) {
                window.clearInterval(dialogueTimer);
                dialogueTyping = false;
            }
        }, 23);
    };
    const continueDialogue = () => {
        if (dialogue.hidden) return;
        if (dialogueTyping) {
            window.clearInterval(dialogueTimer);
            dialogueTyping = false;
            dialogue.querySelector('[data-ch5-dialogue-text]').textContent = dialogueLines[dialogueIndex];
            return;
        }
        if (dialogueIndex < dialogueLines.length - 1) { dialogueIndex++; paintDialogue(); return; }
        dialogue.hidden = true;
        surface.inert = false;
        if (!state.prologueComplete) {
            state.prologueComplete = true;
            persist();
            learning.showModal();
        }
    };
    dialogue.addEventListener('click', (event) => { if (!event.target.closest('[data-step-back]')) continueDialogue(); });
    document.addEventListener('keydown', (event) => {
        if (!dialogue.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); continueDialogue(); }
    });

    const prologueScenes = [
        { kicker: 'PROLOG · 01', title: 'Router dan VLAN sekolah sudah siap', text: 'VLAN siswa dan guru sudah dibuat di router. Sekarang hubungkan router ke switch dengan trunk, lalu atur port access agar tiap komputer masuk ke VLAN yang tepat.', pose: 'menugaskan' },
        { kicker: 'JALUR ANTARPERANGKAT · 02', title: 'Satu kabel membawa dua VLAN', text: 'Port ether1 pada switch menjadi trunk menuju ether2-vlan pada router. Kabel ini meneruskan VLAN 10 siswa dan VLAN 20 guru dengan tag masing-masing.', pose: 'ngasih_arahan' },
        { kicker: 'PORT KLIEN · 03', title: 'Tiap PC masuk ke segmennya', text: 'Port ether2 di switch disiapkan untuk PC siswa dan ether3 untuk PC guru. PVID memberi VLAN yang tepat pada trafik dari komputer yang tidak mengirim tag.', pose: 'memberitahu' },
        { kicker: 'PENGUJIAN · 04', title: 'Periksa hasil dari dua komputer', text: 'Setelah VLAN Filtering diaktifkan, buka CMD di PC siswa dan PC guru. Jalankan ipconfig dan ping gateway masing-masing untuk memastikan kedua jalur bekerja.', pose: 'mantap' },
    ];
    const renderPrologue = () => {
        const story = prologueScenes[prologueIndex];
        document.querySelector('[data-ch5-prologue-kicker]').textContent = story.kicker;
        document.querySelector('[data-ch5-prologue-avatar]').src = scene.dataset.teacherBase + '/' + story.pose + '.png';
        const title = document.querySelector('[data-ch5-prologue-title]');
        const text = document.querySelector('[data-ch5-prologue-text]');
        title.textContent = '';
        text.textContent = '';
        prologueFullStory = story;
        prologueTyping = !reducedMotion.matches;
        window.clearInterval(prologueTimer);
        if (!prologueTyping) {
            title.textContent = story.title;
            text.textContent = story.text;
        } else {
            let position = 0;
            prologueTimer = window.setInterval(() => {
                position++;
                if (position <= story.title.length) title.textContent = story.title.slice(0, position);
                else text.textContent = story.text.slice(0, position - story.title.length);
                if (position >= story.title.length + story.text.length) {
                    window.clearInterval(prologueTimer);
                    prologueTimer = null;
                    prologueTyping = false;
                }
            }, 28);
        }
        document.querySelector('[data-ch5-prologue-count]').textContent = 'ADEGAN ' + String(prologueIndex + 1).padStart(2, '0') + ' / ' + String(prologueScenes.length).padStart(2, '0');
        document.querySelector('[data-ch5-prologue-progress]').style.width = ((prologueIndex + 1) / prologueScenes.length * 100) + '%';
    };
    const closePrologue = () => {
        window.clearInterval(prologueTimer);
        prologue.hidden = true;
        scene.classList.remove('is-prologue');
        const lines = [
            'Bagus, konfigurasi VLAN 10 siswa dan VLAN 20 guru di router tetap dipakai. Kita tidak mengubahnya pada tugas ini.',
            'Di switch, kita buat bridge, masukkan ether1, ether2, dan ether3, lalu buat tabel VLAN. ether1 menjadi trunk ke ' + upstreamInterface + '; ether2 access untuk siswa dan ether3 untuk guru.',
            'Jangan aktifkan VLAN Filtering sebelum port dan tabel VLAN benar. Setelah itu, uji PC siswa dan guru dari CMD dengan ipconfig dan ping ke gateway masing-masing.',
        ];
        openDialogue(lines);
    };
    const advancePrologue = () => {
        if (prologue.hidden) return;
        if (prologueTyping) {
            window.clearInterval(prologueTimer);
            prologueTimer = null;
            prologueTyping = false;
            document.querySelector('[data-ch5-prologue-title]').textContent = prologueFullStory.title;
            document.querySelector('[data-ch5-prologue-text]').textContent = prologueFullStory.text;
            return;
        }
        if (prologueIndex < prologueScenes.length - 1) { prologueIndex++; renderPrologue(); return; }
        closePrologue();
    };
    prologue.addEventListener('click', (event) => { if (!event.target.closest('[data-step-back]')) advancePrologue(); });
    document.addEventListener('keydown', (event) => {
        if (!prologue.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); advancePrologue(); }
    });
    document.querySelectorAll('[data-step-back]').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        if (!prologue.hidden && prologueIndex > 0) { prologueIndex--; renderPrologue(); }
        else if (!dialogue.hidden && dialogueIndex > 0) { dialogueIndex--; paintDialogue(); }
    }));

    const activePortRole = () => expectedPorts.find(({ key }) => !portValid(key))?.key || null;
    const activeVlanKey = () => expectedVlans.find(({ key }) => !vlanValid(key))?.key || null;
    const setStage = (stage) => {
        if (!stages.includes(stage)) return;
        state.stage = stage;
        activeEditor = null;
        portDraftRole = null;
        vlanDraftKey = null;
        bridgeEditor.hidden = true;
        portEditor.hidden = true;
        vlanEditor.hidden = true;
        bridgeWindow.hidden = false;
        if (stage !== 'test') { clientWorkspace.hidden = true; document.querySelector('[data-ch5-stage="winbox"]').hidden = false; }
        if (stage === 'test') { clientWorkspace.hidden = false; document.querySelector('[data-ch5-stage="winbox"]').hidden = true; showClient(currentClient); }
        persist();
        render();
        stepGuide.refresh();
    };
    const advanceConfiguredStage = () => {
        if (state.stage === 'bridge' && bridgeValid()) setStage('ports');
        else if (state.stage === 'ports' && portsValid()) setStage('vlans');
        else if (state.stage === 'vlans' && vlansValid()) setStage('filtering');
        else if (state.stage === 'filtering' && filteringValid()) setStage('test');
        else if (state.stage === 'test' && allTestsComplete()) setStage('quiz');
    };
    const setBridgeTab = (tab) => {
        bridgeTab = tab;
        state.activeBridgeTab = tab;
        document.querySelectorAll('[data-bridge-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.bridgeTab === tab));
        document.querySelectorAll('[data-bridge-panel]').forEach((panel) => { panel.hidden = panel.dataset.bridgePanel !== tab; });
        persist();
        stepGuide.refresh();
    };
    document.querySelector('[data-open-bridge]').addEventListener('click', () => {
        bridgeWindow.hidden = false;
        document.querySelector('[data-open-bridge]').classList.add('is-active');
        if (state.stage === 'bridge') state.actions = { ...state.actions, bridgeMenu: true };
        persist();
        render();
        stepGuide.refresh();
    });
    document.querySelector('[data-close-bridge]').addEventListener('click', () => { bridgeWindow.hidden = true; });
    document.querySelectorAll('[data-bridge-tab]').forEach((button) => button.addEventListener('click', () => setBridgeTab(button.dataset.bridgeTab)));

    const openEditor = (kind) => {
        activeEditor = kind;
        bridgeWindow.hidden = false;
        topLayer++;
        if (kind === 'bridge') { bridgeEditor.hidden = false; bridgeEditor.style.zIndex = String(topLayer); }
        if (kind === 'port') { portEditor.hidden = false; portEditor.style.zIndex = String(topLayer); }
        if (kind === 'vlan') { vlanEditor.hidden = false; vlanEditor.style.zIndex = String(topLayer); }
        stepGuide.refresh();
    };
    document.querySelector('[data-bridge-add]').addEventListener('click', () => {
        if (state.stage !== 'bridge' || state.bridge) return;
        bridgeEditMode = 'create';
        document.querySelector('[data-bridge-editor-title]').textContent = 'New Bridge';
        document.querySelector('[data-bridge-name]').value = '';
        document.querySelector('[data-bridge-protocol]').value = 'rstp';
        document.querySelector('[data-bridge-filtering]').checked = false;
        openEditor('bridge');
    });
    document.querySelector('[data-bridge-row]').addEventListener('dblclick', () => {
        if (state.stage !== 'filtering' || !bridgeValid()) return;
        bridgeEditMode = 'filtering';
        document.querySelector('[data-bridge-editor-title]').textContent = 'Bridge <bridge1>';
        document.querySelector('[data-bridge-name]').value = state.bridge.name;
        document.querySelector('[data-bridge-protocol]').value = state.bridge.protocol;
        document.querySelector('[data-bridge-filtering]').checked = Boolean(state.bridge.filtering);
        openEditor('bridge');
    });
    const closeEditors = () => {
        bridgeEditor.hidden = true; portEditor.hidden = true; vlanEditor.hidden = true;
        activeEditor = null; portDraftRole = null; vlanDraftKey = null;
        stepGuide.refresh();
    };
    document.querySelectorAll('[data-close-editor]').forEach((button) => button.addEventListener('click', closeEditors));
    const saveBridge = (close = true) => {
        const name = document.querySelector('[data-bridge-name]').value.trim();
        const protocol = document.querySelector('[data-bridge-protocol]').value;
        const filtering = document.querySelector('[data-bridge-filtering]').checked;
        if (name !== 'bridge1') return feedback('Gunakan nama bridge1 sesuai sambungan switch pada misi ini.', 'error');
        if (protocol !== 'rstp') return feedback('Pertahankan Protocol Mode: rstp pada bridge sekolah.', 'error');
        if (bridgeEditMode === 'create' && filtering) return feedback('Biarkan VLAN Filtering tidak dicentang dulu. Aktifkan setelah semua port dan tabel VLAN terpasang.', 'error');
        if (bridgeEditMode === 'filtering' && (!portsValid() || !vlansValid() || !filtering)) return feedback('Pastikan port ether1–ether3 dan kedua entri VLAN sudah benar, baru centang VLAN Filtering.', 'error');
        state.bridge = { name, protocol, filtering };
        if (close) closeEditors();
        persist();
        render();
        advanceConfiguredStage();
    };
    document.querySelector('[data-save-bridge]').addEventListener('click', () => saveBridge(true));
    document.querySelector('[data-apply-bridge]').addEventListener('click', () => saveBridge(false));

    document.querySelector('[data-port-add]').addEventListener('click', () => {
        if (state.stage !== 'ports' || !bridgeValid()) return;
        portDraftRole = activePortRole();
        if (!portDraftRole) return;
        document.querySelector('[data-port-interface]').value = '';
        document.querySelector('[data-port-bridge]').value = 'bridge1';
        document.querySelector('[data-port-pvid]').value = '1';
        document.querySelector('[data-port-ingress]').checked = true;
        document.querySelector('[data-port-frame]').value = 'admit-all';
        openEditor('port');
    });
    document.querySelectorAll('[data-save-port]').forEach((button) => button.addEventListener('click', () => {
        if (!portDraftRole) return;
        const target = expectedPorts.find(({ key }) => key === portDraftRole);
        const item = {
            interface: document.querySelector('[data-port-interface]').value,
            bridge: document.querySelector('[data-port-bridge]').value,
            pvid: Number(document.querySelector('[data-port-pvid]').value),
            ingress: document.querySelector('[data-port-ingress]').checked,
            frame: document.querySelector('[data-port-frame]').value,
        };
        if (item.interface !== target.interface) return feedback('Untuk ' + target.role + ', pilih Interface ' + target.interface + '.', 'error');
        if (item.bridge !== 'bridge1') return feedback('Pilih bridge1 pada kolom Bridge.', 'error');
        if (item.pvid !== target.pvid) return feedback('PVID ' + target.pvid + ' diperlukan untuk ' + target.role + '.', 'error');
        if (!item.ingress || item.frame !== target.frame) return feedback(target.key === 'trunk' ? 'Port trunk ether1 menerima frame bertag saja. Pilih Frame Types admit-only-vlan-tagged dan aktifkan Ingress Filtering.' : 'Port access harus menerima trafik tanpa tag. Pilih admit-only-untagged-and-priority-tagged dan aktifkan Ingress Filtering.', 'error');
        state.ports[target.key] = item;
        closeEditors();
        persist();
        render();
        advanceConfiguredStage();
    }));

    document.querySelector('[data-vlan-add]').addEventListener('click', () => {
        if (state.stage !== 'vlans' || !portsValid()) return;
        vlanDraftKey = activeVlanKey();
        if (!vlanDraftKey) return;
        const target = expectedVlans.find(({ key }) => key === vlanDraftKey);
        document.querySelector('[data-vlan-bridge]').value = 'bridge1';
        document.querySelector('[data-vlan-tagged]').value = '';
        document.querySelector('[data-vlan-untagged]').value = '';
        document.querySelector('[data-vlan-id]').value = '';
        document.querySelector('[data-vlan-id]').placeholder = String(target.id);
        openEditor('vlan');
    });
    document.querySelectorAll('[data-save-vlan]').forEach((button) => button.addEventListener('click', () => {
        if (!vlanDraftKey) return;
        const target = expectedVlans.find(({ key }) => key === vlanDraftKey);
        const item = {
            bridge: document.querySelector('[data-vlan-bridge]').value,
            tagged: document.querySelector('[data-vlan-tagged]').value.trim(),
            untagged: document.querySelector('[data-vlan-untagged]').value.trim(),
            id: Number(document.querySelector('[data-vlan-id]').value),
        };
        if (item.bridge !== 'bridge1') return feedback('Pilih bridge1 pada kolom Bridge.', 'error');
        if (item.id !== target.id) return feedback('Masukkan VLAN ID ' + target.id + ' untuk ' + target.label + '.', 'error');
        if (item.tagged !== 'ether1') return feedback('Port trunk ether1 harus masuk ke kolom Tagged karena membawa frame bertag ke router.', 'error');
        if (item.untagged !== target.port) return feedback(target.label + ' memakai port access ' + target.port + '. Masukkan port itu di kolom Untagged.', 'error');
        state.vlans[target.key] = item;
        closeEditors();
        persist();
        render();
        advanceConfiguredStage();
    }));

    const renderConfiguration = () => {
        const bridgeRow = document.querySelector('[data-bridge-row]');
        bridgeRow.hidden = !state.bridge;
        document.querySelector('[data-bridge-empty]').hidden = Boolean(state.bridge);
        document.querySelector('[data-bridge-count]').textContent = state.bridge ? '1 item' : '0 items';
        document.querySelector('[data-bridge-filtering-value]').textContent = state.bridge?.filtering ? 'yes' : 'no';
        const portRows = document.querySelector('[data-port-rows]');
        portRows.replaceChildren();
        for (const port of expectedPorts) {
            const item = state.ports[port.key];
            if (!item) continue;
            const row = document.createElement('div');
            row.className = 'ch5-data-row';
            for (const value of ['R', item.interface, item.bridge, String(item.pvid), item.frame, item.ingress ? 'yes' : 'no', '']) {
                const cell = document.createElement('span');
                cell.textContent = value;
                row.append(cell);
            }
            portRows.append(row);
        }
        document.querySelector('[data-port-empty]').hidden = portRows.children.length > 0;
        document.querySelector('[data-port-count]').textContent = portRows.children.length + (portRows.children.length === 1 ? ' item' : ' items');
        const vlanRows = document.querySelector('[data-vlan-rows]');
        vlanRows.replaceChildren();
        for (const vlan of expectedVlans) {
            const item = state.vlans[vlan.key];
            if (!item) continue;
            const row = document.createElement('div');
            row.className = 'ch5-data-row';
            for (const value of ['', item.bridge, String(item.id), item.tagged, item.untagged]) {
                const cell = document.createElement('span');
                cell.textContent = value;
                row.append(cell);
            }
            vlanRows.append(row);
        }
        document.querySelector('[data-vlan-empty]').hidden = vlanRows.children.length > 0;
        document.querySelector('[data-vlan-count]').textContent = vlanRows.children.length + (vlanRows.children.length === 1 ? ' item' : ' items');
    };
    const planForStage = () => {
        if (state.stage === 'bridge') return [
            ['Klik Bridge pada menu kiri WinBox.', !bridgeWindow.hidden],
            ['Pada tab Bridge, klik tombol + untuk menambahkan bridge.', activeEditor === 'bridge'],
            ['Di jendela New Bridge, isi Name: bridge1 dan Protocol Mode: rstp. Biarkan VLAN Filtering tidak dicentang, lalu klik OK.', bridgeCreatedWithoutFiltering(), [{ selector: '[data-bridge-name]', expected: 'bridge1' },{ selector: '[data-bridge-protocol]', expected: 'rstp' },"[data-save-bridge]"]],
        ];
        if (state.stage === 'ports') {
            const plan = [['Di jendela Bridge, klik tab Ports.', bridgeTab === 'Ports']];
            for (const port of expectedPorts) {
                plan.push(['Klik + untuk menambahkan ' + port.role + '.', activeEditor === 'port' && portDraftRole === port.key || Boolean(state.ports[port.key])]);
                plan.push(['Pada New Bridge Port, isi pengaturan berikut:\nInterface: ' + port.interface + '\nBridge: bridge1\nPVID: ' + port.pvid + '\nIngress Filtering: aktif\nFrame Types: ' + port.frame + '\nKlik OK.', portValid(port.key), [{ selector: '[data-port-interface]', expected: port.interface },{ selector: '[data-port-bridge]', expected: 'bridge1' },{ selector: '[data-port-pvid]', expected: port.pvid },{ selector: '[data-port-ingress]', expected: true },{ selector: '[data-port-frame]', expected: port.frame },"[data-save-port]"]]);
            }
            return plan;
        }
        if (state.stage === 'vlans') {
            const plan = [['Klik tab VLANs pada jendela Bridge.', bridgeTab === 'VLANs']];
            for (const vlan of expectedVlans) {
                plan.push(['Klik + untuk membuat entri ' + vlan.label + '.', activeEditor === 'vlan' && vlanDraftKey === vlan.key || Boolean(state.vlans[vlan.key])]);
                plan.push(['Isi pengaturan VLAN:\nBridge: bridge1\nTagged: ether1\nUntagged: ' + vlan.port + '\nVLAN IDs: ' + vlan.id + '\nKlik OK.', vlanValid(vlan.key), [{ selector: '[data-vlan-bridge]', expected: 'bridge1' },{ selector: '[data-vlan-tagged]', expected: 'ether1' },{ selector: '[data-vlan-untagged]', expected: vlan.port },{ selector: '[data-vlan-id]', expected: vlan.id },"[data-save-vlan]"]]);
            }
            return plan;
        }
        if (state.stage === 'filtering') return [
            ['Pilih tab Bridge dan pastikan baris bridge1 terlihat.', bridgeTab === 'Bridges'],
            ['Klik dua kali baris bridge1 untuk membuka propertinya.', activeEditor === 'bridge' && bridgeEditMode === 'filtering', "[data-bridge-row]"],
            ['Centang VLAN Filtering, pertahankan Protocol Mode rstp, lalu klik OK. Port manajemen ether5 tetap di luar bridge agar sesi WinBox tidak terputus.', filteringValid(), [{ selector: '[data-bridge-filtering]', expected: true },"[data-save-bridge]"]],
        ];
        if (state.stage === 'test') {
            const plan = [];
            for (const key of ['student', 'teacher']) {
                const label = key === 'student' ? 'PC siswa' : 'PC guru';
                const ip = key === 'student' ? '192.168.40.1' : '192.168.60.1';
                plan.push(['Klik ' + label + ' pada taskbar, lalu klik ikon Command Prompt di desktop PC.', currentClient === key && !clientWorkspace.hidden && !clientTerminal.hidden]);
                plan.push(['Ketik ipconfig, tekan Enter, lalu periksa IP ' + (key === 'student' ? '192.168.40.x' : '192.168.60.x') + ' dan gateway ' + ip + '.', state.tests[key].ipconfig]);
                plan.push(['Ketik ping ' + ip + ' dan tekan Enter. Tunggu empat balasan tanpa packet loss.', state.tests[key].ping]);
            }
            return plan;
        }
        if (state.stage === 'quiz') return [['Kedua PC telah diuji. Buka evaluasi setelah selesai memeriksa hasilnya.', allTestsComplete()]];
        return [['Evaluasi Chapter 5 selesai dan progres tersimpan.', scene.dataset.completed === 'true']];
    };
    const stepGuide = window.NetGuardStepGuide.create({
        list: document.querySelector('[data-guide-list]'),
        getKey: () => state.stage,
        getPlan: planForStage,
        root: scene,
    });
    const render = () => {
        renderConfiguration();
        const count = scene.dataset.completed === 'true' ? 5 : progressCount();
        document.querySelector('[data-progress]').value = count;
        document.querySelector('[data-progress-label]').textContent = count + ' / 5';
        document.querySelector('[data-open-evaluation]').hidden = !allTestsComplete();
        document.querySelector('[data-port-add]').disabled = state.stage !== 'ports' || !bridgeValid();
        document.querySelector('[data-vlan-add]').disabled = state.stage !== 'vlans' || !portsValid();
        document.querySelector('[data-bridge-add]').disabled = state.stage !== 'bridge' || Boolean(state.bridge);
        document.querySelector('[data-bridge-remove]').disabled = !state.bridge || state.stage !== 'bridge';
        document.querySelector('[data-bridge-enable]').disabled = !state.bridge || Boolean(state.bridge.filtering);
        document.querySelector('[data-bridge-disable]').disabled = !state.bridge || !state.bridge.filtering;
        stepGuide.refresh();
    };

    const clientConfig = (key) => {
        const student = key === 'student';
        const segmentReady = endpointReady(key);
        return {
            address: segmentReady ? clientPoolAddress(key) : '0.0.0.0',
            mask: segmentReady ? '255.255.255.0' : '0.0.0.0',
            gateway: segmentReady ? (student ? '192.168.40.1' : '192.168.60.1') : '0.0.0.0',
            dns: segmentReady ? (student ? '192.168.40.1' : '192.168.60.1') : '0.0.0.0',
            ready: segmentReady,
        };
    };
    const showClient = (key) => {
        const requested = key === 'teacher' ? 'teacher' : 'student';
        if (requested === 'teacher' && !(state.tests.student.ipconfig && state.tests.student.ping)) {
            feedback('Selesaikan ipconfig dan ping gateway PC siswa dahulu. Setelah itu baru pindah ke PC guru.', 'error');
            return;
        }
        currentClient = requested;
        state.activeClient = currentClient;
        clientWorkspace.hidden = false;
        document.querySelector('[data-ch5-stage="winbox"]').hidden = true;
        clientWorkspace.classList.remove('is-terminal');
        clientTerminal.hidden = true;
        document.querySelector('[data-client-title]').textContent = currentClient === 'student' ? 'PC Siswa · ether2 access · VLAN 10' : 'PC Guru · ether3 access · VLAN 20';
        document.querySelector('[data-terminal-title]').textContent = 'Command Prompt — ' + (currentClient === 'student' ? 'PC Siswa' : 'PC Guru');
        document.querySelector('[data-terminal-prompt]').textContent = 'C:\\Users\\' + (currentClient === 'student' ? 'Siswa' : 'Guru') + '>';
        document.querySelectorAll('[data-task-client]').forEach((button) => button.classList.toggle('is-active', button.dataset.taskClient === currentClient));
        document.querySelector('[data-task-winbox]').classList.remove('is-active');
        persist();
        stepGuide.refresh();
    };
    document.querySelectorAll('[data-task-client]').forEach((button) => button.addEventListener('click', () => showClient(button.dataset.taskClient)));
    document.querySelector('[data-task-winbox]').addEventListener('click', () => {
        clientWorkspace.hidden = true;
        document.querySelector('[data-ch5-stage="winbox"]').hidden = false;
        document.querySelectorAll('[data-task-client]').forEach((button) => button.classList.remove('is-active'));
        document.querySelector('[data-task-winbox]').classList.add('is-active');
        stepGuide.refresh();
    });
    document.querySelector('[data-back-winbox]').addEventListener('click', () => document.querySelector('[data-task-winbox]').click());
    document.querySelector('[data-launch-cmd]').addEventListener('click', () => {
        clientWorkspace.classList.add('is-terminal');
        clientTerminal.hidden = false;
        document.querySelector('[data-terminal-input]').focus();
        stepGuide.refresh();
    });
    document.querySelector('[data-close-cmd]').addEventListener('click', () => {
        clientWorkspace.classList.remove('is-terminal');
        clientTerminal.hidden = true;
        stepGuide.refresh();
    });
    const appendTerminal = (text) => {
        const output = document.querySelector('[data-terminal-output]');
        output.textContent += text;
        output.parentElement.scrollTop = output.parentElement.scrollHeight;
    };
    const runPing = (address, key) => {
        const target = key === 'student' ? '192.168.40.1' : '192.168.60.1';
        if (address !== target) {
            appendTerminal('Pinging ' + address + ' with 32 bytes of data:\nRequest timed out.\n\n');
            return;
        }
        if (!endpointReady(key)) {
            appendTerminal('Pinging ' + address + ' with 32 bytes of data:\nRequest timed out.\n\nPing statistics for ' + address + ':\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)\n\n');
            feedback('Belum ada balasan. Periksa lagi VLAN pada switch dan konfigurasi VLAN, gateway, serta DHCP yang sudah dibuat pada router di Chapter 2.', 'error');
            return;
        }
        const revision = ++terminalRevision;
        const replies = ['Reply from ' + address + ': bytes=32 time=1ms TTL=64\n', 'Reply from ' + address + ': bytes=32 time=1ms TTL=64\n', 'Reply from ' + address + ': bytes=32 time=2ms TTL=64\n', 'Reply from ' + address + ': bytes=32 time=1ms TTL=64\n'];
        let index = 0;
        const next = () => {
            if (revision !== terminalRevision) return;
            if (index < replies.length) { appendTerminal(replies[index++]); window.setTimeout(next, 560); return; }
            appendTerminal('\nPing statistics for ' + address + ':\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n\n');
            state.tests[key].ping = true;
            persist();
            feedback((key === 'student' ? 'PC siswa' : 'PC guru') + ' menerima balasan dari gateway ' + address + '.', 'success');
            render();
            advanceConfiguredStage();
        };
        window.setTimeout(next, 560);
    };
    document.querySelector('[data-terminal-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.querySelector('[data-terminal-input]');
        const command = input.value.trim();
        if (!command) return;
        input.value = '';
        appendTerminal('C:\\Users\\' + (currentClient === 'student' ? 'Siswa' : 'Guru') + '> ' + command + '\n');
        if (/^ipconfig(?:\s+\/all)?$/i.test(command)) {
            const network = clientConfig(currentClient);
            appendTerminal('Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : ' + network.address + '\n   Subnet Mask . . . . . . . . . . . : ' + network.mask + '\n   Default Gateway . . . . . . . . . : ' + network.gateway + '\n   DNS Servers . . . . . . . . . . . : ' + network.dns + '\n\n');
            if (network.ready) {
                state.tests[currentClient].ipconfig = true;
                persist();
                feedback((currentClient === 'student' ? 'PC siswa' : 'PC guru') + ' mendapat IP dan gateway sesuai VLAN-nya.', 'success');
                render();
            } else {
                state.tests[currentClient].ipconfig = false;
                feedback('PC masih mendapat 0.0.0.0. Periksa Bridge Ports, Bridge VLANs, VLAN Filtering, lalu konfigurasi Chapter 2 yang dipakai router.', 'error');
            }
            return;
        }
        const pingMatch = command.match(/^ping\s+(\S+)$/i);
        if (pingMatch) {
            if (!state.tests[currentClient].ipconfig) {
                feedback('Jalankan ipconfig lebih dahulu agar alamat dan gateway PC ini sudah diperiksa.', 'error');
                return;
            }
            runPing(pingMatch[1], currentClient);
            return;
        }
        if (/^cls$/i.test(command)) { document.querySelector('[data-terminal-output]').textContent = ''; return; }
        appendTerminal('Perintah tidak dikenali. Gunakan ipconfig atau ping alamat-gateway.\n\n');
    });

    const quizForm = document.querySelector('[data-quiz-form]');
    quizForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!allTestsComplete()) return;
        const button = document.querySelector('[data-submit-quiz]');
        button.disabled = true;
        const answers = [...quizForm.querySelectorAll('fieldset')].map((fieldset) => Number(fieldset.querySelector('input:checked')?.value ?? -1));
        try {
            const response = await fetch(scene.dataset.completeUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ answers }),
            });
            const result = await response.json();
            window.NetGuardEvaluation.showResult(result);
            if (!response.ok) { window.NetGuardEvaluation.showError(result.message || 'Periksa jawabanmu dan coba lagi.'); button.disabled = false; return; }
            scene.dataset.completed = 'true';
            state.stage = 'finish';
            persist();
            render();
            window.setTimeout(() => { quiz.close(); finish.showModal(); }, 850);
        } catch {
            window.NetGuardEvaluation.showError('Hasil belum terkirim. Periksa koneksi lalu coba lagi.');
            button.disabled = false;
        }
    });
    document.querySelector('[data-open-evaluation]').addEventListener('click', () => {
        if (allTestsComplete()) { quiz.showModal(); window.NetGuardEvaluation.clear(); }
    });
    document.querySelector('[data-close-quiz]').addEventListener('click', () => quiz.close());
    document.querySelector('[data-close-finish]').addEventListener('click', () => finish.close());
    document.querySelector('[data-reread-learning]').addEventListener('click', () => learning.showModal());
    document.querySelector('[data-close-learning]').addEventListener('click', () => learning.close());
    document.querySelector('[data-learning-continue]').addEventListener('click', () => learning.close());
    document.querySelector('[data-replay-prologue]').addEventListener('click', () => {
        prologueIndex = 0;
        renderPrologue();
        prologue.hidden = false;
        scene.classList.add('is-prologue');
    });
    document.querySelector('[data-save-progress]').addEventListener('click', () => {
        if (persist()) feedback('Progres Chapter 5 tersimpan pada browser ini.', 'success');
    });
    const previousStage = () => {
        const order = ['bridge', 'ports', 'vlans', 'filtering', 'test'];
        const index = order.indexOf(state.stage);
        if (index > 0) setStage(order[index - 1]);
    };
    window.NetGuardChapterNavbar.bindPrevious(previousStage);
    document.querySelector('[data-previous]').addEventListener('click', previousStage);

    document.querySelectorAll('[data-window] header').forEach((header) => header.addEventListener('pointerdown', () => {
        const windowNode = header.closest('[data-window]');
        if (windowNode) { windowNode.style.zIndex = String(++topLayer); }
    }));

    if (!state.bridge) {
        bridgeWindow.hidden = true;
    } else {
        bridgeWindow.hidden = false;
        setBridgeTab(bridgeTab);
    }
    if (scene.dataset.completed === 'true') state.stage = 'finish';
    if (allTestsComplete() && state.stage === 'test') state.stage = 'quiz';
    while (true) {
        const previous = state.stage;
        advanceConfiguredStage();
        if (state.stage === previous) break;
    }
    if (state.stage === 'test') showClient(currentClient);
    render();
    if (!state.prologueComplete && scene.dataset.completed !== 'true') {
        renderPrologue();
        prologue.hidden = false;
        surface.inert = true;
        scene.classList.add('is-prologue');
        if (reducedMotion.matches) closePrologue();
    } else {
        prologue.hidden = true;
        scene.classList.remove('is-prologue');
    }
    if (scene.dataset.completed === 'true') {
        state.stage = 'finish';
        document.querySelector('[data-open-evaluation]').hidden = false;
    }
})();
