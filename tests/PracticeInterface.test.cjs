const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { initial } = require('./PracticeFixture.cjs');

const boot = ({ state = initial(), type = 'identity', surface = 'winbox', briefing = null, storage = new Map() } = {}) => {
    class Node {
        constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.parentElement = null; this.attributes = {}; this.dataset = {}; this.style = {}; this.listeners = {}; this.value = ''; this.hidden = false; this.disabled = false; this.readOnly = false; this.checked = false; this.open = false; this.ownText = ''; }
        get className() { return this.attributes.class || ''; }
        set className(value) { this.attributes.class = value; }
        get classList() { const node = this; return { contains: (name) => node.className.split(' ').includes(name), add(name) { if (!this.contains(name)) node.className += ' ' + name; }, remove(name) { node.className = node.className.split(' ').filter((value) => value !== name).join(' '); }, toggle(name, active) { const enabled = active ?? !this.contains(name); if (enabled) this.add(name); else this.remove(name); return enabled; } }; }
        get textContent() { return this.ownText + this.children.map((child) => child.textContent).join(''); }
        set textContent(value) { this.ownText = String(value); this.children = []; }
        get firstChild() { return this.children[0]; }
        get firstElementChild() { return this.children[0]; }
        get options() { return this.children.filter((node) => node.tagName === 'OPTION'); }
        get isConnected() { return Boolean(this.parentElement); }
        append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
        prepend(node) { node.parentElement = this; this.children.unshift(node); }
        replaceChildren(...nodes) { this.ownText = ''; this.children = []; this.append(...nodes); }
        insertBefore(node, before) { node.parentElement = this; this.children.splice(this.children.indexOf(before), 0, node); }
        remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((child) => child !== this); this.parentElement = null; }
        setAttribute(name, value) { this.attributes[name] = String(value); }
        getAttribute(name) { if (name.startsWith('data-')) return this.attributes[name] ?? this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] ?? null; return this.attributes[name] ?? null; }
        matches(selector) {
            return selector.split(',').some((part) => {
                let query = part.trim();
                if (query.includes(':not([readonly])')) { if (this.readOnly) return false; query = query.replace(':not([readonly])', ''); }
                const tag = query.match(/^[a-z][\w-]*/i)?.[0]; if (tag && this.tagName !== tag.toUpperCase()) return false;
                const id = query.match(/#([\w-]+)/)?.[1]; if (id && this.getAttribute('id') !== id) return false;
                for (const match of query.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(match[1])) return false;
                for (const match of query.matchAll(/\[([^=\]]+)(?:=["']?([^\]"']*)["']?)?\]/g)) {
                    const value = this.getAttribute(match[1]) ?? (match[1] === 'type' ? this.type : null);
                    if (value === null || match[2] !== undefined && value !== match[2]) return false;
                }
                return Boolean(query);
            });
        }
        querySelectorAll(selector) { const result = []; const visit = (node) => { for (const child of node.children) { if (child.matches(selector)) result.push(child); visit(child); } }; visit(this); return result; }
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
        closest(selector) { let node = this; while (node) { if (node.matches(selector)) return node; node = node.parentElement; } return null; }
        addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
        emit(type, values = {}) { const event = { target: this, currentTarget: this, preventDefault() {}, stopPropagation() {}, ...values }; return Promise.all((this.listeners[type] || []).map((callback) => callback(event))); }
        click() { if (!this.disabled) return this.emit('click'); }
        focus() {}
        setPointerCapture() {}
        getBoundingClientRect() { return { left: 0, top: 0, width: 900, height: 650 }; }
        showModal() { this.open = true; }
        close() { this.open = false; }
    }
    const body = new Node('body'), root = new Node(), host = new Node(), app = new Node(), desktop = new Node(), pc = new Node(), pcApps = new Node(), consoleWindow = new Node(), toolbar = new Node('nav');
    const attr = (node, name) => { node.setAttribute(name, ''); return node; };
    root.dataset = { assets: '/images', userId: '42', checkUrl: '/practice/case/check' }; attr(root, 'data-practice'); body.append(root); attr(host, 'data-practice-host'); root.append(host); attr(app, 'data-practice-winbox'); host.append(app); attr(desktop, 'data-practice-desktop'); app.append(desktop); attr(pc, 'data-pc-desktop'); host.append(pc); pcApps.className = 'lab-pc-apps'; pc.append(pcApps); attr(consoleWindow, 'data-client-cmd'); pc.append(consoleWindow); attr(toolbar, 'data-pc-toolbar'); host.append(toolbar); const tray = new Node(); tray.className = 'lab-pc-tray'; toolbar.append(tray);
    const make = (selector, parent = root, tag = 'button') => { const node = new Node(tag); attr(node, selector.slice(1, -1)); parent.append(node); return node; };
    for (const selector of ['[data-pc-home]', '[data-pc-task-winbox]', '[data-pc-task-cmd]', '[data-pc-network]']) make(selector, toolbar);
    make('[data-pc-open-winbox]', pcApps);
    make('[data-open-client-cmd]', pcApps);
    make('[data-close-client-cmd]', consoleWindow);
    make('[data-client-command-form]', consoleWindow, 'form'); make('[data-client-command]', consoleWindow, 'input'); make('[data-client-terminal]', consoleWindow, 'pre');
    for (const selector of ['[data-session-title]', '[data-session-mac]', '[data-board-title]', '[data-practice-nav]', '[data-app-minimize]', '[data-app-restore]', '[data-session-exit]', '[data-undo]', '[data-redo]', '[data-safe-mode]']) make(selector, app);
    for (const selector of ['[data-physical]', '[data-phone]', '[data-practice-notice]', '[data-case-open]', '[data-practice-submit]']) make(selector, host);
    for (const selector of ['[data-case-dialog]', '[data-submit-confirm]', '[data-practice-result]']) make(selector, body, 'dialog');
    const caseDialog = body.querySelector('[data-case-dialog]'); caseDialog.dataset.teacherBase = '/images/teacher';
    for (const selector of ['[data-case-previous]', '[data-briefing-heading]', '[data-briefing-text]', '[data-briefing-count]', '[data-briefing-teacher-image]']) make(selector, caseDialog);
    for (const selector of ['[data-case-start]', '[data-submit-cancel]', '[data-result-title]', '[data-result-description]', '[data-result-errors]', '[data-submit-error]']) make(selector, body);
    make('[data-submit-send]', body);
    const scenario = new Node('script'); scenario.setAttribute('id', 'practice-scenario'); scenario.textContent = JSON.stringify({ id: 'case', type, surface, initialState: state, briefing }); body.append(scenario);
    const meta = new Node('meta'); meta.setAttribute('name', 'csrf-token'); meta.content = 'csrf'; body.append(meta);
    const timers = new Map(); let timerId = 0;
    const requests = [];
    const context = { window: { setTimeout(callback) { timers.set(++timerId, callback); return timerId; }, clearTimeout(id) { timers.delete(id); } }, document: { querySelector: (query) => body.querySelector(query), createElement: (tag) => new Node(tag), createElementNS: (_, tag) => new Node(tag), createTextNode: (text) => { const node = new Node('#text'); node.textContent = text; return node; }, addEventListener() {} }, localStorage: { getItem: (key) => storage.get(key) ?? null, setItem(key, value) { storage.set(key, value); } }, sessionStorage: { getItem: () => null, setItem() {} }, fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ correct: false, errors: ['Identity belum sesuai.'] }) }; }, DOMParser: class { parseFromString() { return { querySelector: () => null }; } }, console };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/practice-simulator.js'), 'utf8'), context);
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/practice.js'), 'utf8'), context);
    const findText = (parent, tag, text) => parent.querySelectorAll(tag).find((node) => node.textContent.replace(/›/g, '').trim() === text);
    const setField = (label, value, parent = desktop) => { const input = parent.querySelector('[aria-label="' + label + '"]'); assert.ok(input, label); if (input.type === 'checkbox') input.checked = value; else input.value = value; input.emit('input'); input.emit('change'); return input; };
    return { root, host, desktop, context, findText, setField, requests, storage, flush() { while (timers.size) { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); } }, clickText(parent, tag, text) { const node = findText(parent, tag, text); assert.ok(node, text); node.click(); return node; }, all: (query) => body.querySelectorAll(query) };
};

test('Practice starts with the case and keeps all main WinBox menus interactive', () => {
    const game = boot();
    assert.ok(game.all('[data-case-dialog]')[0].open);
    const menu = game.all('[data-practice-nav]')[0];
    for (const name of ['Interfaces', 'Wireless', 'Bridge', 'Switch', 'IP', 'System', 'Files', 'Tools', 'New Terminal']) assert.ok(game.findText(menu, 'button', name), name);
});

test('floating submit stays hidden during navigation and appears on Add, including after reload', () => {
    const game = boot(), submit = game.all('[data-practice-submit]')[0];
    assert.equal(submit.hidden, true); submit.click(); assert.equal(game.all('[data-submit-confirm]')[0].open, false);
    game.clickText(game.root, 'button', 'Interfaces');
    const list = game.desktop.querySelector('[data-practice-window="list-interfaces"]');
    game.clickText(list, 'button', 'VLAN'); assert.equal(submit.hidden, true);
    list.querySelector('[aria-label="Tambah"]').click(); assert.equal(submit.hidden, false);
    submit.click(); assert.equal(game.all('[data-submit-confirm]')[0].open, true);
    assert.equal(boot({ storage: game.storage }).all('[data-practice-submit]')[0].hidden, false);
    assert.equal(boot().all('[data-practice-submit]')[0].hidden, true);
});

test('opening an existing configuration does not reveal submit until Apply or OK is pressed', () => {
    for (const action of ['Apply', 'OK']) {
        const game = boot(), submit = game.all('[data-practice-submit]')[0];
        game.clickText(game.root, 'button', 'System'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Identity');
        const editor = game.desktop.querySelector('[data-practice-window="editor-identity-new"]');
        game.setField('Identity', 'Lab-Pertama', editor); assert.equal(submit.hidden, true);
        game.clickText(editor, 'button', action); assert.equal(submit.hidden, false);
        assert.equal(boot({ storage: game.storage }).all('[data-practice-submit]')[0].hidden, false);
    }
});

test('starting a setup wizard reveals the floating submit for wizard-based tasks', () => {
    const game = boot({ type: 'hotspot' }), submit = game.all('[data-practice-submit]')[0];
    game.clickText(game.root, 'button', 'IP'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Hotspot');
    assert.equal(submit.hidden, true); game.clickText(game.desktop, 'button', 'Hotspot Setup'); assert.equal(submit.hidden, false);
});

test('Pak Amat alone explains the task through the chapter-style click-to-advance popups', async () => {
    const briefing = { context: 'Ruang studio perlu nama router yang mudah dikenali.', initial: 'WinBox sudah terhubung; identity masih MikroTik.', assignment: 'Ubah Identity menjadi Lab-ABCD.', outcome: 'Nama perangkat harus Lab-ABCD, nama port tetap.', requirements: ['Identity: Lab-ABCD'], submission: 'Simpan dengan OK atau Apply, lalu Selesaikan jawaban.' };
    const game = boot({ briefing }), dialog = game.all('[data-case-dialog]')[0], next = game.all('[data-case-start]')[0], previous = game.all('[data-case-previous]')[0];
    assert.equal(dialog.open, true); assert.equal(game.all('[data-briefing-text]')[0].textContent, '');
    assert.equal(previous.disabled, true); assert.equal(game.all('[data-briefing-student]').length, 0);
    next.click(); assert.equal(game.all('[data-briefing-text]')[0].textContent, briefing.context);
    assert.match(game.all('[data-briefing-count]')[0].textContent, /^1 \/ 6/);
    await dialog.click(); game.flush(); assert.equal(game.all('[data-briefing-text]')[0].textContent, briefing.initial);
    previous.click(); game.flush(); assert.match(game.all('[data-briefing-count]')[0].textContent, /^1 \/ 6/);
    next.click(); game.flush(); next.click(); game.flush(); assert.equal(game.all('[data-briefing-text]')[0].textContent, briefing.assignment);
    next.click(); game.flush(); assert.equal(game.all('[data-briefing-text]')[0].textContent, 'Identity: Lab-ABCD');
    next.click(); game.flush(); assert.equal(game.all('[data-briefing-text]')[0].textContent, briefing.outcome);
    next.click(); game.flush(); assert.equal(game.all('[data-briefing-text]')[0].textContent, briefing.submission); assert.match(game.all('[data-briefing-count]')[0].textContent, /MULAI PRAKTIK/); assert.equal(dialog.open, true);
    let prevented = false; await dialog.emit('cancel', { preventDefault() { prevented = true; } }); assert.equal(prevented, true);
    assert.equal(game.requests.length, 0); await dialog.emit('keydown', { key: 'Enter', target: next }); assert.equal(dialog.open, false);
    game.all('[data-case-open]')[0].click(); assert.equal(dialog.open, true); assert.match(game.all('[data-briefing-count]')[0].textContent, /^1 \/ 6/);
});

test('System Identity opens through its complete submenu and Apply persists the typed identity', () => {
    const game = boot();
    game.clickText(game.root, 'button', 'System');
    const submenu = game.desktop.querySelector('.practice-menu');
    assert.ok(game.findText(submenu, 'button', 'Clock'));
    assert.ok(game.findText(submenu, 'button', 'RouterBOARD'));
    game.clickText(submenu, 'button', 'Identity');
    const editor = game.desktop.querySelector('[data-practice-window="editor-identity-new"]');
    game.setField('Identity', 'Studio-ABCD', editor);
    game.clickText(editor, 'button', 'Apply');
    assert.match(game.all('[data-session-title]')[0].textContent, /Studio-ABCD/);
    assert.equal(editor.isConnected, true);
    game.clickText(editor, 'button', 'OK');
    assert.equal(editor.isConnected, false);
});

test('Identity cases retain every Interfaces tab and a complete aligned list of interface types', () => {
    const state = initial(); state.tables.interfaces = state.tables.interfaces.slice(0, 4);
    state.tables.vlans = [{ name: 'vlan-studio', vlanId: 211, interface: 'ether2', disabled: false }];
    state.tables.bridges = [{ name: 'bridge-studio', disabled: false }];
    const game = boot({ state });
    game.clickText(game.root, 'button', 'Interfaces');
    const list = game.desktop.querySelector('[data-practice-window="list-interfaces"]');
    for (const tab of ['Interface', 'Interface List', 'Ethernet', 'EoIP Tunnel', 'IP Tunnel', 'GRE Tunnel', 'VLAN', 'VXLAN', 'VRRP', 'Bonding', 'LTE']) assert.ok(game.findText(list, 'button', tab), tab);
    const headings = list.querySelector('thead').querySelectorAll('th');
    assert.deepEqual(headings.map((cell) => cell.textContent), ['#', '', 'Name', 'Type', 'MTU', 'Actual MTU', 'L2 MTU', 'Tx', 'Rx', 'FP Tx', 'FP Rx']);
    const rows = list.querySelector('tbody').querySelectorAll('tr');
    assert.equal(rows.length, 7);
    for (const row of rows) assert.equal(row.querySelectorAll('td').length, headings.length);
    assert.match(list.textContent, /wlan1Wireless/); assert.match(list.textContent, /vlan-studioVLAN/); assert.match(list.textContent, /bridge-studioBridge/);
    game.clickText(list, 'button', 'Ethernet');
    assert.equal(list.querySelector('tbody').querySelectorAll('tr').length, 4);
    assert.equal(list.querySelector('[aria-label="Tambah"]').disabled, true);
});

test('Ethernet editor preserves settings between native tabs and reports actual cable link state', async () => {
    const game = boot(); game.clickText(game.root, 'button', 'Interfaces');
    const list = game.desktop.querySelector('[data-practice-window="list-interfaces"]');
    const ethernetRow = list.querySelector('tbody').querySelectorAll('tr')[2];
    await ethernetRow.click();
    assert.equal(list.querySelector('tbody').querySelectorAll('tr')[2], ethernetRow, 'selecting a row must preserve the double-click target');
    assert.equal(list.querySelector('[aria-label="Remove"]').disabled, true);
    await ethernetRow.emit('dblclick');
    const editor = game.desktop.querySelector('[data-practice-window="editor-interfaces-2"]');
    for (const label of ['Name', 'Type', 'MTU', 'Actual MTU', 'L2 MTU', 'Max L2 MTU', 'MAC Address', 'ARP', 'ARP Timeout']) assert.ok(editor.querySelector('[aria-label="' + label + '"]'), label);
    game.setField('Name', 'ether3-teknisi', editor);
    game.clickText(editor, 'button', 'Ethernet');
    assert.equal(editor.querySelector('[aria-label="Speed"]').disabled, true);
    const advertise = editor.querySelector('[aria-label="10M-baseT-half"]'); advertise.checked = false; await advertise.emit('change');
    game.setField('Auto Negotiation', false, editor);
    assert.equal(editor.querySelector('[aria-label="Speed"]').disabled, false);
    game.setField('Speed', '10M-baseT-full', editor);
    game.clickText(editor, 'button', 'Loop Protect'); game.setField('Loop Protect', 'on', editor);
    game.clickText(editor, 'button', 'General');
    assert.equal(editor.querySelector('[aria-label="Name"]').value, 'ether3-teknisi');
    game.clickText(editor, 'button', 'Apply');
    game.clickText(editor, 'button', 'Status');
    assert.equal(editor.querySelector('[aria-label="Status"]').value, 'link ok');
    assert.equal(editor.querySelector('[aria-label="Rate"]').value, '10 Mbps');
    game.clickText(editor, 'button', 'Traffic'); assert.ok(editor.querySelector('[role="img"]'));
    game.clickText(editor, 'button', 'OK');
    game.all('[data-practice-submit]')[0].click(); await game.all('[data-submit-send]')[0].click();
    const saved = JSON.parse(game.requests[0].options.body).state.tables.interfaces[2];
    assert.equal(saved.name, 'ether3-teknisi'); assert.equal(saved.autoNegotiation, false); assert.equal(saved.speed, '10M-baseT-full'); assert.equal(saved.loopProtect, 'on');
    assert.equal(saved.advertise.includes('10M-baseT-half'), false);
});

test('aggregate Interface rows edit and disable the correct VLAN rather than the Ethernet row at its index', async () => {
    const state = initial(); state.tables.vlans = [{ name: 'vlan-media', vlanId: 211, interface: 'ether2', disabled: false }];
    const game = boot({ state }); game.clickText(game.root, 'button', 'Interfaces');
    const list = game.desktop.querySelector('[data-practice-window="list-interfaces"]');
    const row = list.querySelector('tbody').querySelectorAll('tr').find((line) => line.textContent.includes('vlan-media'));
    await row.emit('dblclick');
    const editor = game.desktop.querySelector('[data-practice-window="editor-vlans-0"]');
    game.setField('VLAN ID', '212', editor); game.clickText(editor, 'button', 'OK');
    await list.querySelector('tbody').querySelectorAll('tr').find((line) => line.textContent.includes('vlan-media')).click();
    list.querySelector('[aria-label="Disable"]').click();
    const disabled = list.querySelector('tbody').querySelectorAll('tr').find((line) => line.textContent.includes('vlan-media'));
    assert.equal(disabled.classList.contains('is-disabled'), true);
    game.all('[data-practice-submit]')[0].click(); await game.all('[data-submit-send]')[0].click();
    const saved = JSON.parse(game.requests[0].options.body).state;
    assert.equal(saved.tables.vlans[0].vlanId, 212); assert.equal(saved.tables.vlans[0].disabled, true); assert.equal(saved.tables.interfaces[0].disabled, false);
});

test('Interface Lists separates list definitions from their interface members', () => {
    const game = boot(); game.clickText(game.root, 'button', 'Interfaces');
    const list = game.desktop.querySelector('[data-practice-window="list-interfaces"]');
    game.clickText(list, 'button', 'Interface List'); game.clickText(list, 'button', 'Lists');
    const definitions = game.desktop.querySelector('[data-practice-window="list-interfaceListNames"]'); definitions.querySelector('[aria-label="Tambah"]').click();
    const editor = game.desktop.querySelector('[data-practice-window="editor-interfaceListNames-new"]');
    game.setField('Name', 'LAN-STUDIO', editor); game.clickText(editor, 'button', 'OK');
    list.querySelector('[aria-label="Tambah"]').click();
    const member = game.desktop.querySelector('[data-practice-window="editor-interfaceLists-new"]');
    assert.ok(member.querySelector('[aria-label="List"]').options.some((option) => option.value === 'LAN-STUDIO'));
    game.setField('List', 'LAN-STUDIO', member); game.setField('Interface', 'ether3', member); game.clickText(member, 'button', 'OK');
    assert.match(list.textContent, /LAN-STUDIOether3/);
});

test('Switch VLAN has per-port dropdowns and stacked add controls, then stores a proper table row', () => {
    const game = boot();
    game.clickText(game.root, 'button', 'Switch');
    const list = game.desktop.querySelector('[data-practice-window="list-switch"]');
    game.clickText(list, 'button', 'VLAN');
    list.querySelector('[aria-label="Tambah"]').click();
    const editor = game.desktop.querySelector('[data-practice-window="editor-switchVlans-new"]');
    game.setField('VLAN ID', '211', editor);
    const choose = (index, value) => { const input = editor.querySelectorAll('[aria-label="Ports"]')[index]; assert.equal(input.tagName, 'SELECT'); input.value = value; input.emit('change'); };
    choose(0, 'ether1'); editor.querySelectorAll('[aria-label="Tambah Ports"]')[0].click();
    choose(1, 'ether3'); editor.querySelectorAll('[aria-label="Tambah Ports"]')[1].click();
    choose(2, 'ether4');
    game.clickText(editor, 'button', 'OK');
    assert.match(list.textContent, /211/);
    assert.match(list.textContent, /ether1, ether3, ether4/);
});

test('NAT editor retains General values when moving to Action and saves the chosen action', () => {
    const game = boot();
    game.clickText(game.root, 'button', 'IP');
    game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Firewall');
    const list = game.desktop.querySelector('[data-practice-window="list-firewall"]');
    game.clickText(list, 'button', 'NAT'); list.querySelector('[aria-label="Tambah"]').click();
    const editor = game.desktop.querySelector('[data-practice-window="editor-nat-new"]');
    game.setField('Chain', 'srcnat', editor); game.setField('Out. Interface', 'ether4', editor);
    game.clickText(editor, 'button', 'Action'); game.setField('Action', 'masquerade', editor);
    game.clickText(editor, 'button', 'General');
    assert.equal(editor.querySelector('[aria-label="Out. Interface"]').value, 'ether4');
    game.clickText(editor, 'button', 'OK');
    assert.match(list.textContent, /masquerade/);
});

test('canceling final confirmation does not submit; confirming posts saved state and displays every error', async () => {
    const game = boot();
    game.clickText(game.root, 'button', 'System'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Identity');
    game.clickText(game.desktop.querySelector('[data-practice-window="editor-identity-new"]'), 'button', 'Apply');
    game.all('[data-practice-submit]')[0].click();
    assert.equal(game.all('[data-submit-confirm]')[0].open, true);
    game.all('[data-submit-cancel]')[0].click();
    assert.equal(game.requests.length, 0);
    assert.equal(game.all('[data-submit-confirm]')[0].open, false);
    game.all('[data-practice-submit]')[0].click();
    await game.all('[data-submit-send]')[0].click();
    assert.equal(game.requests.length, 1);
    assert.equal(JSON.parse(game.requests[0].options.body).state.identity, 'MikroTik');
    assert.equal(game.all('[data-practice-result]')[0].open, true);
    assert.match(game.all('[data-result-errors]')[0].textContent, /Identity belum sesuai/);
    assert.equal(game.root.inert, true);
    assert.equal(game.all('[data-practice-submit]')[0].hidden, true);
});

test('DHCP Setup goes through native wizard screens and submits its linked pool and server', async () => {
    const state = initial(); state.tables.dhcp = []; state.tables.pools = []; state.tables.networks = [];
    const game = boot({ state, type: 'dhcp' });
    game.clickText(game.root, 'button', 'IP'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'DHCP Server');
    game.clickText(game.desktop, 'button', 'DHCP Setup');
    const win = game.desktop.querySelector('[data-practice-window="wizard-dhcp"]');
    game.setField('DHCP Server Interface', 'ether3', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="DHCP Address Space"]').value, '');
    game.setField('DHCP Address Space', '172.22.91.0/24', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="Gateway for DHCP Network"]').value, '');
    game.setField('Gateway for DHCP Network', '172.22.91.1', win); game.clickText(win, 'button', 'Next');
    game.setField('Addresses to Give Out', '172.22.91.60-172.22.91.95', win); game.clickText(win, 'button', 'Next');
    game.setField('DNS Servers', '172.22.91.1', win); game.clickText(win, 'button', 'Next');
    game.setField('Lease Time', '00:20:00', win); game.clickText(win, 'button', 'Next');
    assert.match(win.textContent, /completed successfully/);
    game.clickText(win, 'button', 'OK');
    await game.all('[data-submit-send]')[0].click();
    const config = JSON.parse(game.requests[0].options.body).state.tables;
    assert.equal(config.dhcp[0].leaseTime, '00:20:00');
    assert.equal(config.dhcp[0].pool, config.pools[0].name);
    assert.equal(config.pools[0].ranges, '172.22.91.60-172.22.91.95');
});

test('HotSpot Setup uses chapter-four layout and requires manually entered network values', async () => {
    const state = initial(); state.tables.hotspot = []; state.tables.users = [];
    const game = boot({ state, type: 'hotspot' });
    game.clickText(game.root, 'button', 'IP'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Hotspot');
    game.clickText(game.desktop, 'button', 'Hotspot Setup');
    const win = game.desktop.querySelector('[data-practice-window="wizard-hotspot"]');
    assert.equal(win.classList.contains('ch4-setup-window'), true);
    assert.ok(win.querySelector('.ch4-setup-description')); assert.ok(win.querySelector('.ch4-setup-fields'));
    assert.deepEqual(win.querySelector('.ch4-setup-actions').querySelectorAll('button').map((button) => button.textContent), ['Back', 'Next', 'Cancel']);
    game.setField('HotSpot Interface', 'wlan1', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="Local Address of Network"]').value, '');
    game.clickText(win, 'button', 'Next'); assert.ok(win.querySelector('[aria-label="Local Address of Network"]'), 'blank network address cannot silently finish the wizard');
    assert.equal(game.desktop.querySelector('[data-practice-window="list-hotspot"]').textContent.includes('hotspot1'), false);
    game.setField('Local Address of Network', '10.57.8.1/24', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="Address Pool of Network"]').value, '');
    game.clickText(win, 'button', 'Back'); assert.equal(win.querySelector('[aria-label="Local Address of Network"]').value, '10.57.8.1/24');
    game.clickText(win, 'button', 'Next'); game.setField('Address Pool of Network', '10.57.8.60-10.57.8.95', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="Select Certificate"]').value, 'none'); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="IP Address of SMTP Server"]').value, '0.0.0.0'); game.clickText(win, 'button', 'Next');
    const dns = win.querySelector('[aria-label="DNS Servers"]'); assert.equal(dns.value, ''); assert.equal(dns.tagName, 'INPUT');
    game.setField('DNS Servers', '1.1.1.1, 9.9.9.9', win); game.clickText(win, 'button', 'Next');
    assert.equal(win.querySelector('[aria-label="DNS Name"]').value, ''); game.setField('DNS Name', 'studio-baru.test', win); game.clickText(win, 'button', 'Next');
    game.setField('Name of Local HotSpot User', 'tamu-baru', win); game.setField('Password for the User', 'Coba-Baru-123', win); game.clickText(win, 'button', 'Next');
    assert.match(win.textContent, /completed successfully/); game.clickText(win, 'button', 'OK');
    await game.all('[data-submit-send]')[0].click();
    const saved = JSON.parse(game.requests[0].options.body).state;
    assert.equal(saved.tables.hotspot[0].localAddress, '10.57.8.1/24'); assert.equal(saved.tables.hotspot[0].pool, '10.57.8.60-10.57.8.95');
    assert.deepEqual(saved.tables.hotspot[0].dns, ['1.1.1.1', '9.9.9.9']); assert.equal(saved.tables.hotspot[0].dnsName, 'studio-baru.test');
    assert.equal(saved.tables.users[0].name, 'tamu-baru');
});

test('security profiles and the Wireless tab preserve independent Wi-Fi settings', async () => {
    const game = boot(); game.clickText(game.root, 'button', 'Wireless');
    const list = game.desktop.querySelector('[data-practice-window="list-wireless"]');
    game.clickText(list, 'button', 'Security Profiles'); list.querySelector('[aria-label="Tambah"]').click();
    const editor = game.desktop.querySelector('[data-practice-window="editor-security-new"]');
    game.setField('Name', 'profil-baru', editor); game.setField('Mode', 'dynamic keys', editor); game.setField('WPA2 PSK', true, editor); game.setField('WPA2 Pre-Shared Key', 'Password-Sendiri', editor); game.clickText(editor, 'button', 'OK');
    game.clickText(list, 'button', 'WiFi Interfaces');
    list.querySelector('tbody').children[0].emit('dblclick');
    const wifi = game.desktop.querySelector('[data-practice-window="editor-wireless-0"]');
    game.clickText(wifi, 'button', 'Wireless'); game.setField('SSID', 'SSID-Berbeda', wifi); game.setField('Security Profile', 'profil-baru', wifi); game.clickText(wifi, 'button', 'OK');
    await game.all('[data-submit-send]')[0].click(); const config = JSON.parse(game.requests[0].options.body).state.tables;
    assert.equal(config.wireless[0].ssid, 'SSID-Berbeda');
    assert.equal(config.wireless[0].securityProfile, 'profil-baru');
    assert.equal(config.security[1].key, 'Password-Sendiri');
});

test('login HTML must be copied, saved in Notepad and dragged back with replacement confirmation', async () => {
    const game = boot({ type: 'portal-page' });
    game.clickText(game.root, 'button', 'Files'); game.all('[data-app-restore]')[0].click();
    assert.equal(game.all('[data-pc-desktop]')[0].hidden, false);
    game.all('[data-pc-desktop]')[0].emit('drop', { dataTransfer: { getData: () => 'practice-router-html' } });
    const file = game.all('[data-practice-html]')[0]; assert.ok(file);
    file.emit('contextmenu', { clientX: 30, clientY: 40 });
    game.clickText(game.host.querySelector('.practice-file-menu'), 'button', 'Open with'); game.clickText(game.host.querySelector('.practice-file-menu'), 'button', 'Notepad');
    const notepad = game.host.querySelector('.practice-notepad'); notepad.querySelector('textarea').value = '<h1>Studio Baru</h1><form name="login"><input name="username"><input name="password"></form>';
    game.clickText(notepad, 'button', 'Simpan'); game.clickText(notepad, 'button', '×');
    const list = game.desktop.querySelector('[data-practice-window="files"]'); list.querySelector('.practice-table-scroll').emit('drop', { dataTransfer: { getData: () => 'practice-desktop-html' } });
    const confirm = game.desktop.querySelector('[data-practice-window="replace-file"]'); game.clickText(confirm, 'button', 'Yes');
    await game.all('[data-submit-send]')[0].click();
    assert.match(JSON.parse(game.requests[0].options.body).state.files.routerHtml, /Studio Baru/);
});

test('HP scans Wi-Fi, connects using its key, then logs in using the separate HotSpot account', async () => {
    const game = boot({ type: 'portal-login' });
    game.clickText(game.root, 'button', '▯ HP uji');
    game.clickText(game.root, 'button', '⚙ Pengaturan Wi-Fi'); game.flush();
    game.clickText(game.root, 'button', '◉  Studio-Baru');
    game.setField('Password Wi-Fi', 'Password-Baru', game.host); game.clickText(game.root, 'button', 'Hubungkan'); game.flush();
    game.clickText(game.root, 'button', '◉  Studio-Baru · Terhubung'); game.flush();
    game.setField('Username HotSpot', 'peserta', game.host); game.setField('Password HotSpot', 'Hotspot-Baru', game.host);
    game.clickText(game.root, 'button', 'Connect'); game.flush();
    assert.match(game.all('[data-phone]')[0].textContent, /Login berhasil/);
    await game.all('[data-submit-send]')[0].click();
    assert.equal(JSON.parse(game.requests[0].options.body).state.phone.authenticatedUser, 'peserta');
});

test('Undo and Redo restore saved configuration independently from the open question', () => {
    const game = boot();
    game.clickText(game.root, 'button', 'System'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Identity');
    const editor = game.desktop.querySelector('[data-practice-window="editor-identity-new"]');
    game.setField('Identity', 'Identitas-Baru', editor); game.clickText(editor, 'button', 'OK');
    game.all('[data-undo]')[0].click(); assert.match(game.all('[data-session-title]')[0].textContent, /MikroTik/);
    game.all('[data-redo]')[0].click(); assert.match(game.all('[data-session-title]')[0].textContent, /Identitas-Baru/);
});

test('leaving an uncommitted Safe Mode session rolls back configuration changes', () => {
    const game = boot(); game.all('[data-safe-mode]')[0].click();
    game.clickText(game.root, 'button', 'System'); game.clickText(game.desktop.querySelector('.practice-menu'), 'button', 'Identity');
    const editor = game.desktop.querySelector('[data-practice-window="editor-identity-new"]');
    game.setField('Identity', 'Sementara', editor); game.clickText(editor, 'button', 'OK');
    game.all('[data-session-exit]')[0].click();
    assert.match(game.all('[data-session-title]')[0].textContent, /MikroTik/);
    assert.ok(game.desktop.querySelector('[data-practice-window="loader"]'));
    assert.equal(game.all('[data-safe-mode]')[0].classList.contains('is-active'), false);
});
