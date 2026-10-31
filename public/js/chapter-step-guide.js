(() => {
    'use strict';

    const formatInstructionValue = (text) => String(text)
        .replace(/\b(\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?)\.(?=\s|$)/gu, '$1');

    const instructionLines = (text) => String(text)
        .replace(/^Lakukan:\s*/u, '')
        .replace(/\b(Out|Src|Dst)\.(?=\s+(?:Interface|Address)\b)/giu, '$1\uE000')
        .split(/\n+|(?<=[.!?])\s+(?=[A-ZÀ-Ž])|,?\s+lalu\s+(?=klik|pilih|isi|ketik|tekan|buka|seret|pasang|tunggu)|,\s+(?=(?:VLAN ID|Interface|Bridge|PVID|Ingress Filtering|Frame Types|Tagged|Untagged|VLAN IDs|Shared Users|Rate Limit|Password|Name|Protocol Mode)\b)/u)
        .map((line) => line.replace(/\uE000/gu, '.').trim())
        .filter(Boolean)
        .map((line) => line.charAt(0).toUpperCase() + line.slice(1));

    const appendInstructions = (body, instruction) => {
        const groups = Array.isArray(instruction) ? [instruction] : String(instruction).split(/\n\s*\n/u);
        groups.forEach((group, index) => {
            const lines = Array.isArray(group) ? group : instructionLines(group);
            const branches = document.createElement('ul');
            branches.className = index === 0 ? 'chapter-guide-branches' : 'chapter-guide-branches chapter-guide-branches--help';
            lines.forEach((text) => {
                const item = document.createElement('li');
                item.textContent = formatInstructionValue(text);
                branches.append(item);
            });
            body.append(branches);
        });
    };

    window.NetGuardStepGuide = {
        create({ list, getKey, getPlan, root = document.body, highlightWinbox = /^chapter-(one|two|three|four|five)$/u.test(document.documentElement.dataset.page || '') }) {
            let highlighted = null;
            let highlightKey = '';
            let visited = new WeakSet();
            let settledFields = new WeakSet();
            let fieldTimer = null;
            const normalize = (value) => String(value).toLocaleLowerCase('id').replace(/\s+/gu, ' ').trim();
            const isFormField = (control) => control.matches('input, select, textarea') && !control.closest('[data-terminal-form]');
            const fieldIsReady = (control, target) => {
                if (!isFormField(control)) return false;
                if (target && Object.hasOwn(target, 'expected')) {
                    return typeof target.expected === 'boolean'
                        ? control.checked === target.expected
                        : String(control.value).trim() === String(target.expected).trim();
                }
                if (target?.completeWhen) return settledFields.has(control) && target.completeWhen(control);
                if (control.type === 'checkbox') return control.checked;
                return settledFields.has(control) && Boolean(control.value.trim()) && control.checkValidity();
            };
            const clearHighlight = () => {
                highlighted?.classList.remove('chapter-guide-target');
                highlighted = null;
            };
            const highlightControl = (instruction, stepKey, done, targetSelector) => {
                if (highlightKey !== stepKey) {
                    highlightKey = stepKey;
                    visited = new WeakSet();
                    settledFields = new WeakSet();
                    window.clearTimeout(fieldTimer);
                }
                if (!highlightWinbox || done || document.querySelector('dialog[open], .chapter-dialogue:not([hidden]), .ch2-dialogue-overlay:not([hidden])')) {
                    clearHighlight();
                    return;
                }
                const text = normalize(Array.isArray(instruction) ? instruction.join(' ') : String(instruction));
                const candidates = [];
                const targets = (Array.isArray(targetSelector) ? targetSelector : targetSelector ? [targetSelector] : [])
                    .map((target) => typeof target === 'string' ? { selector: target } : target);
                const editorSelector = '[data-window]:has(.ch2-vlan-edit-layout), [data-window]:has(.ch5-editor-layout), [data-window]:has(.ch2-dhcp-wizard), [data-window="hotspot-setup"], [data-config-panel]:has(.winbox-child__fields)';
                const editors = [...root.querySelectorAll(editorSelector)].filter((node) => !node.closest('[hidden], [inert]') && node.getClientRects().length);
                const activeEditor = editors.sort((left, right) => Number(right.style.zIndex || 0) - Number(left.style.zIndex || 0))[0];
                root.querySelectorAll('button, a, input:not([type="hidden"]), select, textarea, [role="button"], [draggable="true"], [tabindex="0"]').forEach((control) => {
                    if (!control.closest('.routeros, .winbox-window')) return;
                    if (list.contains(control) || control.closest('.lab-guide, [hidden], [inert]') || control.disabled || control.readOnly || (!isFormField(control) && visited.has(control)) || !control.getClientRects().length) return;
                    if (control.getAttribute('aria-expanded') === 'true') return;
                    if (control.matches('.is-active') && control.closest('.ch2-window-tabs, .winbox-tabs')) return;
                    if (control.hasAttribute('data-open-window')) {
                        const name = control.getAttribute('data-open-window');
                        const openedWindow = [...root.querySelectorAll('[data-window]')].find((node) => node.dataset.window === name);
                        if (openedWindow && !openedWindow.closest('[hidden], [inert]') && openedWindow.getClientRects().length) return;
                    }
                    if (control.getAttribute('aria-selected') === 'true' && control.getAttribute('role') === 'tab') return;
                    if (activeEditor && !activeEditor.contains(control)) return;
                    const fieldLabel = control.closest('label');
                    const label = control.matches('input, select, textarea')
                        ? fieldLabel && [...fieldLabel.childNodes].filter((node) => node.nodeType === 3 || (node.nodeType === 1 && !node.matches('input, select, textarea') && !node.querySelector('input, select, textarea'))).map((node) => node.textContent).join(' ')
                        : control.textContent.replace(/[›▸▾▼→]/gu, ' ').trim();
                    const labels = [label, control.getAttribute('aria-label'), control.getAttribute('title')].filter(Boolean).map((value) => normalize(value).replace(/:\s*$/u, ''));
                    if (control.matches('button, [role="button"], [draggable="true"], [tabindex="0"]')) {
                        control.querySelectorAll(':scope > strong, :scope > td, :scope > span').forEach((cell) => {
                            const value = normalize(cell.textContent);
                            if (value.length >= 3) labels.push(value);
                        });
                    }
                    const targetIndex = targets.findIndex((target) => control.matches(target.selector));
                    if (targets.length && targetIndex < 0) return;
                    if (fieldIsReady(control, targets[targetIndex])) return;
                    if (targetIndex >= 0) candidates.push({ control, position: -1000 + targetIndex, length: 0 });
                    const icon = control.querySelector('use')?.getAttribute('href')?.split('#').pop();
                    if (icon === 'add' || labels.some((value) => /^(add|tambah(?: .+)?)$/u.test(value))) labels.push('+');
                    if (icon === 'enable' || labels.some((value) => /^(enable|aktifkan)(?:\s|$)/u.test(value))) labels.push('✓', 'centang');
                    if (labels.includes('bridges')) labels.push('bridge');
                    if (control.matches('[data-add-dns-server]')) labels.push('panah kecil', '▾');
                    if (control.matches('[data-terminal-command]')) labels.push('kolom ketik', 'ketik ping');
                    for (const value of labels) {
                        if (!value || (value.length < 2 && !['+', '✓', '▾', '□'].includes(value))) continue;
                        const position = text.indexOf(value);
                        if (position < 0) continue;
                        const before = text[position - 1] || ' ';
                        const after = text[position + value.length] || ' ';
                        if (value !== '+' && (/[\p{L}\p{N}]/u.test(before) || /[\p{L}\p{N}]/u.test(after))) continue;
                        candidates.push({ control, position, length: value.length });
                    }
                });
                candidates.sort((left, right) => left.position - right.position || right.length - left.length);
                const next = candidates[0]?.control || null;
                if (next !== highlighted) {
                    clearHighlight();
                    highlighted = next;
                    highlighted?.classList.add('chapter-guide-target');
                }
            };
            const followTarget = (event) => {
                if (!highlighted || !highlighted.contains(event.target)) return;
                if (highlighted.matches('input, select, textarea')) return;
                visited.add(highlighted);
            };
            const followFieldInput = (event) => {
                const control = event.target;
                if (!isFormField(control) || !control.closest('.routeros, .winbox-window')) return;
                settledFields.delete(control);
                window.clearTimeout(fieldTimer);
                if (event.type === 'change' || control.matches('select, input[type="checkbox"]')) {
                    settledFields.add(control);
                    return;
                }
                const expectedStep = highlightKey;
                const value = control.value;
                fieldTimer = window.setTimeout(() => {
                    if (highlightKey !== expectedStep || control.value !== value) return;
                    settledFields.add(control);
                    schedule();
                }, 500);
            };
            let key = null;
            let index = 0;
            let timer = null;
            let signature = '';
            let queued = false;
            const cancel = () => { window.clearTimeout(timer); timer = null; };
            const refresh = () => {
                const nextKey = String(getKey());
                const plan = getPlan();
                if (!plan.length) return;
                let completed = 0;
                while (completed < plan.length && plan[completed][1]) completed++;
                if (nextKey !== key || completed < index) {
                    cancel(); key = nextKey;
                    index = Math.min(completed, plan.length - 1);
                    signature = '';
                }
                const nextSignature = JSON.stringify([key, index, plan.map(([text, done]) => [text, Boolean(done)])]);
                if (signature !== nextSignature || !list.firstElementChild?.classList.contains('chapter-guide-step')) {
                    signature = nextSignature;
                    const card = (position, compact = false) => {
                        const node = document.createElement('li');
                        const done = Boolean(plan[position][1]);
                        node.className = 'chapter-guide-step';
                        node.classList.toggle('is-done', done);
                        node.dataset.guideKey = key + ':' + position;
                        const heading = document.createElement('b');
                        heading.textContent = (done ? '✓ ' : '') + 'Langkah ' + (position + 1) + ' / ' + plan.length;
                        const body = document.createElement('div');
                        body.className = 'chapter-guide-instructions';
                        if (compact) body.textContent = 'Selesai';
                        else appendInstructions(body, plan[position][0]);
                        node.append(heading, body);
                        if (!done) node.setAttribute('aria-current', 'step');
                        return node;
                    };
                    list.classList.remove('is-preparation-checklist');
                    list.classList.add('chapter-step-guide');
                    list.replaceChildren(...(index > 0 ? [card(index - 1, true), card(index)] : [card(index)]));
                }
                if (completed > index && index < plan.length - 1 && timer === null) {
                    const expectedKey = key;
                    timer = window.setTimeout(() => {
                        timer = null;
                        if (String(getKey()) !== expectedKey) return;
                        index++;
                        refresh();
                    }, 450);
                } else if (completed <= index) cancel();
                highlightControl(plan[index][0], key + ':' + index, Boolean(plan[index][1]), plan[index][2]);
            };
            const schedule = () => {
                if (queued) return;
                queued = true;
                queueMicrotask(() => { queued = false; refresh(); });
            };
            const observer = new MutationObserver((mutations) => {
                if (mutations.some((mutation) => !list.contains(mutation.target))) schedule();
            });
            observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class', 'disabled', 'open'] });
            const events = ['click', 'input', 'change', 'drop', 'keydown'];
            root.addEventListener('click', followTarget, true);
            root.addEventListener('change', followTarget, true);
            root.addEventListener('input', followFieldInput, true);
            root.addEventListener('change', followFieldInput, true);
            events.forEach((name) => root.addEventListener(name, schedule));
            refresh();
            return {
                refresh,
                reset() { cancel(); window.clearTimeout(fieldTimer); key = null; signature = ''; schedule(); },
                destroy() { cancel(); window.clearTimeout(fieldTimer); clearHighlight(); observer.disconnect(); root.removeEventListener('click', followTarget, true); root.removeEventListener('change', followTarget, true); root.removeEventListener('input', followFieldInput, true); root.removeEventListener('change', followFieldInput, true); events.forEach((name) => root.removeEventListener(name, schedule)); },
            };
        },
    };
})();
