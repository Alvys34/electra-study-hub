// lesson-template.js: copy to src/lesson/<unitId>.js, rename the export, fill it in.
// Full guide: docs/LESSON_AUTHORING.md · Reference lesson: src/lesson/unit2a.js
// [[term]] = highlighted key term. HTML (<b>, <br>, <ul><li>, <sub>) is allowed in text fields.

import { FIG } from './visuals.js';
// import { Screen } from '../game/engine/Parts.js';   // only if a step uses the bench monitor

// ---- small helpers (same as unit2a.js) ----
const lit = s => Math.abs(s?.I || 0) > 0.08;
const across = (g, m, t1, t2) => (g.joined(m.T('red'), t1) && g.joined(m.T('com'), t2)) || (g.joined(m.T('red'), t2) && g.joined(m.T('com'), t1));
const CAM = { pos: [0, 6.0, 7.2], target: [0, 0.35, 0.1] };

export const LESSON_XX = {
  id: 'unitXX',            // unit1a … unit6
  code: 'XX',
  title: 'Unit title',
  color: '#38bdf8',        // unit accent colour
  minutesRead: 5,

  // ============================================================ PART 1 · READ (study sheet)
  sheet: [
    {
      title: 'First idea',
      body: `Plain-language explanation with [[key terms]] highlighted.
        <ul><li>a list item with a [[term]]</li><li>another one</li></ul>`,
      fig: FIG.basicCircuit,                 // optional, a function from FIG in visuals.js
      key: 'The one thing to remember.',     // optional 💡 Key idea
      exam: 'What the quiz asks / the classic trap.', // optional 🎯 On the test
    },
    // … 5–8 sections, slide order, covering every slide
  ],

  // ============================================================ PART 2 · DO (8–12 steps)
  steps: [
    // ---------- a 3D bench step ----------
    {
      id: 'example-3d', kind: '3d', title: 'Short title',
      text: '1–3 sentences: the idea being practised, with [[terms]].',
      how: 'Exactly what to click: the <b>red + post</b>, then a <b>lamp post</b>.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.lamp = g.slot({ pos: [2.4, 0, -0.2], content: { type: 'lamp', R: 50, Prated: 2.88 }, locked: true });
          // pre-wire what isn't the point of the step:
          // g.wire(s.ps.T('+'), s.lamp.T('a'), { locked: true });
        },
        // glow + 👇 on the next terminal(s) to click; change the answer as the player progresses
        highlight(g, s) {
          if (lit(s.lamp)) return [];
          return g.pending ? [s.lamp.T('a'), s.lamp.T('b')] : [s.ps.T('+')];
        },
        // allowWiring: false, noWiringMsg: 'No wiring here: click the switch!',
        // on: { fuseBlown: (g, s, slot) => g.say('💥 The [[fuse]] melted!') },
      },
      tasks: [
        { text: 'Wire the supply to the lamp', done: (g, s) => g.joined(s.ps.T('+'), s.lamp.T('a')) || g.joined(s.ps.T('+'), s.lamp.T('b')) },
        { text: 'Close the loop', done: (g, s) => lit(s.lamp) },
      ],
      success: 'What just happened, in one line, with a [[term]].',
      question: {
        q: 'A question about the idea just practised?',
        options: ['Right answer', 'Plausible wrong 1', 'Plausible wrong 2', 'Plausible wrong 3'],
        correct: 0,          // index in this list (shuffled on screen)
        why: 'Short explanation with the [[key term]].',
      },
    },

    // ---------- a 2D visual step ----------
    {
      id: 'example-visual', kind: 'visual', title: 'Short title',
      text: 'The idea.',
      how: 'What to do in the visual.',
      visual: 'fuseVsBreaker',        // key in VISUALS (src/lesson/visuals.js); calls api.done() when finished
      tasks: [{ text: 'Sort all the cards' }],
      success: 'One-line wrap-up.',
      // question: { … } optional
    },

    // ---------- a question-only step (use sparingly) ----------
    {
      id: 'example-question', kind: 'question', title: 'Quick check',
      text: 'Context for the question.',
      question: { q: '…?', options: ['A', 'B', 'C', 'D'], correct: 0, why: '…' },
    },
  ],
};

// Then register it in src/lesson/LessonPage.js:
//   import { LESSON_XX } from './unitXX.js';
//   export const LESSONS_V2 = { unit2a: LESSON_2A, unitXX: LESSON_XX };
