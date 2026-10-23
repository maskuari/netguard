<audio data-game-music data-user-id="{{ auth()->id() }}" data-default-track="Managed_Flow" preload="metadata" loop hidden src="{{ asset('music/Managed_Flow.mp3') }}?v={{ filemtime(public_path('music/Managed_Flow.mp3')) }}"></audio>
<script src="{{ asset('js/game-music.js') }}?v={{ filemtime(public_path('js/game-music.js')) }}" defer></script>
