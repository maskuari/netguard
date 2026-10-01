(() => {
    'use strict';

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nativeTransitions = 'CSSViewTransitionRule' in window && 'onpagereveal' in window;
    const storageKey = 'netguard-page-transition';
    let leaving = false;
    let navigationTimer;
    let entryTimer;

    const resetPage = () => {
        window.clearTimeout(navigationTimer);
        window.clearTimeout(entryTimer);
        root.classList.remove('page-exiting', 'page-entering', 'page-transitioning');
        delete root.dataset.pageDestination;
        const scene = document.querySelector('.academy-scene');
        if (scene) scene.inert = false;
        document.querySelectorAll('[data-page-link][aria-busy], [data-submit][aria-busy]').forEach((element) => element.removeAttribute('aria-busy'));
        leaving = false;
    };

    // Run in the head so returning pages never paint a stale exit state.
    try {
        const entry = JSON.parse(window.sessionStorage.getItem(storageKey) || 'null');
        window.sessionStorage.removeItem(storageKey);
        if (entry && entry.path === window.location.pathname + window.location.search
            && Date.now() - entry.time < 10000 && !reducedMotion.matches && !nativeTransitions) {
            root.classList.add('page-arrived', 'page-entering');
        }
    } catch {
        // Navigation remains available when storage is disabled.
    }

    window.addEventListener('pageswap', (event) => {
        if (!event.viewTransition) return;
        if (reducedMotion.matches) {
            event.viewTransition.skipTransition();
            return;
        }
        root.classList.add('page-arrived', 'page-transitioning');
        event.viewTransition.finished.then(() => root.classList.remove('page-transitioning'));
    });

    window.addEventListener('pagereveal', (event) => {
        if (!event.viewTransition) return;
        if (reducedMotion.matches) {
            event.viewTransition.skipTransition();
            return;
        }
        resetPage();
        root.classList.add('page-arrived', 'page-transitioning');
        event.viewTransition.finished.then(() => root.classList.remove('page-transitioning'));
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) resetPage();
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (root.classList.contains('page-entering')) {
            entryTimer = window.setTimeout(() => root.classList.remove('page-entering'), 1150);
        }
    }, { once: true });

    const navigate = (href, page, { trigger = null, followLink = false } = {}) => {
        const destination = new URL(href, window.location.href);
        if (destination.origin !== window.location.origin || destination.href === window.location.href) return false;
        if (leaving) return true;

        root.dataset.pageDestination = page;
        if (reducedMotion.matches || nativeTransitions) {
            if (!followLink) window.location.assign(destination.href);
            return false;
        }

        leaving = true;
        root.classList.remove('page-entering');
        root.classList.add('page-arrived', 'page-exiting');
        trigger?.setAttribute('aria-busy', 'true');
        const scene = document.querySelector('.academy-scene');
        if (scene) scene.inert = true;

        try {
            window.sessionStorage.setItem(storageKey, JSON.stringify({
                path: destination.pathname + destination.search,
                time: Date.now(),
            }));
        } catch {
            // The destination's usual reveal is the fallback when storage is unavailable.
        }

        navigationTimer = window.setTimeout(() => window.location.assign(destination.href), 360);
        return true;
    };

    window.NetGuardNavigation = Object.freeze({ navigate });

    document.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest?.('a[data-page-link]');
        if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        if (navigate(link.href, link.dataset.pageLink, { trigger: link, followLink: true })) event.preventDefault();
    });
})();
