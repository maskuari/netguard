(() => {
    'use strict';

    const tabs = [...document.querySelectorAll('.chapter-card[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    const selectChapter = (index, focusTab = false) => {
        tabs.forEach((tab, tabIndex) => {
            const selected = tabIndex === index;
            tab.classList.toggle('is-selected', selected);
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            panels[tabIndex].hidden = !selected;
        });

        if (focusTab) tabs[index].focus();
        window.history.replaceState(null, '', '#chapter-' + tabs[index].dataset.chapter);
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectChapter(index));
        tab.addEventListener('keydown', (event) => {
            let nextIndex;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                nextIndex = (index + 1) % tabs.length;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                nextIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            selectChapter(nextIndex, true);
        });
    });

    const initialIndex = tabs.findIndex((tab) => window.location.hash === '#chapter-' + tab.dataset.chapter);
    if (initialIndex > 0) selectChapter(initialIndex);
})();
