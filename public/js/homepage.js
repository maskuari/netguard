(() => {
    'use strict';

    const dialog = document.querySelector('#homepage-dialog');
    const title = document.querySelector('#home-panel-title');
    const description = document.querySelector('#home-panel-description');
    const content = document.querySelector('#home-panel-content');
    const homeLink = document.querySelector('.homepage-navbar .nav-link[data-home]');
    const account = document.querySelector('.homepage-account');
    const accountToggle = account.querySelector('.homepage-account__toggle');
    const accountMenu = account.querySelector('.homepage-account__menu');
    const logoutForm = account.querySelector('[data-logout]');
    const adventureLink = document.querySelector('[data-adventure-link]');
    const loading = document.querySelector('.homepage-loading');
    const loadingMessage = loading.querySelector('.homepage-loading__message');
    const main = document.querySelector('#main-content');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const modeGrid = document.querySelector('.mode-grid');
    const previousMode = document.querySelector('[data-mode-previous]');
    const nextMode = document.querySelector('[data-mode-next]');
    let modeTimer;
    let leaving = false;

    const panels = {
        materials: { title: 'Materi Belajar', description: 'Ikuti lima chapter untuk membangun jaringan sekolah selangkah demi selangkah.' },
        about: { title: 'Tentang NetGuard Academy', description: 'Belajar jaringan jadi petualangan seru.' },
        resources: { title: 'Materi Rujukan', description: 'Kenali topik jaringan yang menemani perjalanan belajarmu.' },
        leaderboard: { title: 'Leaderboard', description: 'Tempat pencapaian para penjelajah jaringan.' },
        help: { title: 'Ada yang bisa dibantu?', description: 'Kenali halaman dan mode belajar NetGuard Academy.' },
        practice: { title: 'Practice Mode', description: 'Asah kemampuan konfigurasi MikroTik lewat latihan.' },
        certification: { title: 'Certification Mode', description: 'Tantang dirimu dan tunjukkan kemampuan jaringanmu.' },
        'practice-locked': { title: 'Practice Mode terkunci', description: 'Selesaikan Chapter 3 Adventure untuk membuka mode ini.' },
        'certification-locked': { title: 'Certification Mode terkunci', description: 'Selesaikan seluruh Adventure untuk membuka mode ini.' },
    };

    const resetNavigation = () => {
        document.querySelectorAll('.homepage-navbar .nav-link').forEach((link) => {
            link.classList.toggle('is-active', link === homeLink);
        });
    };

    const closeAccountMenu = () => {
        accountMenu.hidden = true;
        accountToggle.setAttribute('aria-expanded', 'false');
    };

    const showLoading = (message) => {
        loadingMessage.textContent = message;
        loading.hidden = false;
        main.setAttribute('aria-busy', 'true');
    };

    const hideLoading = () => {
        loading.hidden = true;
        main.removeAttribute('aria-busy');
    };

    const updateModeControls = () => {
        previousMode.disabled = modeGrid.scrollLeft <= 1;
        nextMode.disabled = modeGrid.scrollLeft >= modeGrid.scrollWidth - modeGrid.clientWidth - 1;
    };

    const scrollModes = (direction) => {
        const card = modeGrid.querySelector('.mode-card');
        const gap = parseFloat(window.getComputedStyle(modeGrid).columnGap) || 0;
        modeGrid.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
    };

    previousMode.addEventListener('click', () => scrollModes(-1));
    nextMode.addEventListener('click', () => scrollModes(1));
    modeGrid.addEventListener('scroll', updateModeControls, { passive: true });
    window.addEventListener('resize', updateModeControls);
    updateModeControls();

    logoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (leaving) return;
        leaving = true;
        window.clearTimeout(modeTimer);
        closeAccountMenu();
        showLoading('Keluar dari akun...');
        window.setTimeout(() => HTMLFormElement.prototype.submit.call(logoutForm), reducedMotion.matches ? 150 : 650);
    });

    adventureLink.addEventListener('click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (leaving || !loading.hidden) return;
        leaving = true;
        closeAccountMenu();
        showLoading('Menyiapkan Adventure Mode...');
        modeTimer = window.setTimeout(() => {
            if (window.NetGuardNavigation) {
                window.NetGuardNavigation.navigate(adventureLink.href, 'adventure');
            } else {
                window.location.assign(adventureLink.href);
            }
        }, reducedMotion.matches ? 150 : 650);
    });

    accountToggle.addEventListener('click', () => {
        accountMenu.hidden = !accountMenu.hidden;
        accountToggle.setAttribute('aria-expanded', String(!accountMenu.hidden));
    });

    document.addEventListener('click', (event) => {
        if (!account.contains(event.target)) closeAccountMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !accountMenu.hidden) {
            closeAccountMenu();
            accountToggle.focus();
        }
    });

    const openPanel = (trigger, panel, template) => {
        title.textContent = panel.title;
        description.textContent = panel.description;
        content.replaceChildren(template.content.cloneNode(true));
        if (trigger.classList.contains('nav-link')) {
            document.querySelectorAll('.homepage-navbar .nav-link').forEach((link) => {
                link.classList.toggle('is-active', link === trigger);
            });
        }
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
    };

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest?.('[data-home-panel]');
        if (!trigger || leaving || !loading.hidden) return;
        const panelName = trigger.dataset.modeLocked === 'true'
            ? `${trigger.dataset.homePanel}-locked`
            : trigger.dataset.homePanel;
        const panel = panels[panelName];
        const template = document.querySelector(`#home-panel-${panelName}`);
        if (!panel || !template) return;

        if (trigger.dataset.modeLocked === 'true') {
            closeAccountMenu();
            openPanel(trigger, panel, template);
            return;
        }

        if (trigger.classList.contains('mode-card')) {
            showLoading(`Membuka info ${panel.title}...`);
            modeTimer = window.setTimeout(() => {
                hideLoading();
                openPanel(trigger, panel, template);
            }, reducedMotion.matches ? 150 : 750);
            return;
        }

        openPanel(trigger, panel, template);
    });

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        if (leaving) {
            window.location.reload();
            return;
        }
        window.clearTimeout(modeTimer);
        hideLoading();
    });

    dialog.querySelectorAll('.dialog-close, .dialog-back').forEach((button) => {
        button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('close', resetNavigation);
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });

    document.querySelectorAll('[data-home]').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            main.focus({ preventScroll: true });
        });
    });
})();
