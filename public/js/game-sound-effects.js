(() => {
    'use strict';

    const config = document.querySelector('[data-game-sfx]');
    if (!config || window.NetGuardAudio) return;

    const preferenceKey = `netguard:sfx:${config.dataset.userId || 'user'}`;
    const maximumGain = 2.5;
    const clips = {
        click: ['click_001', .35, 55],
        select: ['switch_001', .3, 80],
        back: ['back_001', .4, 100],
        open: ['open_001', .4, 140],
        close: ['close_001', .35, 100],
        minimize: ['minimize_001', .4, 100],
        maximize: ['maximize_001', .4, 100],
        dialogue: ['pluck_001', .32, 180],
        typing: ['tick_001', .09, 75],
        correct: ['confirmation_001', .55, 220],
        error: ['error_003', .5, 350],
        complete: ['confirmation_002', .7, 1500],
        chapter: ['confirmation_002', .55, 1000],
    };
    const buffers = new Map();
    const lastPlayed = new Map();
    const active = new Set();
    const feedbackState = new WeakMap();
    const textState = new WeakMap();
    const checklistState = new Map();
    const visibleState = new WeakMap();
    let context = null;
    let master = null;
    let enabled = true;
    let typingEnabled = true;
    let volume = 45;
    let leaving = false;
    let pendingChapter = Boolean(document.querySelector('.chapter-one-scene'));
    let lastResultAt = -Infinity;
    let clickTimer = null;

    try {
        const saved = JSON.parse(window.localStorage.getItem(preferenceKey) || 'null');
        if (saved) {
            enabled = saved.enabled !== false;
            typingEnabled = saved.typing !== false;
            if (Number.isFinite(saved.volume)) volume = Math.max(0, Math.min(100, saved.volume));
        }
    } catch {}

    const save = () => {
        try { window.localStorage.setItem(preferenceKey, JSON.stringify({ enabled, typing: typingEnabled, volume })); } catch {}
    };
    const refreshControls = () => {
        document.querySelectorAll('[data-sfx-toggle]').forEach((button) => {
            button.setAttribute('aria-checked', String(enabled));
            button.querySelector('[data-sfx-state]').textContent = enabled ? 'Nyala' : 'Mati';
        });
        document.querySelectorAll('[data-sfx-typing-toggle]').forEach((button) => {
            button.setAttribute('aria-checked', String(typingEnabled));
            button.querySelector('[data-sfx-typing-state]').textContent = typingEnabled ? 'Nyala' : 'Mati';
        });
        document.querySelectorAll('[data-sfx-volume]').forEach((input) => {
            input.value = String(volume);
            input.style.setProperty('--music-volume', `${volume}%`);
        });
        document.querySelectorAll('[data-sfx-volume-output]').forEach((output) => { output.textContent = `${volume}%`; });
        if (master) master.gain.setValueAtTime(enabled ? volume / 100 * maximumGain : 0, context.currentTime);
    };
    const stop = (onlyTyping = false) => {
        active.forEach((voice) => {
            if (onlyTyping && voice.name !== 'typing') return;
            try { voice.source.stop(); } catch {}
            active.delete(voice);
        });
    };
    const prepare = () => {
        if (context) return true;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return false;
        try {
            context = new AudioContext();
            master = context.createGain();
            master.gain.value = enabled ? volume / 100 * maximumGain : 0;
            const limiter = context.createDynamicsCompressor();
            limiter.threshold.value = -3;
            limiter.knee.value = 6;
            limiter.ratio.value = 20;
            limiter.attack.value = .003;
            limiter.release.value = .15;
            master.connect(limiter);
            limiter.connect(context.destination);
            return true;
        } catch { return false; }
    };
    const bufferFor = (file) => {
        if (!buffers.has(file)) {
            const request = Promise.resolve().then(() => {
                    const encoded = window.NetGuardSoundData?.[file];
                    if (!encoded) return null;
                    const binary = window.atob(encoded);
                    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
                    return context.decodeAudioData(bytes.buffer);
                })
                .catch(() => null);
            buffers.set(file, request);
        }
        return buffers.get(file);
    };
    const play = (name) => {
        const clip = clips[name];
        if (!clip || !enabled || volume === 0 || leaving || document.visibilityState === 'hidden') return;
        if (name === 'typing' && !typingEnabled) return;
        if (!prepare() || context.state !== 'running') return;
        const now = performance.now();
        if (now - (lastPlayed.get(name) ?? -Infinity) < clip[2]) return;
        if (['correct', 'error', 'complete'].includes(name)) {
            lastResultAt = now;
            window.clearTimeout(clickTimer);
            stop();
        } else if (['typing', 'click', 'dialogue'].includes(name) && now - lastResultAt < 250) return;
        lastPlayed.set(name, now);
        bufferFor(clip[0]).then((buffer) => {
            if (!buffer || !enabled || !volume || leaving || document.visibilityState === 'hidden' || context.state !== 'running') return;
            if (performance.now() - now > (name === 'typing' || name === 'click' ? 200 : 1200)) return;
            if (['click', 'typing', 'dialogue', 'open'].includes(name) && lastResultAt > now) return;
            if (active.size >= 8 || (name === 'typing' && [...active].some((voice) => voice.name === 'typing'))) return;
            const source = context.createBufferSource();
            const gain = context.createGain();
            source.buffer = buffer;
            gain.gain.value = clip[1];
            if (name === 'typing') source.playbackRate.value = 1.2;
            source.connect(gain);
            gain.connect(master);
            const voice = { source, name };
            active.add(voice);
            source.onended = () => { active.delete(voice); source.disconnect(); gain.disconnect(); };
            source.start();
        });
    };
    const unlock = (event) => {
        if (event && !event.isTrusted) return;
        if (!enabled || !volume || !prepare()) return;
        context.resume().then(() => {
            if (pendingChapter && context.state === 'running') {
                pendingChapter = false;
                play('chapter');
            }
        }).catch(() => {});
    };
    window.NetGuardAudio = {
        play,
        setEnabled(value) { enabled = Boolean(value); if (!enabled) stop(); refreshControls(); save(); },
        setVolume(value) {
            const next = Number(value);
            if (!Number.isFinite(next)) return;
            volume = Math.max(0, Math.min(100, Math.round(next)));
            if (!volume) stop();
            refreshControls(); save();
        },
        getPreferences() { return { enabled, typing: typingEnabled, volume }; },
    };
    document.querySelectorAll('[data-sfx-toggle]').forEach((button) => button.addEventListener('click', () => {
        window.NetGuardAudio.setEnabled(!enabled);
        if (enabled) { unlock(); play('select'); }
    }));
    document.querySelectorAll('[data-sfx-volume]').forEach((input) => {
        input.addEventListener('input', () => window.NetGuardAudio.setVolume(input.value));
        input.addEventListener('change', () => { unlock(); play('select'); });
    });
    document.querySelectorAll('[data-sfx-typing-toggle]').forEach((button) => button.addEventListener('click', () => {
        typingEnabled = !typingEnabled;
        if (!typingEnabled) stop(true);
        refreshControls(); save(); play('select');
    }));

    document.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('keydown', (event) => {
        unlock(event);
        if (!event.isTrusted || event.repeat) return;
        if (event.key === 'Enter' && event.target.matches('input:not([type="range"])')) play('click');
        else if (event.key === 'Escape') play('close');
    }, { capture: true });
    document.addEventListener('click', (event) => {
        if (!event.isTrusted) return;
        const control = event.target.closest('button, a[href], summary, select, input[type="radio"], input[type="checkbox"], [role="button"]');
        if (!control || control.disabled || control.closest('[inert]') || control.matches('[data-sfx-toggle], [data-sfx-typing-toggle]')) return;
        let effect = 'click';
        const label = control.getAttribute('aria-label') || '';
        if (control.matches('[data-minimize]') || label.startsWith('Minimalkan')) effect = 'minimize';
        else if (label.startsWith('Maksimalkan')) effect = 'maximize';
        else if (control.matches('[data-step-back], [data-previous], .lab-back')) effect = 'back';
        else if (control.matches('[data-close], [data-close-learning], [data-close-configuration-learning]') || label.startsWith('Tutup')) effect = 'close';
        else if (control.matches('[data-open-window], [data-config-nav], summary')) effect = 'open';
        window.clearTimeout(clickTimer);
        clickTimer = window.setTimeout(() => play(effect), 35);
    }, { capture: true });
    document.addEventListener('change', (event) => {
        if (event.isTrusted && event.target.matches('select')) play('select');
    });
    document.addEventListener('drop', (event) => { if (event.isTrusted) play('select'); }, { capture: true });

    const isVisible = (node) => !node.hidden && !node.closest('[hidden]') && (!node.matches('dialog') || node.open);
    const checklistKey = (node) => {
        if (node.hasAttribute('data-guide-key')) return 'guide:' + node.getAttribute('data-guide-key');
        const owner = node.closest('[data-guide-list], [data-task-list], [data-device-task-list]');
        return owner ? `${owner.getAttributeNames().filter((name) => name.startsWith('data-')).join('.')}:${node.getAttribute('aria-label')?.replace(/:?[ ]?(?:sudah dikenali|belum dikenali|belum selesai|selesai|Selesai|Belum selesai).*$/, '') || node.querySelector('b')?.textContent || node.textContent.replace(/^\s*[✓\d]+\s*/, '')}` : null;
    };
    const scan = (initial = false) => {
        document.querySelectorAll('[data-feedback], [data-dialogue-answer-feedback], [data-evaluation-feedback]').forEach((node) => {
            const text = node.textContent.trim();
            const kind = node.dataset.kind || (node.matches('[data-evaluation-feedback]') ? 'error' : '');
            const signature = `${kind}:${text}`;
            const previous = feedbackState.get(node);
            feedbackState.set(node, signature);
            if (initial || signature === previous || !text || !isVisible(node)) return;
            if (kind === 'error') play('error');
            else if (kind === 'success') play('correct');
        });
        document.querySelectorAll('[data-dialogue], [data-ch2-dialogue], dialog, [data-window]').forEach((node) => {
            const visible = isVisible(node);
            const wasVisible = visibleState.get(node);
            visibleState.set(node, visible);
            if (initial || !visible || wasVisible) return;
            if (node.matches('[data-finish-dialog]')) play('complete');
            else if (node.matches('[data-dialogue], [data-ch2-dialogue]')) play('dialogue');
            else play('open');
        });
        document.querySelectorAll('[data-guide-list] li, [data-task-list] li, [data-device-task-list] li, [data-vlan-task], [data-address-task], [data-dhcp-task], [data-wan-task]').forEach((node) => {
            const key = checklistKey(node) || node;
            const done = node.classList.contains('is-done');
            const previous = checklistState.get(key);
            checklistState.set(key, done);
            if (!initial && done && previous === false && isVisible(node)) play('correct');
        });
        document.querySelectorAll('[data-dialogue-text], [data-synopsis-title], [data-synopsis-text], [data-ch2-prologue-title], [data-ch2-prologue-text]').forEach((node) => {
            const text = node.textContent;
            const previous = textState.get(node) || '';
            textState.set(node, text);
            if (!initial && isVisible(node) && text.length > previous.length && text.length - previous.length <= 4 && text.trim()) play('typing');
        });
    };
    scan(true);
    let scanQueued = false;
    const observer = new MutationObserver(() => {
        if (scanQueued) return;
        scanQueued = true;
        queueMicrotask(() => { scanQueued = false; scan(); });
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open', 'class', 'data-kind'] });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stop(); });
    window.addEventListener('pagehide', () => { leaving = true; stop(); context?.suspend().catch(() => {}); });
    window.addEventListener('pageshow', () => { leaving = false; });
    refreshControls();
    if (prepare()) {
        [...new Set(Object.values(clips).map((clip) => clip[0]))].forEach(bufferFor);
    }
})();
