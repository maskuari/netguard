(() => {
    'use strict';
    const quizForm = document.querySelector('[data-quiz-form]');
    const finishPanel = document.querySelector('[data-quiz-finish]');
    let submitButton = null;
    let retryButton = null;
    const questions = quizForm ? [...quizForm.querySelectorAll('fieldset')] : [];
    const confirmed = new Set();
    let currentQuestion = 0;
    let refreshExam = () => {};
    let shuffleOptions = () => {};
    if (questions.length) {
        quizForm.noValidate = true;
        quizForm.classList.add('chapter-exam');
        const paper = document.createElement('div'); paper.className = 'chapter-exam-paper';
        const sidebar = document.createElement('aside'); sidebar.className = 'chapter-exam-sidebar';
        const title = document.createElement('h3'); title.textContent = 'Nomor soal'; sidebar.append(title);
        const progress = document.createElement('p'); progress.className = 'chapter-exam-progress'; progress.setAttribute('aria-live', 'polite'); sidebar.append(progress);
        const numbers = document.createElement('div'); numbers.className = 'chapter-exam-numbers'; sidebar.append(numbers);
        const navigation = document.createElement('div'); navigation.className = 'chapter-exam-navigation';
        const previous = document.createElement('button'); previous.type = 'button'; previous.className = 'chapter-evaluation-secondary'; previous.textContent = '← Sebelumnya';
        const next = document.createElement('button'); next.type = 'button'; next.className = 'chapter-evaluation-primary'; next.textContent = 'Berikutnya →';
        next.dataset.submitQuiz = ''; submitButton = next;
        navigation.append(previous, next);
        const buttons = questions.map((question, index) => {
            paper.append(question);
            const button = document.createElement('button'); button.type = 'button'; button.textContent = String(index + 1); button.setAttribute('aria-label', 'Soal ' + (index + 1));
            button.addEventListener('click', () => { currentQuestion = index; refreshExam(); }); numbers.append(button); return button;
        });
        paper.append(navigation);
        quizForm.prepend(paper, sidebar);
        refreshExam = () => {
            const locked = quizForm.dataset.reviewLocked === 'true';
            confirmed.clear();
            questions.forEach((question, index) => { if (question.querySelector('input:checked')) confirmed.add(index); });
            questions.forEach((question, index) => { question.hidden = index !== currentQuestion; });
            buttons.forEach((button, index) => {
                button.classList.toggle('is-confirmed', confirmed.has(index));
                button.setAttribute('aria-current', String(index === currentQuestion));
                button.setAttribute('aria-label', 'Soal ' + (index + 1) + (confirmed.has(index) ? ', sudah dijawab' : ', belum dijawab'));
            });
            progress.textContent = confirmed.size + ' dari ' + questions.length + ' dijawab';
            paper.setAttribute('data-question-number', 'SOAL ' + (currentQuestion + 1) + ' DARI ' + questions.length);
            previous.disabled = currentQuestion === 0;
            next.hidden = locked;
            next.disabled = currentQuestion === questions.length - 1 && confirmed.size !== questions.length;
            next.textContent = currentQuestion === questions.length - 1 ? 'Selesai' : 'Berikutnya →';
        };
        shuffleOptions = () => questions.forEach((question) => {
            const container = question.querySelector('div');
            const labels = [...container.querySelectorAll('label')];
            for (let index = labels.length - 1; index > 0; index--) {
                const swap = Math.floor(Math.random() * (index + 1));
                [labels[index], labels[swap]] = [labels[swap], labels[index]];
            }
            labels.forEach((label) => container.append(label));
        });
        previous.addEventListener('click', () => { currentQuestion = Math.max(0, currentQuestion - 1); refreshExam(); });
        next.addEventListener('click', () => { if (currentQuestion === questions.length - 1) { quizForm.requestSubmit(); return; } currentQuestion++; refreshExam(); });
        quizForm.addEventListener('change', refreshExam);
        quizForm.addEventListener('reset', () => { confirmed.clear(); currentQuestion = 0; queueMicrotask(refreshExam); });
        shuffleOptions(); refreshExam();
    }
    const setReviewMode = (incorrect) => {
        if (!quizForm) return;
        quizForm.dataset.reviewLocked = 'true';
        questions.forEach((question, index) => { if (question.querySelector('input:checked')) confirmed.add(index); });
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
                shuffleOptions(); refreshExam();
                quizForm.dispatchEvent(new Event('change', { bubbles: true }));
                document.querySelector('[data-quiz-dialog]')?.scrollTo({ top: 0, behavior: 'auto' });
                quizForm.querySelector('input[type="radio"]')?.focus({ preventScroll: true });
            });
            quizForm.querySelector('.chapter-exam-navigation')?.append(retryButton);
        }
        retryButton.hidden = !incorrect;
        refreshExam();
    };
    quizForm?.addEventListener('submit', (event) => {
        if (quizForm.dataset.reviewLocked !== 'true' && (!questions.length || confirmed.size === questions.length)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);
    window.NetGuardEvaluation = {
        showResult(result) {
            const correct = result?.correctAnswers ?? result?.score;
            const total = result?.totalQuestions ?? 5;
            if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || correct < 0 || correct > total) return null;
            const summary = { correctAnswers: correct, incorrectAnswers: total - correct, totalQuestions: total, score: correct };
            const scorePanel = document.querySelector('[data-quiz-score]');
            if (scorePanel) {
                scorePanel.querySelector('[data-score-percent]').textContent = String(Math.round(correct / total * 100));
                scorePanel.querySelector('[data-score-correct]').textContent = String(correct);
                scorePanel.querySelector('[data-score-incorrect]').textContent = String(summary.incorrectAnswers);
            }
            const practiceNotice = document.querySelector('[data-practice-unlocked]');
            if (practiceNotice) practiceNotice.hidden = !(correct === total && result?.practiceUnlockedNow === true);
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
        showFinish() {
            if (!finishPanel || !quizForm) return;
            quizForm.hidden = true;
            document.querySelector('[data-evaluation-result="quiz"]').hidden = true;
            document.querySelector('[data-evaluation-feedback]').hidden = true;
            finishPanel.hidden = false;
            const dialog = document.querySelector('[data-quiz-dialog]');
            if (!dialog.open) dialog.showModal();
            dialog.scrollTo({ top: 0, behavior: 'auto' });
        },
        replay() {
            if (!quizForm) return;
            finishPanel.hidden = true;
            quizForm.hidden = false;
            delete quizForm.dataset.reviewLocked;
            quizForm.querySelectorAll('input[type="radio"]').forEach((input) => { input.disabled = false; });
            quizForm.reset();
            if (retryButton) retryButton.hidden = true;
            this.clear(); shuffleOptions(); refreshExam();
            if (submitButton) submitButton.disabled = false;
            const dialog = document.querySelector('[data-quiz-dialog]');
            if (!dialog.open) dialog.showModal();
            dialog.scrollTo({ top: 0, behavior: 'auto' });
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
