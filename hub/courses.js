// courses.js - every course in the hub. Add one entry per course; `path` is the course folder under courses/.
// `progressKey` is the localStorage key the course saves to. `summary(read)` (optional) turns that saved data into
// what the hub shows: a few numbers and the next place to go. `read(key)` returns parsed JSON or null, never throws.
import { UNITS } from '../courses/electra/src/core/units.js';

const METROLOGY_MODULES = [['1', 'I'], ['2', 'II'], ['3', 'III'], ['4', 'IV'], ['5', 'V'], ['6', 'VI']];
const METROLOGY_LAB_SIZE = 10; // every module lab has 10 problems

export const COURSES = [
  {
    id: 'electra',
    path: 'courses/electra/',
    title: 'Circuit Analysis',
    subject: 'EMNG1001',
    blurb: 'Units, resistors, Ohm’s law, series and parallel circuits, power and atomic theory. Wire and measure real circuits on a 3D bench.',
    progressKey: 'electra.progress.v2',
    summary(read) {
      const learn = read('electra.progress.v2')?.learn || {};
      const done = u => !!learn[`lesson-${u.id}`]?.done;
      const sheet = u => done(u) || !!learn[`lesson-${u.id}-read`]?.done;
      const next = UNITS.find(u => !done(u));
      const labs = read('electra.labs.v1') || {};
      const started = Object.values(labs.guide || {}).filter(g => g && Array.isArray(g.seen) && g.seen.length).length;
      const last = labs.last && /^[6-9]$/.test(String(labs.last.lab)) ? labs.last : null;
      return {
        stats: [
          ['Sheets read', `${UNITS.filter(sheet).length}/${UNITS.length}`],
          ['Bench labs', `${UNITS.filter(done).length}/${UNITS.length}`],
          ['Labs 6–9', started ? `${started} started` : 'Not started'],
        ],
        next: next
          ? { label: `${sheet(next) ? 'Bench lab' : 'Read'} ${next.code} · ${next.title}`, href: `#/lesson/${next.id}${sheet(next) ? '/do' : ''}` }
          : { label: 'All units done · Practice', href: '#/practice/mix' },
        more: [last
          ? { label: `Continue Lab ${last.lab}`, href: `#/labs/${last.lab}${last.view === 'guide' ? '/guide' : ''}` }
          : { label: 'In-class labs 6–9', href: '#/labs' }],
      };
    },
  },
  {
    id: 'metrology',
    path: 'courses/metrology/',
    title: 'Blueprint Reading & Metrology',
    subject: 'CRN-20405',
    blurb: 'Steel rules, conversions, calipers, micrometers, height gages and protractors, with instruments you can move and a 3D measuring bench.',
    progressKey: 'metrology.progress.v1',
    summary(read) {
      const d = read('metrology.progress.v1') || {};
      const isRead = id => !!d.read?.[id];
      const solved = id => (Array.isArray(d.labs?.[`lab-${id}`]?.solved) ? d.labs[`lab-${id}`].solved.length : 0);
      const next = METROLOGY_MODULES.find(([id]) => solved(id) < METROLOGY_LAB_SIZE);
      return {
        stats: [
          ['Modules read', `${METROLOGY_MODULES.filter(([id]) => isRead(id)).length}/6`],
          ['Labs finished', `${METROLOGY_MODULES.filter(([id]) => solved(id) >= METROLOGY_LAB_SIZE).length}/6`],
        ],
        next: next
          ? { label: `${isRead(next[0]) ? 'Lab' : 'Read'} module ${next[1]}`, href: isRead(next[0]) ? `#/lab/${next[0]}` : `#/m/${next[0]}` }
          : { label: 'Shop projects', href: '#/' },
        more: [{ label: '3D measuring bench', href: '#/bench' }],
      };
    },
  },
];
