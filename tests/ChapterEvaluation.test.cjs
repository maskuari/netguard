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

const bootExam = () => {
    class Node {
        constructor() { this.children = []; this.dataset = {}; this.listeners = {}; this.attributes = {}; this.hidden = false; this.disabled = false; this.checked = false; this.classes = new Set(); this.classList = { add: (name) => this.classes.add(name), remove: (name) => this.classes.delete(name), toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name) }; }
        append(...nodes) { nodes.forEach((node) => { if (node.parent) node.parent.children = node.parent.children.filter((child) => child !== node); node.parent = this; this.children.push(node); }); }
        prepend(...nodes) { this.append(...nodes); this.children = [...nodes, ...this.children.filter((node) => !nodes.includes(node))]; }
        setAttribute(name, value) { this.attributes[name] = value; }
        addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
        emit(name, target = this) { (this.listeners[name] || []).forEach((callback) => callback({ target, preventDefault() { this.prevented = true; }, stopImmediatePropagation() {} })); }
        contains(target) { return this === target || this.children.some((child) => child.contains(target)); }
        querySelectorAll(selector) { const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll('*')]); return selector === '*' ? descendants : descendants.filter((node) => selector === 'input[type="radio"]' ? node.kind === 'input' : node.kind === selector); }
        querySelector(selector) { return selector === 'input:checked' ? this.querySelectorAll('input').find((node) => node.checked) : this.querySelectorAll(selector)[0]; }
    }
    const form = new Node(), submit = new Node();
    const questions = Array.from({ length: 5 }, () => { const question = new Node(); question.kind = 'fieldset'; const options = new Node(); options.kind = 'div'; question.append(options); for (let index = 0; index < 4; index++) { const label = new Node(); label.kind = 'label'; const input = new Node(); input.kind = 'input'; input.value = String(index); label.append(input); options.append(label); } return question; });
    form.append(...questions, submit);
    const document = { querySelector: (selector) => selector === '[data-quiz-form]' ? form : selector === '[data-submit-quiz]' ? submit : null, querySelectorAll: () => [], createElement: () => new Node() };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/chapter-evaluation.js'), 'utf8'), { document, window: {}, queueMicrotask });
    const paper = form.children[0], sidebar = form.children[1], numbers = sidebar.children[2].children;
    return { form, submit, questions, numbers };
};

test('exam marks selected answers green immediately and allows submission only when all are answered', () => {
    const exam = bootExam();
    assert.equal(exam.submit.hidden, true);
    assert.equal(exam.questions.filter((question) => !question.hidden).length, 1);
    exam.numbers[3].emit('click'); assert.equal(exam.questions[3].hidden, false);
    for (let index = 0; index < 5; index++) {
        exam.numbers[index].emit('click');
        const input = exam.questions[index].querySelectorAll('input')[0]; input.checked = true;
        exam.form.emit('change', input);
        assert.equal(exam.submit.hidden, index < 4);
        assert.equal(exam.numbers[index].classes.has('is-confirmed'), true);
    }
    assert.equal(exam.submit.hidden, false);
    const input = exam.questions[2].querySelectorAll('input')[0]; exam.form.emit('change', input);
    assert.equal(exam.submit.hidden, false); assert.equal(exam.numbers[2].classes.has('is-confirmed'), true);
    input.checked = false; exam.form.emit('change', input);
    assert.equal(exam.submit.hidden, true); assert.equal(exam.numbers[2].classes.has('is-confirmed'), false);
    exam.questions.forEach((question) => assert.deepEqual(question.querySelectorAll('input').map((node) => node.value).sort(), ['0', '1', '2', '3']));
});
