(() => {
    'use strict';
    const buttons = [...document.querySelectorAll('[data-step-back]')];
    const homeBacks = [...document.querySelectorAll('[data-home-back]')];
    const homeConfirm = document.querySelector('[data-home-confirm]');
    const homeConfirmLeave = homeConfirm?.querySelector('[data-home-confirm-leave]');
    const homeConfirmClose = homeConfirm ? [...homeConfirm.querySelectorAll('[data-home-confirm-close]')] : [];
    let saveProgress = null;
    let restoringMission = false;
    let homeDestination = homeBacks[0]?.href;
    const autosave = () => { if (!restoringMission) saveProgress?.(); };

    const closeHomeConfirm = () => {
        if (!homeConfirm) return;
        homeConfirm.hidden = true;
        document.body.classList.remove('chapter-home-confirm-open');
    };

    homeBacks.forEach((link) => link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        homeDestination = link.href;
        if (!homeConfirm) return;
        homeConfirm.hidden = false;
        document.body.classList.add('chapter-home-confirm-open');
        homeConfirm.querySelector('button[data-home-confirm-close]')?.focus();
    }));
    homeConfirmClose.forEach((button) => button.addEventListener('click', closeHomeConfirm));
    homeConfirmLeave?.addEventListener('click', () => {
        autosave();
        window.location.assign(homeDestination);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && homeConfirm && !homeConfirm.hidden) closeHomeConfirm();
    });

    window.NetGuardChapterNavbar = {
        bindAutosave(callback) {
            saveProgress = callback;
            document.addEventListener('input', autosave);
            document.addEventListener('change', autosave);
            document.addEventListener('click', () => queueMicrotask(autosave));
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') autosave(); });
            window.addEventListener('pagehide', autosave);
        },
        bindMissions({ missions, storageKey, getCurrent, getUnlocked = getCurrent, completed = false, isComplete = () => completed, replay }) {
            const header = document.querySelector('.chapter-navbar');
            if (!header) return;
            const historyKey = 'netguard.chapter-missions.v1.' + storageKey;
            const pendingKey = 'netguard.chapter-mission-replay.v1.' + storageKey;
            const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
            const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
            const history = read(historyKey) || { highest: 0, checkpoints: {} };
            history.checkpoints ||= {};
            const clamp = (index) => Math.max(0, Math.min(missions.length - 1, Number(index) || 0));
            history.highest = clamp(Math.max(history.highest, completed ? missions.length - 1 : getUnlocked()));
            let observed = -1;
            const track = () => {
                const current = clamp(getCurrent());
                const finished = Boolean(history.completed || completed || isComplete());
                const highest = clamp(Math.max(history.highest, getUnlocked(), current, finished ? missions.length - 1 : 0));
                if (current === observed && highest === history.highest && finished === history.completed) return;
                observed = current;
                history.highest = highest;
                history.completed = finished;
                const snapshot = read(storageKey);
                if (snapshot) {
                    missions.slice(0, highest + 1).forEach((mission) => {
                        history.checkpoints[mission.stage] ||= snapshot;
                    });
                    history.checkpoints[missions[current].stage] = snapshot;
                    history.latest = snapshot;
                }
                write(historyKey, history);
            };
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'chapter-missions-button';
            button.textContent = 'Misi';
            button.setAttribute('aria-haspopup', 'dialog');
            button.setAttribute('data-open-missions', '');
            const dialog = document.createElement('dialog');
            dialog.className = 'chapter-missions-dialog';
            dialog.setAttribute('aria-labelledby', 'chapter-missions-title');
            dialog.innerHTML = '<header><div><span>PERJALANAN CHAPTER</span><h2 id="chapter-missions-title">Daftar misi</h2></div><button type="button" data-close-missions aria-label="Tutup daftar misi">×</button></header><p>Pilih misi untuk mengulang. Konfigurasi mulai dari misi yang dipilih akan direset.</p><div class="chapter-missions-grid"></div>';
            header.insertBefore(button, header.querySelector('[data-step-back]'));
            document.body.append(dialog);
            const start = (mission, index) => {
                track();
                if (index > history.highest) return;
                dialog.close();
                const checkpoint = history.checkpoints[mission.stage] || history.latest;
                if (checkpoint && write(pendingKey, mission.stage)) {
                    if (write(storageKey, checkpoint)) { restoringMission = true; window.location.reload(); return; }
                    localStorage.removeItem(pendingKey);
                }
                replay(mission.stage);
                track();
            };
            const openMissions = () => {
                track();
                const grid = dialog.querySelector('.chapter-missions-grid');
                grid.replaceChildren(...missions.map((mission, index) => {
                    const card = document.createElement('button');
                    card.type = 'button';
                    card.className = 'chapter-mission-card';
                    card.disabled = index > history.highest;
                    if (index === clamp(getCurrent())) card.setAttribute('aria-current', 'step');
                    const number = document.createElement('span');
                    number.className = 'chapter-mission-card__number';
                    number.textContent = String(index + 1).padStart(2, '0');
                    const title = document.createElement('strong');
                    title.textContent = mission.title;
                    const description = document.createElement('p');
                    description.textContent = mission.description;
                    const status = document.createElement('small');
                    status.textContent = card.disabled ? 'Terkunci' : index === clamp(getCurrent()) ? 'Misi saat ini · ulang dari awal' : 'Bisa diulang';
                    card.append(number, title, description, status);
                    card.addEventListener('click', () => start(mission, index));
                    return card;
                }));
                const evaluationCard = document.createElement('button');
                evaluationCard.type = 'button';
                evaluationCard.className = 'chapter-mission-card';
                evaluationCard.disabled = !history.completed;
                const evaluationNumber = document.createElement('span');
                evaluationNumber.className = 'chapter-mission-card__number';
                evaluationNumber.textContent = String(missions.length + 1).padStart(2, '0');
                const evaluationTitle = document.createElement('strong');
                evaluationTitle.textContent = 'Evaluasi';
                const evaluationDescription = document.createElement('p');
                evaluationDescription.textContent = 'Uji kembali pemahamanmu tentang chapter ini.';
                const evaluationStatus = document.createElement('small');
                evaluationStatus.textContent = evaluationCard.disabled ? 'Terkunci' : 'Bisa diulang';
                evaluationCard.append(evaluationNumber, evaluationTitle, evaluationDescription, evaluationStatus);
                evaluationCard.addEventListener('click', () => {
                    dialog.close();
                    window.NetGuardEvaluation?.replay();
                });
                grid.append(evaluationCard);
                dialog.showModal();
            };
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                openMissions();
            });
            dialog.querySelector('[data-close-missions]').addEventListener('click', () => dialog.close());
            dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
            dialog.addEventListener('close', () => button.focus());
            const pending = read(pendingKey);
            const resumingMission = missions.some((mission, index) => mission.stage === pending && index <= history.highest);
            if (resumingMission) {
                localStorage.removeItem(pendingKey);
                replay(pending);
            }
            track();
            if (history.completed && !resumingMission) {
                document.querySelectorAll('dialog[open]').forEach((node) => node.close());
                document.querySelectorAll('.chapter-prologue, .chapter-dialogue, .ch2-dialogue-overlay').forEach((node) => { node.hidden = true; });
                const scene = document.querySelector('.chapter-one-scene');
                scene?.classList.remove('is-prologue', 'is-dialogue-open');
                const surface = scene?.querySelector('.lab-scroll');
                if (surface) surface.inert = false;
                openMissions();
            }
            const observer = new MutationObserver(track);
            observer.observe(document.querySelector('.chapter-one-scene') || document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
        },
        bindPrevious(callback) {
            buttons.forEach((button) => {
                button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); if (!button.disabled) callback(); });
                button.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); });
            });
        },
        setBackEnabled(enabled) { buttons.forEach((button) => { button.disabled = !enabled; }); },
    };
})();
