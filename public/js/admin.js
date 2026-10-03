(() => {
    'use strict';

    const loadingOverlay = document.querySelector('[data-admin-loading]');
    const loadingMessage = loadingOverlay?.querySelector('[data-loading-message]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const submittedForms = new WeakSet();
    const disabledButtons = new Map();
    const sidebar = document.querySelector('#admin-sidebar');
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');

    const showLoading = (message) => {
        if (loadingMessage) {
            loadingMessage.textContent = message || 'Memproses perubahan…';
        }
        if (loadingOverlay) {
            loadingOverlay.hidden = false;
        }
        document.body.setAttribute('aria-busy', 'true');
    };

    const hideLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.hidden = true;
        }
        document.body.removeAttribute('aria-busy');
    };

    const disableSubmitButtons = (form) => {
        form.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])').forEach((button) => {
            disabledButtons.set(button, button.disabled);
            button.disabled = true;
        });
    };

    const restoreSubmitButtons = (form) => {
        form.querySelectorAll('button, input[type="submit"]').forEach((button) => {
            if (disabledButtons.has(button)) {
                button.disabled = disabledButtons.get(button);
                disabledButtons.delete(button);
            }
        });
    };

    const closeSidebar = () => {
        document.body.classList.remove('admin-menu-open');
        sidebarToggle?.setAttribute('aria-expanded', 'false');
    };

    sidebarToggle?.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('admin-menu-open');
        sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
        if (document.body.classList.contains('admin-menu-open') && !sidebar?.contains(event.target) && !sidebarToggle?.contains(event.target)) {
            closeSidebar();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('admin-menu-open')) {
            closeSidebar();
            sidebarToggle?.focus();
        }
    });

    const dialogOpeners = new WeakMap();

    document.querySelectorAll('[data-open-dialog]').forEach((button) => {
        button.addEventListener('click', () => {
            const dialog = document.getElementById(button.dataset.openDialog);
            if (!(dialog instanceof HTMLDialogElement) || dialog.open) {
                return;
            }
            dialogOpeners.set(dialog, button);
            dialog.showModal();
        });
    });

    document.querySelectorAll('.admin-dialog').forEach((dialog) => {
        dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
            button.addEventListener('click', () => dialog.close());
        });
        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) {
                return;
            }
            const bounds = dialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                dialog.close();
            }
        });
        dialog.addEventListener('close', () => {
            const opener = dialogOpeners.get(dialog);
            if (opener?.isConnected) {
                opener.focus();
            }
        });
        if (dialog.hasAttribute('data-open-on-load') && !dialog.open) {
            dialog.showModal();
        }
    });

    document.querySelectorAll('[data-password-target]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordTarget);
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            const showPassword = input.type === 'password';
            input.type = showPassword ? 'text' : 'password';
            button.textContent = showPassword ? 'Sembunyikan password' : 'Tampilkan password';
            button.setAttribute('aria-pressed', String(showPassword));
        });
    });

    document.querySelectorAll('[data-toast-dismiss]').forEach((button) => {
        button.addEventListener('click', () => {
            const toast = button.closest('[data-admin-toast]');
            if (toast) {
                toast.hidden = true;
            }
        });
    });

    document.querySelectorAll('form[data-admin-action]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (submittedForms.has(form) || !form.reportValidity()) {
                return;
            }
            submittedForms.add(form);
            const activeDialog = form.closest('dialog');
            if (activeDialog instanceof HTMLDialogElement && activeDialog.open) {
                activeDialog.close();
            }
            showLoading(form.dataset.loadingLabel);
            disableSubmitButtons(form);
            window.setTimeout(() => {
                HTMLFormElement.prototype.submit.call(form);
            }, reducedMotion.matches ? 0 : 180);
        });
    });

    const loginForm = document.querySelector('form[data-admin-login]');
    const loginError = document.querySelector('#admin-login-error');

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submittedForms.has(loginForm) || !loginForm.reportValidity()) {
            return;
        }
        submittedForms.add(loginForm);
        if (loginError) {
            loginError.hidden = true;
            loginError.textContent = '';
        }
        const formData = new FormData(loginForm);
        disableSubmitButtons(loginForm);
        showLoading('Memverifikasi akun administrator…');

        try {
            const response = await fetch(loginForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error(response.status === 419 ? 'Sesi halaman sudah berakhir. Muat ulang halaman, lalu coba masuk lagi.' : 'Tidak dapat masuk saat ini. Silakan coba lagi.');
            }
            const result = await response.json();
            if (!response.ok) {
                const validationMessage = Object.values(result.errors || {}).flat()[0];
                throw new Error(validationMessage || result.message || 'Email atau password administrator tidak cocok.');
            }
            if (typeof result.redirect !== 'string' || !result.redirect) {
                throw new Error('Halaman administrator belum dapat dibuka. Silakan coba lagi.');
            }
            const target = new URL(result.redirect, window.location.href);
            if (target.origin !== window.location.origin) {
                throw new Error('Tujuan halaman administrator tidak valid.');
            }
            window.location.assign(target.href);
        } catch (error) {
            hideLoading();
            restoreSubmitButtons(loginForm);
            submittedForms.delete(loginForm);
            if (loginError) {
                loginError.textContent = error instanceof TypeError ? 'Koneksi terputus. Periksa jaringan, lalu coba lagi.' : error.message;
                loginError.hidden = false;
                loginError.setAttribute('tabindex', '-1');
                loginError.focus();
            }
        }
    });

    window.addEventListener('pageshow', () => {
        hideLoading();
        disabledButtons.forEach((wasDisabled, button) => {
            button.disabled = wasDisabled;
        });
        disabledButtons.clear();
        document.querySelectorAll('form[data-admin-action], form[data-admin-login]').forEach((form) => {
            submittedForms.delete(form);
        });
        closeSidebar();
    });
})();
