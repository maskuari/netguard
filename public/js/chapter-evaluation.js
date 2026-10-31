(() => {
    'use strict';
    const quizForm = document.querySelector('[data-quiz-form]');
    const submitButton = document.querySelector('[data-submit-quiz]');
    let retryButton = null;
    const setReviewMode = (incorrect) => {
        if (!quizForm) return;
        quizForm.dataset.reviewLocked = 'true';
        quizForm.querySelectorAll('input[type="radio"]').forEach((input) => { input.disabled = true; });
        if (submitButton) submitButton.hidden = true;
        if (!retryButton) {
            retryButton = document.createElement('button');
            retryButton.type = 'button';
            retryButton.className = 'chapter-evaluation-primary';
            retryButton.textContent = 'Jawab ulang';
            retryButton.dataset.retryQuiz = '';
            retryButton.addEventListener('click', () => {
                delete quizForm.dataset.reviewLocked;
                quizForm.reset();
                quizForm.querySelectorAll('input[type="radio"]').forEach((input) => { input.disabled = false; });
                retryButton.hidden = true;
                if (submitButton) { submitButton.hidden = false; submitButton.disabled = false; }
                window.NetGuardEvaluation.clear();
                quizForm.dispatchEvent(new Event('change', { bubbles: true }));
                document.querySelector('[data-quiz-dialog]')?.scrollTo({ top: 0, behavior: 'auto' });
                quizForm.querySelector('input[type="radio"]')?.focus({ preventScroll: true });
            });
            quizForm.append(retryButton);
        }
        retryButton.hidden = !incorrect;
    };
    quizForm?.addEventListener('submit', (event) => {
        if (quizForm.dataset.reviewLocked !== 'true') return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);
    window.NetGuardEvaluation = {
        showResult(result) {
            const correct = result?.correctAnswers ?? result?.score;
            const total = result?.totalQuestions ?? 5;
            if (!Number.isInteger(correct) || !Number.isInteger(total) || correct < 0 || correct > total) return null;
            const summary = { correctAnswers: correct, incorrectAnswers: total - correct, totalQuestions: total, score: correct };
            document.querySelectorAll('[data-evaluation-result]').forEach((panel) => {
                panel.hidden = false;
                panel.querySelector('[data-correct-count]').textContent = String(correct);
                panel.querySelector('[data-incorrect-count]').textContent = String(summary.incorrectAnswers);
                panel.querySelector('[data-total-count]').textContent = String(total);
                panel.querySelector('[data-evaluation-result-title]').textContent = correct === total ? 'Semua jawaban benar!' : 'Hasil percobaan ini';
                panel.querySelector('[data-evaluation-result-note]').textContent = correct === total
                    ? 'Evaluasi selesai. Progres chapter tersimpan di akun.'
                    : Array.isArray(result?.correctOptionIndexes)
                        ? 'Jawaban benar ditandai hijau dan pilihanmu yang salah ditandai merah. Pilihan dikunci. Klik Jawab ulang untuk memulai percobaan baru.'
                        : 'Masih ada ' + summary.incorrectAnswers + ' jawaban salah. Pilihan dikunci. Klik Jawab ulang untuk mencoba lagi.';
            });
            this.markCorrectOptions(result?.correctOptionIndexes);
            setReviewMode(correct < total);
            window.NetGuardAudio?.play(correct === total ? 'complete' : 'error');
            return summary;
        },
        markCorrectOptions(correctOptionIndexes) {
            if (!Array.isArray(correctOptionIndexes)) return;
            const fieldsets = document.querySelectorAll('[data-quiz-form] fieldset');
            fieldsets.forEach((fieldset, questionIndex) => {
                const correctOptionIndex = correctOptionIndexes[questionIndex];
                fieldset.querySelectorAll('label').forEach((label) => {
                    label.classList.remove('is-answer-correct', 'is-answer-incorrect');
                    label.querySelector('.chapter-evaluation-option-indicator')?.remove();
                    const input = label.querySelector('input');
                    if (!input) return;
                    const isCorrect = Number(input.value) === Number(correctOptionIndex);
                    const isSelected = input.checked;
                    if (isCorrect) label.classList.add('is-answer-correct');
                    if (isSelected && !isCorrect) label.classList.add('is-answer-incorrect');
                    if (!isCorrect && !isSelected) return;
                    const indicator = document.createElement('span');
                    indicator.className = 'chapter-evaluation-option-indicator';
                    indicator.textContent = isCorrect ? 'Jawaban benar' : 'Pilihanmu';
                    label.append(indicator);
                });
            });
        },
        showError(message) {
            window.NetGuardAudio?.play('error');
            const feedback = document.querySelector('[data-evaluation-feedback]');
            feedback.textContent = message;
            feedback.hidden = false;
            document.querySelector('[data-quiz-dialog]').scrollTo({ top: 0, behavior: 'auto' });
        },
        clear() {
            if (quizForm?.dataset.reviewLocked === 'true') return;
            document.querySelector('[data-evaluation-result="quiz"]').hidden = true;
            document.querySelector('[data-evaluation-feedback]').hidden = true;
            document.querySelectorAll('[data-quiz-form] label').forEach((label) => {
                label.classList.remove('is-answer-correct', 'is-answer-incorrect');
                label.querySelector('.chapter-evaluation-option-indicator')?.remove();
            });
        },
    };
})();
