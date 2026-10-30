<section class="lab-pc-desktop" data-pc-desktop aria-label="Desktop PC lab" hidden>
    <div class="lab-pc-apps">
        <button class="lab-pc-shortcut" type="button" data-pc-open-winbox><img src="{{ asset('images/logo/winbox.png') }}" alt="">WinBox</button>
        <button class="lab-pc-shortcut" type="button" data-open-client-cmd="local"><span aria-hidden="true">C:\_</span>Command Prompt</button>
    </div>
    <section class="lab-pc-command" data-client-cmd="local" aria-label="Command Prompt PC lab" hidden>
        <header><span>Command Prompt — PC lab</span><button type="button" data-close-client-cmd="local" aria-label="Tutup Command Prompt">×</button></header>
        <div class="lab-pc-console"><pre data-client-terminal="local" aria-live="polite">Microsoft Windows [Version 10.0.19045]
</pre><form data-client-command-form="local"><label><span>C:\Users\Lab&gt;</span><input data-client-command="local" autocomplete="off" spellcheck="false" aria-label="Perintah Command Prompt PC lab"></label></form></div>
    </section>
</section>
<nav class="lab-pc-toolbar" data-pc-toolbar aria-label="Taskbar Windows PC lab" hidden>
    <button type="button" data-pc-home aria-label="Tampilkan desktop PC" title="Tampilkan desktop PC"><span class="lab-pc-start-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Desktop PC</span></button>
    <button type="button" data-pc-task-winbox aria-label="Buka atau pulihkan WinBox" title="WinBox"><img src="{{ asset('images/logo/winbox.png') }}" alt=""><span>WinBox</span></button>
    <button type="button" data-open-client-cmd="local" data-pc-task-cmd aria-label="Buka atau pulihkan Command Prompt" title="Command Prompt"><span class="lab-pc-task-cmd-icon" aria-hidden="true">&gt;_</span><span>CMD</span></button>
    <span class="lab-pc-tray"><span data-client-busy="local" role="status"></span><span>Lab TKJ <small>Ethernet · ether3-local</small></span></span>
</nav>
