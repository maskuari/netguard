(() => {
    'use strict';
    const root = document.querySelector('[data-practice]');
    if (!root) return;
    const scenario = JSON.parse(document.querySelector('#practice-scenario').textContent);
    const simulator = window.NetGuardPracticeSimulator;
    const schemas = simulator.schemas;
    const host = root.querySelector('[data-practice-host]');
    const app = root.querySelector('[data-practice-winbox]');
    const desktop = root.querySelector('[data-practice-desktop]');
    const pcDesktop = root.querySelector('[data-pc-desktop]');
    const pcCommand = root.querySelector('[data-client-cmd]');
    const physical = root.querySelector('[data-physical]');
    const phone = root.querySelector('[data-phone]');
    const storageKey = 'netguard.practice.' + root.dataset.userId + '.' + scenario.id;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { saved = null; }
    let engine = simulator.create(saved?.state || scenario.initialState);
    let submitted = Boolean(scenario.result), view = scenario.surface, zIndex = 40, selectedCable = '', phoneScreen = 'home', phoneTimer = null, noticeTimer = null, safeSnapshot = null;
    let configurationStarted = saved?.configurationStarted === true || (saved?.configurationStarted === undefined && Boolean(saved?.state));
    const submitControl = root.querySelector('[data-practice-submit]');
    submitControl.hidden = !configurationStarted || submitted;
    const undo = [], redo = [], windows = new Map(), refreshers = new Map();
    const assets = root.dataset.assets;
    const element = (tag, className = '', text = '') => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
    const button = (text, callback, className = '') => { const node = element('button', className, text); node.type = 'button'; node.addEventListener('click', callback); return node; };
    const icon = (name) => { const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); node.setAttribute('class', 'wb-icon'); node.setAttribute('aria-hidden', 'true'); const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', assets + '/logo/winbox-icons.svg#' + name); node.append(use); return node; };
    const saveLocal = () => { try { localStorage.setItem(storageKey, JSON.stringify({ state: engine.snapshot(), configurationStarted })); } catch { /* The attempt can still be submitted when browser storage is full. */ } };
    const beginConfiguration = () => { if (submitted || configurationStarted) return; configurationStarted = true; submitControl.hidden = false; saveLocal(); };
    const notice = (message) => { const node = root.querySelector('[data-practice-notice]'); node.textContent = message; node.hidden = false; window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { node.hidden = true; }, 3200); };
    const change = (action) => { if (submitted) return; const before = engine.snapshot(); try { action(); beginConfiguration(); undo.push(before); if (undo.length > 30) undo.shift(); redo.length = 0; saveLocal(); refreshAll(); } catch (error) { engine = simulator.create(before); throw error; } };
    const attempt = (action) => { try { action(); } catch (error) { notice(error.message); } };
    const closeMenu = () => desktop.querySelector('.practice-menu')?.remove();
    const childTasks = element('div', 'practice-child-tasks'); desktop.append(childTasks);
    const updateTitle = () => {
        root.querySelector('[data-session-title]').textContent = 'admin@' + engine.state.session.mac + ' (' + engine.state.identity + ') - WinBox (64bit) v7.14.3 on ' + engine.state.device + ' (' + (engine.state.device === 'hEX lite' ? 'mipsbe' : 'smips') + ')';
        root.querySelector('[data-session-mac]').textContent = engine.state.session.mac;
        root.querySelector('[data-board-title]').textContent = 'RouterOS 7.14.3 · ' + engine.state.device;
        const network = root.querySelector('[data-pc-network]');
        network.classList.toggle('is-online', Boolean(engine.state.physical.pcPort && engine.state.physical.pcLan));
        network.setAttribute('title', engine.state.physical.pcPort ? 'Ethernet · ' + engine.state.physical.pcPort : 'Kabel LAN terlepas');
    };
    const refreshAll = () => { updateTitle(); for (const refresh of refreshers.values()) refresh(); };
    const disconnectSession = () => {
        if (safeSnapshot) { engine = simulator.create(safeSnapshot); safeSnapshot = null; root.querySelector('[data-safe-mode]').classList.remove('is-active'); }
        change(() => { engine.state.session.connected = false; }); openLoader();
    };
    const showView = (next) => {
        view = next; closeMenu();
        app.hidden = next !== 'winbox'; pcDesktop.hidden = !['desktop', 'cmd'].includes(next); pcCommand.hidden = next !== 'cmd'; physical.hidden = next !== 'physical'; phone.hidden = next !== 'phone';
        root.querySelector('[data-pc-home]').setAttribute('aria-pressed', String(next === 'desktop'));
        root.querySelector('[data-pc-task-winbox]').setAttribute('aria-pressed', String(next === 'winbox'));
        root.querySelector('[data-pc-task-cmd]').setAttribute('aria-pressed', String(next === 'cmd'));
        if (next === 'winbox' && !engine.state.session.connected) openLoader();
        if (next === 'physical') renderPhysical();
        if (next === 'phone') renderPhone();
        if (next === 'cmd') root.querySelector('[data-client-command]').focus();
        if (!engine.state.physical.powered && next !== 'physical') powerScreen();
    };
    const makeWindow = (id, title, editor = false) => {
        closeMenu();
        if (windows.has(id)) { const current = windows.get(id); current.hidden = false; current.style.zIndex = String(++zIndex); childTasks.querySelector('[data-restore="' + id + '"]')?.remove(); return current; }
        const node = element('section', 'practice-window' + (editor ? ' practice-editor' : ' is-maximized'));
        node.setAttribute('aria-label', title); node.dataset.practiceWindow = id; node.style.zIndex = String(++zIndex);
        const header = element('header'), controls = element('span'); header.append(element('span', '', title), controls);
        const close = () => { node.remove(); windows.delete(id); refreshers.delete(id); childTasks.querySelector('[data-restore="' + id + '"]')?.remove(); };
        if (!editor) {
            controls.append(button('−', () => { node.hidden = true; const restore = button(title, () => { node.hidden = false; node.style.zIndex = String(++zIndex); restore.remove(); }); restore.dataset.restore = id; childTasks.append(restore); }));
            controls.append(button('□', () => node.classList.toggle('is-maximized')));
        }
        controls.append(button('×', close)); node.append(header);
        node.closePractice = close;
        let drag = null;
        header.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || event.target.closest('button') || node.classList.contains('is-maximized')) return;
            const bounds = node.getBoundingClientRect(); drag = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, id: event.pointerId }; header.setPointerCapture(event.pointerId); event.preventDefault();
        });
        header.addEventListener('pointermove', (event) => {
            if (!drag || drag.id !== event.pointerId) return;
            const area = desktop.getBoundingClientRect(), bounds = node.getBoundingClientRect();
            node.style.left = Math.max(0, Math.min(event.clientX - area.left - drag.x, area.width - bounds.width)) + 'px';
            node.style.top = Math.max(0, Math.min(event.clientY - area.top - drag.y, area.height - bounds.height)) + 'px';
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => header.addEventListener(name, () => { drag = null; }));
        node.addEventListener('pointerdown', () => { node.style.zIndex = String(++zIndex); });
        windows.set(id, node); desktop.append(node); return node;
    };
    const renderField = (definition, values) => {
        const label = element('label'); label.append(document.createTextNode(definition.label));
        const control = (value = '') => {
            const node = element(definition.type === 'select' || definition.source ? 'select' : definition.type === 'textarea' ? 'textarea' : 'input');
            if (node.tagName === 'SELECT') {
                for (const item of ['', ...engine.options(definition)]) { const option = element('option', '', String(item)); option.value = item; node.append(option); }
                if (value && ![...node.options].some((option) => option.value === String(value))) { const option = element('option', '', String(value)); option.value = value; node.append(option); }
            } else node.type = definition.type === 'number' ? 'number' : definition.type === 'password' ? 'password' : definition.type === 'checkbox' ? 'checkbox' : 'text';
            if (definition.type === 'checkbox') node.checked = Boolean(value); else node.value = value ?? '';
            node.setAttribute('aria-label', definition.label); node.autocomplete = 'off';
            if (definition.readonly) { node.readOnly = true; if (node.tagName === 'SELECT' || node.type === 'checkbox') node.disabled = true; }
            if (definition.min !== undefined) node.min = definition.min; if (definition.max !== undefined) node.max = definition.max;
            return node;
        };
        if (definition.type === 'checks') {
            const group = element('span', 'practice-check-group');
            for (const option of definition.options) {
                const item = element('label'), input = element('input'); input.type = 'checkbox'; input.checked = (values[definition.key] || []).includes(option); input.setAttribute('aria-label', option);
                input.addEventListener('change', () => { const selected = new Set(values[definition.key] || []); if (input.checked) selected.add(option); else selected.delete(option); values[definition.key] = [...selected]; });
                item.append(input, document.createTextNode(option)); group.append(item);
            }
            label.append(group);
        } else if (definition.type === 'list') {
            const list = element('span', 'practice-list-field');
            const draw = () => {
                list.replaceChildren();
                const items = values[definition.key]?.length ? values[definition.key] : [''];
                items.forEach((value, index) => {
                    const row = element('div'), input = control(value);
                    input.addEventListener('change', () => { items[index] = input.value; values[definition.key] = items; });
                    input.addEventListener('input', () => { items[index] = input.value; values[definition.key] = items; });
                    const add = button('▾', () => { beginConfiguration(); items.splice(index + 1, 0, ''); values[definition.key] = items; draw(); }); add.setAttribute('aria-label', 'Tambah ' + definition.label); add.style.gridColumn = '2'; add.style.gridRow = '2';
                    const remove = button('▴', () => { items.splice(index, 1); values[definition.key] = items; draw(); }); remove.setAttribute('aria-label', 'Hapus ' + definition.label); remove.style.gridColumn = '2'; remove.style.gridRow = '1';
                    row.append(input, add, remove); list.append(row);
                });
            };
            draw(); label.append(list);
        } else {
            const input = control(values[definition.key]);
            const update = () => { values[definition.key] = definition.type === 'checkbox' ? input.checked : input.value; };
            input.addEventListener('input', update); input.addEventListener('change', update); label.append(input);
        }
        return label;
    };
    const openEditor = (table, index = null, onSaved = () => {}, initialValues = {}) => {
        const id = 'editor-' + table + '-' + (index ?? 'new');
        if (windows.has(id)) return makeWindow(id, '', true);
        const schema = schemas[table];
        if (!schema.singleton && index === null) beginConfiguration();
        let values = { ...engine.draft(table, index), ...initialValues }, currentIndex = index;
        const win = makeWindow(id, schema.singleton ? schema.title : index === null ? schema.editTitle : schema.editTitle.replace(/^New /, '') + (values.name ? ' <' + values.name + '>' : ''), true);
        const layout = element('div', 'practice-editor-layout'), main = element('div', 'practice-editor-main'), actions = element('div', 'practice-editor-actions'), status = element('div', 'practice-window-status'), footer = element('footer');
        const tabs = [...new Set(schema.fields.map((item) => item.tab))];
        const fields = element('div', 'practice-form');
        let activeTab = tabs[0];
        const paintFields = () => {
            if (currentIndex !== null && ['interfaces', 'wireless', 'vlans', 'bridges'].includes(table)) {
                const live = engine.interfaceDetails(table, currentIndex);
                for (const item of schema.fields.filter((field) => field.readonly)) values[item.key] = live[item.key] ?? values[item.key];
            }
            fields.replaceChildren(...schema.fields.filter((item) => item.tab === activeTab).map((item) => renderField(item, values)));
            if (activeTab === 'Traffic') {
                const graph = element('div', 'practice-traffic-graph'); graph.setAttribute('role', 'img'); graph.setAttribute('aria-label', 'Traffic: Tx ' + (values.tx || '0 bps') + ', Rx ' + (values.rx || '0 bps'));
                graph.append(element('span', '', 'bps'), element('div', 'practice-traffic-baseline'), element('small', '', '60 s                         30 s                         0 s'));
                fields.prepend(graph);
            }
            if (activeTab === 'Ethernet') {
                const syncNegotiation = () => {
                    fields.querySelector('[aria-label="Speed"]').disabled = Boolean(values.autoNegotiation);
                    fields.querySelector('.practice-check-group').querySelectorAll('input').forEach((input) => { input.disabled = !values.autoNegotiation; });
                };
                syncNegotiation(); fields.querySelector('[aria-label="Auto Negotiation"]').addEventListener('change', syncNegotiation);
            }
        };
        if (tabs.length > 1) {
            const nav = element('div', 'practice-tabs');
            tabs.forEach((tab) => { const control = button(tab, () => { activeTab = tab; [...nav.children].forEach((child) => child.classList.toggle('is-active', child === control)); paintFields(); }); control.classList.toggle('is-active', tab === activeTab); nav.append(control); });
            main.append(nav);
        }
        const apply = (close) => {
            beginConfiguration();
            try {
                for (const item of schema.fields.filter((item) => item.type === 'list')) values[item.key] = (values[item.key] || []).filter((value) => String(value).trim() !== '');
                change(() => { currentIndex = engine.save(table, values, currentIndex); });
                status.textContent = ''; footer.textContent = values.disabled ? 'disabled' : 'enabled';
                const remove = actions.querySelector('[data-editor-remove]'); if (remove) remove.disabled = false;
                onSaved(); if (close) win.closePractice(); else paintFields();
            } catch (error) { status.textContent = error.message; }
        };
        actions.append(button('OK', () => apply(true)), button('Cancel', () => win.closePractice()), button('Apply', () => apply(false)));
        if (!schema.singleton) actions.append(button(values.disabled ? 'Enable' : 'Disable', () => {
            values.disabled = !values.disabled;
            if (currentIndex !== null) change(() => engine.toggle(table, currentIndex, values.disabled));
            actions.children[3].textContent = values.disabled ? 'Enable' : 'Disable'; footer.textContent = values.disabled ? 'disabled' : 'enabled'; paintFields();
        }));
        if (!schema.singleton) {
            actions.append(button('Comment', () => {
                const dialog = makeWindow('comment-' + table, 'Comment', true), form = element('div', 'practice-form'), comment = { comment: values.comment || '' };
                form.append(renderField({ key: 'comment', label: 'Comment', type: 'textarea' }, comment), button('OK', () => { values.comment = comment.comment; dialog.closePractice(); })); dialog.append(form);
            }));
            if (!['interfaces', 'wireless', 'lte', 'switchPorts', 'switchChips'].includes(table)) {
                actions.append(button('Copy', () => { const copy = { ...values }; if (copy.name) copy.name += '-copy'; win.closePractice(); openEditor(table, null, onSaved, copy); }));
                const remove = button('Remove', () => { change(() => engine.remove(table, currentIndex)); onSaved(); win.closePractice(); }); remove.dataset.editorRemove = ''; remove.disabled = currentIndex === null; actions.append(remove);
            }
        }
        paintFields(); main.append(fields); layout.append(main, actions); footer.textContent = values.disabled ? 'disabled' : 'enabled'; win.append(layout, status, footer);
        refreshers.set(id, () => { if (currentIndex !== null && !engine.state.tables[table]?.[currentIndex]) win.closePractice(); else if (['Status', 'Traffic'].includes(activeTab)) paintFields(); });
        win.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') { event.preventDefault(); apply(true); } });
        fields.querySelector('input:not([readonly]), select')?.focus();
    };
    const groups = {
        interfaces: [['Interface', 'interfaces'], ['Interface List', 'interfaceLists'], ['Ethernet', 'ethernet'], ['EoIP Tunnel', 'eoip'], ['IP Tunnel', 'ipip'], ['GRE Tunnel', 'gre'], ['VLAN', 'vlans'], ['VXLAN', 'vxlan'], ['VRRP', 'vrrp'], ['Bonding', 'bonding'], ['LTE', 'lte']],
        wireless: [['WiFi Interfaces', 'wireless'], ['W60G Station', 'wireless60'], ['Nstreme Dual', 'nstreme'], ['Access List', 'wirelessAccess'], ['Registration', 'wirelessRegistration'], ['Connect List', 'wirelessConnect'], ['Security Profiles', 'security'], ['Channels', 'wirelessChannels']],
        bridge: [['Bridge', 'bridges'], ['Ports', 'bridgePorts'], ['VLANs', 'bridgeVlans'], ['MSTIs', 'bridgeMstis'], ['Port MST Overrides', 'bridgeOverrides'], ['Filters', 'bridgeFilters'], ['NAT', 'bridgeNat'], ['Hosts', 'bridgeHosts'], ['MDB', 'bridgeMdb']],
        switch: [['Switch', 'switchChips'], ['Port', 'switchPorts'], ['Port Isolation', 'switchIsolation'], ['Host', 'switchHosts'], ['VLAN', 'switchVlans'], ['Rule', 'switchRules']],
        dhcp: [['DHCP', 'dhcp'], ['Networks', 'networks'], ['Leases', 'leases']],
        firewall: [['Filter Rules', 'filter'], ['NAT', 'nat'], ['Mangle', 'mangle'], ['Raw', 'raw'], ['Service Ports', 'servicePorts'], ['Connections', 'connections'], ['Address Lists', 'addressLists']],
        hotspot: [['Servers', 'hotspot'], ['Server Profiles', 'hotspotProfiles'], ['Users', 'users'], ['User Profiles', 'profiles'], ['Active', 'hotspotActive'], ['Hosts', 'hotspotHosts'], ['IP Bindings', 'hotspotBindings'], ['Service Ports', 'hotspotServices'], ['Walled Garden', 'walledGarden'], ['Walled Garden IP List', 'walledGardenIp'], ['Cookies', 'hotspotCookies']],
        routes: [['Routes', 'routes'], ['Nexthops', 'nexthops'], ['Rules', 'routingRules'], ['VRF', 'vrf']],
    };
    const ensureSchema = (key, title) => {
        if (schemas[key]) return;
        schemas[key] = { title, editTitle: 'New ' + title, columns: ['name', 'address', 'interface', 'comment'], fields: [{ key: 'name', label: 'Name', type: 'text', tab: 'General' }, { key: 'address', label: 'Address', type: 'text', tab: 'General' }, { key: 'interface', label: 'Interface', type: 'select', source: 'interfaces', tab: 'General' }, { key: 'comment', label: 'Comment', type: 'text', tab: 'General' }] };
        engine.state.tables[key] ||= [];
    };
    const labels = { name: 'Name', type: 'Type', mtu: 'MTU', actualMtu: 'Actual MTU', l2Mtu: 'L2 MTU', tx: 'Tx', rx: 'Rx', fpTx: 'FP Tx', fpRx: 'FP Rx', vlanId: 'VLAN ID', interface: 'Interface', outInterface: 'Out. Interface', srcAddress: 'Src. Address', dstAddress: 'Dst. Address', dns: 'DNS Servers', pool: 'Address Pool', leaseTime: 'Lease Time', mac: 'MAC Address', sharedUsers: 'Shared Users', rateLimit: 'Rate Limit', usePeerDns: 'Use Peer DNS', addDefaultRoute: 'Add Default Route', securityProfile: 'Security Profile', ssid: 'SSID', header: 'VLAN Header', mode: 'VLAN Mode', pathCost: 'Path Cost' };
    const cellText = (value) => Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? value ? 'yes' : 'no' : String(value ?? '');
    const openList = (key, startingTable = null) => {
        const tabDefinitions = groups[key] || [[schemas[key]?.title || key, key]];
        for (const [label, table] of tabDefinitions) ensureSchema(table, label);
        const id = 'list-' + key;
        if (windows.has(id)) { makeWindow(id, ''); return; }
        const win = makeWindow(id, schemas[tabDefinitions[0][1]].title);
        const tabs = element('div', 'practice-tabs'), toolbar = element('div', 'practice-list-toolbar'), scroll = element('div', 'practice-table-scroll'), footer = element('footer');
        let table = startingTable || tabDefinitions[0][1], selected = null, searchText = '', sortKey = null, ascending = true, filter = 'all';
        const entries = () => ['interfaces', 'ethernet'].includes(table) ? engine.interfaceEntries(table === 'ethernet') : engine.state.tables[table].map((row, index) => ({ row, index, table }));
        const currentSelection = () => selected && entries().find((entry) => entry.table === selected.table && entry.index === selected.index);
        const updateSelectionControls = () => toolbar.querySelectorAll('[data-needs-selection]').forEach((control) => { const entry = currentSelection(); control.disabled = !entry || control.dataset.operation === 'Remove' && ['interfaces', 'wireless', 'lte'].includes(entry.table); });
        const draw = () => {
            const schema = schemas[table], tableNode = element('table', 'practice-table'), head = element('thead'), heading = element('tr'), body = element('tbody');
            heading.append(element('th', '', '#'));
            const isInterfaceList = ['interfaces', 'ethernet'].includes(table);
            if (isInterfaceList) { tableNode.classList.add('practice-interface-table'); const flags = element('th', '', ''); flags.setAttribute('aria-label', 'Flags'); heading.append(flags); }
            schema.columns.forEach((column) => { const label = column === 'mode' ? table === 'switchPorts' ? 'VLAN Mode' : 'Mode' : column === 'vlanId' && table === 'switchPorts' ? 'Default VLAN ID' : labels[column]; const cell = element('th', '', label || column.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())); cell.addEventListener('click', () => { ascending = sortKey === column ? !ascending : true; sortKey = column; draw(); }); heading.append(cell); }); head.append(heading);
            let rows = entries().filter(({ row }) => Object.values(row).some((value) => cellText(value).toLowerCase().includes(searchText)) && (filter === 'all' || filter === 'disabled' && row.disabled || filter === 'enabled' && !row.disabled));
            if (sortKey) rows.sort((a, b) => cellText(a.row[sortKey]).localeCompare(cellText(b.row[sortKey]), undefined, { numeric: true }) * (ascending ? 1 : -1));
            rows.forEach(({ row, index, table: sourceTable }, displayIndex) => {
                const line = element('tr'); line.tabIndex = 0; line.classList.toggle('is-selected', selected?.index === index && selected?.table === sourceTable); line.classList.toggle('is-disabled', Boolean(row.disabled));
                line.append(element('td', '', String(isInterfaceList ? displayIndex : index) + (!isInterfaceList && row.disabled ? ' X' : '')));
                if (isInterfaceList) { const flags = element('td', '', row.flags); flags.title = 'R - running, S - slave, X - disabled'; line.append(flags); }
                schema.columns.forEach((column) => line.append(element('td', '', cellText(row[column] ?? (['tx', 'rx'].includes(column) ? '0 bps' : column === 'type' ? table === 'bridges' ? 'Bridge' : 'Ethernet' : '')))));
                if (isInterfaceList) { const name = line.children[2]; name.prepend(icon(sourceTable === 'wireless' ? 'wireless' : 'interfaces')); }
                line.addEventListener('click', () => { selected = { table: sourceTable, index }; [...body.children].forEach((child) => child.classList.toggle('is-selected', child === line)); updateSelectionControls(); }); line.addEventListener('dblclick', () => openEditor(sourceTable, index));
                line.addEventListener('keydown', (event) => { if (event.key === 'Enter') openEditor(sourceTable, index); }); body.append(line);
            });
            tableNode.append(head, body); scroll.replaceChildren(tableNode); footer.textContent = rows.length + ' items';
            updateSelectionControls();
        };
        const tools = () => {
            toolbar.replaceChildren();
            const add = button('', () => { beginConfiguration(); return table === 'interfaces' ? menu(add, [['Bridge', 'bridges'], ['Bonding', 'bonding'], ['EoIP Tunnel', 'eoip'], ['GRE Tunnel', 'gre'], ['IP Tunnel', 'ipip'], ['VLAN', 'vlans'], ['VRRP', 'vrrp'], ['VXLAN', 'vxlan']].map(([label, key]) => [label, () => openEditor(key)])) : openEditor(table); }); add.disabled = ['ethernet', 'lte'].includes(table); add.title = 'Add'; add.setAttribute('aria-label', 'Tambah'); add.append(icon('add')); toolbar.append(add);
            for (const [name, symbol, action] of [['Remove', 'remove', (entry) => change(() => { engine.remove(entry.table, entry.index); selected = null; })], ['Enable', 'enable', (entry) => change(() => engine.toggle(entry.table, entry.index, false))], ['Disable', 'disable', (entry) => change(() => engine.toggle(entry.table, entry.index, true))], ['Comment', 'comment', (entry) => openEditor(entry.table, entry.index)]]) {
                const control = button('', () => attempt(() => { const entry = currentSelection(); if (entry) action(entry); })); control.title = name; control.setAttribute('aria-label', name); control.dataset.needsSelection = ''; control.dataset.operation = name; control.append(icon(symbol)); toolbar.append(control);
            }
            const filterButton = button('', () => menu(filterButton, ['all', 'enabled', 'disabled'].map((value) => [value, () => { filter = value; draw(); }]))); filterButton.setAttribute('aria-label', 'Filter'); filterButton.append(icon('filter')); toolbar.append(filterButton);
            if (table === 'interfaceLists') toolbar.append(button('Lists', () => openList('interfaceListNames')));
            if (table === 'dhcp') toolbar.append(button('DHCP Setup', () => openWizard('dhcp')));
            if (table === 'hotspot') toolbar.append(button('Hotspot Setup', () => openWizard('hotspot')));
            if (table === 'wan') toolbar.append(button('Renew', () => attempt(() => change(() => { for (const row of engine.state.tables.wan) if (!row.disabled) row.status = 'bound'; }))));
            if (table === 'bridges') toolbar.append(button('Settings', () => openBridgeSettings()));
            if (table === 'wireless') {
                for (const name of ['CAP', 'WPS Client', 'Setup Repeater', 'Scanner', 'Freq. Usage', 'Alignment', 'Wireless Sniffer', 'Wireless Snooper']) toolbar.append(button(name, () => openWirelessTool(name)));
            }
            const search = element('input'); search.placeholder = 'Find'; search.setAttribute('aria-label', 'Find'); search.value = searchText; search.addEventListener('input', () => { searchText = search.value.toLowerCase(); draw(); }); toolbar.append(search);
        };
        if (tabDefinitions.length > 1) {
            tabDefinitions.forEach(([label, value]) => { const control = button(label, () => { table = value; selected = null; sortKey = null; [...tabs.children].forEach((child) => child.classList.toggle('is-active', child === control)); tools(); draw(); }); control.classList.toggle('is-active', value === table); tabs.append(control); }); win.append(tabs);
        }
        win.append(toolbar, scroll, footer); tools(); draw(); refreshers.set(id, draw);
    };
    const openBridgeSettings = () => {
        if (!schemas.bridgeSettings) schemas.bridgeSettings = { title: 'Bridge Settings', singleton: true, fields: ['Use IP Firewall', 'Use IP Firewall For VLAN', 'Use IP Firewall For PPPoE', 'Allow Fast Path'].map((label) => ({ key: label, label, type: 'checkbox', tab: 'General', default: label === 'Allow Fast Path' })) };
        const id = 'bridge-settings'; if (windows.has(id)) return makeWindow(id, '', true);
        const win = makeWindow(id, 'Bridge Settings', true), form = element('div', 'practice-form'), values = { ...engine.state.bridgeSettings };
        schemas.bridgeSettings.fields.forEach((item) => { values[item.key] ??= item.default; form.append(renderField(item, values)); });
        form.append(button('OK', () => { change(() => { engine.state.bridgeSettings = values; }); win.closePractice(); }), button('Cancel', () => win.closePractice())); win.append(form);
    };
    const openWirelessTool = (name) => {
        const id = 'wireless-tool-' + name; if (windows.has(id)) return makeWindow(id, '', true);
        const win = makeWindow(id, name, true), form = element('div', 'practice-form'), values = { interface: 'wlan1', ssid: '', password: '', bridge: '', enabled: false };
        form.append(renderField({ key: 'interface', label: 'Interface', type: 'select', source: 'wireless' }, values));
        if (name === 'CAP') form.append(renderField({ key: 'enabled', label: 'Enabled', type: 'checkbox' }, values));
        if (name === 'Setup Repeater') {
            form.append(renderField({ key: 'ssid', label: 'SSID', type: 'text' }, values), renderField({ key: 'password', label: 'Passphrase', type: 'password' }, values));
        }
        const output = element('pre', 'lab-pc-console');
        form.append(button(['CAP', 'Setup Repeater'].includes(name) ? 'OK' : 'Start', () => {
            if (name === 'CAP' || name === 'Setup Repeater') { change(() => { engine.state.wirelessTools ||= {}; engine.state.wirelessTools[name] = { ...values }; }); win.closePractice(); return; }
            output.textContent = name === 'Scanner' ? 'ADDRESS             SSID                CHANNEL      SIGNAL\n62:18:BA:47:39:12    Ruang-Guru          2412/20      -64 dBm\n62:18:BA:47:39:14    Perpustakaan        2437/20      -71 dBm' : name === 'Freq. Usage' ? 'FREQUENCY     USAGE\n2412 MHz      12%\n2437 MHz       8%\n2462 MHz       5%' : name === 'Alignment' ? 'RSSI: -64 dBm\nRate: 54 Mbps' : 'Interface: ' + values.interface + '\nPackets: 0\nRunning…';
        }), button('Stop', () => { output.textContent += '\nStopped'; })); win.append(form, output);
    };
    const openWizard = (kind) => {
        beginConfiguration();
        const dhcp = kind === 'dhcp', id = 'wizard-' + kind;
        if (windows.has(id)) return makeWindow(id, '', true);
        const win = makeWindow(id, dhcp ? 'DHCP Setup' : 'Hotspot Setup', true);
        win.classList.add(dhcp ? 'practice-dhcp-wizard' : 'practice-hotspot-wizard');
        if (!dhcp) win.classList.add('ch4-setup-window');
        const values = { interface: dhcp ? '' : 'ether1', network: '', gateway: '', localAddress: '', pool: '', dns: [], leaseTime: '00:10:00', certificate: 'none', smtp: '0.0.0.0', dnsName: '', username: 'admin', password: '', masquerade: true };
        const item = (key, label, type = 'text', extra = {}) => ({ key, label, type, tab: 'General', ...extra });
        const steps = dhcp ? [
            ['Select interface to run DHCP server on', [item('interface', 'DHCP Server Interface', 'select', { source: 'interfaces' })]],
            ['Select network for DHCP addresses', [item('network', 'DHCP Address Space', 'cidr')]],
            ['Select gateway for given network', [item('gateway', 'Gateway for DHCP Network', 'ip')]],
            ['Select pool of IP addresses given out by DHCP server', [item('pool', 'Addresses to Give Out')]],
            ['Select DNS servers', [item('dns', 'DNS Servers', 'list')]],
            ['Select lease time', [item('leaseTime', 'Lease Time')]],
        ] : [
            ['Select interface to run HotSpot on', [item('interface', 'HotSpot Interface', 'select', { source: 'interfaces' })]],
            ['Set HotSpot address for interface', [item('localAddress', 'Local Address of Network', 'cidr'), item('masquerade', 'Masquerade Network', 'checkbox')]],
            ['Set pool for HotSpot addresses', [item('pool', 'Address Pool of Network')]],
            ['Select certificate', [item('certificate', 'Select Certificate', 'select', { options: ['none'] })]],
            ['Select SMTP server', [item('smtp', 'IP Address of SMTP Server', 'ip')]],
            ['Setup DNS configuration', [item('dns', 'DNS Servers', 'list')]],
            ['DNS name of local HotSpot server', [item('dnsName', 'DNS Name')]],
            ['Create local HotSpot user', [item('username', 'Name of Local HotSpot User'), item('password', 'Password for the User', 'password')]],
        ];
        let step = 0, finished = false;
        const description = element('p', dhcp ? 'practice-dhcp-description' : 'ch4-setup-description');
        const content = element('div', dhcp ? 'ch2-dhcp-wizard' : 'ch2-window-content ch4-setup-fields'), controls = element('div', dhcp ? 'ch2-dhcp-wizard-actions' : 'ch4-setup-actions'), status = element('div', 'practice-window-status'); description.hidden = dhcp; win.append(description, content, status, controls);
        if (!dhcp) win.append(element('footer'));
        const paint = () => {
            status.textContent = '';
            description.textContent = finished ? 'Setup has completed successfully' : steps[step][0]; content.replaceChildren(); controls.replaceChildren();
            if (dhcp) content.append(element('p', '', description.textContent));
            if (finished) { controls.append(button('OK', () => win.closePractice())); return; }
            steps[step][1].forEach((definition) => {
                if (definition.key === 'dns') {
                    const draft = { dns: values.dns.join(', ') }, row = renderField({ ...definition, type: 'text' }, draft), input = row.querySelector('input');
                    const update = () => { values.dns = draft.dns.split(/[,\s]+/).filter(Boolean); }; input.addEventListener('input', update); input.addEventListener('change', update); content.append(row);
                } else if (!dhcp && definition.type === 'checkbox') {
                    const row = element('label', 'ch4-native-check'), input = element('input'); input.type = 'checkbox'; input.checked = values[definition.key]; input.setAttribute('aria-label', definition.label); input.addEventListener('change', () => { values[definition.key] = input.checked; }); row.append(input, document.createTextNode(definition.label)); content.append(row);
                } else content.append(renderField(definition, values));
            });
            const cancel = button('Cancel', () => win.closePractice());
            if (dhcp) controls.append(cancel);
            const back = button('Back', () => { step--; paint(); }); back.disabled = step === 0; controls.append(back);
            controls.append(button('Next', () => {
                status.textContent = '';
                for (const definition of steps[step][1]) {
                    const value = String(values[definition.key] ?? '').trim();
                    if (definition.type === 'cidr') {
                        const [ip, prefix] = value.split('/');
                        if (!simulator.isIp(ip) || !/^\d+$/.test(prefix || '') || Number(prefix) > 32) { status.textContent = definition.label + ': gunakan alamat/prefix yang valid.'; return; }
                    }
                    if (definition.type === 'ip' && !simulator.isIp(value)) { status.textContent = definition.label + ': alamat IP tidak valid.'; return; }
                    if (definition.key === 'interface' && !value) { status.textContent = 'Pilih interface terlebih dahulu.'; return; }
                    if (definition.key === 'pool') {
                        const range = value.split('-'); if (range.length !== 2 || range.some((ip) => !simulator.isIp(ip.trim()))) { status.textContent = definition.label + ': gunakan rentang IP awal-IP akhir.'; return; }
                    }
                    if (definition.key === 'dns') {
                        values.dns = values.dns.map((ip) => ip.trim()).filter(Boolean);
                        if (!values.dns.length || values.dns.some((ip) => !simulator.isIp(ip))) { status.textContent = 'DNS Servers: masukkan alamat DNS yang valid.'; return; }
                    }
                }
                if (step < steps.length - 1) { step++; paint(); return; }
                try { change(() => dhcp ? engine.setupDhcp(values) : engine.setupHotspot(values)); finished = true; paint(); } catch (error) { status.textContent = error.message; }
            }));
            if (!dhcp) controls.append(cancel);
        };
        paint();
    };
    const openTerminal = () => {
        if (windows.has('router-terminal')) return makeWindow('router-terminal', '');
        const win = makeWindow('router-terminal', 'Terminal');
        const consoleNode = element('div', 'lab-pc-console'), output = element('pre', '', 'MikroTik RouterOS 7.14.3\n'), form = element('form'), label = element('label'), input = element('input');
        consoleNode.style.background = '#fff'; consoleNode.style.color = '#111'; input.setAttribute('aria-label', 'Perintah terminal router'); label.append(element('span', '', '[admin@' + engine.state.identity + '] >'), input); form.append(label); consoleNode.append(output, form); win.append(consoleNode);
        form.addEventListener('submit', (event) => { event.preventDefault(); const text = input.value; input.value = ''; change(() => { output.textContent += '[admin@' + engine.state.identity + '] > ' + text + '\n' + engine.command(text, 'router'); }); }); input.focus();
    };
    const openPing = () => {
        if (windows.has('ping')) return makeWindow('ping', '', true);
        const win = makeWindow('ping', 'Ping', true), form = element('div', 'practice-form'), values = { target: '', count: 4 }, output = element('pre', 'lab-pc-console');
        form.append(renderField({ key: 'target', label: 'Ping To', type: 'text' }, values), renderField({ key: 'count', label: 'Count', type: 'number' }, values), button('Start', () => attempt(() => change(() => { output.textContent = engine.command('ping ' + values.target, 'router'); })))); win.append(form, output);
    };
    const openSystem = (name) => {
        const tables = { Identity: 'identity', Users: 'usersSystem', Scheduler: 'scheduler', Scripts: 'scripts', Logging: 'logging' };
        if (tables[name]) return name === 'Identity' ? openEditor('identity') : openList(tables[name]);
        if (['Reboot', 'Shutdown', 'Reset Configuration'].includes(name)) {
            const win = makeWindow('system-' + name, name, true), form = element('div', 'practice-form');
            form.append(element('p', '', name + ' — Are you sure?'), button('Yes', () => {
                change(() => {
                    if (name === 'Reset Configuration') { engine.state.identity = 'MikroTik'; for (const table of Object.keys(engine.state.tables)) if (!['interfaces', 'wireless', 'switchPorts', 'switchChips'].includes(table)) engine.state.tables[table] = []; engine.state.dns = { servers: [], allowRemoteRequests: false }; }
                    engine.state.session.connected = false;
                });
                for (const current of [...windows.values()]) current.closePractice();
                openLoader();
            }), button('No', () => win.closePractice())); win.append(form); return;
        }
        const systemFields = {
            Clock: [['time', 'Time', '09:15:00'], ['date', 'Date', 'nov/06/2026'], ['timeZone', 'Time Zone Name', 'Asia/Makassar']],
            Resources: [['uptime', 'Uptime', '00:04:32'], ['version', 'Version', '7.14.3 (stable)'], ['board', 'Board Name', engine.state.device], ['memory', 'Total Memory', '32.0 MiB'], ['cpu', 'CPU Load', '2%']],
            RouterBOARD: [['model', 'Model', engine.state.device === 'hEX lite' ? 'RB750r2' : 'RB941-2nD'], ['serial', 'Serial Number', 'PRACTICE001'], ['firmware', 'Current Firmware', '7.14.3']],
            Password: [['oldPassword', 'Old Password', ''], ['newPassword', 'New Password', ''], ['confirmPassword', 'Confirm Password', '']],
            'NTP Client': [['enabled', 'Enabled', false], ['servers', 'Servers', '']],
            'NTP Server': [['enabled', 'Enabled', false], ['broadcast', 'Broadcast', false]],
            Watchdog: [['enabled', 'Watchdog Timer', true], ['address', 'Watch Address', 'none']],
            Note: [['note', 'Note', '']], Health: [['voltage', 'Voltage', '5 V']], License: [['level', 'Level', '4']],
        };
        const fields = systemFields[name];
        if (!fields) { const key = 'system' + name.replace(/\W/g, ''); ensureSchema(key, name); openList(key); return; }
        const id = 'system-' + name; if (windows.has(id)) return makeWindow(id, '', true);
        const win = makeWindow(id, name, true), form = element('div', 'practice-form'), values = { ...(engine.state.system?.[name] || {}) };
        fields.forEach(([key, label, value]) => { values[key] ??= value; form.append(renderField({ key, label, type: typeof value === 'boolean' ? 'checkbox' : name === 'Password' ? 'password' : name === 'Note' ? 'textarea' : 'text', readonly: ['Resources', 'RouterBOARD', 'Health', 'License'].includes(name) }, values)); });
        form.append(button('OK', () => { change(() => { engine.state.system ||= {}; engine.state.system[name] = values; }); win.closePractice(); }), button('Cancel', () => win.closePractice())); win.append(form);
    };
    const ipItems = { ARP: 'arp', Addresses: 'addresses', Cloud: 'cloud', 'DHCP Client': 'wan', 'DHCP Relay': 'dhcpRelay', 'DHCP Server': 'dhcp', DNS: 'dns', Firewall: 'firewall', Hotspot: 'hotspot', IPsec: 'ipsec', 'Kid Control': 'kidControl', Neighbors: 'neighbors', Packing: 'packing', Pool: 'pools', Routes: 'routes', Services: 'services', Settings: 'ipSettings', SMB: 'smb', SNMP: 'snmp', Socks: 'socks', TFTP: 'tftp', 'Traffic Flow': 'trafficFlow', UPnP: 'upnp', 'Web Proxy': 'webProxy' };
    const systemItems = ['Certificates', 'Clock', 'Console', 'Disks', 'Health', 'History', 'Identity', 'LEDs', 'License', 'Logging', 'Note', 'NTP Client', 'NTP Server', 'Packages', 'Password', 'Ports', 'Reboot', 'Reset Configuration', 'Resources', 'RouterBOARD', 'Scheduler', 'Scripts', 'Shutdown', 'Special Login', 'Users', 'Watchdog'];
    const toolItems = ['Bandwidth Test', 'Email', 'Flood Ping', 'Graphing', 'IP Scan', 'MAC Server', 'Netwatch', 'Packet Sniffer', 'Ping', 'Ping Speed', 'Profile', 'RoMON', 'SMS', 'Speed Test', 'Telnet', 'Torch', 'Traceroute', 'Traffic Generator', 'Traffic Monitor', 'WoL'];
    const openTarget = (key) => {
        if (['identity', 'dns'].includes(key)) return openEditor(key);
        if (key === 'files') return openFiles();
        if (key === 'terminal') return openTerminal();
        if (key === 'ping') return openPing();
        ensureSchema(key, key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())); openList(key);
    };
    const menu = (trigger, entries) => {
        if (desktop.querySelector('.practice-menu')?.dataset.trigger === trigger.textContent) { closeMenu(); return; }
        closeMenu(); const panel = element('div', 'practice-menu'); panel.dataset.trigger = trigger.textContent;
        entries.forEach(([title, action, symbol = 'system']) => { const control = button('', () => { closeMenu(); action(); }); control.append(icon(symbol), document.createTextNode(title)); panel.append(control); });
        desktop.append(panel); const parent = desktop.getBoundingClientRect(), bounds = trigger.getBoundingClientRect(); panel.style.top = Math.max(0, Math.min(bounds.top - parent.top, parent.height - panel.getBoundingClientRect().height - 4)) + 'px';
    };
    const nav = root.querySelector('[data-practice-nav]');
    const navItems = [['Interfaces', 'interfaces'], ['Wireless', 'wireless'], ['Bridge', 'bridge'], ['PPP', 'ppp'], ['Switch', 'switch'], ['Mesh', 'mesh'], ['IP', 'ip'], ['IPv6', 'ipv6'], ['MPLS', 'mpls'], ['Routing', 'routing'], ['System', 'system'], ['Queues', 'queues'], ['Files', 'files'], ['Log', 'log'], ['RADIUS', 'radius'], ['Tools', 'tools'], ['New Terminal', 'terminal'], ['Dot1X', 'dot1x'], ['Make Supout.rif', 'supout'], ['New WinBox', 'winbox'], ['Exit', 'exit']];
    navItems.forEach(([title, key]) => {
        const control = button('', () => {
            if (key === 'ip') return menu(control, Object.entries(ipItems).map(([label, target]) => [label, () => openTarget(target), target === 'routes' ? 'routing' : 'ip']));
            if (key === 'system') return menu(control, systemItems.map((name) => [name, () => openSystem(name)]));
            if (key === 'tools') return menu(control, toolItems.map((name) => [name, () => name === 'Ping' || name === 'Flood Ping' ? openPing() : openTarget('tool' + name.replace(/\W/g, '')), 'tools']));
            const branches = { ipv6: ['Addresses', 'DHCP Client', 'DHCP Server', 'Firewall', 'ND', 'Neighbors', 'Pool', 'Routes', 'Settings'], mpls: ['Interfaces', 'LDP', 'Forwarding Table', 'Traffic Eng'], routing: ['BFD', 'BGP', 'Filters', 'IGMP Proxy', 'OSPF', 'PIM', 'RIP', 'Routes', 'Rules', 'Settings', 'Tables'] };
            if (branches[key]) return menu(control, branches[key].map((label) => [label, () => openTarget(key + label.replace(/\W/g, '')), key]));
            if (key === 'exit') return disconnectSession();
            if (key === 'winbox') return openLoader();
            if (key === 'supout') { notice('supout.rif tersimpan di File List.'); engine.state.files.supout = true; saveLocal(); return; }
            openTarget(key);
        }, 'routeros__menu-item');
        control.append(icon(key === 'terminal' ? 'terminal' : key), element('span', '', title));
        if (['ip', 'ipv6', 'mpls', 'routing', 'system', 'tools'].includes(key)) control.append(element('i', 'wb-menu-arrow', '›'));
        nav.append(control);
    });
    root.querySelectorAll('[data-top-menu]').forEach((trigger) => trigger.addEventListener('click', () => menu(trigger, trigger.dataset.topMenu === 'Session' ? [['Disconnect', disconnectSession], ['Close', () => showView('desktop')]] : trigger.dataset.topMenu === 'Settings' ? [['Hide Passwords', () => { desktop.querySelectorAll('input[type=password]').forEach((input) => { input.type = 'text'; }); }], ['Inline Comments', () => notice('Inline Comments')]] : [['CPU', () => openSystem('Resources')], ['Memory', () => openSystem('Resources')]])));
    root.addEventListener('pointerdown', (event) => { if (!event.target.closest('.practice-menu, .ch5-nav, [data-top-menu]')) closeMenu(); });

    const openLoader = () => {
        for (const win of [...windows.values()]) win.closePractice();
        if (windows.has('loader')) return;
        const win = makeWindow('loader', 'WinBox (64bit) v3.41', true), form = element('div', 'practice-form'), values = { address: '', login: 'admin', password: '' };
        form.append(renderField({ key: 'address', label: 'Connect To', type: 'text' }, values), renderField({ key: 'login', label: 'Login', type: 'text' }, values), renderField({ key: 'password', label: 'Password', type: 'password' }, values));
        const rows = element('div', 'practice-table-scroll'), status = element('div', 'practice-window-status');
        form.append(button('Connect', () => {
            if (values.address !== engine.state.session.mac || values.login !== 'admin' || values.password !== '') { status.textContent = 'ERROR: could not connect / invalid username or password'; return; }
            status.textContent = 'Connecting…';
            window.setTimeout(() => { if (submitted) return; change(() => { engine.state.session.connected = true; engine.state.session.connectedMac = values.address; }); win.closePractice(); }, 650);
        }));
        const tabs = element('div', 'practice-tabs'); tabs.append(button('Managed', () => rows.replaceChildren()), button('Neighbors', () => rows.replaceChildren()));
        const refresh = button('Refresh', () => { rows.textContent = 'Discovering…'; window.setTimeout(() => { if (!win.isConnected || submitted) return; rows.replaceChildren(button(engine.state.session.mac + '   0.0.0.0   ' + engine.state.identity + '   ' + engine.state.device, () => { values.address = engine.state.session.mac; form.querySelector('[aria-label="Connect To"]').value = values.address; })); }, 650); });
        win.append(form, tabs, refresh, rows, status);
    };
    const powerScreen = () => {
        app.hidden = true; pcDesktop.hidden = false;
        if (pcDesktop.querySelector('[data-practice-power]')) return;
        const panel = element('div', 'practice-power'); panel.dataset.practicePower = ''; panel.append(element('h2', '', 'PC lab belum dinyalakan'), button('⏻ Nyalakan PC', () => {
            panel.textContent = 'Memulai Windows…'; window.setTimeout(() => { if (submitted) return; change(() => { engine.state.physical.powered = true; }); panel.remove(); showView('desktop'); }, 800);
        }, 'ch2-task-button')); pcDesktop.append(panel);
    };
    const openFiles = () => {
        if (windows.has('files')) return makeWindow('files', '');
        const win = makeWindow('files', 'File List'), toolbar = element('div', 'practice-list-toolbar'), area = element('div', 'practice-table-scroll');
        const table = element('table', 'practice-table');
        const head = element('thead'), heading = element('tr'); ['Name', 'Type', 'Size', 'Creation Time'].forEach((title) => heading.append(element('th', '', title))); head.append(heading);
        const body = element('tbody'), folder = element('tr'); folder.append(element('td', '', '▸ hotspot'), element('td', '', 'directory'), element('td'), element('td')); body.append(folder);
        const file = element('tr'); file.tabIndex = 0; file.draggable = true; file.append(element('td', '', 'hotspot/login.html'), element('td', '', '.html file'), element('td', '', '1.9 KiB'), element('td'));
        file.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', 'practice-router-html')); file.addEventListener('click', () => file.classList.toggle('is-selected')); body.append(file); table.append(head, body); area.append(table);
        const copy = () => change(() => { engine.state.files.desktopHtml = engine.state.files.routerHtml; renderDesktopFile(); });
        toolbar.append(button('Backup', () => { const backup = engine.snapshot(); delete backup.files.backup; engine.state.files.backup = backup; saveLocal(); notice('Berkas backup.backup dibuat.'); }), button('Restore', () => { if (!engine.state.files.backup) return notice('Belum ada berkas backup.backup.'); const backup = engine.state.files.backup; change(() => { engine = simulator.create(backup); }); }), button('Upload…', () => {
            const input = element('input'); input.type = 'file'; input.accept = '.html,.htm'; input.addEventListener('change', async () => { const selected = input.files[0]; if (!selected) return; if (selected.size > 32768) return notice('Ukuran berkas maksimal 32 KiB.'); const html = await selected.text(); change(() => { engine.state.files.desktopHtml = html; renderDesktopFile(); }); confirmUpload(); }); input.click();
        }));
        file.addEventListener('contextmenu', (event) => { event.preventDefault(); const popup = fileMenu(event.clientX, event.clientY); popup.append(button('Download', () => { copy(); popup.remove(); showView('desktop'); })); });
        area.addEventListener('dragover', (event) => event.preventDefault()); area.addEventListener('drop', (event) => { event.preventDefault(); if (event.dataTransfer.getData('text/plain') === 'practice-desktop-html') confirmUpload(); });
        win.append(toolbar, area, element('footer', '', '2 items'));
    };
    const fileMenu = (x, y) => {
        host.querySelector('.practice-file-menu')?.remove(); const popup = element('div', 'practice-file-menu'); const bounds = host.getBoundingClientRect(); popup.style.left = Math.min(x - bounds.left, bounds.width - 180) + 'px'; popup.style.top = Math.min(y - bounds.top, bounds.height - 120) + 'px'; host.append(popup); return popup;
    };
    const confirmUpload = () => {
        const win = makeWindow('replace-file', 'File already exists', true), content = element('div', 'practice-form'); content.append(element('p', '', 'Replace hotspot/login.html?'), button('Yes', () => { change(() => { engine.state.files.routerHtml = engine.state.files.desktopHtml; }); win.closePractice(); notice('hotspot/login.html tersimpan pada router.'); }), button('No', () => win.closePractice())); win.append(content);
    };
    const renderDesktopFile = () => {
        pcDesktop.querySelector('[data-practice-html]')?.remove();
        if (engine.state.files.desktopHtml === null) return;
        const shortcut = button('login.html', () => {}, 'lab-pc-shortcut'); shortcut.dataset.practiceHtml = ''; shortcut.prepend(element('span', '', '</>')); shortcut.draggable = true;
        shortcut.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', 'practice-desktop-html'));
        shortcut.addEventListener('contextmenu', (event) => { event.preventDefault(); const popup = fileMenu(event.clientX, event.clientY); popup.append(button('Open', () => { popup.remove(); showView('phone'); phoneScreen = 'browser'; renderPhone(); }), button('Open with  ›', () => { popup.replaceChildren(button('Notepad', () => { popup.remove(); openNotepad(); })); })); });
        shortcut.addEventListener('dblclick', openNotepad); pcDesktop.querySelector('.lab-pc-apps').append(shortcut);
    };
    pcDesktop.addEventListener('dragover', (event) => event.preventDefault());
    pcDesktop.addEventListener('drop', (event) => { event.preventDefault(); if (event.dataTransfer.getData('text/plain') === 'practice-router-html') change(() => { engine.state.files.desktopHtml = engine.state.files.routerHtml; renderDesktopFile(); }); });
    const openNotepad = () => {
        if (host.querySelector('.practice-notepad')) return;
        const win = element('section', 'practice-notepad'), header = element('header'), text = element('textarea'); text.value = engine.state.files.desktopHtml || ''; text.maxLength = 32768; text.setAttribute('aria-label', 'Isi login.html di Notepad');
        const save = () => { change(() => { engine.state.files.desktopHtml = text.value; }); header.firstChild.textContent = 'login.html — Notepad'; };
        header.append(element('span', '', 'login.html — Notepad'), button('Simpan', save), button('×', () => win.remove()));
        text.addEventListener('input', () => { header.firstChild.textContent = '*login.html — Notepad'; });
        text.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); } }); win.append(header, text); host.append(win); text.focus();
    };
    const wireColors = { 'putih-oranye': ['#fff', '#f4942c'], oranye: ['#f4942c', '#f4942c'], 'putih-hijau': ['#fff', '#46a36a'], hijau: ['#46a36a', '#46a36a'], biru: ['#288ae0', '#288ae0'], 'putih-biru': ['#fff', '#288ae0'], cokelat: ['#92583f', '#92583f'], 'putih-cokelat': ['#fff', '#92583f'] };
    const renderPhysical = () => {
        physical.replaceChildren();
        const header = element('header'); header.append(element('span', '', 'LAB FISIK · PRACTICE MODE'), element('h2', '', scenario.type === 'wiring' ? 'Rakit dan uji kabel LAN' : 'Sambungan perangkat'), element('p', '', 'Gunakan kebutuhan pada studi kasus. Perubahan diperiksa setelah jawaban dikumpulkan.')); physical.append(header);
        if (scenario.type === 'wiring') {
            const ends = element('div', 'practice-wire-ends');
            for (const end of ['a', 'b']) {
                const board = element('section', 'practice-wire-end'), pins = element('div', 'practice-wire-pins'), colors = element('div', 'practice-wire-colors');
                board.append(element('h3', '', 'Ujung ' + end.toUpperCase()), pins, colors);
                for (let index = 0; index < 8; index++) {
                    const color = engine.state.physical.wires[end][index], pin = button(String(index + 1), () => { change(() => { engine.state.physical.wires[end].splice(index, 1); engine.state.physical.crimp[end] = false; engine.state.physical.tested = false; }); renderPhysical(); });
                    if (color) { const [a, b] = wireColors[color]; pin.style.background = 'repeating-linear-gradient(45deg,' + a + ' 0 8px,' + b + ' 8px 16px)'; pin.title = color; }
                    pin.addEventListener('dragover', (event) => event.preventDefault()); pin.addEventListener('drop', (event) => { event.preventDefault(); const picked = event.dataTransfer.getData('text/plain'); if (!wireColors[picked]) return; change(() => { engine.state.physical.wires[end][index] = picked; engine.state.physical.crimp[end] = false; engine.state.physical.tested = false; }); renderPhysical(); }); pins.append(pin);
                }
                for (const [color, [a, b]] of Object.entries(wireColors)) {
                    const choice = button(color, () => { if (engine.state.physical.wires[end].length >= 8) return; change(() => { engine.state.physical.wires[end].push(color); engine.state.physical.crimp[end] = false; engine.state.physical.tested = false; }); renderPhysical(); }); choice.draggable = true; choice.style.borderLeft = '6px solid ' + b; choice.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', color)); colors.append(choice);
                }
                const tools = element('div', 'practice-wire-tools'); tools.append(button(engine.state.physical.crimp[end] ? 'Sudah di-crimp' : 'Crimp ujung ' + end.toUpperCase(), () => { if (engine.state.physical.wires[end].length !== 8) return notice('Masukkan delapan inti sebelum crimping.'); change(() => { engine.state.physical.crimp[end] = true; }); renderPhysical(); }), button('Kosongkan', () => { change(() => { engine.state.physical.wires[end] = []; engine.state.physical.crimp[end] = false; engine.state.physical.tested = false; }); renderPhysical(); })); board.append(tools); ends.append(board);
            }
            const tester = button('Nyalakan LAN tester', () => { if (!engine.state.physical.crimp.a || !engine.state.physical.crimp.b) return notice('Hubungkan kedua ujung kabel yang sudah di-crimp.'); change(() => { engine.state.physical.tested = true; }); const a = engine.state.physical.wires.a, b = engine.state.physical.wires.b; notice('MAIN: 1 2 3 4 5 6 7 8 · REMOTE: ' + a.map((color) => { const index = b.indexOf(color); return index < 0 ? '—' : index + 1; }).join(' ')); }, 'ch2-task-button'); physical.append(ends, tester); return;
        }
        const layout = element('div', 'ch5-cabling-layout'), device = element('div', 'ch5-hex-device'), image = element('img'), actions = element('div', 'ch5-cabling-actions');
        const switchTest = scenario.type === 'switch-test', hex = switchTest || engine.state.device === 'hEX lite';
        image.src = assets + '/asset/alat/' + (hex ? 'hex-lite-front-v2.png' : 'mkrotikhapport.png'); image.alt = hex ? 'MikroTik hEX lite' : 'MikroTik hAP lite'; image.draggable = false; device.append(image);
        const setPort = (port) => {
            if (switchTest) {
                if (port === 'ether1') return;
                change(() => { if (engine.state.physical.pcPort === port) { engine.state.physical.pcPort = ''; selectedCable = 'pc'; } else if (!engine.state.physical.pcPort) { engine.state.physical.pcPort = port; selectedCable = ''; } engine.state.tests.pcIp = ''; });
            } else {
                const existing = Object.entries(engine.state.physical.connections).find(([, connected]) => connected === port);
                change(() => { if (existing) { delete engine.state.physical.connections[existing[0]]; selectedCable = existing[0]; } else if (selectedCable) { engine.state.physical.connections[selectedCable] = port; selectedCable = ''; } engine.state.physical.pcPort = engine.state.physical.connections.pc || ''; });
            }
            renderPhysical();
        };
        for (let index = 1; index <= (hex ? 5 : 4); index++) {
            const port = 'ether' + index, control = button('', () => setPort(port), 'ch5-hex-port ch5-hex-port--' + index);
            control.setAttribute('aria-label', port); const wired = switchTest ? engine.state.physical.pcPort === port || port === 'ether1' : Object.values(engine.state.physical.connections).includes(port); control.classList.toggle('is-connected', wired); control.append(element('b', '', port), element('span', 'ch5-cable-plug'));
            if (!hex) { control.style.left = [0, 39.2, 50.5, 61.7, 73][index] + '%'; control.style.top = '71.4%'; control.style.width = '10%'; control.style.height = '14.5%'; }
            control.addEventListener('dragover', (event) => event.preventDefault()); control.addEventListener('drop', (event) => { event.preventDefault(); selectedCable = event.dataTransfer.getData('text/plain'); setPort(port); }); device.append(control);
        }
        const choices = switchTest ? [['pc', 'Kabel LAN PC yang sama']] : [['internet', 'Internet / ISP'], ['switch', 'Switch hEX'], ['pc', 'PC teknisi']];
        choices.forEach(([key, label]) => {
            const choice = button('', () => { selectedCable = key; renderPhysical(); }, 'ch5-cable-choice'); choice.draggable = true; choice.classList.toggle('is-selected', selectedCable === key);
            const plug = element('img'); plug.src = assets + '/asset/alat/rj45-single-hd.webp'; plug.alt = ''; const info = element('span'); info.append(element('b', '', label), element('small', '', (switchTest ? engine.state.physical.pcPort : engine.state.physical.connections[key]) || 'Ujung kabel belum terpasang')); choice.append(plug, info); choice.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', key)); actions.append(choice);
        });
        actions.append(button(engine.state.physical.pcLan ? 'LAN PC: terpasang' : 'Pasang ujung kabel ke LAN PC', () => { change(() => { engine.state.physical.pcLan = !engine.state.physical.pcLan; }); renderPhysical(); }, 'ch2-task-back'), button('Buka desktop PC →', () => showView('desktop'), 'ch2-task-button'));
        layout.append(device, actions); physical.append(layout);
    };
    const renderPhone = () => {
        phone.replaceChildren(); const frame = element('div', 'practice-phone'), content = element('div', 'practice-phone-content'), status = element('div', 'practice-phone-status'); status.append(element('span', '', '09:15'), element('span', '', engine.state.phone.ssid ? '◉ ▰' : '▱ ▰')); frame.append(status, content);
        const navigate = (screen) => { window.clearTimeout(phoneTimer); phoneScreen = screen; renderPhone(); };
        const load = (message, callback) => { content.replaceChildren(element('div', 'practice-phone-loading', message)); window.clearTimeout(phoneTimer); phoneTimer = window.setTimeout(() => { if (!submitted) callback(); }, 800); };
        const title = (text) => content.append(element('h2', '', text));
        if (phoneScreen === 'home') {
            title('09:15'); content.append(element('p', '', engine.state.phone.ssid ? 'Terhubung ke ' + engine.state.phone.ssid : 'Belum terhubung ke Wi-Fi'), button('⚙ Pengaturan Wi-Fi', () => { phoneScreen = 'scanning'; renderPhone(); }), button('◎ Browser', () => navigate('browser')));
        } else if (phoneScreen === 'scanning') {
            load('Memindai jaringan Wi-Fi…', () => navigate('wifi'));
        } else if (phoneScreen === 'wifi') {
            title('Wi-Fi');
            const networks = engine.state.tables.wireless.filter((row) => !row.disabled && ['ap bridge', 'bridge'].includes(row.mode));
            if (!networks.length) content.append(element('p', '', 'Tidak ada jaringan tersedia.'));
            networks.forEach((wifi) => content.append(button('◉  ' + wifi.ssid + (engine.state.phone.ssid === wifi.ssid ? ' · Terhubung ›' : ' ›'), () => {
                if (engine.state.phone.ssid === wifi.ssid) { load('Membuka halaman jaringan…', () => navigate('browser')); return; }
                content.replaceChildren(element('h2', '', wifi.ssid)); const input = element('input'); input.type = 'password'; input.placeholder = 'Password Wi-Fi'; input.setAttribute('aria-label', 'Password Wi-Fi'); const errorNode = element('p');
                content.append(input, button('Hubungkan', () => { const password = input.value; load('Menghubungkan…', () => { try { change(() => engine.connectPhone(wifi.ssid, password)); navigate('wifi'); } catch (error) { navigate('wifi'); notice(error.message); } }); }), errorNode);
            })));
            if (engine.state.phone.ssid) content.append(button('Lupakan jaringan', () => { change(() => { engine.state.phone.ssid = ''; engine.state.phone.authenticatedUser = ''; }); renderPhone(); }));
        } else if (phoneScreen === 'tabs') {
            title('Tab terbuka'); content.append(button('MikroTik · ' + (engine.state.tables.hotspot[0]?.dnsName || 'login'), () => navigate('browser')), button('Google · google.com', () => navigate('google')));
        } else if (phoneScreen === 'google') {
            const toolbar = element('div', 'practice-phone-browser-toolbar'); toolbar.append(button('‹', () => navigate('home')), element('span', '', 'google.com'), button('▣ 2', () => navigate('tabs'))); content.append(toolbar, element('h2', 'practice-google', 'Google')); const search = element('input'); search.placeholder = 'Telusuri Google'; search.setAttribute('aria-label', 'Telusuri Google'); content.append(search);
        } else if (phoneScreen === 'browser') {
            const hotspot = engine.state.tables.hotspot.find((row) => !row.disabled), toolbar = element('div', 'practice-phone-browser-toolbar'); toolbar.append(button('‹', () => navigate('home')), element('span', '', engine.state.phone.ssid ? (hotspot?.dnsName || 'studio.test') + (engine.state.phone.authenticatedUser ? '/status' : '/login') : 'google.com'), button('+', () => navigate('google')), button('▣ 2', () => navigate('tabs'))); content.append(toolbar);
            if (!engine.state.phone.ssid) { title('Tidak ada koneksi internet'); content.append(element('p', '', 'ERR_INTERNET_DISCONNECTED'), button('Buka Wi-Fi', () => navigate('scanning'))); }
            else if (!hotspot) { title('Situs ini tidak dapat dijangkau'); content.append(element('p', '', 'ERR_CONNECTION_REFUSED')); }
            else {
                const portal = element('div', 'practice-mikrotik'); portal.append(element('strong', '', 'MikroTik'));
                const parsed = new DOMParser().parseFromString(engine.state.files.routerHtml || '', 'text/html'); const heading = parsed.querySelector('h1'); if (heading) portal.append(element('h2', '', heading.textContent));
                if (engine.state.phone.authenticatedUser) {
                    const user = engine.state.tables.users.find((row) => row.name === engine.state.phone.authenticatedUser), profile = engine.state.tables.profiles.find((row) => row.name === user?.profile);
                    portal.append(element('p', '', 'Login berhasil\nUser: ' + user?.name + '\nProfile: ' + user?.profile + '\nShared Users: ' + (profile?.sharedUsers || 1) + '\nRate Limit rx/tx: ' + (profile?.rateLimit || 'unlimited')), button('Log out', () => { change(() => { engine.state.phone.authenticatedUser = ''; }); renderPhone(); }));
                } else {
                    portal.append(element('p', '', 'Please log on to use the internet hotspot service'));
                    const username = element('input'), password = element('input'), errorNode = element('p'); username.placeholder = 'Username'; username.setAttribute('aria-label', 'Username HotSpot'); password.type = 'password'; password.placeholder = 'Password'; password.setAttribute('aria-label', 'Password HotSpot');
                    portal.append(username, password, button('Connect', () => { const name = username.value, pass = password.value; load('Memuat halaman…', () => { try { change(() => engine.loginPhone(name, pass)); renderPhone(); } catch (error) { renderPhone(); notice(error.message); } }); }), errorNode);
                }
                portal.append(element('small', '', 'Powered by MikroTik RouterOS')); content.append(portal);
            }
        }
        const nav = element('div', 'practice-phone-nav'); nav.append(button('‹', () => navigate(phoneScreen === 'browser' ? 'wifi' : 'home')), button('○', () => navigate('home')), button('Wi-Fi', () => navigate('scanning'))); frame.append(nav); phone.append(frame);
    };
    root.querySelector('[data-pc-toolbar]').hidden = false;
    const taskbar = root.querySelector('[data-pc-toolbar]');
    const cableTask = button('⇄ Kabel PC', () => showView('physical')), phoneTask = button('▯ HP uji', () => { phoneScreen = 'home'; showView('phone'); }); taskbar.insertBefore(cableTask, taskbar.querySelector('.lab-pc-tray')); taskbar.insertBefore(phoneTask, taskbar.querySelector('.lab-pc-tray'));
    root.querySelector('[data-pc-home]').addEventListener('click', () => showView('desktop'));
    root.querySelector('[data-pc-open-winbox]').addEventListener('click', () => showView('winbox'));
    root.querySelector('[data-pc-task-winbox]').addEventListener('click', () => showView('winbox'));
    root.querySelectorAll('[data-open-client-cmd]').forEach((control) => control.addEventListener('click', () => showView('cmd')));
    root.querySelector('[data-close-client-cmd]').addEventListener('click', () => showView('desktop'));
    root.querySelector('[data-client-command-form]').addEventListener('submit', (event) => { event.preventDefault(); const input = root.querySelector('[data-client-command]'), text = input.value.trim(), output = root.querySelector('[data-client-terminal]'); if (!text) return; input.value = ''; if (/^cls$/i.test(text)) { output.textContent = ''; return; } change(() => { output.textContent += 'C:\\Users\\Lab> ' + text + '\n' + engine.command(text, 'pc') + '\n'; }); output.parentElement.scrollTop = output.parentElement.scrollHeight; });
    root.querySelector('[data-app-minimize]').addEventListener('click', () => showView('desktop'));
    root.querySelector('[data-app-restore]').addEventListener('click', () => { app.classList.toggle('is-restored'); pcDesktop.hidden = !app.classList.contains('is-restored'); pcCommand.hidden = true; });
    root.querySelector('[data-session-exit]').addEventListener('click', disconnectSession);
    root.querySelector('[data-undo]').addEventListener('click', () => { if (!undo.length) return; redo.push(engine.snapshot()); engine = simulator.create(undo.pop()); saveLocal(); refreshAll(); });
    root.querySelector('[data-redo]').addEventListener('click', () => { if (!redo.length) return; undo.push(engine.snapshot()); engine = simulator.create(redo.pop()); saveLocal(); refreshAll(); });
    root.querySelector('[data-safe-mode]').addEventListener('click', (event) => { safeSnapshot = safeSnapshot ? null : engine.snapshot(); event.currentTarget.classList.toggle('is-active', Boolean(safeSnapshot)); });
    const caseDialog = document.querySelector('[data-case-dialog]'), confirmDialog = document.querySelector('[data-submit-confirm]'), resultDialog = document.querySelector('[data-practice-result]');
    const briefing = scenario.briefing || { context: scenario.description || '', initial: 'Baca kondisi perangkat dan rincian tugas sebelum mulai.', assignment: scenario.description || '', requirements: scenario.clues || [], outcome: 'Penuhi seluruh kebutuhan yang tercantum pada tugas.', submission: 'Simpan konfigurasi, lalu tekan Selesaikan jawaban dan konfirmasi untuk memperoleh hasil pemeriksaan.' };
    const briefingScenes = [
        { heading: 'Studi kasus', text: briefing.context, pose: 'menugaskan' },
        { heading: 'Kondisi awal perangkat', text: briefing.initial, pose: 'memberitahu' },
        { heading: 'Tugas yang kamu kerjakan', text: briefing.assignment, pose: 'ngasih_arahan' },
        ...briefing.requirements.map((requirement) => ({ heading: 'Rincian tugas', text: requirement, pose: 'ngasih_arahan' })),
        { heading: 'Hasil yang harus tercapai', text: briefing.outcome, pose: 'memberitahu' },
        { heading: 'Simpan, periksa, lalu kumpulkan', text: briefing.submission, pose: 'mantap' },
    ];
    let briefingIndex = 0, briefingTimer = null;
    const briefingText = document.querySelector('[data-briefing-text]');
    const finishBriefingTyping = () => {
        window.clearTimeout(briefingTimer); briefingTimer = null;
        briefingText.textContent = briefingScenes[briefingIndex].text; briefingText.classList.remove('is-typing');
    };
    const paintBriefing = () => {
        window.clearTimeout(briefingTimer);
        const scene = briefingScenes[briefingIndex];
        document.querySelector('[data-briefing-heading]').textContent = scene.heading;
        document.querySelector('[data-briefing-count]').textContent = (briefingIndex + 1) + ' / ' + briefingScenes.length + ' · KLIK DI MANA SAJA UNTUK ' + (briefingIndex === briefingScenes.length - 1 ? 'MULAI PRAKTIK' : 'LANJUT');
        document.querySelector('[data-case-previous]').disabled = briefingIndex === 0;
        document.querySelector('[data-briefing-teacher-image]').src = caseDialog.dataset.teacherBase + '/' + scene.pose + '.png';
        const card = document.querySelector('[data-case-start]'); card.scrollTop = 0;
        briefingText.textContent = ''; briefingText.classList.add('is-typing');
        let position = 0;
        const type = () => { position++; briefingText.textContent = scene.text.slice(0, position); if (position >= scene.text.length) finishBriefingTyping(); else briefingTimer = window.setTimeout(type, 24); };
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) finishBriefingTyping(); else briefingTimer = window.setTimeout(type, 24);
    };
    const continueBriefing = () => {
        if (!caseDialog.open) return;
        if (briefingTimer !== null) { finishBriefingTyping(); return; }
        if (briefingIndex < briefingScenes.length - 1) { briefingIndex++; paintBriefing(); } else caseDialog.close();
    };
    const openBriefing = () => { briefingIndex = 0; paintBriefing(); if (!caseDialog.open) caseDialog.showModal(); document.querySelector('[data-case-start]').focus(); };
    root.querySelector('[data-case-open]').addEventListener('click', openBriefing);
    document.querySelector('[data-case-previous]').addEventListener('click', (event) => { event.stopPropagation(); if (briefingIndex > 0) { briefingIndex--; paintBriefing(); } });
    document.querySelector('[data-case-start]').addEventListener('click', (event) => { event.stopPropagation(); continueBriefing(); });
    caseDialog.addEventListener('click', continueBriefing);
    caseDialog.addEventListener('keydown', (event) => { if (event.repeat || event.target.closest('[data-case-previous]')) return; if (['Enter', ' '].includes(event.key)) { event.preventDefault(); event.stopPropagation(); continueBriefing(); } });
    caseDialog.addEventListener('cancel', (event) => event.preventDefault());
    submitControl.addEventListener('click', () => { if (configurationStarted && !submitted) confirmDialog.showModal(); });
    document.querySelector('[data-submit-cancel]').addEventListener('click', () => confirmDialog.close());
    const showResult = (result) => {
        submitted = true; submitControl.hidden = true; root.inert = true; window.clearTimeout(phoneTimer);
        resultDialog.classList.toggle('is-correct', result.correct);
        document.querySelector('[data-result-title]').textContent = result.correct ? 'Benar! Misi selesai.' : 'Konfigurasi belum sesuai.';
        document.querySelector('[data-result-description]').textContent = result.correct ? 'Kebutuhan studi kasus sudah terpenuhi. Kamu bisa melanjutkan dengan soal acak yang berbeda.' : 'Berikut bagian yang perlu diperbaiki. Coba lagi untuk mengerjakan studi kasus baru.';
        const list = document.querySelector('[data-result-errors]'); list.hidden = result.correct; list.replaceChildren(...result.errors.map((message) => element('li', '', message)));
        confirmDialog.close(); if (!resultDialog.open) resultDialog.showModal();
    };
    document.querySelector('[data-submit-send]').addEventListener('click', async (event) => {
        if (submitted) return;
        const control = event.currentTarget; control.disabled = true; document.querySelector('[data-submit-error]').textContent = '';
        try {
            const response = await fetch(root.dataset.checkUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content }, body: JSON.stringify({ state: engine.snapshot() }) });
            const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Jawaban belum berhasil dikirim.'); showResult(result);
        } catch (error) { document.querySelector('[data-submit-error]').textContent = error.message; } finally { control.disabled = false; }
    });
    resultDialog.addEventListener('cancel', (event) => event.preventDefault());
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeMenu(); host.querySelector('.practice-file-menu')?.remove(); } });
    renderDesktopFile(); updateTitle(); showView(view);
    if (scenario.result) showResult(scenario.result);
    else openBriefing();
})();
