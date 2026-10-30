<audio data-game-music data-user-id="{{ auth()->id() }}" data-default-track="Managed_Flow" preload="metadata" loop hidden src="{{ asset('music/Managed_Flow.mp3') }}?v={{ filemtime(public_path('music/Managed_Flow.mp3')) }}"></audio>
<script src="{{ asset('js/game-music.js') }}?v={{ filemtime(public_path('js/game-music.js')) }}" defer></script>

<span data-game-sfx data-user-id="{{ auth()->id() }}" data-sound-base="{{ asset('audio/sfx') }}" hidden></span>
<script src="{{ asset('js/game-sound-effects.js') }}?v={{ filemtime(public_path('js/game-sound-effects.js')) }}" defer></script>
