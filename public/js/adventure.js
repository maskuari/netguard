(() => {
    'use strict';

    const tabs = [...document.querySelectorAll('.chapter-card__select[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    const account = document.querySelector('.adventure-account');
    const accountToggle = account.querySelector('.homepage-account__toggle');
    const accountMenu = account.querySelector('.homepage-account__menu');
    const logoutForm = account.querySelector('[data-logout]');
    const loading = document.querySelector('.adventure-loading');
    const dialog = document.querySelector('#adventure-dialog');
    const dialogTitle = document.querySelector('#adventure-dialog-title');
    const dialogText = document.querySelector('#adventure-dialog-text');
    const dialogContent = document.querySelector('#adventure-dialog-content');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let leaving = false;

    const closeAccountMenu = () => {
        accountMenu.hidden = true;
        accountToggle.setAttribute('aria-expanded', 'false');
    };

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

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        closeAccountMenu();
        loading.hidden = true;
        leaving = false;
    });

    logoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (leaving) return;
        leaving = true;
        closeAccountMenu();
        loading.hidden = false;
        window.NetGuardMusic?.stop();
        window.setTimeout(() => HTMLFormElement.prototype.submit.call(logoutForm), reducedMotion.matches ? 100 : 450);
    });

    const openDialog = (title, message, template = null) => {
        closeAccountMenu();
        dialogTitle.textContent = title;
        dialogText.textContent = message;
        dialogContent.replaceChildren(template ? template.content.cloneNode(true) : document.createTextNode(''));
        if (!dialog.open) dialog.showModal();
    };

    document.querySelectorAll('[data-adventure-info]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const information = {
                materials: ['Materi Belajar', 'Ikuti lima chapter untuk membangun jaringan sekolah selangkah demi selangkah.', '#adventure-info-materials'],
                about: ['Tentang NetGuard Academy', 'Belajar MikroTik melalui cerita, simulasi, dan misi jaringan.', '#adventure-info-about'],
                resources: ['Materi Rujukan', 'Topik jaringan yang akan kamu temui sepanjang petualangan.', '#adventure-info-resources'],
                help: ['Bantuan', 'Pilih pulau untuk melihat ringkasan dan materi setiap chapter.', '#adventure-info-help'],
            }[trigger.dataset.adventureInfo];
            if (!information) return;
            openDialog(information[0], information[1], document.querySelector(information[2]));
        });
    });

    const chapterOneResetButton = document.querySelector('[data-reset-chapter-one]');
    chapterOneResetButton.addEventListener('click', async () => {
        const confirmed = window.confirm('Reset semua progres Adventure Mode? Chapter yang sudah tercatat selesai akan kembali terkunci dan Chapter 1 dimulai dari adegan pembuka.');
        if (!confirmed) return;
        chapterOneResetButton.disabled = true;
        chapterOneResetButton.textContent = 'Mereset progres…';
        try {
            const response = await fetch(chapterOneResetButton.dataset.resetUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Reset gagal.');
            try {
                const userId = chapterOneResetButton.dataset.progressKey.split('.').at(-1);
                const chapterProgressKeys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index))
                    .filter((key) => key?.startsWith('netguard.chapter-') && key.endsWith(`.${userId}`));
                chapterProgressKeys.forEach((key) => window.localStorage.removeItem(key));
            } catch {
                // Server progress is already reset; browser drafts are best-effort cleanup.
            }
            window.location.reload();
        } catch {
            chapterOneResetButton.disabled = false;
            chapterOneResetButton.textContent = 'Reset Progres';
            window.alert('Progres belum dapat direset. Periksa koneksi lalu coba lagi.');
        }
    });

    document.querySelectorAll('[data-start-chapter]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            openDialog(`Ringkasan Chapter ${trigger.dataset.startChapter}`, 'Chapter ini sudah terbuka. Baca materi, topik, dan target belajarnya pada panel ini. Simulasi interaktif tiap chapter akan dilanjutkan bertahap.');
        });
    });

    dialog.querySelectorAll('[data-close-dialog]').forEach((trigger) => {
        trigger.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });

    const learning = document.querySelector('#chapter-learning');
    const dots = [...document.querySelectorAll('[data-chapter-dot]')];
    let activeIndex = 0;

    const selectChapter = (index, focusTab = false) => {
        activeIndex = (index + tabs.length) % tabs.length;
        tabs.forEach((tab, tabIndex) => {
            const selected = tabIndex === activeIndex;
            let distance = tabIndex - activeIndex;
            if (distance > 2) distance -= tabs.length;
            if (distance < -2) distance += tabs.length;
            tab.closest('.chapter-card').dataset.position = String(distance);
            tab.closest('.chapter-card').classList.toggle('is-selected', selected);
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            panels[tabIndex].hidden = !selected;
            dots[tabIndex].classList.toggle('is-selected', selected);
            dots[tabIndex].setAttribute('aria-current', String(selected));
        });
        learning.hidden = false;
        if (focusTab) tabs[activeIndex].focus();
        window.history.replaceState(null, '', '#chapter-' + tabs[activeIndex].dataset.chapter);
    };

    document.querySelector('[data-carousel-previous]').addEventListener('click', () => selectChapter(activeIndex - 1));
    document.querySelector('[data-carousel-next]').addEventListener('click', () => selectChapter(activeIndex + 1));
    document.querySelector('[data-close-learning]').addEventListener('click', () => { learning.hidden = true; });
    dots.forEach((dot, index) => dot.addEventListener('click', () => selectChapter(index)));
    document.querySelectorAll('[data-open-learning]').forEach((button, index) => {
        button.addEventListener('click', () => {
            selectChapter(index);
            learning.hidden = false;
        });
    });
    document.querySelectorAll('[data-detail-chapter]').forEach((button, index) => {
        button.addEventListener('click', () => {
            const chapter = panels[index];
            openDialog(chapter.dataset.title, chapter.dataset.story);
            dialogContent.append(chapter.querySelector('.chapter-learning__topics').cloneNode(true));
            dialogContent.append(chapter.querySelector('.chapter-learning__result').cloneNode(true));
        });
    });

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectChapter(index));
        tab.addEventListener('keydown', (event) => {
            let nextIndex;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = tabs.length - 1;
            else return;
            event.preventDefault();
            selectChapter(nextIndex, true);
        });
    });

    const initialIndex = tabs.findIndex((tab) => window.location.hash === '#chapter-' + tab.dataset.chapter);
    selectChapter(initialIndex > 0 ? initialIndex : 0);
})();
