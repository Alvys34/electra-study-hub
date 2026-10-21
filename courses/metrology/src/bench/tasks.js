// tasks.js - the 3D bench's random jobs: one of the shop-project parts, one dimension on it, and the tool the
// class uses for it (bores get the caliper's inside jaws, since the bench has no telescoping gauge).
// The same seed always gives the same job, so a refresh keeps it.
import { makeRng } from '../core/rng.js';
import { PROJECTS, makePart } from '../projects/index.js';
import { TOOLS } from '../sim/index.js';
import { KIND } from './measure.js';

export const FILTERS = [
  { id: 'any', name: 'Any tool' },
  { id: 'caliper', name: 'Vernier caliper' },
  { id: 'mic', name: 'Micrometer' },
  { id: 'depthmic', name: 'Depth micrometer' },
  { id: 'height', name: 'Height gage' },
  { id: 'rule', name: 'Steel rule' },
];

function options(filter) {
  const out = [];
  for (const project of PROJECTS) {
    for (const [kind, [id, extra]] of Object.entries(project.tools)) {
      if (kind === 'angle') continue;
      const toolId = kind === 'bore' ? (project.unit === 'mm' ? 'vernier-mm' : 'vernier-in') : id;
      if (filter === 'any' || KIND[toolId] === filter) out.push({ project, kind, toolId, extra: kind === 'bore' ? {} : extra });
    }
  }
  return out;
}

export function makeTask(seed, filter = 'any') {
  const rng = makeRng(seed), list = options(filter), o = rng.pick(list.length ? list : options('any'));
  const part = makePart(o.project, rng.int(1, 2 ** 31 - 2));
  const feature = rng.pick(part.features.filter(f => f.kind === o.kind));
  const tool = TOOLS[o.toolId];
  return { seed, filter, project: o.project, part, feature, tool, extra: o.extra, kind: KIND[o.toolId], target: tool.snap({ ...tool.base, ...o.extra, value: feature.value }) };
}

// The tool set to a measured value, the way it would read on the part.
export const specAt = (task, value) => task.tool.snap({ ...task.tool.base, ...task.extra, value });

export const sameReading = (task, value) => Math.abs(specAt(task, value).value - task.target.value) < 1e-9;
