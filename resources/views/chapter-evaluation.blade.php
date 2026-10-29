<dialog class="chapter-evaluation-dialog" data-quiz-dialog aria-labelledby="chapter-quiz-title">
    <button type="button" class="chapter-evaluation-close" data-close-quiz aria-label="Tutup evaluasi">×</button>
    <span class="chapter-evaluation-kicker">EVALUASI PEMAHAMAN · CHAPTER {{ str_pad((string) $chapterNumber, 2, '0', STR_PAD_LEFT) }}</span>
    <h2 id="chapter-quiz-title">{{ $quizTitle }}</h2>
    <p>Jawab lima soal berdasarkan materi modul. Semua jawaban harus tepat agar progres Chapter {{ $chapterNumber }} tersimpan di akun.</p>
    @include('chapter-evaluation-result', ['resultContext' => 'quiz'])
    <p class="chapter-evaluation-feedback" data-evaluation-feedback role="alert" hidden></p>
    <form data-quiz-form>
        @foreach ($questions as $question)
            <fieldset><legend><b>{{ $loop->iteration }}.</b> {{ $question['question'] }}</legend><div>@foreach ($question['options'] as $option)<label><input type="radio" name="answer-{{ $loop->parent->iteration }}" value="{{ $loop->index }}" required><span>{{ $option }}</span></label>@endforeach</div></fieldset>
        @endforeach
        <button class="chapter-evaluation-primary" type="submit" data-submit-quiz>Simpan hasil Chapter {{ $chapterNumber }}</button>
    </form>
</dialog>
<dialog class="chapter-evaluation-dialog chapter-evaluation-finish" data-finish-dialog aria-labelledby="chapter-finish-title">
    <img src="{{ asset($teacherPath.'mantap.png') }}" alt="Pak Amat memberi apresiasi">
    <span class="chapter-evaluation-kicker">PAK AMAT · CHAPTER {{ str_pad((string) $chapterNumber, 2, '0', STR_PAD_LEFT) }} SELESAI</span>
    <h2 id="chapter-finish-title">{{ $finishTitle }}</h2>
    <p>{{ $finishDescription }}</p>
    @include('chapter-evaluation-result', ['resultContext' => 'finish'])
    <div class="chapter-evaluation-actions"><a class="chapter-evaluation-primary" href="{{ route('adventure') }}#chapter-{{ str_pad((string) ($chapterNumber + 1), 2, '0', STR_PAD_LEFT) }}">Lihat peta chapter →</a><button type="button" class="chapter-evaluation-secondary" data-close-finish>Kembali ke WinBox</button></div>
</dialog>
