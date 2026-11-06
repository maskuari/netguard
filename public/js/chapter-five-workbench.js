(() => {
    'use strict';

    const scene = document.querySelector('.ch5-scene');
    if (!scene) return;
    const studentId = scene.dataset.userId;
    const storageKey = 'netguard.chapter-five.v1.' + studentId;
    const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
    const chapterOne = read('netguard.chapter-one.v1.' + studentId) || {};
    const chapterTwo = read('netguard.chapter-two.v2.' + studentId) || {};
    const upstreamInterface = chapterTwo.interfaces?.ether2 || chapterOne.interfaceNames?.ether2 || 'ether2-vlan';
    document.querySelectorAll('[data-upstream-interface], [data-reference-uplink]').forEach((node) => { node.textContent = upstreamInterface; });
    document.querySelector('[data-ch5-trunk-label]').textContent = 'hAP ' + upstreamInterface + ' → ether1 hEX';
    const stages = ['connect-switch', 'switch-session', 'identity', 'bridge', 'ports', 'switch-ports', 'vlans', 'test', 'quiz', 'finish'];
    const bridgeInterfaces = ['ether1', 'ether2', 'ether3', 'ether4'];
    const testPorts = ['ether2', 'ether3', 'ether4'];
    const expectedPorts = [
        { interface: 'ether1', mode: 'check', header: 'add if missing', id: 0 },
        { interface: 'ether2', mode: 'secure', header: 'always strip', id: 10 },
        { interface: 'ether3', mode: 'secure', header: 'always strip', id: 10 },
        { interface: 'ether4', mode: 'secure', header: 'always strip', id: 20 },
    ];
    const expectedVlans = [
        { key: 'student', id: 10, ports: ['ether1', 'ether2', 'ether3'], label: 'VLAN siswa' },
        { key: 'teacher', id: 20, ports: ['ether1', 'ether4'], label: 'VLAN guru' },
    ];
    const saved = read(storageKey) || {};
    if (saved.replaying) scene.dataset.completed = 'false';
    const legacy = saved.workflowVersion !== 2;
    const oldConfigured = Boolean(saved.bridge);
    const oldConnected = Boolean(saved.migration?.connectedHex || oldConfigured);
    const state = {
        ...saved, workflowVersion: 2, stage: saved.stage || 'connect-switch', prologueComplete: Boolean(saved.prologueComplete),
        identity: legacy ? 'MikroTik' : saved.identity || 'MikroTik', identitySaved: !legacy && Boolean(saved.identitySaved),
        connections: legacy ? { trunk: 'ether1', pcPort: saved.connections?.management || (oldConfigured ? 'ether5' : null) } : { trunk: 'ether1', pcPort: null, ...saved.connections },
        migration: { exitedHap: oldConnected, neighborsLoaded: oldConnected, connectedHex: oldConnected, ...saved.migration },
        bridge: saved.bridge ? { name: saved.bridge.name, protocol: saved.bridge.protocol || 'rstp', mtu: saved.bridge.mtu || 'auto' } : null,
        ports: legacy ? Object.fromEntries(bridgeInterfaces.map((port) => [port, Boolean(Object.values(saved.ports || {}).some((item) => item?.interface === port))])) : { ...saved.ports },
        switchPorts: legacy ? {} : { ...saved.switchPorts }, vlans: legacy ? {} : { ...saved.vlans },
        tests: Object.fromEntries(testPorts.map((port) => [port, legacy ? { ipconfig: false } : { ipconfig: false, ...saved.tests?.[port] }])),
        answers: saved.answers || [],
    };
    if (state.connections.pcPort === 'hap-ether3') state.connections.pcPort = null;
    if (legacy && oldConnected) state.stage = 'identity';
    if (!stages.includes(state.stage)) state.stage = 'connect-switch';
    if (!state.identitySaved && !['connect-switch', 'switch-session'].includes(state.stage)) state.stage = 'identity';
    if (state.connections.pcPort === 'hap-ether3' || !state.connections.pcPort && state.stage !== 'test') state.stage = 'connect-switch';
    const bridgeWindow = document.querySelector('[data-window="bridge"]');
    const switchWindow = document.querySelector('[data-window="switch"]');
    const systemMenu = document.querySelector('[data-ch5-system-menu]');
    const clientWorkspace = document.querySelector('[data-client-workspace]');
    const clientTerminal = document.querySelector('[data-client-terminal]');
    const quiz = document.querySelector('[data-quiz-dialog]');
    const finish = document.querySelector('[data-finish-dialog]');
    const learning = document.querySelector('[data-learning-dialog]');
    const prologue = document.querySelector('[data-ch5-prologue]');
    const dialogue = document.querySelector('[data-ch5-dialogue]');
    const surface = scene.querySelector('.lab-scroll');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canConfigure = () => state.connections.pcPort === 'ether5' && state.migration.connectedHex;
    const hexReady = canConfigure;
    const bridgeValid = () => state.bridge?.name === 'bridge1';
    const portsValid = () => bridgeInterfaces.every((port) => state.ports[port]);
    const portValid = (port) => { const target = expectedPorts.find((item) => item.interface === port), actual = state.switchPorts[port]; return Boolean(target && actual && actual.mode === target.mode && actual.header === target.header && Number(actual.id) === target.id); };
    const rolesValid = () => expectedPorts.every((port) => portValid(port.interface));
    const samePorts = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && expected.every((port) => actual.includes(port));
    const vlanValid = (key) => { const target = expectedVlans.find((item) => item.key === key), actual = state.vlans[key]; return Boolean(actual && Number(actual.id) === target.id && samePorts(actual.ports, target.ports)); };
    const vlansValid = () => expectedVlans.every((vlan) => vlanValid(vlan.key));
    const configurationValid = () => state.identitySaved && bridgeValid() && portsValid() && rolesValid() && vlansValid();
    const clientGroup = (port) => port === 'ether4' ? 'teacher' : 'student';
    const clientPoolAddress = (group) => { const first = String(chapterTwo.pools?.[group] || '').split(',')[0].split('-')[0].trim(); return /^\d{1,3}(\.\d{1,3}){3}$/.test(first) ? first : null; };
    const upstreamValid = (group) => Boolean(chapterTwo.vlan?.[group] && chapterTwo.addresses?.[group] && clientPoolAddress(group)?.startsWith(group === 'student' ? '192.168.40.' : '192.168.60.') && !chapterTwo.dhcpDisabled?.[group]);
    const allTestsComplete = () => configurationValid() && testPorts.every((port) => state.tests[port].ipconfig);
    const nextTestPort = () => testPorts.find((port) => !state.tests[port].ipconfig) || 'ether4';
    const progressCount = () => [state.identitySaved, bridgeValid() && portsValid(), rolesValid(), vlansValid(), allTestsComplete()].filter(Boolean).length;
    let activeWindow = null, activeEditor = null, bridgeTab = 'Bridges', switchTab = 'Switch', portDraftRole = null, switchPortDraft = null, vlanDraftKey = null;
    let workspace = state.stage === 'test' ? 'cable' : 'winbox', terminalOpen = false, cableSelected = false, currentTestPort = nextTestPort();
    if (['identity', 'bridge', 'ports', 'switch-ports', 'vlans'].includes(state.stage) && !canConfigure()) workspace = 'cable';
    let discoveryBusy = false, connectBusy = false, dhcpBusy = false, sessionTimer = null, dhcpTimer = null, sessionRevision = 0, guideRevision = 0;
    let prologueIndex = 0, prologueTimer = null, prologueTyping = false, prologueFullStory = null, dialogueTimer = null, dialogueLines = [], dialogueIndex = 0, dialogueTyping = false;
    const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; } catch { feedback('Progres belum dapat disimpan di browser ini.', 'error'); return false; } };
    const feedback = (text, kind = '') => { const node = document.querySelector('[data-feedback]'); node.textContent = text; node.dataset.kind = kind; if (kind === 'error' || kind === 'success') window.NetGuardAudio?.play(kind === 'error' ? 'error' : 'correct'); };
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
            if (hexReady()) learning.showModal();
            render();
        }
    };
    dialogue.addEventListener('click', (event) => { if (!event.target.closest('[data-step-back]')) continueDialogue(); });
    document.addEventListener('keydown', (event) => {
        if (!dialogue.hidden && !event.repeat && ['Enter', ' '].includes(event.key)) { event.preventDefault(); continueDialogue(); }
    });

    const prologueScenes = [
        { kicker: 'PROLOG · 01', title: 'Berpindah dari hAP ke MikroTik hEX', text: 'Chapter 1–4 memakai router hAP. Sekarang kita berpindah ke hEX untuk mengatur VLAN switch. Konfigurasi hAP tetap dipertahankan. Kita pasang kabel terlebih dahulu, baru masuk ke hEX lewat WinBox.', pose: 'menugaskan' },
        { kicker: 'JALUR ANTARPERANGKAT · 02', title: 'Satu kabel membawa dua VLAN', text: 'Port ether1 pada switch menjadi trunk menuju ether2-vlan pada router. Kabel ini meneruskan VLAN 10 siswa dan VLAN 20 guru dengan tag masing-masing.', pose: 'ngasih_arahan' },
        { kicker: 'PINDAHKAN PC · 03', title: 'Sambungkan PC ke ether5 hEX', text: 'Kabel PC sudah dilepas dari router hAP. Pasang ujungnya ke ether5 hEX; ujung pada LAN PC tetap terpasang. Setelah itu keluar dari sesi WinBox hAP dan pilih hEX di Neighbors. Gunakan satu kabel PC yang sama. Ether2 dan ether3 adalah akses siswa; ether4 akses guru.', pose: 'memberitahu' },
        { kicker: 'PENGUJIAN · 04', title: 'Satu PC menguji tiga port', text: 'Setelah konfigurasi Switch selesai, cabut kabel PC dari ether5. Pindahkan bergantian ke ether2, ether3, lalu ether4. Jalankan ipconfig di PC yang sama untuk memeriksa IP setiap port.', pose: 'mantap' },
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
            'Sekarang kita berpindah perangkat dari router hAP ke MikroTik hEX. Konfigurasi VLAN 10 dan VLAN 20 di hAP tetap digunakan.',
            'Jalur trunk dari ' + upstreamInterface + ' hAP ke ether1 hEX tetap terpasang. Kabel PC sudah dilepas dari router hAP. Pasang ujung yang sama ke ether5 hEX. Ujung pada LAN PC tetap terpasang.',
            'Sesi WinBox yang lama masih mengarah ke hAP. Keluar dari sesi itu, buka Neighbors, lalu masuk ke hEX. Ubah System → Identity menjadi Switch terlebih dahulu. Sesudah itu kita membuat Bridge dan mengatur VLAN lewat menu Switch.',
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

    const closeEditors = () => { activeEditor = null; portDraftRole = null; switchPortDraft = null; vlanDraftKey = null; };
    const editorDesktop = document.querySelector('.ch5-desktop');
    const positionEditor = (editor, centerX, centerY) => {
        const desktopBounds = editorDesktop.getBoundingClientRect();
        const editorBounds = editor.getBoundingClientRect();
        const scaleX = editorDesktop.clientWidth / desktopBounds.width || 1;
        const scaleY = editorDesktop.clientHeight / desktopBounds.height || 1;
        const halfWidth = editorBounds.width / 2;
        const halfHeight = editorBounds.height / 2;
        const left = Math.max(halfWidth, Math.min(centerX, desktopBounds.width - halfWidth));
        const top = Math.max(halfHeight, Math.min(centerY, desktopBounds.height - halfHeight));
        editor.style.setProperty('--ch5-editor-left', left * scaleX + 'px');
        editor.style.setProperty('--ch5-editor-top', top * scaleY + 'px');
    };
    document.querySelectorAll('.ch5-editor').forEach((editor) => {
        const titlebar = editor.querySelector('header');
        let drag = null;
        titlebar.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || event.target.closest('button')) return;
            const bounds = editor.getBoundingClientRect();
            drag = { pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
            titlebar.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        titlebar.addEventListener('pointermove', (event) => {
            if (!drag || drag.pointerId !== event.pointerId) return;
            const desktopBounds = editorDesktop.getBoundingClientRect();
            const bounds = editor.getBoundingClientRect();
            positionEditor(editor, event.clientX - desktopBounds.left - drag.offsetX + bounds.width / 2, event.clientY - desktopBounds.top - drag.offsetY + bounds.height / 2);
        });
        const stopDragging = () => { drag = null; };
        titlebar.addEventListener('pointerup', stopDragging);
        titlebar.addEventListener('pointercancel', stopDragging);
        titlebar.addEventListener('lostpointercapture', stopDragging);
    });
    window.addEventListener('resize', () => {
        if (!activeEditor) return;
        const editor = document.querySelector('[data-window="' + activeEditor + '"]');
        const bounds = editor.getBoundingClientRect();
        const desktopBounds = editorDesktop.getBoundingClientRect();
        positionEditor(editor, bounds.left - desktopBounds.left + bounds.width / 2, bounds.top - desktopBounds.top + bounds.height / 2);
    });
    let bridgeEditTab = 'General', portEditTab = 'General', bridgeMinimized = false, bridgeMaximized = true;
    let bridgeFilterShown = false, bridgeFilterText = '';
    const setStage = (stage, windowName = null) => {
        if (!stages.includes(stage)) return;
        state.stage = stage; closeEditors(); activeWindow = windowName; bridgeMinimized = false; closeNavigationMenus();
        workspace = stage === 'test' ? 'cable' : ['quiz', 'finish'].includes(stage) ? 'pc' : 'winbox';
        if (stage === 'test') currentTestPort = nextTestPort();
        persist(); render(); stepGuide.reset();
    };
    const requireConfigurationSession = () => {
        if (canConfigure()) return true;
         workspace = 'cable';
        feedback('Sesi WinBox terputus saat kabel PC dipindah. Pasang kembali kabel ke ether5, lalu login ulang untuk mengubah konfigurasi.');
        render(); return false;
    };
    const openMainWindow = (name) => {
        if (!requireConfigurationSession()) return;
        if (!state.identitySaved) return feedback('Ubah System → Identity menjadi Switch terlebih dahulu.', 'error');
         closeEditors(); activeWindow = name; if (name === 'bridge') bridgeMinimized = false; closeNavigationMenus(); workspace = 'winbox'; render();
    };
    const openEditor = (name) => { activeEditor = name; if (name === 'bridge-edit') bridgeEditTab = 'General'; if (name === 'port-edit') portEditTab = 'General'; closeNavigationMenus(); render(); };
    document.querySelectorAll('[data-bridge-edit-tab]').forEach((button) => button.addEventListener('click', () => { bridgeEditTab = button.dataset.bridgeEditTab; render(); }));
    document.querySelectorAll('[data-port-edit-tab]').forEach((button) => button.addEventListener('click', () => { portEditTab = button.dataset.portEditTab; render(); }));
    document.querySelector('[data-minimize-bridge]').addEventListener('click', () => { bridgeMinimized = true; render(); });
    document.querySelector('[data-maximize-bridge]').addEventListener('click', () => { bridgeMaximized = !bridgeMaximized; render(); });
    document.querySelector('[data-ch5-bridge-task]').addEventListener('click', () => openMainWindow('bridge'));
    document.querySelector('[data-bridge-settings]').addEventListener('click', () => openEditor('bridge-settings'));
    document.querySelector('[data-bridge-filter]').addEventListener('click', () => { bridgeFilterShown = !bridgeFilterShown; if (!bridgeFilterShown) { bridgeFilterText = ''; document.querySelector('[data-bridge-filter-name]').value = ''; } render(); });
    document.querySelector('[data-bridge-filter-name]').addEventListener('input', (event) => { bridgeFilterText = event.target.value.trim().toLowerCase(); render(); });
    document.querySelector('[data-bridge-clear-filter]').addEventListener('click', () => { bridgeFilterText = ''; document.querySelector('[data-bridge-filter-name]').value = ''; render(); });
    document.querySelector('[data-bridge-row]').addEventListener('click', () => document.querySelector('[data-bridge-row]').classList.add('is-selected'));
    const closeNavigationMenus = () => {
        systemMenu.hidden = true;
        document.querySelectorAll('[data-ch5-submenu]').forEach((menu) => { menu.hidden = true; });
        document.querySelectorAll('[data-ch5-menu]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
        document.querySelector('[data-ch5-system]').setAttribute('aria-expanded', 'false');
    };
    const toggleNavigationMenu = (button, menu) => {
        if (!requireConfigurationSession()) return;
        const shouldOpen = menu.hidden;
        closeNavigationMenus();
        if (shouldOpen) {
            menu.hidden = false;
            const buttonBounds = button.getBoundingClientRect();
            const desktopBounds = document.querySelector('.ch5-desktop').getBoundingClientRect();
            menu.style.maxHeight = Math.max(0, desktopBounds.height - 8) + 'px';
            const menuHeight = menu.getBoundingClientRect().height;
            menu.style.top = Math.max(0, Math.min(buttonBounds.top - desktopBounds.top, desktopBounds.height - menuHeight - 4)) + 'px';
            button.setAttribute('aria-expanded', 'true');
        }
        render();
    };
    document.querySelector('[data-ch5-system]').addEventListener('click', () => toggleNavigationMenu(document.querySelector('[data-ch5-system]'), systemMenu));
    document.querySelectorAll('[data-ch5-menu]').forEach((button) => button.addEventListener('click', () => {
        toggleNavigationMenu(button, document.querySelector('[data-ch5-submenu="' + button.dataset.ch5Menu + '"]'));
    }));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeNavigationMenus(); render(); } });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.ch5-system-menu, [data-ch5-system], [data-ch5-menu]')) closeNavigationMenus();
    });
    document.querySelector('[data-ch5-open-identity]').addEventListener('click', () => {
         document.querySelector('[data-ch5-identity]').value = state.identity; openEditor('identity');
    });
    document.querySelector('[data-save-identity]').addEventListener('click', () => {
        if (!requireConfigurationSession()) return;
        const identity = document.querySelector('[data-ch5-identity]').value.trim();
        if (identity !== 'Switch') return feedback('Isi Identity dengan Switch, lalu klik OK.', 'error');
         state.identity = identity; state.identitySaved = true; closeEditors();
        feedback('Identity hEX tersimpan sebagai Switch. Sekarang buat Bridge.', 'success');
        if (state.stage === 'identity') setStage(bridgeValid() ? 'ports' : 'bridge'); else { persist(); render(); }
    });
    document.querySelector('[data-open-bridge]').addEventListener('click', () => openMainWindow('bridge'));
    document.querySelector('[data-open-switch]').addEventListener('click', () => openMainWindow('switch'));
    document.querySelector('[data-close-bridge]').addEventListener('click', () => {  activeWindow = null; render(); });
    document.querySelector('[data-close-switch]').addEventListener('click', () => {  activeWindow = null; render(); });
    document.querySelectorAll('[data-close-editor]').forEach((button) => button.addEventListener('click', () => {  closeEditors(); render(); }));
    document.querySelectorAll('[data-bridge-tab]').forEach((button) => button.addEventListener('click', () => {  bridgeTab = button.dataset.bridgeTab; render(); }));
    document.querySelectorAll('[data-switch-tab]').forEach((button) => button.addEventListener('click', () => {  switchTab = button.dataset.switchTab; render(); }));
    document.querySelector('[data-bridge-add]').addEventListener('click', () => {
        if (!requireConfigurationSession() || state.bridge) return;
         document.querySelector('[data-bridge-name]').value = 'bridge1'; document.querySelector('[data-bridge-protocol]').value = 'rstp'; document.querySelector('[data-bridge-mtu]').value = 'auto'; document.querySelector('[data-bridge-editor-title]').textContent = 'New Interface'; openEditor('bridge-edit'); document.querySelector('[data-bridge-name]').focus(); document.querySelector('[data-bridge-name]').select?.();
    });
    const saveBridge = (close = true) => {
        if (!requireConfigurationSession()) return;
        const name = document.querySelector('[data-bridge-name]').value.trim();
        if (name !== 'bridge1') return feedback('Pertahankan Name: bridge1 sesuai pengaturan bridge pada modul.', 'error');
        if (document.querySelector('[data-bridge-protocol]').value !== 'rstp') return feedback('Biarkan Protocol Mode: rstp sesuai pengaturan awal bridge.', 'error');
         state.bridge = { name, protocol: 'rstp', mtu: document.querySelector('[data-bridge-mtu]').value || 'auto' };
        if (close) { closeEditors(); setStage('ports', 'bridge'); } else { document.querySelector('[data-bridge-editor-title]').textContent = 'Interface <' + name + '>'; persist(); render(); }
    };
    document.querySelector('[data-save-bridge]').addEventListener('click', () => saveBridge(true));
    document.querySelector('[data-apply-bridge]').addEventListener('click', () => saveBridge(false));
    document.querySelector('[data-port-add]').addEventListener('click', () => {
        if (!requireConfigurationSession() || !bridgeValid()) return;
        const port = bridgeInterfaces.find((item) => !state.ports[item]);
        if (!port) return;
         portDraftRole = port; document.querySelector('[data-port-interface]').value = ''; document.querySelector('[data-port-bridge]').value = 'bridge1'; openEditor('port-edit');
    });
    const saveBridgePort = (close = true) => {
        if (!requireConfigurationSession() || !portDraftRole) return;
        if (document.querySelector('[data-port-interface]').value !== portDraftRole || document.querySelector('[data-port-bridge]').value !== 'bridge1') return feedback('Pilih Interface: ' + portDraftRole + ' dan Bridge: bridge1.', 'error');
        state.ports[portDraftRole] = true;
        if (close) closeEditors();
        if (portsValid() && close) setStage('switch-ports', 'bridge'); else { persist(); render(); }
    };
    document.querySelectorAll('[data-save-port]').forEach((button) => button.addEventListener('click', () => saveBridgePort(true)));
    document.querySelector('[data-apply-port]').addEventListener('click', () => saveBridgePort(false));
    const editSwitchPort = (port) => {
        if (!requireConfigurationSession()) return;
         switchPortDraft = port;
        const current = state.switchPorts[port] || { mode: 'disabled', header: 'leave as is', id: 0 };
        document.querySelector('[data-switch-port-title]').textContent = 'Switch Port <' + port + '>';
        document.querySelector('[data-switch-port-name]').value = port;
        document.querySelector('[data-switch-vlan-mode]').value = current.mode;
        document.querySelector('[data-switch-vlan-header]').value = current.header;
        document.querySelector('[data-switch-default-vlan]').value = String(current.id);
        openEditor('switch-port-edit');
    };
    document.querySelector('[data-save-switch-port]').addEventListener('click', () => {
        if (!requireConfigurationSession() || !switchPortDraft) return;
        const target = expectedPorts.find((port) => port.interface === switchPortDraft);
        const actual = { mode: document.querySelector('[data-switch-vlan-mode]').value, header: document.querySelector('[data-switch-vlan-header]').value, id: Number(document.querySelector('[data-switch-default-vlan]').value) };
        if (actual.mode !== target.mode || actual.header !== target.header || actual.id !== target.id) return feedback(target.interface + ': VLAN Mode ' + target.mode + ', VLAN Header ' + target.header + ', Default VLAN ID ' + target.id + '.', 'error');
         state.switchPorts[switchPortDraft] = actual; closeEditors();
        if (rolesValid()) setStage('vlans', 'switch'); else { persist(); render(); }
    });
    const parsePorts = (value) => String(value).split(',').map((port) => port.trim()).filter(Boolean);
    let vlanPortDraft = [''];
    const paintVlanPortPicker = () => {
        const rows = document.querySelector('[data-vlan-port-rows]');
        rows.replaceChildren();
        const updatePorts = () => {
            document.querySelector('[data-vlan-ports]').value = vlanPortDraft.filter(Boolean).join(',');
            stepGuide.refresh();
        };
        vlanPortDraft.forEach((port, index) => {
            const row = document.createElement('div');
            row.className = 'ch5-port-picker-row';
            const select = document.createElement('select');
            select.setAttribute('aria-label', 'Ports ' + (index + 1));
            select.setAttribute('data-vlan-port-index', String(index));
            ['', 'ether1', 'ether2', 'ether3', 'ether4', 'ether5', 'switch1-cpu'].forEach((name) => {
                const option = document.createElement('option');
                option.value = name; option.textContent = name;
                select.append(option);
            });
            select.value = port;
            select.addEventListener('change', () => { vlanPortDraft[index] = select.value; updatePorts(); });
            const add = document.createElement('button');
            add.type = 'button'; add.className = 'ch5-port-picker-add';
            add.setAttribute('data-vlan-port-add', String(index));
            add.setAttribute('aria-label', 'Tambah baris port'); add.title = 'Tambah baris port';
            add.disabled = vlanPortDraft.length >= 7;
            add.addEventListener('click', () => { vlanPortDraft.splice(index + 1, 0, ''); paintVlanPortPicker(); updatePorts(); });
            const remove = document.createElement('button');
            remove.type = 'button'; remove.className = 'ch5-port-picker-remove';
            remove.setAttribute('aria-label', 'Hapus baris port ' + (index + 1)); remove.title = 'Hapus baris port';
            remove.disabled = vlanPortDraft.length === 1;
            remove.addEventListener('click', () => { vlanPortDraft.splice(index, 1); paintVlanPortPicker(); updatePorts(); });
            row.append(select, add, remove); rows.append(row);
        });
    };

    document.querySelector('[data-switch-vlan-add]').addEventListener('click', () => {
        if (!requireConfigurationSession() || !rolesValid()) return;
        const next = expectedVlans.find((vlan) => !vlanValid(vlan.key)); if (!next) return;
         vlanDraftKey = next.key; document.querySelector('[data-vlan-id]').value = ''; document.querySelector('[data-vlan-ports]').value = ''; vlanPortDraft = ['']; paintVlanPortPicker(); openEditor('vlan-edit');
    });
    document.querySelectorAll('[data-save-vlan]').forEach((button) => button.addEventListener('click', () => {
        if (!requireConfigurationSession() || !vlanDraftKey) return;
        const target = expectedVlans.find((vlan) => vlan.key === vlanDraftKey);
        const actual = { id: Number(document.querySelector('[data-vlan-id]').value), ports: parsePorts(document.querySelector('[data-vlan-ports]').value) };
        if (actual.id !== target.id || !samePorts(actual.ports, target.ports)) return feedback('VLAN ID ' + target.id + ' memakai Ports: ' + target.ports.join(', ') + '.', 'error');
         state.vlans[vlanDraftKey] = actual; closeEditors();
        if (vlansValid()) { setStage('test'); feedback('Konfigurasi selesai. Cabut kabel PC dari ether5 dan pindahkan ke ether2 untuk pengujian.'); } else { persist(); render(); }
    }));
    const cancelDiscovery = () => { window.clearTimeout(sessionTimer); sessionRevision++; discoveryBusy = false; connectBusy = false; };
    const startLease = () => {
        window.clearTimeout(dhcpTimer); dhcpBusy = testPorts.includes(state.connections.pcPort);
        if (!dhcpBusy) return;
        const port = state.connections.pcPort;
        dhcpTimer = window.setTimeout(() => { if (state.connections.pcPort !== port) return; dhcpBusy = false; render(); feedback('Link ' + port + ' aktif. Buka CMD dan jalankan ipconfig untuk memeriksa alamat IP.'); }, 900);
    };
    const unplugPc = () => {
         cancelDiscovery(); window.clearTimeout(dhcpTimer); dhcpBusy = false;
        state.connections.pcPort = null; state.migration.connectedHex = false; cableSelected = true;
        persist(); render(); feedback('Kabel PC sudah dicabut. Pasang ujung yang sama ke ' + (state.stage === 'test' ? currentTestPort : 'ether5') + '.');
    };
    const assignHexPort = (port) => {
        if (workspace !== 'cable' && state.stage !== 'connect-switch') return;
        if (port === 'ether1') return feedback('ether1 adalah uplink tetap dari router hAP. Pindahkan hanya kabel PC.', 'error');
        if (state.connections.pcPort === port) { unplugPc(); return; }
        if (state.connections.pcPort) return feedback('Cabut kabel PC dari port sebelumnya terlebih dahulu.', 'error');
        if (!cableSelected) return feedback('Pilih konektor kabel PC, lalu klik port tujuan.', 'error');
        const expected = state.stage === 'test' ? currentTestPort : 'ether5';
        if (port !== expected) { feedback('Pada tahap ini, pasang kabel PC ke ' + expected + '.', 'error'); return; }
         state.connections.pcPort = port; cableSelected = false; persist(); startLease(); render();
        feedback('Kabel PC terpasang pada ' + port + '. ' + (state.stage === 'test' ? 'Tunggu koneksi, lalu buka desktop PC.' : 'Sekarang buka PC untuk mengganti sesi WinBox.'), 'success');
    };
    const cable = document.querySelector('[data-ch5-pc-cable]');
    cable.addEventListener('click', () => { if (!state.connections.pcPort) { cableSelected = true; render(); } });
    cable.addEventListener('dragstart', (event) => { if (state.connections.pcPort) { event.preventDefault(); return; } cableSelected = true; event.dataTransfer.setData('text/plain', 'ch5-pc-cable'); render(); });
    document.querySelectorAll('[data-hex-port]').forEach((button) => {
        button.addEventListener('click', () => assignHexPort(button.dataset.hexPort));
        button.addEventListener('dragover', (event) => { if (cableSelected) event.preventDefault(); });
        button.addEventListener('drop', (event) => { event.preventDefault(); if (event.dataTransfer.getData('text/plain') === 'ch5-pc-cable') assignHexPort(button.dataset.hexPort); });
    });
    document.querySelector('[data-check-hex-cables]').addEventListener('click', () => {
        if (state.stage === 'test') { if (state.connections.pcPort === currentTestPort && !dhcpBusy) {  workspace = 'pc'; render(); } return; }
        if (state.connections.pcPort !== 'ether5') return feedback('Pasang kabel PC pada ether5 hEX terlebih dahulu.', 'error');
        state.resumeStage = !['connect-switch', 'switch-session'].includes(state.stage) ? state.stage : state.resumeStage;
        setStage('switch-session'); feedback('Tutup sesi WinBox lama lewat Exit, lalu login ke hEX melalui Neighbors.');
    });
    const exitWinbox = () => {
        if (state.connections.pcPort !== 'ether5') { requireConfigurationSession(); return; }
         cancelDiscovery(); state.resumeStage = ['connect-switch', 'switch-session'].includes(state.stage) ? state.resumeStage : state.stage;
        state.migration.exitedHap = true; state.migration.connectedHex = false; state.migration.neighborsLoaded = false;
        document.querySelector('[data-ch5-connect-to]').value = ''; setStage('switch-session');
    };
    document.querySelectorAll('[data-ch5-exit]').forEach((button) => button.addEventListener('click', exitWinbox));
    document.querySelector('[data-ch5-refresh-neighbors]').addEventListener('click', () => {
        if (state.connections.pcPort !== 'ether5' || !state.migration.exitedHap) return;
         cancelDiscovery(); const revision = sessionRevision; discoveryBusy = true; state.migration.neighborsLoaded = false; render();
        sessionTimer = window.setTimeout(() => { if (revision !== sessionRevision) return; discoveryBusy = false; state.migration.neighborsLoaded = true; persist(); render(); }, 800);
    });
    document.querySelector('[data-ch5-hex-neighbor]').addEventListener('click', () => {  document.querySelector('[data-ch5-connect-to]').value = '48:A9:8A:1C:01:05'; render(); });
    document.querySelector('[data-ch5-connect-hex]').addEventListener('click', () => {
        if (state.connections.pcPort !== 'ether5' || discoveryBusy || connectBusy || !state.migration.neighborsLoaded) return;
        if (document.querySelector('[data-ch5-connect-to]').value.trim() !== '48:A9:8A:1C:01:05' || document.querySelector('[data-ch5-login-name]').value.trim() !== 'admin' || document.querySelector('[data-ch5-login-password]').value !== '') return feedback('Pilih MAC hEX, Login: admin, Password: kosong.', 'error');
         cancelDiscovery(); const revision = sessionRevision; connectBusy = true; render();
        sessionTimer = window.setTimeout(() => { if (revision !== sessionRevision || state.connections.pcPort !== 'ether5') return; connectBusy = false; state.migration.connectedHex = true; const next = state.identitySaved ? state.resumeStage || 'bridge' : 'identity'; delete state.resumeStage; setStage(next); feedback(state.identitySaved ? 'Terhubung kembali ke hEX.' : 'Terhubung ke hEX. Buka System → Identity dan ubah menjadi Switch.', 'success'); }, 900);
    });
    const planForStage = () => {
        if (workspace === 'cable' && !['connect-switch', 'test'].includes(state.stage)) return [
            ['Cabut kabel PC dari port uji sebelumnya.', !state.connections.pcPort || state.connections.pcPort === 'ether5', false],
            ['Pasang kembali kabel PC ke ether5 untuk konfigurasi.', state.connections.pcPort === 'ether5', false],
            ['Klik Buka PC · WinBox, lalu login ulang ke hEX.', false, false],
        ];
        if (state.stage === 'connect-switch') return [
            ['Pilih atau seret kabel PC ke ether5 hEX. Ujung pada LAN PC tetap terpasang.', state.connections.pcPort === 'ether5', false],
            ['Klik Buka PC · WinBox.', false, false],
        ];
        if (state.stage === 'switch-session') return [
            ['Tutup sesi WinBox lama dengan klik Exit.', state.migration.exitedHap, '[data-ch5-exit].routeros__menu-item'],
            ['Pada tab Neighbors, klik Refresh dan tunggu hEX muncul.', state.migration.neighborsLoaded, '[data-ch5-refresh-neighbors]'],
            ['Klik MAC Address hEX: 48:A9:8A:1C:01:05.', document.querySelector('[data-ch5-connect-to]').value.trim() === '48:A9:8A:1C:01:05', '[data-ch5-hex-neighbor]'],
            ['Login: admin. Password: kosong. Klik Connect.', state.migration.connectedHex, '[data-ch5-connect-hex]'],
        ];
        if (state.stage === 'identity') return [
            ['Klik System pada menu kiri WinBox.', !systemMenu.hidden || activeEditor === 'identity', '[data-ch5-system]'],
            ['Klik Identity.', activeEditor === 'identity', '[data-ch5-open-identity]'],
            ['Pada Identity, ketik Switch lalu klik OK.', state.identitySaved && activeEditor !== 'identity', [{ selector: '[data-ch5-identity]', expected: 'Switch' }, '[data-save-identity]']],
        ];
        if (state.stage === 'bridge') return [
            ['Klik Bridge pada menu kiri WinBox.', activeWindow === 'bridge' && !bridgeMinimized, '[data-open-bridge]'],
            ['Pada tab Bridge, klik +.', activeEditor === 'bridge-edit', '[data-bridge-add]'],
            ['Biarkan Name: bridge1, lalu klik OK.', bridgeValid() && activeEditor !== 'bridge-edit', '[data-save-bridge]'],
        ];
        if (state.stage === 'ports') {
            const plan = [['Klik Bridge pada menu kiri WinBox.', activeWindow === 'bridge' && !bridgeMinimized, '[data-open-bridge]'], ['Klik tab Ports.', bridgeTab === 'Ports', '[data-bridge-tab="Ports"]']];
            for (const port of bridgeInterfaces) { plan.push(['Klik + untuk menambahkan ' + port + '.', Boolean(state.ports[port]) || activeEditor === 'port-edit' && portDraftRole === port, '[data-port-add]']); plan.push(['Pada Interface, pilih ' + port + '. Biarkan Bridge: bridge1, lalu klik OK.', Boolean(state.ports[port]) && !(activeEditor === 'port-edit' && portDraftRole === port), [{ selector: '[data-port-interface]', expected: port }, '[data-save-port]']]); }
            return plan;
        }
        if (state.stage === 'switch-ports') {
            const plan = [['Klik Switch pada menu kiri WinBox.', activeWindow === 'switch', '[data-open-switch]'], ['Klik tab Port.', switchTab === 'Port', '[data-switch-tab="Port"]']];
            for (const port of expectedPorts) { plan.push(['Klik dua kali baris ' + port.interface + '.', portValid(port.interface) || activeEditor === 'switch-port-edit' && switchPortDraft === port.interface, '[data-switch-port="' + port.interface + '"]']); plan.push(['Pada VLAN Mode, pilih ' + port.mode + '.\nPada VLAN Header, pilih ' + port.header + '.\nPada Default VLAN ID, isi ' + port.id + '.\nKlik OK.', portValid(port.interface), [{ selector: '[data-switch-vlan-mode]', expected: port.mode }, { selector: '[data-switch-vlan-header]', expected: port.header }, { selector: '[data-switch-default-vlan]', expected: port.id }, '[data-save-switch-port]']]); }
            return plan;
        }
        if (state.stage === 'vlans') {
            const plan = [['Klik Switch pada menu kiri WinBox.', activeWindow === 'switch', '[data-open-switch]'], ['Klik tab VLAN.', switchTab === 'VLAN', '[data-switch-tab="VLAN"]']];
            for (const vlan of expectedVlans) {
                const saved = vlanValid(vlan.key);
                const editing = activeEditor === 'vlan-edit' && vlanDraftKey === vlan.key;
                plan.push(['Klik + untuk menambahkan VLAN ' + vlan.id + '.', saved || editing, '[data-switch-vlan-add]']);
                plan.push(['Pada VLAN ID, isi ' + vlan.id + '.', saved || editing && Number(document.querySelector('[data-vlan-id]').value) === vlan.id, { selector: '[data-vlan-id]', expected: vlan.id }]);
                vlan.ports.forEach((port, index) => {
                    if (index > 0) {
                        plan.push(['Klik panah bawah di kanan Ports untuk menambahkan baris ke-' + (index + 1) + '.', saved || editing && vlanPortDraft.length > index, '[data-vlan-port-add="' + (index - 1) + '"]']);
                    }
                    plan.push(['Pada Ports baris ke-' + (index + 1) + ', pilih ' + port + '.', saved || editing && vlanPortDraft[index] === port, { selector: '[data-vlan-port-index="' + index + '"]', expected: port }]);
                });
                plan.push(['Klik OK untuk menyimpan VLAN ' + vlan.id + '.', saved, '[data-save-vlan]']);
            }
            return plan;
        }
        if (state.stage === 'test') {
            const plan = [];
            for (const port of testPorts) {
                const done = state.tests[port].ipconfig;
                const address = port === 'ether4' ? '192.168.60.x' : '192.168.40.x';
                plan.push(['Cabut ujung kabel PC dari port sebelumnya, lalu pasang kabel yang sama ke ' + port + ' hEX. Ujung pada LAN PC tetap terpasang.', done || state.connections.pcPort === port, false]);
                plan.push(['Buka desktop PC, lalu klik Command Prompt.', done || state.connections.pcPort === port && workspace === 'pc' && terminalOpen, false]);
                plan.push(['Ketik ipconfig lalu tekan Enter. Periksa IP ' + address + ' dari pool ' + (port === 'ether4' ? 'guru' : 'siswa') + '.', done, false]);
            }
            return plan;
        }
        return [[allTestsComplete() ? 'Ketiga port sudah diuji dengan PC yang sama. Buka evaluasi Chapter 5.' : 'Evaluasi Chapter 5 selesai.', true, false]];
    };
    const stepGuide = window.NetGuardStepGuide.create({ list: document.querySelector('[data-guide-list]'), root: scene, getKey: () => state.stage + ':' + guideRevision, getPlan: planForStage, highlightWinbox: true });

    const addRow = (container, values, action = null, port = null) => {
        const row = document.createElement(action ? 'button' : 'div'); row.className = 'ch5-data-row';
        if (action) { row.type = 'button'; row.setAttribute('data-switch-port', port); row.addEventListener('dblclick', action); }
        for (const value of values) { const cell = document.createElement('span'); cell.textContent = String(value); row.append(cell); }
        container.append(row);
    };
    const completedStage = () => ({ identity: state.identitySaved, bridge: bridgeValid(), ports: portsValid(), 'switch-ports': rolesValid(), vlans: vlansValid(), test: allTestsComplete() })[state.stage];
    const render = () => {
        const cabling = state.stage === 'connect-switch' || workspace === 'cable';
        const loader = state.stage === 'switch-session' && state.migration.exitedHap && !state.migration.connectedHex;
        document.querySelector('[data-ch5-stage="connect-switch"]').hidden = !cabling;
        document.querySelector('[data-ch5-stage="winbox"]').hidden = cabling || loader || workspace !== 'winbox';
        document.querySelector('[data-ch5-login]').hidden = cabling || !loader || workspace !== 'winbox';
        document.querySelector('[data-ch5-management-desktop]').hidden = true;
        clientWorkspace.hidden = cabling || workspace !== 'pc';
        clientTerminal.hidden = !terminalOpen;
        const connectedPort = state.connections.pcPort;
        const guidedCabling = cabling && !allTestsComplete();
        const expectedPort = state.stage === 'test' ? currentTestPort : 'ether5';
        const cableReady = state.stage === 'test' ? connectedPort === expectedPort && !dhcpBusy : connectedPort === 'ether5';
        document.querySelector('[data-ch5-cabling-title]').textContent = state.stage === 'test' ? 'Pindahkan kabel PC ke ' + expectedPort : 'Pindahkan kabel PC ke ether5 hEX';
        document.querySelector('[data-ch5-cabling-description]').textContent = state.stage === 'test' ? 'Gunakan PC dan kabel LAN yang sama. Cabut ujung kabel dari port sebelumnya sebelum memasangnya ke port tujuan. Ujung pada LAN komputer tetap terpasang.' : 'Pasang ujung kabel PC ke ether5 hEX. Ujung pada LAN komputer tetap terpasang.';
        cable.disabled = Boolean(connectedPort); cable.draggable = !connectedPort; cable.setAttribute('aria-pressed', String(cableSelected));
        cable.classList.toggle('is-selected', cableSelected); cable.classList.toggle('is-connected', Boolean(connectedPort)); cable.classList.toggle('ch5-action-target', guidedCabling && !connectedPort && !cableSelected);
        document.querySelector('[data-ch5-pc-cable-status]').textContent = !connectedPort ? 'Ujung bebas · pilih atau seret ke port hEX' : connectedPort === 'hap-ether3' ? 'Masih terpasang pada ether3-local hAP' : 'Terpasang pada ' + connectedPort + ' hEX · klik port untuk mencabut';
        document.querySelectorAll('[data-hex-port]').forEach((button) => {
            const port = button.dataset.hexPort, pcHere = connectedPort === port;
            button.disabled = port === 'ether1';
            button.classList.toggle('is-connected', port === 'ether1' || pcHere);
            button.classList.toggle('is-pc-cable', pcHere);
            button.setAttribute('aria-pressed', String(pcHere));
            button.classList.toggle('ch5-action-target', guidedCabling && (connectedPort && connectedPort !== 'hap-ether3' && connectedPort !== expectedPort ? pcHere : !connectedPort && cableSelected && port === expectedPort));
            const cableCue = guidedCabling && pcHere && connectedPort !== expectedPort ? 'unplug'
                : guidedCabling && !connectedPort && cableSelected && port === expectedPort ? 'insert' : 'none';
            button.dataset.cableCue = cableCue;
            button.setAttribute('aria-description', cableCue === 'unplug' ? 'Klik untuk mencabut kabel PC, lalu pindahkan ke ' + expectedPort + '.' : cableCue === 'insert' ? 'Klik untuk memasang kabel PC di ' + port + '.' : '');
        });
        const continueButton = document.querySelector('[data-check-hex-cables]'); continueButton.disabled = !cableReady;
        continueButton.textContent = state.stage === 'test' ? dhcpBusy ? 'Menghubungkan…' : 'Buka desktop PC →' : 'Buka PC · WinBox →';
        continueButton.classList.toggle('ch5-action-target', guidedCabling && cableReady);
        document.querySelector('[data-ch5-pc-lan-status]').textContent = !connectedPort ? 'Kabel PC belum terhubung' : connectedPort === 'hap-ether3' ? 'PC masih terhubung ke router hAP' : dhcpBusy ? 'Menunggu koneksi dan alamat DHCP…' : 'LAN PC ↔ ' + connectedPort + ' hEX';
        document.querySelector('[data-ch5-tray-port]').textContent = !connectedPort ? 'Ethernet · kabel terlepas' : connectedPort === 'hap-ether3' ? 'Ethernet · ether3 hAP' : 'Ethernet · ' + connectedPort + ' hEX';
        const hex = state.migration.exitedHap;
        document.querySelector('[data-ch5-session-title]').textContent = hex ? 'admin@48:A9:8A:1C:01:05 (' + state.identity + ') - WinBox (64bit) v7.14.3 on hEX lite (mipsbe)' : 'admin@48:A9:8A:1C:01:01 (Router) - WinBox (64bit) v7.14.3 on hAP lite (smips)';
        document.querySelector('[data-ch5-session-address]').textContent = hex ? '48:A9:8A:1C:01:05' : '48:A9:8A:1C:01:01';
        document.querySelector('[data-ch5-session-board]').textContent = hex ? 'RouterOS 7.14.3 · hEX lite' : 'RouterOS 7.14.3 · hAP lite';
        document.querySelector('[data-ch5-neighbor-identity]').textContent = state.identity;
        document.querySelector('[data-ch5-hex-neighbor]').hidden = !state.migration.neighborsLoaded || discoveryBusy;
        document.querySelector('[data-ch5-refresh-neighbors]').disabled = discoveryBusy || connectBusy;
        document.querySelector('[data-ch5-connect-hex]').disabled = discoveryBusy || connectBusy;
        document.querySelector('[data-ch5-neighbor-status]').textContent = discoveryBusy ? 'Discovering…' : connectBusy ? 'Connecting…' : state.migration.neighborsLoaded ? '1 item' : '0 items';
        document.querySelector('[data-ch5-system]').disabled = !canConfigure();
        document.querySelector('[data-ch5-system]').setAttribute('aria-expanded', String(!systemMenu.hidden));
        document.querySelector('[data-open-bridge]').disabled = !canConfigure() || !state.identitySaved;
        document.querySelector('[data-open-switch]').disabled = !canConfigure() || !state.identitySaved;
        bridgeWindow.hidden = activeWindow !== 'bridge' || bridgeMinimized; switchWindow.hidden = activeWindow !== 'switch';
        bridgeWindow.classList.toggle('is-restored-window', !bridgeMaximized);
        document.querySelector('[data-taskbar]').hidden = !bridgeMinimized;
        document.querySelector('[data-bridge-filter-bar]').hidden = !bridgeFilterShown;
        document.querySelectorAll('[data-bridge-edit-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.bridgeEditTab === bridgeEditTab));
        document.querySelectorAll('[data-bridge-edit-panel]').forEach((panel) => { panel.hidden = panel.dataset.bridgeEditPanel !== bridgeEditTab; });
        document.querySelectorAll('[data-port-edit-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.portEditTab === portEditTab));
        document.querySelectorAll('[data-port-edit-panel]').forEach((panel) => { panel.hidden = panel.dataset.portEditPanel !== portEditTab; });
        document.querySelector('[data-bridge-actual-mtu]').value = state.bridge ? state.bridge.mtu === 'auto' || !state.bridge.mtu ? '1500' : state.bridge.mtu : '';
        document.querySelector('[data-bridge-l2-mtu]').value = state.bridge ? '1598' : '';
        document.querySelector('[data-bridge-mac]').value = state.bridge ? '48:A9:8A:1C:01:05' : '';
        document.querySelector('[data-bridge-running]').value = state.bridge ? 'yes' : 'no';
        for (const name of ['identity', 'bridge-edit', 'port-edit', 'switch-port-edit', 'vlan-edit', 'bridge-settings']) { const editor = document.querySelector('[data-window="' + name + '"]'); editor.hidden = activeEditor !== name; if (!editor.hidden) editor.style.zIndex = '100'; }
        document.querySelectorAll('[data-bridge-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.bridgeTab === bridgeTab));
        document.querySelectorAll('[data-bridge-panel]').forEach((panel) => { panel.hidden = panel.dataset.bridgePanel !== bridgeTab; });
        document.querySelectorAll('[data-switch-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.switchTab === switchTab));
        document.querySelectorAll('[data-switch-panel]').forEach((panel) => { panel.hidden = panel.dataset.switchPanel !== switchTab; });
        document.querySelector('[data-bridge-row]').hidden = !state.bridge || Boolean(bridgeFilterText && !state.bridge.name.toLowerCase().includes(bridgeFilterText)); document.querySelector('[data-bridge-empty]').hidden = Boolean(state.bridge);
        document.querySelector('[data-bridge-count]').textContent = state.bridge && !(bridgeFilterText && !state.bridge.name.toLowerCase().includes(bridgeFilterText)) ? '1 item' : '0 items';
        document.querySelector('[data-bridge-add]').disabled = Boolean(state.bridge) || state.stage !== 'bridge';
        document.querySelector('[data-port-add]').disabled = !bridgeValid() || portsValid();
        const bridgeRows = document.querySelector('[data-port-rows]'); bridgeRows.replaceChildren();
        for (const [index, port] of bridgeInterfaces.filter((port) => state.ports[port]).entries()) addRow(bridgeRows, [index + ' ' + (port === 'ether1' || state.connections.pcPort === port ? 'H' : 'IH'), port, 'bridge1', 'none', 'no', '80', '10']);
        document.querySelector('[data-port-empty]').hidden = bridgeRows.children.length > 0; document.querySelector('[data-port-count]').textContent = bridgeRows.children.length + ' items';
        const switchRows = document.querySelector('[data-switch-port-rows]'); switchRows.replaceChildren();
        for (const port of bridgeInterfaces) { const setting = state.switchPorts[port] || { mode: 'disabled', header: 'leave as is', id: 0 }; addRow(switchRows, [port, 'switch1', setting.mode, setting.header, setting.id], () => editSwitchPort(port), port); }
        const vlanRows = document.querySelector('[data-switch-vlan-rows]'); vlanRows.replaceChildren();
        for (const vlan of expectedVlans) { const actual = state.vlans[vlan.key]; if (actual) addRow(vlanRows, ['switch1', actual.id, actual.ports.join(', ')]); }
        document.querySelector('[data-switch-vlan-add]').disabled = !rolesValid() || vlansValid();
        const count = scene.dataset.completed === 'true' ? 5 : progressCount(); document.querySelector('[data-progress]').value = count; document.querySelector('[data-progress-label]').textContent = count + ' / 5';
        document.querySelector('[data-open-evaluation]').hidden = !allTestsComplete();
        document.querySelector('[data-ch5-resume]').hidden = !completedStage() || state.stage === 'test' || Boolean(activeEditor);
        document.querySelector('[data-ch5-next-test]').hidden = state.stage !== 'test' || !state.tests[connectedPort]?.ipconfig || allTestsComplete();
        document.querySelector('[data-ch5-next-test]').classList.toggle('ch5-action-target', workspace === 'pc' && !document.querySelector('[data-ch5-next-test]').hidden);
        document.querySelector('[data-launch-cmd]').classList.toggle('ch5-action-target', state.stage === 'test' && !allTestsComplete() && workspace === 'pc' && !terminalOpen && connectedPort === currentTestPort);
        clientWorkspace.setAttribute('aria-label', 'PC Lab · ' + (!connectedPort ? 'kabel terlepas' : connectedPort === 'hap-ether3' ? 'router hAP' : connectedPort + ' hEX'));
        const linkStatus = dhcpBusy ? 'Memperoleh alamat DHCP\u2026' : connectedPort ? 'Ethernet terhubung \u00b7 ' + connectedPort : 'Ethernet tidak terhubung';
        document.querySelector('[data-ch5-network]').classList.toggle('is-online', Boolean(connectedPort));
        document.querySelector('[data-ch5-network]').setAttribute('aria-label', linkStatus);
        document.querySelector('[data-ch5-network]').setAttribute('title', linkStatus);
        document.querySelector('[data-task-winbox]').disabled = state.stage === 'connect-switch';
        document.querySelector('[data-task-winbox]').classList.toggle('is-active', workspace === 'winbox' && !cabling);
        document.querySelector('[data-ch5-desktop]').classList.toggle('is-active', workspace === 'pc' && !terminalOpen);
        document.querySelector('[data-ch5-cmd-task]').classList.toggle('is-active', workspace === 'pc' && terminalOpen);
        document.querySelector('[data-ch5-patch-panel]').classList.toggle('is-active', cabling);
        document.querySelector('[data-ch5-patch-panel]').classList.toggle('ch5-action-target', !allTestsComplete() && state.stage === 'test' && workspace === 'pc' && connectedPort !== currentTestPort);
        stepGuide.refresh();
    };
    const clientConfig = () => {
        const port = state.connections.pcPort, group = clientGroup(port);
        const ready = testPorts.includes(port) && !dhcpBusy && configurationValid() && upstreamValid(group);
        return { ready, address: ready ? clientPoolAddress(group) : '0.0.0.0', mask: ready ? '255.255.255.0' : '0.0.0.0', gateway: ready ? group === 'student' ? '192.168.40.1' : '192.168.60.1' : '0.0.0.0' };
    };
    const showPc = (cmd = false) => { workspace = 'pc'; terminalOpen = cmd; render(); };
    document.querySelector('[data-ch5-desktop]').addEventListener('click', () => showPc(false));
    document.querySelector('[data-ch5-cmd-task]').addEventListener('click', () => showPc(true));
    document.querySelector('[data-task-winbox]').addEventListener('click', () => { if (!canConfigure() && !['switch-session', 'connect-switch'].includes(state.stage)) { requireConfigurationSession(); return; }  workspace = 'winbox'; render(); });
    document.querySelector('[data-back-winbox]').addEventListener('click', () => document.querySelector('[data-task-winbox]').click());
    document.querySelector('[data-ch5-desktop-winbox]').addEventListener('click', () => document.querySelector('[data-task-winbox]').click());
    document.querySelector('[data-ch5-minimize]').addEventListener('click', () => showPc(false));
    document.querySelector('[data-ch5-resize]').addEventListener('click', () => document.querySelector('.ch5-routeros').classList.toggle('is-app-restored'));
    document.querySelector('[data-launch-cmd]').addEventListener('click', () => {  terminalOpen = true; render(); document.querySelector('[data-terminal-input]').focus(); });
    document.querySelector('[data-close-cmd]').addEventListener('click', () => {  terminalOpen = false; render(); });
    document.querySelector('[data-ch5-patch-panel]').addEventListener('click', () => {  if (state.stage === 'test') currentTestPort = nextTestPort(); workspace = 'cable'; render(); });
    document.querySelector('[data-ch5-next-test]').addEventListener('click', () => {  currentTestPort = nextTestPort(); workspace = 'cable'; render(); });
    document.querySelector('[data-ch5-resume]').addEventListener('click', () => { if (completedStage()) setStage(stages[stages.indexOf(state.stage) + 1]); });
    document.querySelector('[data-bridge-row]').addEventListener('dblclick', () => { if (!requireConfigurationSession()) return;  document.querySelector('[data-bridge-name]').value = state.bridge?.name || 'bridge1'; document.querySelector('[data-bridge-protocol]').value = state.bridge?.protocol || 'rstp'; document.querySelector('[data-bridge-mtu]').value = state.bridge?.mtu || 'auto'; document.querySelector('[data-bridge-editor-title]').textContent = 'Interface <bridge1>'; openEditor('bridge-edit'); });
    const appendTerminal = (text) => { const output = document.querySelector('[data-terminal-output]'); output.textContent += text; output.parentElement.scrollTop = output.parentElement.scrollHeight; };
    document.querySelector('[data-terminal-form]').addEventListener('submit', (event) => {
        event.preventDefault(); const input = document.querySelector('[data-terminal-input]'), command = input.value.trim(); if (!command) return; input.value = '';
        appendTerminal('C:\\Users\\Lab> ' + command + '\n');
        if (/^ipconfig(?:\s+\/all)?$/i.test(command)) {
            const network = clientConfig();
            if (!state.connections.pcPort) { appendTerminal('Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Media State . . . . . . . . . . . : Media disconnected\n\n'); feedback('Kabel LAN belum terhubung. Pasang ke port uji terlebih dahulu.', 'error'); return; }
            appendTerminal('Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : ' + network.address + '\n   Subnet Mask . . . . . . . . . . . : ' + network.mask + '\n   Default Gateway . . . . . . . . . : ' + network.gateway + '\n   DNS Servers . . . . . . . . . . . : ' + network.gateway + '\n\n');
            if (!network.ready) { feedback(dhcpBusy ? 'DHCP masih diproses. Tunggu sebentar, lalu jalankan ipconfig lagi.' : 'IP belum sesuai. Periksa kabel, Bridge Ports, Switch Port, tabel VLAN, dan DHCP pada router.', 'error'); return; }
            const port = state.connections.pcPort; state.tests[port].ipconfig = true; persist();
            feedback(port + ' mendapat IP ' + network.address + ' sesuai VLAN ' + (port === 'ether4' ? '20 guru' : '10 siswa') + '.', 'success');
            render(); return;
        }
        if (/^ipconfig\s+\/renew$/i.test(command)) { startLease(); appendTerminal('Renewing Ethernet adapter…\n\n'); render(); return; }
        if (/^cls$/i.test(command)) { document.querySelector('[data-terminal-output]').textContent = ''; return; }
        const ping = command.match(/^ping\s+(\S+)$/i);
        if (ping) { const network = clientConfig(); const success = network.ready && ping[1] === network.gateway; appendTerminal('Pinging ' + ping[1] + ' with 32 bytes of data:\n' + Array.from({ length: 4 }, () => success ? 'Reply from ' + ping[1] + ': bytes=32 time=1ms TTL=64' : 'Request timed out.').join('\n') + '\n\n'); return; }
        appendTerminal('Perintah tidak dikenali. Gunakan ipconfig, ipconfig /renew, ping alamat-gateway, atau cls.\n\n');
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
            state.replaying = false;
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
        if (allTestsComplete()) { setStage('quiz'); quiz.showModal(); window.NetGuardEvaluation.clear(); }
    });
    document.querySelector('[data-close-quiz]').addEventListener('click', () => quiz.close());
    document.querySelector('[data-close-finish]').addEventListener('click', () => finish.close());

    learning.addEventListener('close', () => stepGuide.refresh());
    document.querySelector('[data-close-learning]').addEventListener('click', () => learning.close());
    document.querySelector('[data-learning-continue]').addEventListener('click', () => learning.close());
    document.querySelector('[data-reread-learning]').addEventListener('click', () => learning.showModal());
    document.querySelector('[data-save-progress]').addEventListener('click', () => { if (persist()) feedback('Progres Chapter 5 tersimpan pada browser ini.', 'success'); });
    document.querySelector('[data-replay-prologue]').addEventListener('click', () => { prologueIndex = 0; renderPrologue(); prologue.hidden = false; surface.inert = true; scene.classList.add('is-prologue'); });
    const missionStages = [
        ['connect-switch', 'switch-session'],
        ['identity'],
        ['bridge', 'ports'],
        ['switch-ports'],
        ['vlans'],
        ['test'],
        ['quiz'],
        ['finish'],
    ];
    const resetFromStage = (destination) => {
        const index = missionStages.findIndex((mission) => mission.includes(destination));
        const resets = (stage) => missionStages.findIndex((mission) => mission.includes(stage)) >= index;
        cancelDiscovery(); window.clearTimeout(dhcpTimer); dhcpBusy = false; guideRevision++;
        if (resets('connect-switch')) {
            state.connections = { trunk: 'ether1', pcPort: null };
            state.migration = { exitedHap: false, neighborsLoaded: false, connectedHex: false };
            document.querySelector('[data-ch5-connect-to]').value = '';
        }
        if (resets('identity')) { state.identity = 'MikroTik'; state.identitySaved = false; }
        if (resets('bridge')) { state.bridge = null; state.ports = {}; }
        if (resets('switch-ports')) state.switchPorts = {};
        if (resets('vlans')) state.vlans = {};
        if (resets('test')) state.tests = Object.fromEntries(testPorts.map((port) => [port, { ipconfig: false }]));
        delete state.resumeStage;
        state.answers = []; state.evaluationResult = null; state.replaying = true;
        scene.dataset.completed = 'false';
        window.NetGuardEvaluation.clear();
        document.querySelectorAll('[data-quiz-form] input').forEach((input) => { input.checked = false; });
        document.querySelector('[data-submit-quiz]').disabled = false;
        document.querySelector('[data-terminal-input]').value = '';
        document.querySelector('[data-terminal-output]').textContent = 'Microsoft Windows [Version 10.0.19045]\n(c) Microsoft Corporation. All rights reserved.\n\n';
        const defaults = {
            '[data-ch5-identity]': state.identity, '[data-bridge-name]': '', '[data-bridge-protocol]': 'rstp',
            '[data-bridge-mtu]': 'auto', '[data-port-interface]': '', '[data-port-bridge]': 'bridge1', '[data-switch-vlan-mode]': 'disabled',
            '[data-switch-vlan-header]': 'leave as is', '[data-switch-default-vlan]': '0', '[data-vlan-id]': '', '[data-vlan-ports]': '',
        };
        Object.entries(defaults).forEach(([selector, value]) => { document.querySelector(selector).value = value; });
        closeEditors(); activeWindow = null; bridgeTab = 'Bridges'; switchTab = 'Switch';
        bridgeEditTab = 'General'; portEditTab = 'General'; bridgeMinimized = false; bridgeMaximized = true;
        bridgeFilterShown = false; bridgeFilterText = ''; document.querySelector('[data-bridge-filter-name]').value = '';
        terminalOpen = false; cableSelected = false; currentTestPort = nextTestPort(); systemMenu.hidden = true;
    };
    const previousStage = () => {
        if (!prologue.hidden) { if (prologueIndex > 0) { prologueIndex--; renderPrologue(); } return; }
        if (learning.open) { learning.close(); return; }
        if (!dialogue.hidden) { window.clearInterval(dialogueTimer); dialogue.hidden = true; surface.inert = false; }
        if (quiz.open) quiz.close();
        if (finish.open) finish.close();
        const index = missionStages.findIndex((mission) => mission.includes(state.stage));
        if (index <= 0) {
            resetFromStage('connect-switch'); setStage('connect-switch');
            prologueIndex = prologueScenes.length - 1; renderPrologue(); prologue.hidden = false;
            surface.inert = true; scene.classList.add('is-prologue');
            return;
        }
        const destination = missionStages[index - 1][0];
        resetFromStage(destination);
        setStage(destination);
        if (!['connect-switch', 'switch-session', 'test', 'quiz'].includes(destination) && !canConfigure()) { workspace = 'cable'; render(); }
        if (destination === 'quiz') quiz.showModal();
        feedback('Misi sebelumnya diulang dari awal. Hasil misi itu dan misi lanjutannya sudah direset.');
    };
    window.NetGuardChapterNavbar.bindPrevious(previousStage);
    window.NetGuardChapterNavbar.setBackEnabled?.(true);
    document.querySelector('[data-previous]').addEventListener('click', previousStage);
    document.querySelector('[data-ch5-connect-to]').addEventListener('input', () => stepGuide.refresh());
    if (scene.dataset.completed === 'true') { state.stage = 'finish'; workspace = 'pc'; }
    if (state.stage === 'identity' && !state.migration.connectedHex) state.stage = 'switch-session';
    render(); persist();
    if (!state.prologueComplete && scene.dataset.completed !== 'true') { renderPrologue(); prologue.hidden = false; surface.inert = true; scene.classList.add('is-prologue'); if (reducedMotion.matches) closePrologue(); }
    else { prologue.hidden = true; surface.inert = false; scene.classList.remove('is-prologue'); }
})();
