// labkit.js - the notebook (fields and tables the student fills in) and the step-by-step calculators.
// Rules this file keeps:
//  - a field only ever shows what the student typed; nothing is pre-filled or auto-completed;
//  - every field says what kind of value it is (measured, Multisim, own calculation, observation);
//  - a calculator uses the student's readings, or nominal values only when the student picks
//    "Example" and then says so in a banner.
import { labStore } from './labstore.js';

export const SCALE = {
  'Ω': 1, 'kΩ': 1e3, 'V': 1, 'mV': 1e-3, 'A': 1, 'mA': 1e-3, 'W': 1, 'mW': 1e-3,
  'F': 1, 'µF': 1e-6, 'C': 1, 'mC': 1e-3, 'µC': 1e-6,
  's': 1, 'ms': 1e-3, 'µs': 1e-6, 'Hz': 1, 'kHz': 1e3, '°': 1, 'rad/s': 1, 'div': 1, '': 1,
  's/div': 1, 'ms/div': 1e-3, 'µs/div': 1e-6, 'V/div': 1, 'mV/div': 1e-3,
};

export const KIND = {
  meas: { tag: 'Measured', cls: 'k-meas' },
  sim: { tag: 'Multisim', cls: 'k-sim' },
  calc: { tag: 'Your calculation', cls: 'k-calc' },
  obs: { tag: 'Observation', cls: 'k-obs' },
  ans: { tag: 'Your answer', cls: 'k-obs' },
  set: { tag: 'Scope setting', cls: 'k-meas' },
  pf: { tag: 'Test result', cls: 'k-meas' },
};

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Parse what the student typed: "4.68", "4,68", " 12.02 ". Returns a number or null. */
export function parseNum(s) {
  if (s == null) return null;
  const t = String(s).trim().replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Format an SI value in a display unit with 4 significant figures: (2564, 'kΩ') -> '2.564 kΩ'. */
export function fmt(x, unit = '', sig = 4) {
  if (x == null || !Number.isFinite(x)) return '—';
  const v = x / (SCALE[unit] ?? 1);
  let s;
  if (v === 0) s = '0';
  else if (Math.abs(v) >= 1e5 || Math.abs(v) < 1e-3) s = v.toExponential(sig - 1).replace('e', '×10^');
  else s = Number(v.toPrecision(sig)).toString();
  s = s.replace(/^-/, '−');
  return unit === '°' ? `${s}°` : unit ? `${s} ${unit}` : s;
}

export class Notebook {
  constructor(lab) { this.lab = lab; this.fields = new Map(); }
  add(list) { list.forEach(f => this.fields.set(f.key, f)); }
  field(key) { return this.fields.get(key); }
  raw(key) { return labStore.note(this.lab, key); }
  unit(key) { const f = this.field(key); return labStore.unit(this.lab, key, f?.unit || ''); }
  /** SI value of a numeric field, or null if empty / not a number. */
  num(key) {
    const n = parseNum(this.raw(key));
    if (n == null) return null;
    return n * (SCALE[this.unit(key)] ?? 1);
  }
}

let fieldSeq = 0;
/** One input. f: { key, label, unit, units?, kind, nominal?, wide?, rows? } */
export function fieldHTML(nb, key, opts = {}) {
  const f = nb.field(key);
  if (!f) return `<span class="miss">[${esc(key)}]</span>`;
  const kind = KIND[f.kind] || KIND.meas;
  const val = esc(nb.raw(key));
  const id = `f-${nb.lab}-${key}-${++fieldSeq}`;
  const label = opts.noLabel ? '' : `<label class="fld-l" for="${id}">${f.label}</label>`;
  const tag = `<span class="tag ${kind.cls}">${kind.tag}</span>`;
  if (f.kind === 'obs' || f.kind === 'ans') {
    return `<div class="fld long ${kind.cls}">${label}${tag}
      <textarea id="${id}" data-key="${key}" rows="${f.rows || 3}" placeholder="${esc(f.ph || 'Write it in your own words…')}">${val}</textarea></div>`;
  }
  if (f.kind === 'pf') {
    const cur = nb.raw(key);
    return `<div class="fld pf ${kind.cls}">${label}
      <div class="seg" role="group" aria-label="${esc(f.plain || key)} result">
        ${['Pass', 'Fail'].map(p => `<button type="button" data-key="${key}" data-val="${p}" class="${cur === p ? 'on' : ''}">${p}</button>`).join('')}
      </div>${tag}</div>`;
  }
  const units = f.units
    ? `<select data-unit="${key}" aria-label="unit">${f.units.map(u => `<option ${nb.unit(key) === u ? 'selected' : ''}>${u}</option>`).join('')}</select>`
    : `<span class="u">${f.unit || ''}</span>`;
  const nom = f.nominal != null ? `<span class="nom">nominal ${f.nominal}</span>` : '';
  return `<div class="fld ${kind.cls} ${opts.compact ? 'compact' : ''}">${label}
    <div class="inrow"><input id="${id}" data-key="${key}" inputmode="decimal" autocomplete="off" value="${val}" placeholder="—">${units}</div>
    <div class="meta">${tag}${nom}<span class="chk" data-chk="${key}"></span></div></div>`;
}

/** A lab table. t: { title, note, head: [..], rows: [{ label, nominal?, keys: [..] }], diff?: [i, j] } */
export function tableHTML(nb, t) {
  const diff = t.diff ? `<th>Difference</th>` : '';
  return `<figure class="tbl" data-table="${t.id}">
    <figcaption><b>${t.title}</b>${t.note ? `<span>${t.note}</span>` : ''}</figcaption>
    <div class="tbl-scroll"><table>
      <thead><tr>${t.head.map(h => `<th>${h}</th>`).join('')}${diff}</tr></thead>
      <tbody>${t.rows.map(r => `<tr>
        <th scope="row">${r.label}</th>
        ${r.nominal != null ? `<td class="nomc" data-h="${t.head[1]}">${r.nominal}</td>` : ''}
        ${r.keys.map((k, j) => `<td data-h="${t.head[j + 1 + (r.nominal != null ? 1 : 0)] || ''}">${k ? fieldHTML(nb, k, { noLabel: true, compact: true }) : ''}</td>`).join('')}
        ${t.diff ? `<td class="diff" data-h="Difference" data-diff="${r.keys[t.diff[0]]}|${r.keys[t.diff[1]]}">—</td>` : ''}
      </tr>`).join('')}</tbody>
    </table></div></figure>`;
}

/**
 * Calculator. c: { id, title, intro, inputs: [{ key, sym, nom (SI), unit }], steps(v) -> [{ id, rule, f, s, r, unit, mean }],
 *                  sources: ['meas', 'nom'] | ['nom'], nomLabel }
 * Steps are always all visible. With missing inputs the formulas still show and the numbers wait.
 */
export function calcHTML(nb, c) {
  const sources = c.sources || ['meas', 'nom'];
  const src = sources.length === 1 ? sources[0] : labStore.calcSrc(c.id, sources[0]);
  const v = {}, missing = [];
  for (const i of c.inputs) {
    const val = src === 'nom' || i.fixed ? i.nom : nb.num(i.key);
    if (val == null) missing.push(i);
    v[i.sym] = val;
  }
  const ready = missing.length === 0;
  const steps = c.steps(v, ready);
  const toggle = sources.length > 1 ? `<div class="seg src" role="group" aria-label="Values to use">
      <button type="button" data-src="${c.id}|meas" class="${src === 'meas' ? 'on' : ''}">My readings</button>
      <button type="button" data-src="${c.id}|nom" class="${src === 'nom' ? 'on' : ''}">Example (nominal)</button></div>` : '';
  const banner = src === 'nom'
    ? `<p class="banner ex">${c.nomLabel || 'Example with the <b>nominal</b> values from the lab sheet. These are not your measurements. For your lab sheet, switch to <b>My readings</b>.'}</p>`
    : (ready ? `<p class="banner ok">Using <b>your own readings</b>: ${c.inputs.filter(i => !i.fixed).map(i => `${i.sym} = ${fmt(v[i.sym], i.unit)}`).join(', ')}.</p>`
      : `<p class="banner wait">Waiting for your readings: ${missing.map(i => `<b>${i.sym}</b>`).join(', ')}. Type them in the table${c.where ? ` (${c.where})` : ''} and the numbers appear here.</p>`);
  return `<div class="calc" data-calc="${c.id}">
    <div class="calc-head"><h4>${c.title}</h4>${toggle}</div>
    ${c.intro ? `<p class="calc-intro">${c.intro}</p>` : ''}
    ${banner}
    <ol class="steps">${steps.map(st => `<li>
      <div class="rule">${st.rule}</div>
      <div class="eq"><span class="f">${st.f}</span>${st.s && ready ? `<span class="s">= ${st.s}</span>` : ''}${ready && st.r != null ? `<span class="r">= <b>${fmt(st.r, st.unit)}</b></span>` : ''}</div>
      ${st.mean ? `<div class="mean">${st.mean}</div>` : ''}
    </li>`).join('')}</ol>
  </div>`;
}

/** Values a calculator produces from the student's own readings (for the ✓ checks on their own calculations). */
export function calcResults(nb, c) {
  const v = {};
  for (const i of c.inputs) { const n = i.fixed ? i.nom : nb.num(i.key); if (n == null) return null; v[i.sym] = n; }
  const out = {};
  for (const st of c.steps(v, true)) if (st.id) out[st.id] = st.r;
  return out;
}

export const pct = (a, b) => (a == null || b == null || b === 0 ? null : ((a - b) / b) * 100);
