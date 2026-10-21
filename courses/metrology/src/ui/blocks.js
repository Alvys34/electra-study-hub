// blocks.js - the three looks every problem uses: Problem (cyan), Steps (numbered, always open), Answer (amber).
export const simHtml = (tool, spec, reveal) =>
  `<div class="sim-svg${tool.noSim ? ' nosim' : ''}${tool.tall ? ' tall' : ''}">${tool.draw(spec, { reveal })}</div>`;

export const problemHtml = (tool, spec, { tag = 'Problem', reveal = false, extra = '' } = {}) =>
  `<section class="blk blk-problem"><div class="blk-tag">${tag}</div><p class="q">${tool.question(spec)}</p>${simHtml(tool, spec, reveal)}${extra}</section>`;

export const stepsHtml = (tool, spec) =>
  `<section class="blk blk-steps"><div class="blk-tag">Steps</div><ol class="steps">${tool.steps(spec).map(s => `<li>${s}</li>`).join('')}</ol></section>`;

export const answerHtml = (tool, spec, tag = 'Answer') =>
  `<section class="blk blk-answer"><span class="blk-tag">${tag}</span><span class="ans">${tool.answer(spec)}</span></section>`;

export const workedHtml = (tool, spec) =>
  `<div class="worked">${problemHtml(tool, spec, { tag: 'Worked example', reveal: true })}${stepsHtml(tool, spec)}${answerHtml(tool, spec)}</div>`;

// Answer inputs: degrees + minutes for the bevel protractor, degrees for the plate, one box for the rest.
export function answerForm(tool, spec, { disabled = false } = {}) {
  const dis = disabled ? ' disabled' : '';
  let fields;
  if (tool.unit === 'angle') fields = `<label><input type="text" inputmode="numeric" name="deg" class="short" autocomplete="off"${dis}>°</label><label><input type="text" inputmode="numeric" name="min" class="short" autocomplete="off"${dis}>′</label>`;
  else if (tool.unit === 'deg') fields = `<label><input type="text" inputmode="numeric" name="deg" class="short" autocomplete="off"${dis}>°</label>`;
  else fields = `<label><input type="text" inputmode="decimal" name="v" autocomplete="off" placeholder="${tool.placeholder(spec)}"${dis}>${tool.unit === 'mm' ? 'mm' : tool.id === 'convert' ? '' : 'in'}</label>`;
  return `<form class="answer-row" novalidate>${fields}<button class="btn primary" type="submit"${dis}>Check</button></form>`;
}

export function readForm(tool, form) {
  const f = new FormData(form);
  return tool.unit === 'angle' || tool.unit === 'deg' ? { deg: String(f.get('deg') ?? '').trim(), min: String(f.get('min') ?? '').trim() } : String(f.get('v') ?? '');
}
