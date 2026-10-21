// courses.js - every course in the hub. Add one entry per course; `path` is the course folder under courses/.
// `progressKey` is the localStorage key the course saves to, so the hub can show "started" on the card.
export const COURSES = [
  {
    id: 'electra',
    path: 'courses/electra/',
    icon: '⚡',
    title: 'Electra',
    subject: 'Circuit Analysis · EMNG1001',
    blurb: 'Units, resistors, Ohm’s law, series and parallel circuits, power and atomic theory, with a 3D workbench to wire and measure real circuits.',
    units: 10,
    progressKey: 'electra.progress.v2',
  },
];
