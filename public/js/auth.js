(() => {
    'use strict';

    const scene = document.querySelector('.auth-scene');
    const stage = document.querySelector('.auth-stage');
    const card = document.querySelector('.auth-card__surface');
    const mascot = document.querySelector('.auth-brand__motion');
    const panes = Object.fromEntries([...document.querySelectorAll('[data-pane]')].map((pane) => [pane.dataset.pane, pane]));
    const urls = { login: scene.dataset.loginUrl, register: scene.dataset.registerUrl };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toast = document.querySelector('.auth-toast');
    const toastIcon = toast.querySelector('use');
    const loading = document.querySelector('.auth-loading');
    const loadingMessage = loading.querySelector('.auth-loading__message');
    const forgotDialog = document.querySelector('#forgot-dialog');
    let currentMode = scene.dataset.mode;
    let switching = false;
    let queuedSwitch = null;
    let activeAnimations = [];
    let toastTimeout;
    let submitting = false;

    const hideToast = () => {
        window.clearTimeout(toastTimeout);
        toast.hidden = true;
    };

    const showToast = (message, tone = 'error', duration = 6000) => {
        hideToast();
        toast.dataset.tone = tone;
        toastIcon.setAttribute('href', tone === 'success' ? '#auth-check' : '#auth-info');
        toast.querySelector('.toast__message').textContent = message;
        toast.hidden = false;
        toastTimeout = window.setTimeout(hideToast, duration);
    };

    const startLoading = (message) => {
        loadingMessage.textContent = message;
        loading.hidden = false;
        stage.setAttribute('aria-busy', 'true');
        scene.classList.add('is-submitting');
    };

    const stopLoading = () => {
        loading.hidden = true;
        stage.removeAttribute('aria-busy');
        scene.classList.remove('is-submitting');
    };

    const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

    const animate = (element, keyframes, options) => {
        const animation = element.animate(keyframes, options);
        activeAnimations.push(animation);
        return animation;
    };

    const switchMode = async (nextMode, { pushHistory = false, focus = true, keepToast = false } = {}) => {
        if (!panes[nextMode]) return;
        if (switching) {
            queuedSwitch = { nextMode, options: { pushHistory, focus, keepToast } };
            return;
        }
        if (nextMode === currentMode) return;

        switching = true;
        if (!keepToast) hideToast();
        if (forgotDialog.open) forgotDialog.close();
        const outgoing = panes[currentMode];
        const incoming = panes[nextMode];
        const direction = nextMode === 'register' ? -1 : 1;

        if (outgoing.contains(document.activeElement)) document.activeElement.blur();
        outgoing.inert = true;
        outgoing.setAttribute('aria-hidden', 'true');
        incoming.hidden = false;
        incoming.inert = true;
        incoming.setAttribute('aria-hidden', 'true');
        incoming.scrollTop = 0;
        incoming.querySelector('.auth-fields-scroll').scrollTop = 0;
        scene.classList.add('is-swapping');
        stage.setAttribute('aria-busy', 'true');
        scene.dataset.mode = nextMode;
        document.documentElement.dataset.authMode = nextMode;
        currentMode = nextMode;
        document.title = `${nextMode === 'register' ? 'Register' : 'Login'} — NetGuard Academy`;

        if (pushHistory) window.history.pushState({ netguardMode: nextMode }, '', urls[nextMode]);

        try {
            if (!reducedMotion.matches && typeof card.animate === 'function') {
                const restingCard = 'perspective(1400px) translateY(0) rotateY(0deg) rotateZ(0deg) scale(1)';
                animate(card, [
                    { transform: restingCard },
                    { transform: `perspective(1400px) translateY(-10px) rotateY(${direction * 8}deg) rotateZ(${direction * .8}deg) scale(.955)`, offset: .45 },
                    { transform: restingCard },
                ], { duration: 1050, easing: 'cubic-bezier(.45, 0, .18, 1)' });

                animate(mascot, [
                    { transform: 'translateY(0) scale(1)', opacity: 1 },
                    { transform: `translateY(8px) rotate(${direction * -.8}deg) scale(.93)`, opacity: .88, offset: .45 },
                    { transform: 'translateY(0) scale(1)', opacity: 1 },
                ], { duration: 1050, easing: 'cubic-bezier(.45, 0, .18, 1)' });

                const fadeOut = animate(outgoing, [
                    { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
                    { opacity: 0, transform: `translateX(${direction * 18}px)`, filter: 'blur(3px)' },
                ], { duration: 180, easing: 'ease-out', fill: 'forwards' });
                fadeOut.finished.then(() => { outgoing.hidden = true; }).catch(() => {});

                animate(incoming, [
                    { opacity: 0, transform: `translateX(${-direction * 18}px)`, filter: 'blur(3px)' },
                    { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
                ], { duration: 430, delay: 330, easing: 'cubic-bezier(.2, .75, .25, 1)', fill: 'both' });

                incoming.querySelectorAll('[data-reveal]').forEach((element, index) => {
                    animate(element, [
                        { opacity: 0, transform: 'translateY(9px)' },
                        { opacity: 1, transform: 'translateY(0)' },
                    ], { duration: 390, delay: 360 + index * 28, easing: 'cubic-bezier(.2, .75, .25, 1)', fill: 'both' });
                });

                await Promise.allSettled(activeAnimations.map((animation) => animation.finished));
            }
        } finally {
            outgoing.hidden = true;
            incoming.hidden = false;
            incoming.inert = false;
            incoming.removeAttribute('aria-hidden');
            activeAnimations.forEach((animation) => animation.cancel());
            activeAnimations = [];
            scene.classList.remove('is-swapping');
            stage.removeAttribute('aria-busy');
            switching = false;

            if (queuedSwitch) {
                const queued = queuedSwitch;
                queuedSwitch = null;
                await switchMode(queued.nextMode, queued.options);
            } else if (focus) {
                incoming.querySelector('h1').focus({ preventScroll: true });
            }
        }
    };

    document.querySelectorAll('[data-switch]').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (submitting) return;
            switchMode(link.dataset.switch, { pushHistory: true });
        });
    });

    window.addEventListener('popstate', () => {
        const path = window.location.pathname.replace(/\/$/, '');
        const mode = Object.keys(urls).find((key) => new URL(urls[key]).pathname.replace(/\/$/, '') === path);
        if (mode) switchMode(mode);
    });

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) activeAnimations.forEach((animation) => animation.finish());
    });

    document.querySelectorAll('.password-toggle').forEach((button) => {
        const input = document.getElementById(button.getAttribute('aria-controls'));
        const isConfirmation = input.name === 'password_confirmation';
        button.addEventListener('click', () => {
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';
            button.setAttribute('aria-pressed', String(visible));
            button.setAttribute('aria-label', `${visible ? 'Sembunyikan' : 'Tampilkan'} ${isConfirmation ? 'konfirmasi password' : 'password'}`);
            button.querySelector('use').setAttribute('href', visible ? '#auth-eye' : '#auth-eye-off');
        });
    });

    const registrationPassword = document.querySelector('#register-password');
    const passwordConfirmation = document.querySelector('#register-confirmation');
    const validateConfirmation = () => {
        passwordConfirmation.setCustomValidity(passwordConfirmation.value && passwordConfirmation.value !== registrationPassword.value
            ? 'Konfirmasi password belum sama.' : '');
    };

    const submitAuthForm = async (form) => {
        const isRegistration = form.dataset.authForm === 'register';
        const submitButton = form.querySelector('[data-submit]');
        const startedAt = performance.now();
        submitting = true;
        submitButton.disabled = true;
        hideToast();
        startLoading(isRegistration ? 'Membuat akunmu...' : 'Memeriksa akunmu...');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await response.json().catch(() => ({}));
            await wait(Math.max(0, 650 - (performance.now() - startedAt)));

            if (!response.ok) {
                const firstInvalidField = Object.keys(data.errors || {})[0];
                const invalidInput = firstInvalidField ? form.elements.namedItem(firstInvalidField) : null;
                invalidInput?.setAttribute('aria-invalid', 'true');
                const message = response.status === 429
                    ? 'Terlalu banyak percobaan. Coba lagi sebentar.'
                    : response.status === 419
                        ? 'Sesi habis. Muat ulang halaman lalu coba lagi.'
                        : data.errors?.[firstInvalidField]?.[0] || 'Proses belum berhasil. Coba lagi.';
                stopLoading();
                showToast(message);
                scene.classList.add('has-error');
                window.setTimeout(() => scene.classList.remove('has-error'), 420);
                invalidInput?.focus({ preventScroll: true });
                return;
            }

            if (!data.redirect) throw new Error('Unexpected authentication response');

            if (isRegistration) {
                const email = form.elements.namedItem('email').value;
                form.reset();
                panes.login.querySelector('form').reset();
                panes.login.querySelector('[name="email"]').value = email;
                stopLoading();
                showToast(data.message || 'Pendaftaran berhasil! Silakan login.', 'success', 4200);
                await wait(reducedMotion.matches ? 900 : 1600);
                await switchMode('login', { pushHistory: true, keepToast: true });
                return;
            }

            loadingMessage.textContent = 'Login berhasil! Membuka beranda...';
            await wait(reducedMotion.matches ? 0 : 300);
            if (window.NetGuardNavigation) {
                window.NetGuardNavigation.navigate(data.redirect, 'homepage');
            } else {
                window.location.assign(data.redirect);
            }
        } catch {
            stopLoading();
            showToast('Proses belum berhasil. Periksa koneksi lalu coba lagi.');
        } finally {
            submitting = false;
            submitButton.disabled = false;
        }
    };

    document.querySelectorAll('[data-auth-form]').forEach((form) => {
        const inputs = [...form.querySelectorAll('.auth-input input')];
        form.querySelector('[data-submit]').disabled = false;

        inputs.forEach((input) => {
            input.addEventListener('input', () => {
                input.setCustomValidity('');
                if (form.dataset.authForm === 'register') validateConfirmation();
                input.removeAttribute('aria-invalid');
                if (!toast.hidden && toast.dataset.tone === 'error') hideToast();
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            form.classList.add('was-validated');
            inputs.forEach((input) => {
                if (['email', 'name'].includes(input.name)) {
                    input.setCustomValidity(input.value.trim() ? '' : 'Kolom ini wajib diisi.');
                }
            });
            if (form.dataset.authForm === 'register') validateConfirmation();
            inputs.forEach((input) => input.setAttribute('aria-invalid', String(!input.validity.valid)));
            if (!form.reportValidity()) return;

            if (!submitting) submitAuthForm(form);
        });
    });

    if (!toast.hidden) toastTimeout = window.setTimeout(hideToast, toast.dataset.tone === 'success' ? 4200 : 6500);

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        stopLoading();
        submitting = false;
        document.querySelectorAll('[data-submit]').forEach((button) => { button.disabled = false; });
    });

    document.querySelector('.forgot-password').addEventListener('click', () => {
        hideToast();
        forgotDialog.showModal();
    });
    forgotDialog.querySelectorAll('.dialog-close, .dialog-back').forEach((button) => {
        button.addEventListener('click', () => forgotDialog.close());
    });
    forgotDialog.addEventListener('click', (event) => {
        if (event.target !== forgotDialog) return;
        const bounds = forgotDialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) forgotDialog.close();
    });
    document.querySelector('.toast__close').addEventListener('click', hideToast);
})();
