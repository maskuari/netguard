(() => {
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || event.defaultPrevented || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

        const target = event.target;
        if (!(target instanceof Element) || !target.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select')) return;

        const windowPanel = target.closest('.winbox-child, .practice-window');
        if (!windowPanel || windowPanel.closest('[hidden], [inert]') || windowPanel.getAttribute('aria-hidden') === 'true') return;

        const buttons = windowPanel.querySelectorAll('button');
        const okButton = Array.from(buttons).find((button) => button.textContent.trim() === 'OK' && !button.disabled && !button.closest('[hidden], [inert]'));
        if (!okButton) return;

        event.preventDefault();
        okButton.click();
    });
})();
