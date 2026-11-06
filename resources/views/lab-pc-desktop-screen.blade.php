@php($isChapterFiveDesktop = $chapterFiveDesktop ?? false)
<section class="lab-pc-desktop {{ $isChapterFiveDesktop ? 'ch5-client-workspace' : '' }}" data-pc-desktop @if ($isChapterFiveDesktop) data-client-workspace @endif aria-label="Desktop PC lab" hidden>
    <div class="lab-pc-apps">
        <button class="lab-pc-shortcut" type="button" data-pc-open-winbox @if ($isChapterFiveDesktop) data-back-winbox @endif><img src="{{ asset('images/logo/winbox.png') }}" alt="">WinBox</button>
        <button class="lab-pc-shortcut" type="button" data-open-client-cmd="local" @if ($isChapterFiveDesktop) data-launch-cmd @endif><span aria-hidden="true">C:\_</span>Command Prompt</button>
    </div>
    <section class="lab-pc-command" data-client-cmd="local" @if ($isChapterFiveDesktop) data-client-terminal @endif aria-label="Command Prompt PC lab" hidden>
        <header><span @if ($isChapterFiveDesktop) data-terminal-title @endif>Command Prompt — PC lab</span><button type="button" data-close-client-cmd="local" @if ($isChapterFiveDesktop) data-close-cmd @endif aria-label="Tutup Command Prompt">×</button></header>
        <div class="lab-pc-console"><pre data-client-terminal="local" @if ($isChapterFiveDesktop) data-terminal-output @endif aria-live="polite">Microsoft Windows [Version 10.0.19045]
</pre><form data-client-command-form="local" @if ($isChapterFiveDesktop) data-terminal-form @endif><label><span>C:\Users\Lab&gt;</span><input data-client-command="local" @if ($isChapterFiveDesktop) data-terminal-input @endif autocomplete="off" spellcheck="false" aria-label="Perintah Command Prompt PC lab"></label></form></div>
    </section>
</section>
