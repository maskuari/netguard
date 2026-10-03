<div class="music-settings">
    <p class="music-settings__heading">Pengaturan</p>
    <button class="music-setting" type="button" role="switch" aria-checked="true" aria-label="Musik latar" data-music-toggle>
        <span class="music-setting__icon" aria-hidden="true">
            <svg class="icon" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/><path class="music-setting__mute" d="m3 3 18 18"/></svg>
        </span>
        <span class="music-setting__copy"><span>Musik latar</span><span class="music-setting__state" data-music-state>Nyala</span></span>
        <span class="music-setting__switch" aria-hidden="true"></span>
    </button>
    <div class="music-volume">
        <label class="music-volume__label" for="music-volume">Volume <output for="music-volume" data-music-volume-output>70%</output></label>
        <input id="music-volume" class="music-volume__slider" type="range" min="0" max="100" step="1" value="70" aria-label="Volume musik latar" data-music-volume>
    </div>
    <p class="music-settings__feedback" role="status" aria-live="polite" data-music-feedback hidden></p>
</div>
