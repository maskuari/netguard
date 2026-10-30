(() => {
    'use strict';
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
                panel.querySelector('[data-evaluation-result-note]').textContent = correct === total ? 'Evaluasi selesai. Progres chapter tersimpan di akun.' : 'Masih ada ' + summary.incorrectAnswers + ' jawaban salah. Periksa pilihanmu, lalu kirim jawaban lagi.';
            });
            window.NetGuardAudio?.play(correct === total ? 'complete' : 'error');
            return summary;
        },
        showError(message) {
            window.NetGuardAudio?.play('error');
            const feedback = document.querySelector('[data-evaluation-feedback]');
            feedback.textContent = message;
            feedback.hidden = false;
            document.querySelector('[data-quiz-dialog]').scrollTo({ top: 0, behavior: 'auto' });
        },
        clear() {
            document.querySelector('[data-evaluation-result="quiz"]').hidden = true;
            document.querySelector('[data-evaluation-feedback]').hidden = true;
        },
    };
})();
