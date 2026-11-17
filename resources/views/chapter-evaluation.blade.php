<dialog class="chapter-evaluation-dialog chapter-exam-screen" data-quiz-dialog aria-labelledby="chapter-quiz-title">
    <button type="button" class="chapter-evaluation-close" data-close-quiz aria-label="Tutup evaluasi">×</button>
    <header class="chapter-exam-header">
        <div class="chapter-exam-brand"><img src="{{ asset('images/logo/logo.png') }}" alt="" width="42" height="42"><div><span class="chapter-evaluation-kicker">EVALUASI PEMAHAMAN · CHAPTER {{ str_pad((string) $chapterNumber, 2, '0', STR_PAD_LEFT) }}</span><h2 id="chapter-quiz-title">{{ $quizTitle }}</h2></div></div>
        <span class="chapter-exam-badge">5 soal pilihan ganda</span>
    </header>
    <p class="chapter-exam-instructions">Bacalah setiap soal dengan teliti, lalu pilih satu jawaban yang paling tepat.</p>
    @include('chapter-evaluation-result', ['resultContext' => 'quiz'])
    <p class="chapter-evaluation-feedback" data-evaluation-feedback role="alert" hidden></p>
    <form data-quiz-form>
        @foreach ($questions as $question)
            <fieldset><legend><b>{{ $loop->iteration }}.</b> {{ $question['question'] }}</legend><div>@foreach ($question['options'] as $option)<label><input type="radio" name="answer-{{ $loop->parent->iteration }}" value="{{ $loop->index }}" required><span>{{ $option }}</span></label>@endforeach</div></fieldset>
        @endforeach
    </form>
    <section class="chapter-exam-finish" data-quiz-finish aria-labelledby="chapter-finish-title" hidden>
    <img src="{{ asset($teacherPath.'mantap.png') }}" alt="Pak Amat memberi apresiasi">
    <span class="chapter-evaluation-kicker">PAK AMAT · CHAPTER {{ str_pad((string) $chapterNumber, 2, '0', STR_PAD_LEFT) }} SELESAI</span>
    <h2 id="chapter-finish-title">{{ $finishTitle }}</h2>
    <p>{{ $finishDescription }}</p>
    <div class="chapter-exam-score" data-quiz-score aria-label="Hasil evaluasi">
        <div class="chapter-exam-score__grade"><strong data-score-percent>0</strong><span>/ 100</span><small>Skor evaluasi</small></div>
        <div class="chapter-exam-score__counts"><span><strong data-score-correct>0</strong> jawaban benar</span><span><strong data-score-incorrect>0</strong> jawaban salah</span></div>
    </div>
    @if ($chapterNumber === 3)
        <section class="chapter-practice-unlocked" data-practice-unlocked hidden role="status" aria-live="polite" aria-labelledby="practice-unlocked-title">
            <div><span class="chapter-practice-unlocked__badge">✦ MODE BARU TERBUKA</span><h3 id="practice-unlocked-title">Practice Mode siap dimainkan!</h3><p>Tiga chapter pertama sudah kamu selesaikan. Sekarang uji kemampuanmu lewat satu studi kasus acak dengan tantangan konfigurasi baru.</p><a class="chapter-evaluation-primary" href="{{ route('practice') }}">Coba Practice Mode <span aria-hidden="true">→</span></a></div>
            <img src="{{ asset('images/asset/practice-target-v2.webp') }}" alt="" width="110" height="110" decoding="async">
        </section>
    @endif
    <div class="chapter-evaluation-actions"><a class="chapter-evaluation-primary" href="{{ $chapterNumber < 5 ? route([2 => 'chapter.two', 3 => 'chapter.three', 4 => 'chapter.four', 5 => 'chapter.five'][$chapterNumber + 1]) : route('adventure') }}">{{ $chapterNumber < 5 ? 'Lanjut ke Chapter '.($chapterNumber + 1).' →' : 'Kembali ke peta chapter →' }}</a><button type="button" class="chapter-evaluation-secondary" data-close-finish>Kembali ke WinBox</button></div>
    </section>
</dialog>
<dialog data-finish-dialog hidden></dialog>
