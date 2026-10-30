const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const loadReset = (chapter, context) => {
    const file = chapter === 'one' ? 'chapter-one.js' : 'chapter-' + chapter + '-workbench.js';
    const source = fs.readFileSync(path.join(__dirname, '../public/js', file), 'utf8');
    const start = source.indexOf('    const resetFromStage = (destination) => {');
    const end = source.indexOf(chapter === 'one' ? '    const setStage =' : '    const goToPreviousStep =', start);
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.reset = resetFromStage;', context);
    return context;
};
const node = () => ({ value: '', checked: true, textContent: '', hidden: false, classList: { remove() {} } });
const documentStub = () => {
    const nodes = new Map();
    return { querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, node()); return nodes.get(selector); }, querySelectorAll() { return []; } };
};

const loadClientDesktop = () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const timers = [], errors = [], nodes = new Map();
    const element = (dataset = {}) => ({ dataset, hidden: true, value: '', textContent: '', parentElement: { scrollHeight: 100, scrollTop: 0 }, handlers: {}, addEventListener(name, callback) { this.handlers[name] = callback; }, focus() {} });
    
    const shortcuts = ['local'].map((group) => element({ openClientCmd: group }));
    const closes = ['local'].map((group) => element({ closeClientCmd: group }));
    const forms = ['local'].map((group) => {
        const form = element({ clientCommandForm: group });
        form.input = element(); form.querySelector = () => form.input;
        return form;
    });
    const state = {
        wan: { link: true, bound: true, defaultRoute: true }, dns: { servers: ['8.8.8.8', '8.8.4.4'], remote: true },
        nat: { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade', packets: 0 },
        lan: { local: { ready: true, address: '192.168.100.2', gateway: '192.168.100.1', pool: '192.168.100.2-192.168.100.254' } },
        clientTests: { local: false },
        clientChecks: { local: { config: false, ip: false, domain: false } },
    };
    const context = {
        state, pendingClients: new Set(), resetRevision: 0, clientTestRevision: 0,
        done: () => true, recordGuideAction() {}, render() {}, persist() {}, message() {}, explainError: (text) => errors.push(text),
        reasonText: { nat: 'NAT must be fixed', lan: 'DHCP configuration missing' },
        window: { setTimeout(callback) { timers.push(callback); } },
        document: {
            querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); },
            querySelectorAll(selector) { return ({ '[data-open-client-cmd]': shortcuts, '[data-close-client-cmd]': closes, '[data-client-command-form]': forms })[selector] || []; },
        },
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-simulation.js'), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js/lab-pc-desktop.js'), 'utf8'), context);
    context.model = context.window.NetGuardChapterThree;
    const start = source.indexOf('    const appendClientTerminal =');
    const end = source.indexOf("    document.querySelector('[data-close-quiz]')", start);
    vm.runInContext(source.slice(start, end), context);
    return {
        context, state, errors, shortcuts, nodes,
        command(group, text) { const form = forms[0]; form.input.value = text; form.handlers.submit({ preventDefault() {} }); },
        flush() { while (timers.length) timers.shift()(); },
        output(group) { return context.document.querySelector('[data-client-terminal="' + group + '"]').textContent; },
    };
};

test('the existing lab PC requires IP inspection and both manual ping commands', () => {
    const lab = loadClientDesktop();
    assert.equal(lab.state.clientTests.local, false);
    lab.command('local', 'ping google.com');
    assert.match(lab.errors.pop(), /ipconfig/);
    lab.command('local', 'ipconfig /all'); lab.flush();
    assert.match(lab.output('local'), /192\.168\.100\.2/);
    assert.equal(lab.state.clientTests.local, false);
    lab.command('local', 'ping google.com');
    assert.match(lab.errors.pop(), /ping 8\.8\.8\.8/);
    lab.command('local', 'ping 8.8.8.8'); lab.flush();
    assert.equal(lab.state.clientTests.local, false);
    lab.command('local', 'ping google.com'); lab.flush();
    assert.match(lab.output('local'), /Received = 4, Lost = 0/);
    assert.equal(lab.state.clientTests.local, true);
});

test('PC failures show command output and teacher guidance; stale commands cannot complete a reset mission', () => {
    const lab = loadClientDesktop();
    lab.command('local', 'ipconfig /all'); lab.flush();
    lab.state.nat.disabled = true;
    lab.command('local', 'ping 8.8.8.8'); lab.flush();
    assert.match(lab.output('local'), /Request timed out/);
    assert.equal(lab.state.clientChecks.local.ip, false);
    assert.equal(lab.errors.pop(), 'NAT must be fixed');
    lab.state.nat.disabled = false;
    lab.command('local', 'ping 8.8.8.8');
    lab.context.resetRevision++;
    lab.context.pendingClients.clear();
    lab.flush();
    assert.equal(lab.state.clientChecks.local.ip, false);
    assert.equal(lab.state.clientTests.local, false);
    lab.command('local', 'not-a-command');
    assert.match(lab.errors.pop(), /Command Prompt PC/);
});

test('CP1 returning to preparation resets cable work and later tasks but keeps recognized tools', () => {
    const context = loadReset('one', {
        visitedDevices: new Set(['hap', 'tester']), prepStep: 3, wireEnd: 1, wireVerified: [true, true], topologyChecked: true, loginAccepted: true,
        wirePlacements: [Array(8).fill('orange'), Array(8).fill('orange')], wireHistory: [[1], [2]],
        terminateEnd: 1, terminateStep: 3, testerMain: true, testerRemote: true, testerPassed: true,
        selectedTesterEnd: 'A', selectedTopologyCable: 'internet', pcPowered: true, pcBooting: false,
        neighborsLoaded: true, macSelected: true, identitySaved: true, configCelebrated: true,
        interfaceSaved: { ether1: true, ether2: true, ether3: true }, editingInterface: 'ether1',
        evaluationResult: { correctAnswers: 5 }, evaluation: { clear() {} },
        explainedConfiguration: new Set(['identity', 'interfaces']), shownMissionDialogue: new Set(['prep', 'config']), document: documentStub(),
    });
    context.reset('prep');
    assert.equal(context.prepStep, 0);
    assert.equal(context.visitedDevices.size, 2);
    assert.ok(context.wirePlacements.every((row) => row.every((value) => value === null)));
    assert.equal(context.testerPassed, false);
    assert.equal(context.pcPowered, false);
    assert.equal(context.identitySaved, false);
    assert.equal(context.evaluationResult, null);
});

test('CP2 returning to addresses retains VLAN and WAN but clears gateway and DHCP results', () => {
    const context = loadReset('two', {
        resetRevision: 0, stages: ['intro', 'vlan', 'wan', 'addresses', 'dhcp', 'verify', 'quiz', 'finish'],
        state: { vlan: { student: true, teacher: true }, wan: true, addresses: { local: true, student: true, teacher: true, wireless: true }, pools: { student: 'pool', teacher: 'pool' }, clients: { student: true, teacher: true }, clientLeases: { student: {} }, highest: 7 },
        defaults: { vlan: { student: false, teacher: false }, addresses: { local: false, student: false, teacher: false, wireless: false }, pools: { student: '', teacher: '' }, clients: { student: false, teacher: false } },
        requestingClients: new Set(['student']), persistedFields: [], document: documentStub(), evaluation: { clear() {} },
    });
    context.reset('addresses');
    assert.equal(context.state.vlan.student, true);
    assert.equal(context.state.wan, true);
    assert.ok(Object.values(context.state.addresses).every((value) => value === false));
    assert.equal(context.state.pools.student, '');
    assert.equal(context.state.clients.student, false);
    assert.equal(Object.keys(context.state.clientLeases).length, 0);
    assert.equal(context.state.highest, 3);
    assert.equal(context.resetRevision, 1);
});

test('CP3 returning to NAT retains DNS and resets NAT plus subsequent connectivity checks', () => {
    const context = loadReset('three', {
        resetRevision: 0, missionCompletionTimer: null, announcedMission: null, guideAdvanceTimer: null, guideStage: null, guideIndex: 0, stageNames: ['dns', 'nat', 'router', 'clients'],
        state: { guideActions: {}, wanChecked: true, dns: { servers: ['8.8.8.8', '8.8.4.4'], remote: true }, nat: { action: 'masquerade' }, routerTests: { ip: true, domain: true }, clientTests: { local: true } },
        pendingClients: new Set(['student']), pendingRouterTest: true, selectedNat: true,
        document: documentStub(), evaluation: { clear() {} },
    });
    context.reset('nat');
    assert.equal(context.state.wanChecked, false);
    assert.equal(context.state.dns.remote, true);
    assert.equal(context.state.nat, null);
    assert.equal(context.state.routerTests.ip, false);
    assert.equal(context.state.clientTests.local, false);
    assert.equal(context.pendingClients.size, 0);
    assert.equal(context.pendingRouterTest, false);
});

test('CP1 configuration guide requires saving identity and every interface', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-one.js'), 'utf8');
    const start = source.indexOf('    const getChapterOneGuidePlan =');
    const end = source.indexOf('    progressiveGuide = window.NetGuardStepGuide.create', start);
    const context = {
        stage: 'config', identitySaved: false, interfaceSaved: { ether1: false, ether2: false, ether3: false }, editingInterface: null,
        document: { querySelector: () => ({ hidden: true, value: '' }) },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.plan = getChapterOneGuidePlan;', context);
    assert.ok(context.plan().every((step) => !step[1]));
    context.identitySaved = true;
    context.interfaceSaved.ether1 = true;
    const plan = context.plan();
    assert.equal(plan[1][1], true);
    assert.equal(plan[3][1], true);
    assert.equal(plan[5][1], false);
    assert.equal(plan[7][1], false);
    context.interfaceSaved.ether1 = false;
    assert.equal(context.plan()[3][1], false);
});

test('CP1 empty workspace closes child windows and Identity opens only on request', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-one.js'), 'utf8');
    const start = source.indexOf('    const showConfigPanel =');
    const end = source.indexOf("\n    document.querySelector('[data-config-nav=\"system\"]').setAttribute", start);
    const nodes = new Map();
    const create = () => ({ hidden: false, value: '', style: {}, classList: { toggle() {} }, setAttribute() {}, removeAttribute() {} });
    const children = [create(), create(), create()];
    const context = {
        document: { querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, create()); return nodes.get(selector); }, querySelectorAll(selector) { return selector.includes('.winbox-child') ? children : []; } },
        explainedConfiguration: new Set(), minimizedWindows: new Set(['identity']), identitySaved: false,
        windowTitles: { identity: 'Identity', interfaces: 'Interface List', edit: 'Interface' }, windowOrder: 5,
        renderWindowTaskbar() {}, saveProgress() {}, showConfigurationLearning() {},
    };
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.show = showConfigPanel;', context);
    context.show('home');
    assert.ok(children.every((child) => child.hidden));
    assert.equal(context.minimizedWindows.size, 0);
    assert.equal(nodes.get('[data-system-menu]').hidden, true);
    assert.equal(nodes.get('[data-ip-menu]').hidden, true);
    context.show('ip', true);
    assert.equal(nodes.get('[data-ip-menu]').hidden, false);
    assert.equal(nodes.get('[data-system-menu]').hidden, true);
    context.show('system', true);
    assert.equal(nodes.get('[data-ip-menu]').hidden, true);
    context.show('identity');
    assert.equal(nodes.has('[data-config-panel="identity"]'), false);
    context.explainedConfiguration.add('material-identity');
    context.show('identity', true);
    assert.equal(nodes.get('[data-identity-input]').value, 'MikroTik');
    assert.equal(nodes.get('[data-config-panel="identity"]').hidden, false);
});

test('CP2 mission briefing provides navigation guidance without opening a configuration window', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const mainAction =');
    const end = source.indexOf('    let resetRevision', start);
    let feedback = '';
    let opened = 0;
    const context = { state: { stage: 'vlan' }, isCurrentTaskDone: () => false, message: (text) => { feedback = text; }, openWindow: () => { opened++; } };
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.act = mainAction;', context);
    context.act();
    assert.equal(opened, 0);
    assert.match(feedback, /Interfaces.*VLAN.*\+/);
    context.state.stage = 'addresses'; context.act();
    assert.equal(opened, 0);
    assert.match(feedback, /IP.*Addresses/);
});

test('CP2 VLAN opens only after player clicks Interfaces then VLAN; reentry clears windows', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const clearWorkspace =');
    const end = source.indexOf('    const closeWindow =', start);
    const makeWindow = () => ({ hidden: true, attributes: {}, classList: { remove() {} }, setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; }, querySelector() { return null; } });
    const windows = new Map([['interfaces', makeWindow()], ['vlan', makeWindow()], ['routes', makeWindow()]]);
    let feedback = '';
    const context = { windows, taskbar: { replaceChildren() {}, querySelector() { return null; } }, document: { querySelectorAll() { return []; } }, closeNavigationMenus() {}, canOpen() { return true; }, message(text) { feedback = text; }, removeTaskbarButton() {}, focusWindow() {} };
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.open = openWindow; globalThis.clear = clearWorkspace;', context);
    context.open('vlan');
    assert.equal(windows.get('vlan').hidden, true);
    context.open('vlan', true);
    assert.equal(windows.get('vlan').hidden, true);
    assert.match(feedback, /Interfaces/);
    context.open('interfaces', true);
    assert.equal(windows.get('interfaces').hidden, false);
    assert.equal(windows.get('vlan').hidden, true);
    context.open('vlan', true);
    assert.equal(windows.get('vlan').hidden, false);
    assert.equal(windows.get('vlan').attributes['data-player-open'], 'true');
    context.clear();
    assert.ok([...windows.values()].every((node) => node.hidden && !node.attributes['data-player-open']));
});

test('CP2 dismissed materials can reopen and return to the current task without resetting it', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf("    document.querySelector('[data-review-material]')");
    const end = source.indexOf("    document.querySelector('[data-close-quiz]')", start);
    const elements = new Map();
    const get = (selector) => { if (!elements.has(selector)) elements.set(selector, { textContent: '', events: {}, addEventListener(name, handler) { this.events[name] = handler; } }); return elements.get(selector); };
    let resets = 0;
    const context = { state: { stage: 'wan', wan: true }, pendingStage: null, document: { querySelector: get }, learningDialog: { open: false, close() { this.open = false; } }, mainAction() {}, setStage() { resets++; }, message() {} };
    context.showConcept = () => { context.learningDialog.open = true; context.pendingStage = 'wan'; };
    vm.createContext(context); vm.runInContext(source.slice(start, end), context);
    get('[data-review-material]').events.click();
    assert.equal(context.learningDialog.open, true);
    get('[data-close-learning]').events.click();
    assert.equal(context.learningDialog.open, false);
    get('[data-review-material]').events.click();
    get('[data-learning-continue]').events.click();
    assert.equal(context.learningDialog.open, false);
    assert.equal(context.state.stage, 'wan');
    assert.equal(context.state.wan, true);
    assert.equal(resets, 0);
    assert.equal(context.pendingStage, null);
});

test('CP2 DHCP Client uses Add, preserves options, binds asynchronously and removes cleanly', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const wanTab =');
    const end = source.indexOf('    const addresses =', start);
    const nodes = new Map();
    const node = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { value: '', checked: false, hidden: false, textContent: '', dataset: {}, events: {}, classList: { toggle() {} }, setAttribute() {}, addEventListener(name, handler) { this.events[name] = handler; } });
        return nodes.get(selector);
    };
    const save = node('save'); save.dataset.saveWan = 'ok';
    const timers = [];
    const opened = [];
    let warnings = 0;
    const context = {
        document: { querySelector: node, querySelectorAll(selector) { return selector === '[data-save-wan]' ? [save] : []; } },
        state: { wanClient: null, wan: false }, selectedWan: false, wanDraftDisabled: false, wanBindingRevision: 0, resetRevision: 0,
        window: { setTimeout(callback) { timers.push(callback); } },
        openWindow(name) { opened.push(name); }, closeWindow() {}, persist() {}, render() {}, message() {}, openDialogue() { warnings++; }, explainDhcpError() { warnings++; },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.tool = wanTool; globalThis.paint = renderWanClient;', context);
    node('[data-new-wan]').events.click();
    assert.deepEqual(opened, ['wan-edit']);
    assert.equal(node('[data-wan-peer-dns]').checked, true);
    assert.equal(node('[data-wan-default-route]').value, 'yes');
    node('[data-wan-interface]').value = 'ether2-vlan'; save.events.click();
    assert.equal(warnings, 1);
    assert.equal(context.state.wanClient, null);
    node('[data-wan-interface]').value = 'ether1-internet'; save.events.click();
    assert.equal(context.state.wanClient.bound, false);
    context.paint(); assert.equal(node('[data-wan-status]').textContent, 'searching...');
    timers.shift()(); context.paint();
    assert.equal(context.state.wan, true);
    assert.equal(node('[data-wan-status]').textContent, 'bound');
    assert.equal(context.state.wanClient.peerDns, true);
    context.tool('renew'); context.tool('remove');
    timers.shift()(); context.paint();
    assert.equal(context.state.wanClient, null);
    assert.equal(context.state.wan, false);
    assert.equal(node('[data-wan-row]').hidden, true);
});

test('CP2 waits before explaining bound and ignores completion after leaving the WAN mission', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const render =');
    const end = source.indexOf('    const restoreDrafts =', start);
    const timers = [];
    let speeches = 0;
    const context = {
        state: { stage: 'wan', wanClient: {} }, announcedStage: null, wanCompletionTimer: null,
        finishedInformation: { wan: ['DHCP Client bound', 'Lanjut ke gateway'] }, renderTask() {}, renderLists() {},
        isCurrentTaskDone() { return true; }, openDialogue() { speeches++; }, mainAction() {}, dialogue: { hidden: true }, learningDialog: { open: false }, windows: new Map([['wan', { hidden: false }]]),
        window: { setTimeout(callback, duration) { timers.push({ callback, duration }); return timers.length; }, clearTimeout() {} },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.paint = render;', context);
    context.paint();
    assert.equal(speeches, 0);
    assert.equal(timers[0].duration, 1500);
    context.paint(); assert.equal(timers.length, 1);
    timers[0].callback(); assert.equal(speeches, 1);
    context.announcedStage = null; context.paint(); context.state.stage = 'addresses';
    timers[1].callback(); assert.equal(speeches, 1);
});

test('CP2 every error message opens Pak Amat while normal feedback stays in the guide', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const message =');
    const end = source.indexOf('    const finishDialogueTyping =', start);
    const speeches = [];
    const feedback = [{ textContent: '', dataset: {} }];
    const context = { feedback, window: {}, openDialogue(lines) { speeches.push(lines); } };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.notify = message;', context);
    context.notify('Interface salah, pilih ether2-vlan.', 'error');
    assert.equal(speeches.length, 1);
    assert.equal(speeches[0][0], 'Interface salah, pilih ether2-vlan.');
    assert.equal(feedback[0].dataset.kind, 'error');
    context.notify('Tersimpan.', 'success');
    assert.equal(speeches.length, 1);
});

test('CP2 requires all four module DHCP interfaces and accepts local and Wi-Fi setup', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const groups = ['local', 'student', 'teacher', 'wireless'];
    const values = { '[data-pool-interface]': { value: 'ether3-local' } };
    const context = {
        dhcpGroups: groups, dhcpPrefixes: { local: 100, student: 40, teacher: 60, wireless: 20 }, dhcpNames: { local: 'PC lokal', student: 'siswa', teacher: 'guru', wireless: 'Wi-Fi' },
        state: { pools: { student: 'range', teacher: 'range' }, dhcpDisabled: {}, vlan: { student: true, teacher: true }, addresses: { local: true, student: true, teacher: true, wireless: true }, addressDisabled: {} },
        dhcpStep: 0, normal: (text) => text.trim(), dhcpGroup: () => values['[data-pool-interface]'].value === 'wlan1' ? 'wireless' : 'local',
        document: { querySelector: (selector) => values[selector] }, explainDhcpError() { return false; },
    };
    vm.createContext(context);
    const completeLine = source.split('\n').find((line) => line.includes('const completePools ='));
    const start = source.indexOf('    const validateDhcpStep =');
    const end = source.indexOf("    document.querySelector('[data-pool-interface]').addEventListener", start);
    vm.runInContext(completeLine + source.slice(start, end) + '\nglobalThis.complete = completePools; globalThis.validate = validateDhcpStep;', context);
    assert.equal(context.complete(), false);
    assert.equal(context.validate(), true);
    values['[data-pool-interface]'].value = 'wlan1'; assert.equal(context.validate(), true);
    context.state.pools.local = 'range'; context.state.pools.wireless = 'range';
    assert.equal(context.complete(), true);
    context.state.dhcpDisabled.wireless = true; assert.equal(context.complete(), false);
});

test('CP2 DHCP wizard proposes the native subnet range and preserves manually entered module ranges', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf("    document.querySelector('[data-start-dhcp]').addEventListener");
    const end = source.indexOf("    document.querySelectorAll('[data-pool-row]')", start);
    for (const [group, prefix] of Object.entries({ local: 100, student: 40, teacher: 60, wireless: 20 })) {
        const nodes = new Map();
        const get = (selector) => {
            if (!nodes.has(selector)) nodes.set(selector, { value: '', events: {}, addEventListener(name, callback) { this.events[name] = callback; } });
            return nodes.get(selector);
        };
        const context = {
            document: { querySelector: get }, dhcpStep: 0, dhcpSetupGroup: null,
            dhcpGroup: () => group, dhcpPrefixes: { [group]: prefix },
            validateDhcpStep: () => true, paintDhcpStep() {}, openWindow() {},
            closeWindow() {}, render() {},
        };
        vm.createContext(context); vm.runInContext(source.slice(start, end), context);
        get('[data-start-dhcp]').events.click();
        get('[data-dhcp-next]').events.click();
        assert.equal(get('[data-pool-range]').value, `192.168.${prefix}.2-192.168.${prefix}.254`);
        get('[data-dhcp-next]').events.click();
        get('[data-dhcp-next]').events.click();
        assert.equal(context.dhcpStep, 3);
        const manual = `192.168.${prefix}.10-192.168.${prefix}.50`;
        get('[data-pool-range]').value = manual;
        get('[data-dhcp-back]').events.click();
        get('[data-dhcp-next]').events.click();
        assert.equal(get('[data-pool-range]').value, manual);
    }
});

test('CP2 explains valid ranges that differ from the module without replacing student input', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const poolStart = source.indexOf('    const validPool =');
    const poolEnd = source.indexOf('    const dhcpGroup =', poolStart);
    const start = source.indexOf('    const validateDhcpStep =');
    const end = source.indexOf("    document.querySelector('[data-pool-interface]').addEventListener", start);
    for (const [group, prefix] of Object.entries({ student: 40, teacher: 60, wireless: 20, local: 100 })) {
        const range = { value: `192.168.${prefix}.10-192.168.${prefix}.100` };
        const warnings = [];
        const context = {
            dhcpStep: 3, dhcpGroup: () => group,
            dhcpPrefixes: { [group]: prefix }, dhcpNames: { [group]: group },
            normal: (text) => text.trim(),
            document: { querySelector: (selector) => selector === '[data-pool-range]' ? range : { value: 'interface' } },
            explainDhcpError(text, selector) { warnings.push({ text, selector }); return false; },
        };
        vm.createContext(context);
        vm.runInContext(source.slice(poolStart, poolEnd) + source.slice(start, end) + '\nglobalThis.validate = validateDhcpStep;', context);
        assert.equal(context.validate(), group === 'local');
        if (group !== 'local') {
            assert.match(warnings[0].text, /belum sesuai alokasi jaringan sekolah ini/);
            assert.match(warnings[0].text, /41 alamat/);
            assert.match(warnings[0].text, /Alamat lainnya tidak ikut dibagikan otomatis/);
            assert.doesNotMatch(warnings[0].text, /modul|ketentuan latihan/i);
            assert.equal(warnings[0].selector, '[data-pool-range]');
            assert.equal(range.value, `192.168.${prefix}.10-192.168.${prefix}.100`);
        }
        range.value = `192.168.${prefix}.10-192.168.${prefix}.50`;
        assert.equal(context.validate(), true);
        range.value = `192.168.${prefix}.50-192.168.${prefix}.10`;
        assert.equal(context.validate(), false);
        assert.match(warnings.at(-1).text, /belum valid/);
    }
});

test('CP2 evaluation and result stages never open teacher instructions over their popups', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const setStage =');
    const end = source.indexOf('    const conceptNext =', start);
    const speeches = [];
    const context = {
        stages: ['dhcp', 'quiz', 'finish'], state: { stage: 'dhcp', highest: 0 },
        wanCompletionTimer: null, persist() {}, render() {}, message() {},
        document: { querySelector: () => ({ scrollTo() {} }) },
        isCurrentTaskDone: () => false,
        stageInformation: { dhcp: ['', 'Siapkan DHCP', 'Konfigurasi jaringan'] },
        openDialogue(lines) { speeches.push(lines); }, mainAction() {},
    };
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.transition = setStage;', context);
    context.transition('quiz'); context.transition('finish');
    assert.equal(speeches.length, 0);
    context.transition('dhcp');
    assert.equal(speeches.length, 1);
});

test('CP2 opens evaluation immediately after the pre-evaluation recap is dismissed', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf("    document.querySelector('[data-review-material]')");
    const end = source.indexOf("    document.querySelector('[data-close-quiz]')", start);
    const nodes = new Map();
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { events: {}, addEventListener(name, handler) { this.events[name] = handler; } });
        return nodes.get(selector);
    };
    const sequence = [];
    const context = {
        document: { querySelector: get }, state: { stage: 'dhcp' }, pendingStage: 'quiz',
        learningDialog: { close() { sequence.push('close recap'); } },
        setStage(stage) { this.state.stage = stage; sequence.push(stage); },
        quizDialog: { showModal() { sequence.push('open evaluation'); } },
        showConcept() {}, mainAction() {}, message() {},
    };
    // Functions are called as ordinary callbacks in the workbench.
    context.setStage = (stage) => { context.state.stage = stage; sequence.push(stage); };
    vm.createContext(context); vm.runInContext(source.slice(start, end), context);
    get('[data-learning-continue]').events.click();
    assert.deepEqual(sequence, ['close recap', 'quiz', 'open evaluation']);
    assert.equal(context.pendingStage, null);
});

test('CP3 prologue types title then body, skips typing before advancing, and cancels old timers', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const finishPrologueTyping =');
    const end = source.indexOf("    prologue.addEventListener('click'", start);
    const nodes = new Map();
    const timers = new Map();
    let timerId = 0;
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { textContent: '', style: {}, classList: { add() {}, remove() {} } });
        return nodes.get(selector);
    };
    const context = {
        scenes: [['Hi', 'First'], ['Next', 'Second']], prologueIndex: 0,
        prologueTimer: null, prologueTyping: false, replaying: false,
        prologue: { hidden: false, focus() {} }, scene: { classList: { add() {}, remove() {} } },
        surface: { inert: true }, state: {}, persist() {}, say() {}, updateBackAvailability() {},
        document: { querySelector: get },
        window: { matchMedia: () => ({ matches: false }), setInterval(callback) { timers.set(++timerId, callback); return timerId; }, clearInterval(id) { timers.delete(id); } },
    };
    vm.createContext(context);
    vm.runInContext(source.slice(start, end) + '\nglobalThis.paint = paintPrologue; globalThis.advance = advancePrologue;', context);
    context.paint();
    assert.equal(get('[data-ch2-prologue-title]').textContent, '');
    const tick = () => [...timers.values()].forEach((callback) => callback());
    tick(); assert.equal(get('[data-ch2-prologue-title]').textContent, 'H');
    tick(); tick(); assert.equal(get('[data-ch2-prologue-text]').textContent, 'F');
    context.advance();
    assert.equal(context.prologueIndex, 0);
    assert.equal(get('[data-ch2-prologue-text]').textContent, 'First');
    assert.equal(timers.size, 0);
    context.advance();
    assert.equal(context.prologueIndex, 1);
    assert.equal(timers.size, 1);
    assert.equal(get('[data-ch2-prologue-kicker]').textContent, 'PROLOG · 02');
    context.prologueIndex = 0; context.paint();
    assert.equal(timers.size, 1);
    for (let i = 0; i < 7; i++) tick();
    assert.equal(get('[data-ch2-prologue-text]').textContent, 'First');
    assert.equal(context.prologueTyping, false);
    context.window.matchMedia = () => ({ matches: true });
    context.paint();
    assert.equal(timers.size, 0);
    assert.equal(get('[data-ch2-prologue-title]').textContent, 'Hi');
});

test('CP3 WAN completion requires inspecting both native table rows, not just inherited configuration', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const inspectWan =');
    const end = source.indexOf("    document.querySelectorAll('[data-inspect-wan]')", start);
    const warnings = [];
    const context = {
        state: { stage: 'router', wan: { link: true, bound: true, defaultRoute: true }, wanChecked: false, wanInspected: { client: false, route: false }, routerTests: { ip: false, domain: false } },
        model: { wanReady: (state) => state.wan.link && state.wan.bound && state.wan.defaultRoute, dnsValid: () => false, natValid: () => false, routerTest: () => ({ ok: true }) },
        groups: [],
        persist() {}, render() {}, explainError(text) { warnings.push(text); },
        reasonText: { link: 'no link', wan: 'not bound', route: 'no route' },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.inspect = inspectWan;', context);
    assert.equal(context.state.wanChecked, false);
    context.inspect('route');
    assert.equal(context.state.wanInspected.route, false);
    assert.match(warnings.pop(), /DHCP Client.*Address 192\.0\.2\.2\/24/);
    context.state.wan.bound = false;
    context.inspect('client');
    context.inspect('route');
    assert.equal(context.state.wanInspected.client, false);
    assert.equal(context.state.wanInspected.route, false);
    assert.deepEqual(warnings.splice(0), ['not bound', 'not bound']);
    context.state.wan.bound = true;
    context.inspect('client');
    assert.equal(context.state.wanInspected.client, true);
    assert.equal(context.state.wanChecked, false);
    context.inspect('route');
    assert.equal(context.state.wanChecked, true);
    const doneStart = source.indexOf('    const done =');
    const doneEnd = source.indexOf('    const taskItems =', doneStart);
    vm.runInContext(source.slice(doneStart, doneEnd) + '\nglobalThis.missionDone = done;', context);
    assert.equal(context.missionDone('router'), false, 'clicking the default route cannot prove internet access');
    context.state.routerTests.ip = true;
    assert.equal(context.missionDone('router'), false, 'the domain ping is required as well');
    context.state.routerTests.domain = true;
    assert.equal(context.missionDone('router'), true);
    context.state.wanInspected.route = false; context.state.wan.defaultRoute = false; context.state.wanChecked = false;
    context.inspect('route'); assert.equal(context.state.wanInspected.route, false);
    assert.deepEqual(warnings, ['no route']);
    context.state.stage = 'dns'; context.state.wanInspected.client = false;
    context.inspect('client'); assert.equal(context.state.wanInspected.client, false);
});

test('CP3 shows the next mission material only after real completion and finishing teacher dialogue', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const queueMissionCompletion =');
    const end = source.indexOf('    const beginLesson =', start);
    const timers = new Map(); let timerId = 0; let isDone = false;
    const sequence = []; let continueDialogue;
    const context = {
        state: { stage: 'dns' }, stageNames: ['dns', 'nat'], info: { dns: { title: 'WAN' } },
        missionCompletionTimer: null, announcedMission: null, resetRevision: 0,
        learning: { open: false }, overlay: { hidden: true }, prologue: { hidden: true },
        done: () => isDone,
        window: { setTimeout(callback) { timers.set(++timerId, callback); return timerId; }, clearTimeout(id) { timers.delete(id); } },
        say(text, callback) { sequence.push('dialogue'); continueDialogue = callback; },
        teach(name) { sequence.push('material:' + name); }, setStage() {}, quiz: { showModal() {} },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.queue = queueMissionCompletion;', context);
    context.queue(); assert.equal(timers.size, 0);
    isDone = true; context.queue(); assert.equal(timers.size, 1);
    const callback = [...timers.values()][0]; timers.clear(); callback();
    assert.deepEqual(sequence, ['dialogue']);
    continueDialogue(); assert.deepEqual(sequence, ['dialogue', 'material:nat']);
    context.queue(); assert.equal(timers.size, 0);
    context.announcedMission = null; context.queue(); context.resetRevision++;
    [...timers.values()][0](); assert.equal(sequence.length, 2);
});

test('CP3 DNS guide distinguishes entering correct values from actually saving them', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const guidePlan =');
    const end = source.indexOf('    const renderGuide =', start);
    const nodes = new Map();
    const get = (selector) => { if (!nodes.has(selector)) nodes.set(selector, { value: '', checked: false }); return nodes.get(selector); };
    const servers = [{ value: '' }, { value: '' }];
    let saved = false;
    const context = {
        state: { stage: 'dns', guideActions: {}, dns: { servers: [], remote: false } },
        document: { querySelector: get, querySelectorAll: () => servers },
        model: { dnsValid: (state) => state.dns.servers.includes('8.8.8.8') && state.dns.servers.includes('8.8.4.4') },
        done: () => saved,
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.plan = guidePlan;', context);
    assert.equal(Boolean(context.plan()[0][1]), false);
    context.state.guideActions.dns = { 'open:dns': true };
    assert.equal(context.plan()[0][1], true);
    servers[0].value = '8.8.8.8'; servers[1].value = '8.8.4.4';
    get('[data-dns-remote]').checked = true;
    assert.equal(context.plan()[1][1], true);
    assert.equal(context.plan()[2][1], true);
    assert.equal(context.plan()[3][1], false);
    saved = true; assert.equal(context.plan()[3][1], true);
});

test('CP3 starts with DNS then NAT and migrates the old WAN mission without clearing settings', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const stageNames =');
    const end = source.indexOf('    state.routerTests =', start);
    const dns = { servers: ['8.8.8.8', '8.8.4.4'], remote: true };
    const nat = { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade' };
    const context = { state: { stage: 'wan', dns, nat } };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.order = stageNames;', context);
    assert.deepEqual(Array.from(context.order), ['dns', 'nat', 'router', 'clients']);
    assert.equal(context.state.stage, 'dns');
    assert.equal(context.state.dns, dns);
    assert.equal(context.state.nat, nat);
});

test('CP3 can add the second DNS field and select NAT before creating a rule', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const nodes = new Map();
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { hidden: true, events: {}, focused: false, addEventListener(name, callback) { this.events[name] = callback; }, focus() { this.focused = true; } });
        return nodes.get(selector);
    };
    const tabs = ['filter', 'nat'].map((tab) => ({ dataset: { firewallTab: tab }, events: {}, active: tab === 'filter', addEventListener(name, callback) { this.events[name] = callback; }, classList: { toggle(name, active) { this.owner.active = active; } } }));
    tabs.forEach((tab) => { tab.classList.owner = tab; });
    const panels = ['filter', 'nat'].map((tab) => ({ dataset: { firewallPanel: tab }, hidden: tab === 'nat' }));
    const actions = [];
    const context = { document: { querySelector: get, querySelectorAll: (selector) => selector === '[data-firewall-tab]' ? tabs : panels }, renderGuide() {}, recordGuideAction(action) { actions.push(action); } };
    vm.createContext(context);
    const dnsStart = source.indexOf("    document.querySelector('[data-add-dns-server]')");
    const dnsEnd = source.indexOf("    document.querySelectorAll('[data-save-dns]')", dnsStart);
    const natStart = source.indexOf("    document.querySelectorAll('[data-firewall-tab]')");
    const natEnd = source.indexOf('    const natTab =', natStart);
    vm.runInContext(source.slice(dnsStart, dnsEnd) + source.slice(natStart, natEnd), context);
    get('[data-add-dns-server]').events.click();
    assert.equal(get('[data-dns-second]').hidden, false);
    assert.equal(get('[data-dns-server="1"]').focused, true);
    assert.equal(panels[1].hidden, true);
    tabs[1].events.click();
    assert.equal(panels[0].hidden, true);
    assert.equal(panels[1].hidden, false);
    assert.equal(tabs[1].active, true);
    assert.deepEqual(actions, ['firewall:nat']);
});

test('CP3 explains the DNS task in teacher chat before opening the short DNS material', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const start = source.indexOf('    const showLesson =');
    const end = source.indexOf('    const queueMissionCompletion =', start);
    const nodes = new Map();
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { textContent: '', children: [], replaceChildren(...children) { this.children = children; } });
        return nodes.get(selector);
    };
    let continueChat;
    const speeches = [];
    const definition = 'DNS menerjemahkan nama situs menjadi alamat IP.';
    const context = {
        nextLesson: null, info: { dns: { title: 'Atur DNS router', lesson: definition } },
        document: { querySelector: get, createElement: () => ({ textContent: '' }) },
        learning: { open: false, showModal() { this.open = true; } },
        say(text, callback) { speeches.push(text); continueChat = callback; },
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.teachDns = () => teach("dns");', context);
    context.teachDns();
    assert.equal(context.learning.open, false);
    assert.equal(context.nextLesson, null);
    assert.match(speeches[0], /akan mengatur DNS/);
    assert.match(speeches[0], /Tujuannya/);
    assert.match(speeches[0], /google\.com/);
    assert.match(speeches[0], /DNS Google/);
    assert.match(speeches[0], /8\.8\.8\.8 dan 8\.8\.4\.4/);
    assert.doesNotMatch(speeches[0], /materi|modul|setelah membaca/i);
    continueChat();
    assert.equal(context.learning.open, true);
    assert.equal(context.nextLesson, 'dns');
    assert.equal(get('[data-learning-title]').textContent, 'Apa itu DNS?');
    assert.equal(get('[data-learning-body]').children.length, 1);
    assert.equal(get('[data-learning-body]').children[0].textContent, definition);
});

const loadChapterTwoGuide = () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-two-workbench.js'), 'utf8');
    const start = source.indexOf('    const getChapterTwoGuidePlan =');
    const end = source.indexOf('    progressiveGuide = window.NetGuardStepGuide.create', start);
    const nodes = new Map();
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { value: '', checked: true });
        return nodes.get(selector);
    };
    const context = {
        state: { stage: 'vlan', vlan: { student: false, teacher: false }, addresses: {}, addressDisabled: {}, pools: {}, dhcpDisabled: {}, wan: false, wanClient: null },
        windows: new Map(['interfaces', 'vlan', 'vlan-edit', 'wan', 'wan-edit', 'addresses', 'address-edit', 'dhcp', 'dhcp-setup'].map((name) => [name, { hidden: true }])),
        dhcpGroups: ['local', 'student', 'teacher', 'wireless'],
        dhcpPrefixes: { local: 100, student: 40, teacher: 60, wireless: 20 },
        dhcpNames: { local: 'PC lokal', student: 'siswa', teacher: 'guru', wireless: 'Wi-Fi' },
        addressInterfaces: { local: 'ether3-local', student: 'vlan1-siswa', teacher: 'vlan2-guru', wireless: 'wlan1' },
        editingVlan: 'student', dhcpStep: 0, normal: (value) => value.trim().toLowerCase().replaceAll(' ', ''),
        document: { querySelector: get },
        completeVlan: () => false, completeAddresses: () => false, completePools: () => false,
        dhcpGroup: () => get('[data-pool-interface]').value,
        dhcpStepInstruction: (group, step) => ({ title: group + ':' + step, text: 'Isi layar saat ini', values: [['Field', 'target']], action: 'Klik Next.' }),
    };
    vm.createContext(context); vm.runInContext(source.slice(start, end) + '\nglobalThis.plan = getChapterTwoGuidePlan;', context);
    return { context, get };
};

test('CP2 VLAN and gateway instructions require the correct fields and a separate save', () => {
    const { context, get } = loadChapterTwoGuide();
    context.windows.get('vlan').hidden = false;
    context.windows.get('vlan-edit').hidden = false;
    get('[data-vlan-name]').value = 'vlan1-siswa'; get('[data-vlan-id]').value = '10'; get('[data-vlan-parent]').value = 'ether1-internet';
    assert.equal(context.plan()[3][1], false);
    get('[data-vlan-parent]').value = 'ether2-vlan';
    assert.equal(context.plan()[3][1], true);
    assert.equal(context.plan()[4][1], false);
    context.state.vlan.student = true; assert.equal(context.plan()[4][1], true);
    context.state.stage = 'addresses'; context.windows.get('address-edit').hidden = false;
    get('[data-address-input]').value = '192.168.100.1/24'; get('[data-address-interface]').value = 'ether3-local';
    assert.equal(context.plan()[2][1], true);
    assert.equal(context.plan()[3][1], false);
    context.state.addresses.local = true; assert.equal(context.plan()[3][1], true);
    context.state.addressDisabled.local = true;
    assert.equal(context.plan()[3][1], false);
});

test('CP2 wizard advances only after Next validates a screen and waits for OK on the completion screen', () => {
    const { context, get } = loadChapterTwoGuide();
    context.state.stage = 'dhcp'; context.windows.get('dhcp').hidden = false;
    assert.equal(context.plan().length, 33);
    context.windows.get('dhcp-setup').hidden = false;
    assert.equal(context.plan()[1][1], true);
    assert.equal(context.plan()[2][1], false);
    get('[data-pool-interface]').value = 'local'; context.dhcpStep = 1;
    assert.equal(context.plan()[2][1], true);
    assert.equal(context.plan()[3][1], false);
    context.dhcpStep = 4;
    assert.equal(context.plan()[5][1], true);
    assert.equal(context.plan()[6][1], false);
    context.state.pools.local = '192.168.100.2-192.168.100.254'; context.dhcpStep = 6;
    assert.equal(context.plan()[7][1], true);
    assert.equal(context.plan()[8][1], false);
    context.windows.get('dhcp-setup').hidden = true;
    assert.equal(context.plan()[8][1], true);
    assert.equal(context.plan()[9][1], false);
});
