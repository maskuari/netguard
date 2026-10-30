(() => {
    'use strict';
    const buttons = [...document.querySelectorAll('[data-step-back]')];
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
