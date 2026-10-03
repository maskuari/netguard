<svg class="mode-card__frame" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true">
    <defs>
        <linearGradient id="mode-shell-{{ $theme }}" x2="0" y2="1">
            <stop stop-color="var(--mode-edge)"/>
            <stop offset=".2" stop-color="var(--mode-color)"/>
            <stop offset="1" stop-color="var(--mode-dark)"/>
        </linearGradient>
        <linearGradient id="mode-surface-{{ $theme }}" x2=".2" y2="1">
            <stop stop-color="#fff"/>
            <stop offset=".5" stop-color="var(--mode-light)"/>
            <stop offset="1" stop-color="var(--mode-floor)"/>
        </linearGradient>
        <clipPath id="mode-clip-{{ $theme }}"><path d="M28 46H265L282 22H330L349 46H570L581 59V243L562 261H35L19 246V60Z"/></clipPath>
    </defs>
    <path d="M24 30H253L274 7H337L358 30H574L595 51V250L572 273H29L5 249V53Z" fill="url(#mode-shell-{{ $theme }})" stroke="var(--mode-dark)" stroke-width="4"/>
    <path d="M26 36H257L278 13H333L354 36H571L589 54V247L569 267H32L11 246V56Z" fill="none" stroke="var(--mode-edge)" stroke-width="3"/>
    <path d="M28 46H265L282 22H330L349 46H570L581 59V243L562 261H35L19 246V60Z" fill="url(#mode-surface-{{ $theme }})" stroke="#ffffff" stroke-width="2"/>
    <path d="M281 16H331L350 39 332 62H282L263 39Z" fill="url(#mode-shell-{{ $theme }})" stroke="var(--mode-edge)" stroke-width="2"/>
    <g clip-path="url(#mode-clip-{{ $theme }})">
        <path d="M12 75 253 42 455 280H349ZM378 44 595 126V174Z" fill="#ffffff" opacity=".18"/>
        @if ($theme === 'adventure')
            <path d="m212 238 55-86 34 41 45-61 52 65 33-29 68 87H212Z" fill="var(--mode-color)" opacity=".12"/>
            <path d="m325 217 42-46 16 17 25-19 24 29 21-8 34 51Z" fill="var(--mode-color)" opacity=".12"/>
        @elseif ($theme === 'practice')
            <path d="M251 256v-42h25v-44h18v-40h26v126h13v-62h23v-37h22v99h17v-49h27v-61h26v110h18v-73h23v-42h28v115h20v-42h35v42Z" fill="var(--mode-color)" opacity=".13"/>
        @else
            <path d="m285 174 72-35 74 35H285Zm13 9h120v13H298Zm8 20h14v42h-14Zm27 0h14v42h-14Zm28 0h14v42h-14Zm28 0h14v42h-14Zm-98 43h135v13H291ZM454 258v-52h17v-36h25v-19h20v19h25v88Z" fill="var(--mode-color)" opacity=".15"/>
        @endif
        <path d="M280 265h135l22-21h143M21 64h156l18 18h34" fill="none" stroke="var(--mode-color)" stroke-width="2" opacity=".2"/>
    </g>
    <path d="M40 39h115m203 0h195M32 254h152m237 9h135l16-15" fill="none" stroke="var(--mode-edge)" stroke-width="3" stroke-linecap="round"/>
    <path d="m174 35 7 7m8-7 7 7m8-7 7 7m8-7 7 7m141-7 7 7m8-7 7 7m8-7 7 7" stroke="var(--mode-dark)" stroke-width="3" opacity=".55"/>
</svg>
