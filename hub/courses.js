// courses.js - every course in the hub. Add one entry per course; `path` is the course folder under courses/.
// `tint` (optional) colours the icon tile. `progressKey` is the localStorage key the course saves to, so the hub can show "started" on the card.
export const COURSES = [
  {
    id: 'electra',
    path: 'courses/electra/',
    icon: '⚡',
    title: 'Circuit Analysis',
    subject: 'EMNG1001',
    blurb: 'Units, resistors, Ohm’s law, series and parallel circuits, power and atomic theory, with a 3D workbench to wire and measure real circuits.',
    units: 10,
    progressKey: 'electra.progress.v2',
  },
  {
    id: 'metrology',
    path: 'courses/metrology/',
    icon: '📐',
    tint: 'linear-gradient(135deg, #67e8f9, #0e86a6)',
    title: 'Blueprint Reading & Metrology',
    subject: 'CRN-20405',
    blurb: 'Steel rules, unit conversions, vernier and dial calipers, micrometers, height gages and protractors, with instruments you can move and a lab in every module.',
    units: 6,
    progressKey: 'metrology.progress.v1',
  },
];
