(() => {
    'use strict';

    window.NetGuardStepGuide = {
        create({ list, getKey, getPlan, root = document.body }) {
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
                        const body = document.createElement('span');
                        body.textContent = compact ? 'Selesai' : plan[position][0];
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
            events.forEach((name) => root.addEventListener(name, schedule));
            refresh();
            return {
                refresh,
                reset() { cancel(); key = null; signature = ''; schedule(); },
                destroy() { cancel(); observer.disconnect(); events.forEach((name) => root.removeEventListener(name, schedule)); },
            };
        },
    };
})();
