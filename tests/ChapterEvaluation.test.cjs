const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const boot = (hasPracticeNotice = true) => {
    const notice = { hidden: true };
    const context = {
        window: {},
        document: {
            querySelector: (selector) => selector === '[data-practice-unlocked]' && hasPracticeNotice ? notice : null,
            querySelectorAll: () => [],
        },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/chapter-evaluation.js'), 'utf8'), context);

    return { evaluation: context.window.NetGuardEvaluation, notice };
};

test('Practice opening announcement appears only for a perfect result that newly unlocks the mode', () => {
    const game = boot();
    assert.equal(game.notice.hidden, true);
    game.evaluation.showResult({ correctAnswers: 5, totalQuestions: 5, practiceUnlockedNow: true });
    assert.equal(game.notice.hidden, false);
    game.evaluation.showResult({ correctAnswers: 5, totalQuestions: 5, practiceUnlockedNow: false });
    assert.equal(game.notice.hidden, true);
    game.evaluation.showResult({ correctAnswers: 3, totalQuestions: 5, practiceUnlockedNow: true });
    assert.equal(game.notice.hidden, true);
});

test('restoring chapter results and other chapters never repeat the Practice announcement', () => {
    const game = boot();
    game.evaluation.showResult({ correctAnswers: 5, totalQuestions: 5 });
    assert.equal(game.notice.hidden, true);
    assert.equal(boot(false).evaluation.showResult({ correctAnswers: 5, totalQuestions: 5 }).score, 5);
});
