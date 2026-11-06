const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-five-workbench.js'), 'utf8');
const boot = (savedState = null, completed = false) => {
    const nodes = new Map(), collections = new Map(), timers = new Map(), storage = new Map();
    let sequence = 0, guideOptions, guideRefreshes = 0, previous;
    class Element {
        constructor() {
            this.dataset = {}; this.hidden = false; this.disabled = false; this.inert = false;
            this.open = false; this.value = ''; this.checked = false; this.textContent = '';
            this.children = []; this.style = { setProperty(name, value) { this[name] = value; } }; this.attributes = {}; this.listeners = {};
            this.parentElement = { scrollTop: 0, scrollHeight: 100 }; 
            const classes = new Set();
            this.classList = {
                add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name),
                toggle(name, enabled) { const active = enabled === undefined ? !classes.has(name) : enabled; if (active) classes.add(name); else classes.delete(name); return active; },
            };
        }
        addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
        emit(type, values = {}) { for (const callback of this.listeners[type] || []) callback({ target: this, currentTarget: this, preventDefault() {}, stopPropagation() {}, ...values }); }
        setAttribute(name, value) { this.attributes[name] = value; }
        getAttribute(name) { return this.attributes[name] ?? null; }
        append(...children) { this.children.push(...children); }
        replaceChildren(...children) { this.children = children; }
        querySelector(selector) { return get(selector); }
        querySelectorAll(selector) { return all(selector); }
        closest() { return null; }
        setPointerCapture() {}
        focus() {}
        showModal() { this.open = true; }
        close() { this.open = false; this.emit('close'); }
        click() { if (!this.disabled) this.emit('click'); }
        getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; }
    }
    const get = (selector) => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
    const all = (selector) => collections.get(selector) || [];
    const register = (selector, values, key) => {
        const entries = values.map((value) => { const element = get(selector + '#' + value); if (key) element.dataset[key] = value; return element; });
        collections.set(selector, entries);
    };
    collections.set('.ch5-editor', [get('[data-window="vlan-edit"]')]);
    register('[data-hex-cable]', ['trunk', 'student', 'teacher', 'management'], 'hexCable');
    register('[data-hex-port]', ['ether1', 'ether2', 'ether3', 'ether4', 'ether5'], 'hexPort');
    register('[data-switch-tab]', ['Switch', 'Port', 'VLAN'], 'switchTab');
    register('[data-bridge-edit-tab]', ['General', 'STP', 'VLAN', 'Status', 'Traffic'], 'bridgeEditTab');
    register('[data-bridge-edit-panel]', ['General', 'STP', 'VLAN', 'Status', 'Traffic'], 'bridgeEditPanel');
    register('[data-port-edit-tab]', ['General', 'STP', 'VLAN', 'Status'], 'portEditTab');
    register('[data-port-edit-panel]', ['General', 'STP', 'VLAN', 'Status'], 'portEditPanel');
    register('[data-switch-panel]', ['Switch', 'Port', 'VLAN'], 'switchPanel');
    register('[data-ch5-exit]', ['chrome', 'menu']);
    register('[data-bridge-tab]', ['Bridges', 'Ports', 'VLANs', 'MSTIs', 'Filters', 'NAT', 'Hosts', 'MDB'], 'bridgeTab');
    register('[data-bridge-panel]', ['Bridges', 'Ports', 'VLANs', 'MSTIs', 'Filters', 'NAT', 'Hosts', 'MDB'], 'bridgePanel');
    for (const selector of ['[data-save-port]', '[data-save-vlan]', '[data-close-editor]']) collections.set(selector, [get(selector)]);
    for (const key of ['trunk', 'student', 'teacher', 'management']) get('[data-hex-cable="' + key + '"] b').textContent = key;
    get('.ch5-scene').dataset = { userId: 'test', completed: String(completed), teacherBase: '/teacher', completeUrl: '/complete' };
    get('[data-ch5-login-name]').value = 'admin';
    get('[data-bridge-protocol]').value = 'rstp';
    get('[data-port-ingress]').checked = true;
    get('[data-window="bridge"]').hidden = true;
    get('[data-ch5-dialogue]').hidden = true;
    get('[data-ch5-system-menu]').hidden = true;
    storage.set('netguard.chapter-one.v1.test', JSON.stringify({ identitySaved: true, interfaceNames: { ether2: 'ether2-vlan' } }));
    storage.set('netguard.chapter-two.v2.test', JSON.stringify({ vlan: { student: true, teacher: true }, addresses: { student: true, teacher: true }, pools: { student: '192.168.40.10-192.168.40.50', teacher: '192.168.60.10-192.168.60.50' } }));
    if (savedState) storage.set('netguard.chapter-five.v1.test', JSON.stringify(savedState));
    const context = {
        document: { querySelector: get, querySelectorAll: all, createElement: () => new Element(), addEventListener() {} },
        localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
        window: {
            addEventListener() {}, matchMedia: () => ({ matches: true }), setInterval() {}, clearInterval() {},
            setTimeout(callback) { const id = ++sequence; timers.set(id, callback); return id; }, clearTimeout(id) { timers.delete(id); },
            NetGuardStepGuide: { create(options) { guideOptions = options; return { refresh() { guideRefreshes++; }, reset() { guideRefreshes++; } }; } },
            NetGuardChapterNavbar: { bindPrevious(callback) { previous = callback; } }, NetGuardEvaluation: { clear() {}, showResult() {}, showError() {} },
        }, console,
    };
    vm.runInNewContext(source, context);
    return {
        get, all, storage, guideOptions, refreshCount: () => guideRefreshes, previous: () => previous(),
        flush() { while (timers.size) { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); } },
        submit(selector) { get(selector).emit('submit'); },
        command(value) { get('[data-terminal-input]').value = value; get('[data-terminal-form]').emit('submit'); },
        click: (selector) => get(selector).click(),
        pending: () => guideOptions.getPlan().find(([, done]) => !done),
        state: () => JSON.parse(storage.get('netguard.chapter-five.v1.test') || '{}'),
    };
};

const connected = { workflowVersion: 2, stage: 'identity', prologueComplete: true, identity: 'MikroTik', identitySaved: false, connections: { trunk: 'ether1', pcPort: 'ether5' }, migration: { exitedHap: true, neighborsLoaded: true, connectedHex: true } };
const target = (game, selector) => game.get(selector).classList.contains('ch5-action-target');
const assignIdentity = (game) => { game.click('[data-ch5-system]'); game.click('[data-ch5-open-identity]'); game.get('[data-ch5-identity]').value = 'Switch'; game.click('[data-save-identity]'); };
const configure = (game) => {
    assignIdentity(game);
    game.click('[data-open-bridge]'); game.click('[data-bridge-add]'); game.click('[data-save-bridge]');
    game.click('[data-open-bridge]'); game.click('[data-bridge-tab]#Ports');
    for (const port of ['ether1', 'ether2', 'ether3', 'ether4']) { game.click('[data-port-add]'); game.get('[data-port-interface]').value = port; game.click('[data-save-port]'); }
    game.click('[data-open-switch]'); game.click('[data-switch-tab]#Port');
    for (const [index, mode, header, id] of [[0, 'check', 'add if missing', 0], [1, 'secure', 'always strip', 10], [2, 'secure', 'always strip', 10], [3, 'secure', 'always strip', 20]]) {
        game.get('[data-switch-port-rows]').children[index].emit('dblclick');
        game.get('[data-switch-vlan-mode]').value = mode; game.get('[data-switch-vlan-header]').value = header; game.get('[data-switch-default-vlan]').value = String(id); game.click('[data-save-switch-port]');
    }
    game.click('[data-open-switch]'); game.click('[data-switch-tab]#VLAN');
    for (const [id, ports] of [[10, 'ether1,ether2,ether3'], [20, 'ether1,ether4']]) { game.click('[data-switch-vlan-add]'); game.get('[data-vlan-id]').value = String(id); game.get('[data-vlan-ports]').value = ports; game.click('[data-save-vlan]'); }
};
const moveCable = (game, port) => {
    game.click('[data-ch5-patch-panel]');
    const current = game.state().connections.pcPort;
    if (current) game.click('[data-hex-port]#' + current);
    game.click('[data-hex-port]#' + port);
    game.flush(); game.click('[data-check-hex-cables]'); game.click('[data-launch-cmd]');
};

test('one PC cable is immediately available for ether5 and used to log in before Identity', () => {
    const game = boot();
    assert.equal(target(game, '[data-ch5-pc-cable]'), true);
    assert.equal(game.get('[data-ch5-pc-cable]').disabled, false);
    game.click('[data-ch5-pc-cable]');
    assert.equal(target(game, '[data-hex-port]#ether5'), true);
    game.click('[data-hex-port]#ether5');
    assert.equal(target(game, '[data-check-hex-cables]'), true);
    game.click('[data-check-hex-cables]');
    game.click('[data-ch5-exit]#menu'); game.click('[data-ch5-refresh-neighbors]'); game.flush();
    game.click('[data-ch5-hex-neighbor]'); game.click('[data-ch5-connect-hex]'); game.flush();
    assert.equal(game.state().stage, 'identity');
    assert.equal(game.state().identity, 'MikroTik');
    assert.equal(game.pending()[2], '[data-ch5-system]');
    assert.equal(game.get('[data-open-bridge]').disabled, true);
    assignIdentity(game);
    assert.equal(game.state().identity, 'Switch');
    assert.equal(game.state().stage, 'bridge');
    assert.equal(game.pending()[2], '[data-open-bridge]');
});

test('hardware Switch settings include ether1 through ether4 with two student access ports', () => {
    const game = boot(connected);
    const router = game.storage.get('netguard.chapter-two.v2.test');
    configure(game);
    assert.equal(game.state().stage, 'test');
    assert.deepEqual(Object.keys(game.state().ports).sort(), ['ether1', 'ether2', 'ether3', 'ether4']);
    assert.equal(game.state().switchPorts.ether2.id, 10);
    assert.equal(game.state().switchPorts.ether3.id, 10);
    assert.equal(game.state().switchPorts.ether4.id, 20);
    assert.deepEqual(game.state().vlans.student.ports, ['ether1', 'ether2', 'ether3']);
    assert.deepEqual(game.state().vlans.teacher.ports, ['ether1', 'ether4']);
    assert.equal(game.storage.get('netguard.chapter-two.v2.test'), router);
});

test('testing requires moving the same cable from ether5 to ether2, ether3 and ether4 and checking each lease', () => {
    const game = boot(connected); configure(game);
    const before = game.state().connections.pcPort;
    assert.equal(before, 'ether5');
    assert.equal(target(game, '[data-hex-port]#ether5'), true);
    game.click('[data-hex-port]#ether2');
    assert.equal(game.state().connections.pcPort, 'ether5');
    game.command('ipconfig');
    assert.equal(game.state().tests.ether2.ipconfig, false);
    for (const [port, ip] of [['ether2', '192.168.40.10'], ['ether3', '192.168.40.10'], ['ether4', '192.168.60.10']]) {
        moveCable(game, port); game.command('ipconfig');
        assert.equal(game.state().connections.pcPort, port);
        assert.match(game.get('[data-terminal-output]').textContent, new RegExp(ip.replaceAll('.', '\\.')));
        assert.equal(game.state().tests[port].ipconfig, true);
    }
    assert.equal(game.get('[data-open-evaluation]').hidden, false);
    assert.equal(game.get('[data-progress-label]').textContent, '5 / 5');
    assert.equal(game.state().migration.connectedHex, false);
    game.click('[data-close-cmd]');
    assert.equal(target(game, '[data-launch-cmd]'), false);
    game.click('[data-ch5-patch-panel]');
    assert.equal(target(game, '[data-check-hex-cables]'), false);
    for (const port of game.all('[data-hex-port]')) assert.equal(port.classList.contains('ch5-action-target'), false);
});

test('unplugging reports Media disconnected and an unfinished DHCP lease cannot pass the test', () => {
    const game = boot(connected); configure(game);
    game.click('[data-hex-port]#ether5'); game.command('ipconfig');
    assert.match(game.get('[data-terminal-output]').textContent, /Media disconnected/);
    game.click('[data-hex-port]#ether2'); game.command('ipconfig');
    assert.equal(game.state().tests.ether2.ipconfig, false);
    game.flush(); game.command('ipconfig');
    assert.equal(game.state().tests.ether2.ipconfig, true);
    assert.equal(game.get('[data-open-evaluation]').hidden, true);
});

test('previous from Bridge restarts the entire Identity mission and clears all dependent results', () => {
    const game = boot({ ...connected, stage: 'bridge', identity: 'Switch', identitySaved: true });
    game.click('[data-open-bridge]'); game.click('[data-bridge-add]');
    game.previous();
    assert.equal(game.state().stage, 'identity');
    assert.equal(game.state().identity, 'MikroTik');
    assert.equal(game.state().identitySaved, false);
    assert.equal(game.state().bridge, null);
    assert.deepEqual(game.state().ports, {});
    assert.equal(game.get('[data-window="bridge-edit"]').hidden, true);
    assert.equal(game.pending()[2], '[data-ch5-system]');
});

test('Bridge creation and Bridge Ports are one mission when going back', () => {
    const configured = boot(connected); configure(configured);
    const ports = boot({ ...configured.state(), stage: 'ports' });
    ports.previous();
    assert.equal(ports.state().stage, 'identity');
    assert.equal(ports.state().bridge, null);
    assert.deepEqual(ports.state().ports, {});
    const switching = boot({ ...configured.state(), stage: 'switch-ports' });
    switching.previous();
    assert.equal(switching.state().stage, 'bridge');
    assert.equal(switching.state().identity, 'Switch');
    assert.equal(switching.state().identitySaved, true);
    assert.equal(switching.state().bridge, null);
    assert.deepEqual(switching.state().ports, {});
    assert.deepEqual(switching.state().switchPorts, {});
    assert.deepEqual(switching.state().vlans, {});
    assert.equal(switching.get('[data-progress-label]').textContent, '1 / 5');
});

test('restarting VLAN membership preserves earlier missions and clears membership, testing and evaluation', () => {
    const game = boot(connected); configure(game); moveCable(game, 'ether2'); game.command('ipconfig');
    const prior = game.state();
    const router = game.storage.get('netguard.chapter-two.v2.test');
    game.previous();
    assert.equal(game.state().stage, 'vlans');
    assert.deepEqual(game.state().bridge, prior.bridge);
    assert.deepEqual(game.state().ports, prior.ports);
    assert.deepEqual(game.state().switchPorts, prior.switchPorts);
    assert.deepEqual(game.state().vlans, {});
    assert.equal(game.state().tests.ether2.ipconfig, false);
    assert.deepEqual(game.state().answers, []);
    assert.equal(game.get('[data-terminal-output]').textContent.includes('IPv4 Address'), false);
    assert.equal(game.get('[data-open-evaluation]').hidden, true);
    assert.equal(game.get('[data-window="vlan-edit"]').hidden, true);
    assert.equal(game.storage.get('netguard.chapter-two.v2.test'), router);
    const restored = boot(game.state());
    assert.equal(restored.state().stage, 'vlans');
    assert.deepEqual(restored.state().vlans, {});
    assert.equal(restored.get('[data-ch5-stage="connect-switch"]').hidden, false);
    assert.equal(target(restored, '[data-hex-port]#ether2'), true);
});

test('previous from evaluation restarts all three cable tests without discarding switch configuration', () => {
    const game = boot(connected); configure(game);
    for (const port of ['ether2', 'ether3', 'ether4']) { moveCable(game, port); game.command('ipconfig'); }
    const vlans = game.state().vlans;
    game.click('[data-open-evaluation]');
    assert.equal(game.state().stage, 'quiz');
    assert.equal(game.get('[data-quiz-dialog]').open, true);
    game.previous();
    assert.equal(game.get('[data-quiz-dialog]').open, false);
    assert.equal(game.state().stage, 'test');
    for (const port of ['ether2', 'ether3', 'ether4']) assert.equal(game.state().tests[port].ipconfig, false);
    assert.deepEqual(game.state().vlans, vlans);
    assert.equal(game.get('[data-open-evaluation]').hidden, true);
    assert.equal(game.get('[data-progress-label]').textContent, '4 / 5');
});

test('replaying a completed chapter stays at the reset mission after reloading', () => {
    const configured = boot(connected); configure(configured);
    const completed = boot({ ...configured.state(), stage: 'finish' }, true);
    completed.previous(); completed.previous();
    assert.equal(completed.state().stage, 'test');
    assert.equal(completed.state().replaying, true);
    const reloaded = boot(completed.state(), true);
    assert.equal(reloaded.state().stage, 'test');
    assert.equal(reloaded.get('.ch5-scene').dataset.completed, 'false');
    assert.equal(reloaded.get('[data-progress-label]').textContent, '4 / 5');
});

test('old two-PC saves preserve Bridge membership and return to the missing Identity task', () => {
    const game = boot({ stage: 'test', prologueComplete: true, bridge: { name: 'bridge1', protocol: 'rstp' }, ports: { trunk: { interface: 'ether1' }, student: { interface: 'ether2' }, teacher: { interface: 'ether3' } } });
    assert.equal(game.state().stage, 'identity');
    assert.equal(game.state().identitySaved, false);
    assert.equal(game.state().ports.ether1, true);
    assert.equal(game.state().ports.ether4, false);
    assert.equal(game.state().tests.ether2.ipconfig, false);
    assert.equal(game.get('[data-open-evaluation]').hidden, true);
});

test('closing the learning dialog refreshes the active orange target immediately', () => {
    const game = boot(connected); const learning = game.get('[data-learning-dialog]');
    learning.showModal(); const before = game.refreshCount(); learning.close();
    assert.equal(game.refreshCount(), before + 1);
    assert.equal(game.pending()[2], '[data-ch5-system]');
});

test('the same PC reloads at its real current port with its previous test result preserved', () => {
    const game = boot(connected); configure(game); moveCable(game, 'ether2'); game.command('ipconfig');
    const restored = boot(game.state());
    assert.equal(restored.state().connections.pcPort, 'ether2');
    assert.equal(restored.state().tests.ether2.ipconfig, true);
    assert.equal(target(restored, '[data-hex-port]#ether2'), true);
});

test('resetting a mission cancels pending login so it cannot advance after going back', () => {
    const game = boot({ ...connected, stage: 'switch-session', migration: { exitedHap: true, neighborsLoaded: true, connectedHex: false } });
    game.click('[data-ch5-hex-neighbor]'); game.click('[data-ch5-connect-hex]');
    game.previous(); game.flush();
    assert.equal(game.state().stage, 'connect-switch');
    assert.equal(game.state().connections.pcPort, null);
    assert.equal(game.state().migration.connectedHex, false);
    assert.equal(game.state().identitySaved, false);
});

test('existing saves waiting for the removed hAP unplug action resume with a ready cable', () => {
    const game = boot({ workflowVersion: 2, stage: 'connect-switch', prologueComplete: true, connections: { trunk: 'ether1', pcPort: 'hap-ether3' } });
    assert.equal(game.state().connections.pcPort, null);
    assert.equal(game.get('[data-ch5-pc-cable]').disabled, false);
    assert.equal(target(game, '[data-ch5-pc-cable]'), true);
    assert.equal(game.guideOptions.getPlan().length, 2);
});

test('Bridge Apply keeps the native dialog open, fills status values and OK returns to the same Bridge window', () => {
    const game = boot(connected); assignIdentity(game); game.click('[data-open-bridge]'); game.click('[data-bridge-add]');
    assert.equal(game.get('[data-bridge-editor-title]').textContent, 'New Interface');
    assert.equal(game.get('[data-bridge-edit-panel]#General').hidden, false);
    game.click('[data-bridge-edit-tab]#STP');
    assert.equal(game.get('[data-bridge-edit-panel]#STP').hidden, false);
    assert.equal(game.get('[data-bridge-edit-panel]#General').hidden, true);
    game.click('[data-bridge-edit-tab]#General'); game.click('[data-apply-bridge]');
    assert.equal(game.state().bridge.name, 'bridge1');
    assert.equal(game.state().stage, 'bridge');
    assert.equal(game.get('[data-window="bridge-edit"]').hidden, false);
    assert.equal(game.get('[data-bridge-actual-mtu]').value, '1500');
    assert.equal(game.pending()[2], '[data-save-bridge]');
    game.click('[data-save-bridge]');
    assert.equal(game.state().stage, 'ports');
    assert.equal(game.get('[data-window="bridge-edit"]').hidden, true);
    assert.equal(game.get('[data-window="bridge"]').hidden, false);
    assert.equal(game.pending()[2], '[data-bridge-tab="Ports"]');
});

test('Bridge Port Apply retains the editor until OK and the native advanced tabs retain the selected interface', () => {
    const game = boot(connected); assignIdentity(game); game.click('[data-open-bridge]'); game.click('[data-bridge-add]'); game.click('[data-save-bridge]');
    game.click('[data-bridge-tab]#Ports'); game.click('[data-port-add]');
    game.get('[data-port-interface]').value = 'ether1';
    game.click('[data-port-edit-tab]#STP');
    assert.equal(game.get('[data-port-edit-panel]#STP').hidden, false);
    game.click('[data-port-edit-tab]#General');
    assert.equal(game.get('[data-port-interface]').value, 'ether1');
    game.click('[data-apply-port]');
    assert.equal(game.state().ports.ether1, true);
    assert.equal(game.get('[data-window="port-edit"]').hidden, false);
    assert.equal(Array.isArray(game.pending()[2]), true);
    game.click('[data-save-port]');
    assert.equal(game.get('[data-window="port-edit"]').hidden, true);
    assert.equal(game.pending()[2], '[data-port-add]');
    const row = game.get('[data-port-rows]').children[0];
    assert.deepEqual(Array.from(row.children, (cell) => cell.textContent), ['0 H', 'ether1', 'bridge1', 'none', 'no', '80', '10']);
});

test('Bridge minimizes to its WinBox taskbar and restores without losing its data or guide target', () => {
    const game = boot({ ...connected, identity: 'Switch', identitySaved: true, stage: 'bridge' });
    game.click('[data-open-bridge]'); game.click('[data-maximize-bridge]');
    assert.equal(game.get('[data-window="bridge"]').classList.contains('is-restored-window'), true);
    game.click('[data-minimize-bridge]');
    assert.equal(game.get('[data-window="bridge"]').hidden, true);
    assert.equal(game.get('[data-taskbar]').hidden, false);
    assert.equal(game.pending()[2], '[data-open-bridge]');
    game.click('[data-ch5-bridge-task]');
    assert.equal(game.get('[data-window="bridge"]').hidden, false);
    assert.equal(game.get('[data-taskbar]').hidden, true);
    assert.equal(game.pending()[2], '[data-bridge-add]');
});

test('native Bridge name filtering changes visible rows without changing configuration', () => {
    const game = boot(connected); assignIdentity(game); game.click('[data-open-bridge]'); game.click('[data-bridge-add]'); game.click('[data-save-bridge]');
    game.click('[data-bridge-filter]');
    game.get('[data-bridge-filter-name]').value = 'other'; game.get('[data-bridge-filter-name]').emit('input');
    assert.equal(game.get('[data-bridge-row]').hidden, true);
    assert.equal(game.get('[data-bridge-count]').textContent, '0 items');
    assert.equal(game.state().bridge.name, 'bridge1');
    game.click('[data-bridge-clear-filter]');
    assert.equal(game.get('[data-bridge-row]').hidden, false);
    assert.equal(game.get('[data-bridge-count]').textContent, '1 item');
});


test('System opens its menu before Identity and stays within the desktop', () => {
    const game = boot(connected);
    game.click('[data-ch5-system]');
    assert.equal(game.get('[data-ch5-system-menu]').hidden, false);
    assert.equal(game.get('[data-window="identity"]').hidden, true);
    assert.equal(game.get('[data-ch5-system-menu]').style.top, '0px');
    assert.equal(game.get('[data-ch5-system-menu]').style.maxHeight, '592px');
    game.click('[data-ch5-open-identity]');
    assert.equal(game.get('[data-ch5-system-menu]').hidden, true);
    assert.equal(game.get('[data-window="identity"]').hidden, false);
    assert.equal(game.state().identitySaved, false);
});


test('editor titlebar drag stays inside WinBox and stops on pointer release', () => {
    const game = boot(connected);
    const editor = game.get('[data-window="vlan-edit"]');
    editor.getBoundingClientRect = () => ({ left: 200, top: 100, width: 400, height: 200 });
    const titlebar = editor.querySelector('header');
    titlebar.emit('pointerdown', { button: 0, pointerId: 1, clientX: 220, clientY: 110 });
    titlebar.emit('pointermove', { pointerId: 1, clientX: 2000, clientY: -200 });
    assert.equal(editor.style['--ch5-editor-left'], '600px');
    assert.equal(editor.style['--ch5-editor-top'], '100px');
    titlebar.emit('pointerup', { pointerId: 1 });
    titlebar.emit('pointermove', { pointerId: 1, clientX: 0, clientY: 500 });
    assert.equal(editor.style['--ch5-editor-left'], '600px');
    assert.equal(editor.style['--ch5-editor-top'], '100px');
});


test('Switch VLAN ports are selected in individual rows and can be added or removed', () => {
    const game = boot(connected);
    configure(game);
    game.previous();
    game.click('[data-open-switch]');
    game.click('[data-switch-vlan-add]');
    const rows = game.get('[data-vlan-port-rows]');
    assert.equal(rows.children.length, 1);
    const first = rows.children[0].children[0];
    first.value = 'ether1'; first.emit('change');
    rows.children[0].children[1].click();
    assert.equal(rows.children.length, 2);
    const second = rows.children[1].children[0];
    second.value = 'ether2'; second.emit('change');
    rows.children[1].children[1].click();
    const third = rows.children[2].children[0];
    third.value = 'ether3'; third.emit('change');
    assert.equal(game.get('[data-vlan-ports]').value, 'ether1,ether2,ether3');
    rows.children[2].children[2].click();
    assert.equal(game.get('[data-vlan-ports]').value, 'ether1,ether2');
    assert.equal(rows.children.length, 2);
    rows.children[1].children[1].click();
    rows.children[2].children[0].value = 'ether3';
    rows.children[2].children[0].emit('change');
    game.get('[data-vlan-id]').value = '10';
    game.click('[data-save-vlan]');
    assert.equal(game.state().vlans.student.ports.join(','), 'ether1,ether2,ether3');
    game.click('[data-switch-vlan-add]');
    assert.equal(rows.children.length, 1);
    assert.equal(game.get('[data-vlan-ports]').value, '');
    rows.children[0].children[0].value = 'ether1';
    rows.children[0].children[0].emit('change');
    rows.children[0].children[1].click();
    rows.children[1].children[0].value = 'ether4';
    rows.children[1].children[0].emit('change');
    game.get('[data-vlan-id]').value = '20';
    game.click('[data-save-vlan]');
    assert.equal(game.state().vlans.teacher.ports.join(','), 'ether1,ether4');
    assert.equal(game.state().stage, 'test');
});


test('VLAN guide targets ID, each port dropdown, each add arrow, then OK without Enter', () => {
    const game = boot(connected);
    configure(game);
    game.previous();
    game.click('[data-open-switch]');
    game.click('[data-switch-tab]#VLAN');
    game.click('[data-switch-vlan-add]');
    const nextTarget = () => typeof game.pending()[2] === 'string' ? game.pending()[2] : game.pending()[2].selector;
    assert.equal(nextTarget(), '[data-vlan-id]');
    game.get('[data-vlan-id]').value = '10';
    game.get('[data-vlan-id]').emit('input');
    assert.equal(nextTarget(), '[data-vlan-port-index="0"]');
    const rows = game.get('[data-vlan-port-rows]');
    const choose = (index, value) => {
        const select = rows.children[index].children[0];
        assert.equal(select.getAttribute('data-vlan-port-index'), String(index));
        select.value = value; select.emit('change');
    };
    choose(0, 'ether4');
    assert.equal(nextTarget(), '[data-vlan-port-index="0"]');
    choose(0, 'ether1');
    assert.equal(nextTarget(), '[data-vlan-port-add="0"]');
    assert.equal(rows.children[0].children[1].getAttribute('data-vlan-port-add'), '0');
    rows.children[0].children[1].click();
    assert.equal(nextTarget(), '[data-vlan-port-index="1"]');
    choose(1, 'ether2');
    assert.equal(nextTarget(), '[data-vlan-port-add="1"]');
    rows.children[1].children[1].click();
    assert.equal(nextTarget(), '[data-vlan-port-index="2"]');
    choose(2, 'ether3');
    assert.equal(nextTarget(), '[data-save-vlan]');
    rows.children[2].children[2].click();
    assert.equal(nextTarget(), '[data-vlan-port-add="1"]');
    rows.children[1].children[1].click();
    choose(2, 'ether3');
    game.click('[data-save-vlan]');
    assert.equal(nextTarget(), '[data-switch-vlan-add]');
    game.click('[data-switch-vlan-add]');
    assert.equal(nextTarget(), '[data-vlan-id]');
    game.get('[data-vlan-id]').value = '20';
    assert.equal(nextTarget(), '[data-vlan-port-index="0"]');
    choose(0, 'ether1');
    assert.equal(nextTarget(), '[data-vlan-port-add="0"]');
    rows.children[0].children[1].click();
    assert.equal(nextTarget(), '[data-vlan-port-index="1"]');
    choose(1, 'ether4');
    assert.equal(nextTarget(), '[data-save-vlan]');
    game.click('[data-save-vlan]');
    assert.equal(game.state().stage, 'test');
});

test('cable animation first indicates unplugging then insertion and stops on a correct connection', () => {
    const game = boot(connected);
    configure(game);
    const cue = (port) => game.get('[data-hex-port]#' + port).dataset.cableCue;
    assert.equal(cue('ether1'), 'none');
    assert.equal(cue('ether5'), 'unplug');
    for (const port of ['ether2', 'ether3', 'ether4']) {
        const previous = game.state().connections.pcPort;
        game.click('[data-ch5-patch-panel]');
        assert.equal(cue(previous), 'unplug');
        assert.equal(cue(port), 'none');
        game.click('[data-hex-port]#' + previous);
        assert.equal(cue(previous), 'none');
        assert.equal(cue(port), 'insert');
        assert.equal(cue('ether1'), 'none');
        game.click('[data-hex-port]#' + port);
        assert.equal(cue(port), 'none');
        game.flush(); game.click('[data-check-hex-cables]'); game.click('[data-launch-cmd]');
        for (const button of game.all('[data-hex-port]')) assert.equal(button.dataset.cableCue, 'none');
        game.command('ipconfig');
    }
    game.click('[data-ch5-patch-panel]');
    for (const button of game.all('[data-hex-port]')) assert.equal(button.dataset.cableCue, 'none');
});

test('desktop and CMD tasks restore the matching shared screen and keep terminal output', () => {
    const game = boot(connected);
    game.click('[data-ch5-cmd-task]');
    assert.equal(game.get('[data-client-workspace]').hidden, false);
    assert.equal(game.get('[data-client-terminal]').hidden, false);
    assert.equal(game.get('[data-ch5-cmd-task]').classList.contains('is-active'), true);
    assert.equal(game.get('[data-ch5-desktop]').classList.contains('is-active'), false);
    game.command('ipconfig');
    const output = game.get('[data-terminal-output]').textContent;
    game.click('[data-ch5-desktop]');
    assert.equal(game.get('[data-client-terminal]').hidden, true);
    assert.equal(game.get('[data-ch5-desktop]').classList.contains('is-active'), true);
    assert.equal(game.get('[data-ch5-cmd-task]').classList.contains('is-active'), false);
    game.click('[data-launch-cmd]');
    assert.equal(game.get('[data-client-terminal]').hidden, false);
    assert.equal(game.get('[data-terminal-output]').textContent, output);
    game.click('[data-close-cmd]');
    assert.equal(game.get('[data-client-terminal]').hidden, true);
    assert.equal(game.get('[data-ch5-desktop]').classList.contains('is-active'), true);
    assert.equal(game.get('[data-ch5-network]').classList.contains('is-online'), true);
});
