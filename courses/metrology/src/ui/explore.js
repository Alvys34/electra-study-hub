// explore.js - a live instrument: drag the scale (or use the slider / arrow keys) and the steps and reading
// below update as you go. This is the "hands on the tool" part of every lesson.
import { stepsHtml, answerHtml } from './blocks.js';

export function mountExplore(host, tool, spec0 = {}, { caption = '' } = {}) {
  let spec = tool.snap({ ...tool.base, ...spec0 });
  const [lo, hi] = tool.range(spec), step = tool.step(spec), drag = tool.drag(spec);
  const toggles = (tool.toggles || []).map(t => `<label class="toggle"><input type="checkbox" data-t="${t.key}"${spec[t.key] ? ' checked' : ''}> ${t.label}</label>`).join('');
  host.innerHTML = `<div class="explore">
    ${caption ? `<p class="cap">${caption}</p>` : ''}
    <div class="sim-svg drag${drag.axis === 'y' ? ' vert' : ''}${tool.tall ? ' tall' : ''}" tabindex="0" aria-label="${tool.name}: drag or use arrow keys"></div>
    <div class="sim-controls">
      <button class="icon-btn" data-d="-1" aria-label="Smaller">−</button>
      <input type="range" min="${lo}" max="${hi}" step="${step}" aria-label="Setting">
      <button class="icon-btn" data-d="1" aria-label="Bigger">+</button>
      ${toggles}
    </div>
    <div class="live"></div>
  </div>`;
  const wrap = host.querySelector('.sim-svg'), range = host.querySelector('input[type=range]'), live = host.querySelector('.live');

  const update = () => {
    wrap.innerHTML = tool.draw(spec, { reveal: true });
    range.value = spec.value;
    live.innerHTML = stepsHtml(tool, spec) + answerHtml(tool, spec, 'Reading');
  };
  const set = v => {
    const next = tool.snap({ ...spec, value: Math.min(hi, Math.max(lo, v)) });
    if (next.value === spec.value) return;
    spec = next; update();
  };

  range.addEventListener('input', () => set(Number(range.value)));
  host.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => set(spec.value + Number(b.dataset.d) * step)));
  host.querySelectorAll('[data-t]').forEach(c => c.addEventListener('change', () => { spec = { ...spec, [c.dataset.t]: c.checked }; update(); }));
  wrap.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (d) { e.preventDefault(); set(spec.value + d * step * (e.shiftKey ? 10 : 1)); }
  });

  // Dragging: convert screen pixels to drawing units, then to a value with the tool's own scale.
  let start = null;
  wrap.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    start = { x: e.clientX, y: e.clientY, v: spec.value };
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', e => {
    if (!start) return;
    const svg = wrap.querySelector('svg'), box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const d = drag.axis === 'y' ? (e.clientY - start.y) * vb.height / box.height : (e.clientX - start.x) * vb.width / box.width;
    set(start.v + d * drag.perPx);
  });
  const end = () => { start = null; };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);

  update();
}
