(() => {
    'use strict';
    window.NetGuardPcDesktop = {
        create({ onOpenWinbox, onHome = () => {}, onCmd = () => {}, getNetwork = () => null, onError = () => {}, handleCommands = true }) {
            const desktop = document.querySelector('[data-pc-desktop]');
            const toolbar = document.querySelector('[data-pc-toolbar]');
            const host = toolbar.parentElement;
            const cmd = desktop.querySelector('[data-client-cmd]');
            const input = desktop.querySelector('[data-client-command]');
            const output = desktop.querySelector('[data-client-terminal]');
            const append = (text) => { output.textContent = (output.textContent + text).slice(-16000); output.parentElement.scrollTop = output.parentElement.scrollHeight; };
            const setView = (view) => {
                host.dataset.pcView = view;
                const desktopVisible = ['desktop', 'cmd', 'preview'].includes(view);
                const desktopOnly = ['desktop', 'cmd'].includes(view);
                desktop.hidden = !desktopVisible;
                cmd.hidden = view !== 'cmd';
                for (const surface of host.querySelectorAll(':scope > .simulation-monitor, :scope > [data-stage="winbox"], :scope > [data-stage="config"], :scope > [data-stage="pc"]')) surface.inert = desktopOnly;
                document.querySelector('[data-pc-home]').setAttribute('aria-pressed', String(['desktop', 'preview'].includes(view)));
                document.querySelector('[data-pc-task-winbox]').setAttribute('aria-pressed', String(['winbox', 'preview'].includes(view)));
                document.querySelector('[data-pc-task-cmd]').setAttribute('aria-pressed', String(view === 'cmd'));
            };
            const showDesktop = () => { setView('desktop'); onHome(); };
            const showCommand = () => { setView('cmd'); input.focus(); onCmd(); };
            const showWinbox = () => { setView('winbox'); onOpenWinbox(); };
            document.querySelector('[data-pc-home]').addEventListener('click', showDesktop);
            document.querySelector('[data-pc-open-winbox]').addEventListener('click', showWinbox);
            document.querySelector('[data-pc-task-winbox]').addEventListener('click', showWinbox);
            document.querySelectorAll('[data-open-client-cmd]').forEach((button) => button.addEventListener('click', showCommand));
            desktop.querySelector('[data-close-client-cmd]').addEventListener('click', showDesktop);
            if (handleCommands) desktop.querySelector('form').addEventListener('submit', (event) => {
                event.preventDefault();
                const command = input.value.trim();
                if (!command) return;
                input.value = '';
                append('C:\\Users\\Lab> ' + command + '\n');
                if (/^cls$/i.test(command)) { output.textContent = ''; return; }
                if (/^ipconfig(?:\s+\/all)?$/i.test(command)) {
                    const network = getNetwork();
                    append('Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : ' + (network?.address || '0.0.0.0') + '\n   Subnet Mask . . . . . . . . . . . : ' + (network ? '255.255.255.0' : '0.0.0.0') + '\n   Default Gateway . . . . . . . . . : ' + (network?.gateway || '0.0.0.0') + '\n\n');
                    return;
                }
                append('Pengujian internet belum tersedia pada tahap ini.\n');
                onError('Saat ini kita menyiapkan jaringan lokal. Kamu bisa mengetik ipconfig /all untuk melihat IP komputer. Pengujian ping internet dilakukan setelah DNS dan NAT router selesai disiapkan.');
            });
            setView('winbox');
            return {
                showDesktop, showCommand, showWinbox,
                setNetwork(online) {
                    const icon = document.querySelector('[data-pc-network]');
                    const description = online ? 'Ethernet tersambung · Akses internet tersedia' : 'Ethernet tersambung · Tidak ada akses internet';
                    icon.classList.toggle('is-online', Boolean(online));
                    icon.setAttribute('aria-label', description);
                    icon.setAttribute('title', description);
                },
                setAvailable(available) { toolbar.hidden = !available; host.dataset.pcAvailable = String(available); if (!available) setView('winbox'); },
                hideDesktop() { setView('winbox'); },
                showPreview() { setView('preview'); },
            };
        },
    };
    window.NetGuardTerminal = {
        stream({ text, append, isCurrent = () => true, onComplete = () => {}, interval = 700 }) {
            const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
            let index = 0;
            const next = () => {
                if (!isCurrent()) return;
                if (index === lines.length) { onComplete(); return; }
                append(lines[index++]);
                window.setTimeout(next, interval);
            };
            next();
        },
    };
})();
