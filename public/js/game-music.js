(() => {
    'use strict';

    const audio = document.querySelector('[data-game-music]');
    if (!audio || window.NetGuardMusic) return;

    const controls = [...document.querySelectorAll('[data-music-toggle]')];
    const trackControls = [...document.querySelectorAll('[data-music-track]')];
    const volumeControls = [...document.querySelectorAll('[data-music-volume]')];
    const volumeOutputs = [...document.querySelectorAll('[data-music-volume-output]')];
    const feedback = [...document.querySelectorAll('[data-music-feedback]')];
    const userId = audio.dataset.userId || 'user';
    const preferenceKey = `netguard:music:${userId}:enabled`;
    const trackKey = `netguard:music:${userId}:track`;
    const volumeKey = `netguard:music:${userId}:volume`;
    const positionKey = `netguard:music:${userId}:position`;
    const defaultVolume = 70;
    const defaultTrack = audio.dataset.defaultTrack || 'Managed_Flow';
    const trackSources = new Map([...(trackControls[0]?.options ?? [])].map((option) => [option.value, option.dataset.trackSource]));
    let enabled = true;
    let volume = defaultVolume;
    let track = defaultTrack;
    let waitingForGesture = false;
    let unavailable = false;
    let pagePaused = false;
    let suspended = false;
    let pendingPlayback = false;
    let playbackRequest = 0;
    let restoredPosition = false;
    let savedAt = 0;
    let previousPosition = 0;

    const readStorage = (name, key) => {
        try {
            return window[name].getItem(key);
        } catch {
            return null;
        }
    };

    const writeStorage = (name, key, value) => {
        try {
            window[name].setItem(key, value);
        } catch {
            // Playback remains usable when browser storage is unavailable.
        }
    };

    enabled = readStorage('localStorage', preferenceKey) !== 'off';
    const storedTrack = readStorage('localStorage', trackKey);
    if (trackSources.has(storedTrack)) track = storedTrack;
    const storedVolume = readStorage('localStorage', volumeKey);
    if (storedVolume !== null && storedVolume.trim() !== '') {
        const parsedVolume = Number(storedVolume);
        if (Number.isFinite(parsedVolume)) volume = Math.max(0, Math.min(100, Math.round(parsedVolume)));
    }
    const storedPosition = Number(readStorage('sessionStorage', positionKey));
    if (Number.isFinite(storedPosition) && storedPosition > 0) previousPosition = storedPosition;

    const initialTrackSource = trackSources.get(track);
    if (initialTrackSource && audio.getAttribute('src') !== initialTrackSource) {
        audio.src = initialTrackSource;
        audio.load();
    }

    audio.volume = volume / 100;
    audio.loop = true;
    audio.muted = !enabled;

    const updateControls = () => {
        controls.forEach((control) => {
            control.setAttribute('aria-checked', String(enabled));
            control.setAttribute('aria-label', 'Musik latar');
            control.dataset.musicEnabled = String(enabled);
            const state = control.querySelector('[data-music-state]');
            if (state) state.textContent = enabled ? 'Nyala' : 'Mati';
        });

        trackControls.forEach((control) => { control.value = track; });

        const message = !enabled ? '' : unavailable
            ? 'Musik belum bisa diputar.'
            : waitingForGesture ? 'Ketuk halaman untuk mulai musik.' : '';

        feedback.forEach((element) => {
            element.textContent = message;
            element.hidden = message === '';
        });
    };

    const setVolume = (value, persist = true) => {
        const nextVolume = Number(value);
        if (!Number.isFinite(nextVolume)) return;

        volume = Math.max(0, Math.min(100, Math.round(nextVolume)));
        audio.volume = volume / 100;
        if (persist) writeStorage('localStorage', volumeKey, String(volume));

        volumeControls.forEach((control) => {
            control.value = String(volume);
            control.style.setProperty('--music-volume', `${volume}%`);
        });
        volumeOutputs.forEach((output) => {
            output.value = `${volume}%`;
            output.textContent = `${volume}%`;
        });
    };

    const setTrack = (value, persist = true) => {
        if (!trackSources.has(value)) return;
        if (value === track) {
            trackControls.forEach((control) => { control.value = track; });
            return;
        }

        pausePlayback();
        track = value;
        previousPosition = 0;
        restoredPosition = true;
        unavailable = false;
        waitingForGesture = false;
        writeStorage('sessionStorage', positionKey, '0');
        if (persist) writeStorage('localStorage', trackKey, track);
        audio.src = trackSources.get(track);
        audio.load();
        updateControls();
        resumePlayback();
    };

    const restorePosition = () => {
        if (restoredPosition || audio.readyState < 1) return;

        try {
            const duration = audio.duration;
            const position = Number.isFinite(duration) && duration > 0
                ? previousPosition % duration
                : previousPosition;
            audio.currentTime = position;
            restoredPosition = true;
        } catch {
            // Retry after the media metadata becomes available.
        }
    };

    const savePosition = () => {
        if (!restoredPosition || !Number.isFinite(audio.currentTime)) return;
        writeStorage('sessionStorage', positionKey, String(audio.currentTime));
        savedAt = Date.now();
    };

    const canPlay = () => enabled && !suspended && !pagePaused && !document.hidden && !unavailable;

    const pausePlayback = () => {
        playbackRequest += 1;
        pendingPlayback = false;
        savePosition();
        audio.pause();
    };

    const handlePlaybackFailure = (error, request) => {
        if (request !== playbackRequest || !canPlay()) return;
        pendingPlayback = false;

        if (error?.name === 'AbortError') return;
        if (error?.name === 'NotSupportedError') {
            unavailable = true;
            waitingForGesture = false;
        } else {
            waitingForGesture = true;
        }

        updateControls();
    };

    const resumePlayback = () => {
        if (!canPlay() || pendingPlayback || !audio.paused) return;
        restorePosition();
        audio.muted = false;
        pendingPlayback = true;
        const request = ++playbackRequest;

        try {
            Promise.resolve(audio.play()).then(() => {
                if (!canPlay()) {
                    audio.pause();
                    return;
                }

                if (request !== playbackRequest) return;
                pendingPlayback = false;
                waitingForGesture = false;
                updateControls();
            }).catch((error) => handlePlaybackFailure(error, request));
        } catch (error) {
            handlePlaybackFailure(error, request);
        }
    };

    const setEnabled = (value, persist = true) => {
        enabled = Boolean(value);
        if (persist) writeStorage('localStorage', preferenceKey, enabled ? 'on' : 'off');
        audio.muted = !enabled;

        if (enabled) {
            resumePlayback();
        } else {
            waitingForGesture = false;
            pausePlayback();
        }

        updateControls();
    };

    const stop = () => {
        suspended = true;
        audio.muted = true;
        pausePlayback();
    };

    controls.forEach((control) => {
        control.addEventListener('click', () => setEnabled(!enabled));
    });

    volumeControls.forEach((control) => {
        control.addEventListener('input', () => setVolume(control.value));
    });

    trackControls.forEach((control) => {
        control.addEventListener('change', () => setTrack(control.value));
    });

    const resumeFromGesture = (event) => {
        if (!event.isTrusted || !waitingForGesture) return;
        if (event.target.closest?.('[data-music-toggle], [data-logout]')) return;
        resumePlayback();
    };

    document.addEventListener('pointerdown', resumeFromGesture, { capture: true, passive: true });
    document.addEventListener('click', resumeFromGesture, { capture: true });
    document.addEventListener('keydown', resumeFromGesture, { capture: true });

    document.addEventListener('submit', (event) => {
        if (event.target.matches?.('[data-logout]')) stop();
    }, true);

    audio.addEventListener('loadedmetadata', restorePosition);
    audio.addEventListener('timeupdate', () => {
        if (Date.now() - savedAt >= 4000) savePosition();
    });
    audio.addEventListener('error', () => {
        unavailable = true;
        waitingForGesture = false;
        pausePlayback();
        updateControls();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pausePlayback();
        } else {
            resumePlayback();
        }
    });

    window.addEventListener('pagehide', () => {
        pagePaused = true;
        pausePlayback();
    });

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        pagePaused = false;
        const preference = readStorage('localStorage', preferenceKey);
        if (preference !== null) enabled = preference !== 'off';
        setTrack(readStorage('localStorage', trackKey) ?? defaultTrack, false);
        const restoredVolume = readStorage('localStorage', volumeKey);
        if (restoredVolume !== null) setVolume(restoredVolume, false);
        audio.muted = !enabled || suspended;
        updateControls();
        resumePlayback();
    });

    window.addEventListener('storage', (event) => {
        if (event.key === preferenceKey || event.key === null) {
            setEnabled(readStorage('localStorage', preferenceKey) !== 'off', false);
        }
        if (event.key === trackKey || event.key === null) {
            setTrack(readStorage('localStorage', trackKey) ?? defaultTrack, false);
        }
        if (event.key === volumeKey || event.key === null) {
            setVolume(readStorage('localStorage', volumeKey) ?? defaultVolume, false);
        }
    });

    window.NetGuardMusic = Object.freeze({
        isEnabled: () => enabled,
        getTrack: () => track,
        setEnabled,
        setTrack,
        getVolume: () => volume,
        setVolume,
        toggle: () => setEnabled(!enabled),
        stop,
    });

    updateControls();
    setVolume(volume, false);
    restorePosition();
    resumePlayback();
})();
