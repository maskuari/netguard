<div class="routeros__submenu" @if ($systemChapter === 1) data-system-menu @else data-ch2-submenu="system" @endif hidden aria-label="System">
    @foreach (['Certificates', 'Clock', 'Console', 'Health', 'History', 'Identity', 'LEDs', 'License', 'Logging', 'Note', 'NTP Client', 'NTP Server', 'Packages', 'Password', 'Ports', 'Reboot', 'Reset Configuration', 'Resources', 'RouterBOARD', 'Scheduler', 'Scripts', 'Shutdown', 'Special Login', 'Users', 'Watchdog'] as $systemItem)
        @if ($systemItem === 'Identity')
            <button type="button" @if ($systemChapter === 1) data-config-nav="identity" @else data-open-window="identity" @endif><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#identity"></use></svg>Identity</button>
        @else
            <span><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ in_array($systemItem, ['History', 'Logging', 'Note'], true) ? 'log' : 'system' }}"></use></svg>{{ $systemItem }}</span>
        @endif
    @endforeach
</div>
