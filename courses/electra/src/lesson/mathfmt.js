// mathfmt.js — stacked scientific / engineering notation for study sheets.
// Cyan mantissa, amber exponent, muted operator. Each worked example is its own block.

const SUP = {
  '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾',
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
};

export function sup(n) {
  return String(n).replace(/[0-9+\-()]/g, ch => SUP[ch] || ch);
}

export function m(v) {
  return `<span class="mantissa">${v}</span>`;
}

export function e(exp) {
  return `<span class="exponent">10${sup(exp)}</span>`;
}

export function op(symbol) {
  return `<span class="operator"> ${symbol} </span>`;
}

export function unit(u) {
  return `<span class="mx-unit">${u}</span>`;
}

/** mantissa × 10^exp, optional unit text */
export function sci(mantissa, exp, unitText = '') {
  return `${m(mantissa)}${op('×')}${e(exp)}${unitText ? ' ' + unit(unitText) : ''}`;
}

/** Keep a number and its power on one line when the row wraps. */
export function grp(inner) {
  return `<span class="mx-bit">${inner}</span>`;
}

function plainExp(n) {
  const v = Number(n);
  return (v < 0 ? '−' : '') + Math.abs(v);
}

/** The balance rule: exponent and mantissa move in opposite directions. */
export function balance(fromExp, toExp, fromM, toM) {
  const d = Math.abs(Number(toExp) - Number(fromExp));
  const down = Number(toExp) < Number(fromExp);
  const places = d === 1 ? '1 place' : `${d} places`;
  const step = d === 1 ? '1' : String(d);
  if (down) {
    return `Exponent went down by ${step} (${plainExp(fromExp)} → ${plainExp(toExp)}) → mantissa decimal moved right ${places} (${fromM} → ${toM}).`;
  }
  return `Exponent went up by ${step} (${plainExp(fromExp)} → ${plainExp(toExp)}) → mantissa decimal moved left ${places} (${fromM} → ${toM}).`;
}

export function sub(title) {
  return `<h3 class="ls-sub">${title}</h3>`;
}

export function facts(items) {
  return `<div class="fact-grid">${items.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
}

export function prefixes(items) {
  return `<div class="px-grid">${items.map(p => `<div class="px-chip"><b>${p.sym}</b><span>${p.name}</span><span class="exponent">10${sup(p.exp)}</span></div>`).join('')}</div>`;
}

export function powerCards(items) {
  return `<div class="px-grid">${items.map(p => `<div class="px-chip"><span class="exponent">10${sup(p.exp)}</span><small>${p.value}</small></div>`).join('')}</div>`;
}

/** Engineering exponents, multiples of 3. */
export function jumps(exps = [-12, -9, -6, -3, 0, 3, 6, 9, 12]) {
  return `<div class="mx-jumps" aria-label="Exponents that are multiples of 3">${exps.map(n => `<span class="exponent">${plainExp(n)}</span>`).join('<span class="operator">·</span>')}</div>`;
}

function stepsHTML(steps) {
  return steps.map(s => `<li class="mx-step">
    ${s.k ? `<span class="mx-k">${s.k}</span>` : ''}
    <div class="mx-eq">${s.eq}</div>
    ${s.bridge ? `<div class="mx-bridge">${s.bridge}</div>` : ''}
  </li>`).join('');
}

/** One calculation, top to bottom, with a Step through control. */
export function worked(title, steps) {
  return `<div class="mx is-walk">
    <div class="mx-head"><b>${title}</b><button type="button" class="mx-walk">Step through</button></div>
    <ol class="mx-steps">${stepsHTML(steps)}</ol>
    <div class="mx-nav" hidden>
      <button type="button" class="mx-prev">Back</button>
      <span class="mx-count"></span>
      <button type="button" class="mx-next">Next</button>
    </div>
  </div>`;
}

/** Several short conversions, each on its own rows. No horizontal chaining. */
export function pairs(title, items) {
  const lis = items.map(s => `<li class="mx-step">
    ${s.k ? `<span class="mx-k">${s.k}</span>` : ''}
    <div class="mx-eq">${s.from}</div>
    <div class="mx-eq mx-to">${op('→')} ${s.to}</div>
    ${s.bridge ? `<div class="mx-bridge">${s.bridge}</div>` : ''}
  </li>`).join('');
  return `<div class="mx"><div class="mx-head"><b>${title}</b></div><ol class="mx-steps">${lis}</ol></div>`;
}
