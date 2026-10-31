(() => {
    'use strict';
    const buttons = [...document.querySelectorAll('[data-step-back]')];
    const homeBack = document.querySelector('[data-home-back]');
    const homeConfirm = document.querySelector('[data-home-confirm]');
    const homeConfirmLeave = homeConfirm?.querySelector('[data-home-confirm-leave]');
    const homeConfirmClose = homeConfirm ? [...homeConfirm.querySelectorAll('[data-home-confirm-close]')] : [];

    const closeHomeConfirm = () => {
        if (!homeConfirm) return;
        homeConfirm.hidden = true;
        document.body.classList.remove('chapter-home-confirm-open');
    };

    homeBack?.addEventListener('click', (event) => {
        event.preventDefault();
        if (!homeConfirm) return;
        homeConfirm.hidden = false;
        document.body.classList.add('chapter-home-confirm-open');
        homeConfirm.querySelector('button[data-home-confirm-close]')?.focus();
    });
    homeConfirmClose.forEach((button) => button.addEventListener('click', closeHomeConfirm));
    homeConfirmLeave?.addEventListener('click', () => {
        window.location.assign(homeBack.href);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && homeConfirm && !homeConfirm.hidden) closeHomeConfirm();
    });

    window.NetGuardChapterNavbar = {
        bindPrevious(callback) {
            buttons.forEach((button) => {
                button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); if (!button.disabled) callback(); });
                button.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); });
            });
        },
        setBackEnabled(enabled) { buttons.forEach((button) => { button.disabled = !enabled; }); },
    };
})();
