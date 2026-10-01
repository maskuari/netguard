(() => {
    'use strict';

    const dialog = document.querySelector('#information-dialog');
    const panelTitle = document.querySelector('#panel-title');
    const panelDescription = document.querySelector('#panel-description');
    const panelContent = document.querySelector('#panel-content');
    const panelIcon = document.querySelector('#panel-icon');
    const homeLink = document.querySelector('.nav-link[data-home]');

    const panels = {
        about: {
            title: 'Kenalan dengan NetGuard',
            description: 'Tempat memulai perjalananmu menjelajahi dunia jaringan dan MikroTik.',
            icon: 'about',
        },
        resources: {
            title: 'Materi Rujukan',
            description: 'Kenali topik-topik yang akan menemani perjalanan belajarmu.',
            icon: 'book',
        },
        help: {
            title: 'Ada yang bisa dibantu?',
            description: 'Panduan singkat sebelum memulai misi pertamamu.',
            icon: 'help',
        },
    };

    const resetNavigation = () => {
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.toggle('is-active', link === homeLink);
        });
    };

    document.querySelectorAll('[data-panel]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const panel = panels[trigger.dataset.panel];
            const template = document.querySelector(`#panel-${trigger.dataset.panel}`);
            if (!panel || !template) return;

            panelTitle.textContent = panel.title;
            panelDescription.textContent = panel.description;
            panelIcon.setAttribute('href', `#icon-${panel.icon}`);
            panelContent.replaceChildren(template.content.cloneNode(true));
            document.querySelectorAll('.nav-link').forEach((link) => {
                link.classList.toggle('is-active', link === trigger);
            });
            dialog.showModal();
            dialog.scrollTop = 0;
        });
    });

    document.querySelectorAll('.dialog-close, .dialog-back').forEach((button) => {
        button.addEventListener('click', () => dialog.close());
    });

    dialog.addEventListener('close', resetNavigation);
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const isOutside = event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (isOutside) dialog.close();
    });

    document.querySelectorAll('[data-home]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (dialog.open) dialog.close();
            resetNavigation();
        });
    });
})();
