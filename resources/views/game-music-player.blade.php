<audio data-game-music data-user-id="{{ auth()->id() }}" preload="metadata" loop hidden>
    <source src="{{ asset('music/Hardline_Override.mp3') }}?v={{ filemtime(public_path('music/Hardline_Override.mp3')) }}" type="audio/mpeg">
</audio>
<script src="{{ asset('js/game-music.js') }}?v={{ filemtime(public_path('js/game-music.js')) }}" defer></script>
