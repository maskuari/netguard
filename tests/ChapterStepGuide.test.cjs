const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-step-guide.js'), 'utf8');
const setup = (steps) => {
    const makeNode = () => {
        const classes = new Set();
        return {
            children: [], dataset: {}, attributes: {}, textContent: '',
            get firstElementChild() { return this.children[0]; },
            get className() { return [...classes].join(' '); },
            set className(value) { classes.clear(); value.split(' ').filter(Boolean).forEach((name) => classes.add(name)); },
            classList: { contains: (name) => classes.has(name), add: (name) => classes.add(name), remove: (name) => classes.delete(name), toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } },
            append(...children) { this.children.push(...children); },
            replaceChildren(...children) { this.children = children; },
            setAttribute(name, value) { this.attributes[name] = value; },
            contains(node) { return node === this || this.children.some((child) => child.contains(node)); },
        };
    };
    const list = makeNode();
    const timers = new Map();
    const handlers = new Map();
    let sequence = 0;
    let key = 'mission';
    let mutation;
    let disconnected = false;
    const root = { addEventListener(name, handler) { handlers.set(name, handler); }, removeEventListener(name) { handlers.delete(name); } };
    const context = { window: { setTimeout(callback) { timers.set(++sequence, callback); return sequence; }, clearTimeout(id) { timers.delete(id); } }, document: { body: root, createElement: makeNode }, MutationObserver: class { constructor(callback) { mutation = callback; } observe() {} disconnect() { disconnected = true; } }, queueMicrotask };
    vm.runInNewContext(source, context);
    const guide = context.window.NetGuardStepGuide.create({ list, root, getKey: () => key, getPlan: () => steps });
    return {
        guide, list, timers, handlers,
        setKey(value) { key = value; },
        advance() { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); },
        mutate(target) { mutation([{ target }]); },
        disconnected: () => disconnected,
    };
};

test('only the current step and last completed step appear; completion is green before automatic advance', () => {
    const steps = [['Open menu', false], ['Fill field', false], ['Save', false]];
    const game = setup(steps);
    assert.equal(game.list.children.length, 1);
    assert.equal(game.list.children[0].attributes['aria-current'], 'step');
    steps[0][1] = true; game.guide.refresh();
    assert.equal(game.list.children[0].classList.contains('is-done'), true);
    assert.equal(game.list.children[0].children[0].textContent, '✓ Langkah 1 / 3');
    assert.equal(game.timers.size, 1);
    game.advance();
    assert.equal(game.list.children.length, 2);
    assert.equal(game.list.children[0].children[1].textContent, 'Selesai');
    assert.equal(game.list.children[1].children[1].textContent, 'Fill field');
    steps[1][1] = true; game.guide.refresh(); game.advance();
    assert.equal(game.list.children.length, 2);
    assert.equal(game.list.children[1].children[1].textContent, 'Save');
});

test('wrong or reverted input keeps the step active and cancels pending advancement', () => {
    const steps = [['Fill field', false], ['Save', false]];
    const game = setup(steps);
    steps[0][1] = true; game.guide.refresh();
    steps[0][1] = false; game.guide.refresh();
    assert.equal(game.timers.size, 0);
    assert.equal(game.list.children[0].classList.contains('is-done'), false);
    assert.equal(game.list.children[0].children[1].textContent, 'Fill field');
});

test('completing a later step cannot skip an unfinished earlier step', () => {
    const steps = [['Open', false], ['Configure', false], ['Save', true]];
    const game = setup(steps);
    game.guide.refresh();
    assert.equal(game.list.children[0].children[1].textContent, 'Open');
    assert.equal(game.timers.size, 0);
});

test('previous-step reset changes the key and prevents callbacks from advancing another mission', () => {
    const steps = [['Open', false], ['Save', false]];
    const game = setup(steps);
    steps[0][1] = true; game.guide.refresh();
    const staleCallback = [...game.timers.values()][0];
    game.setKey('other-mission'); steps[0][1] = false; game.guide.refresh();
    staleCallback();
    assert.equal(game.list.children[0].children[1].textContent, 'Open');
    assert.equal(game.timers.size, 0);
    assert.equal(game.list.children[0].dataset.guideKey, 'other-mission:0');
});

test('restored progress shows the next unfinished task without replaying the entire list', () => {
    const game = setup([['Open', true], ['Configure', true], ['Save', false], ['Check', false]]);
    assert.equal(game.list.children.length, 2);
    assert.equal(game.list.children[1].children[0].textContent, 'Langkah 3 / 4');
    assert.equal(game.list.children[1].children[1].textContent, 'Save');
});

test('DOM changes and input update steps without polling or an observer loop', async () => {
    const steps = [['Wait for asynchronous result', false], ['Next', false]];
    const game = setup(steps);
    steps[0][1] = true;
    game.mutate({}); await Promise.resolve();
    assert.equal(game.list.children[0].classList.contains('is-done'), true);
    const firstCard = game.list.children[0];
    game.mutate(firstCard); await Promise.resolve();
    assert.equal(game.list.children[0], firstCard);
    game.guide.destroy();
    assert.equal(game.disconnected(), true);
    assert.equal(game.handlers.size, 0);
    assert.equal(game.timers.size, 0);
});
