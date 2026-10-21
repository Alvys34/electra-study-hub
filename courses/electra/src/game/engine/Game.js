// Game.js - ties the stage, parts, wires, live circuit solving, and the level's objectives together.
import * as THREE from 'three';
import { solve } from './circuit.js';
import { Stage } from './Stage.js';
import { Supply, Slot, Switch, Meter, Bin } from './Parts.js';
import { sfx as fx } from '../../core/fx.js';
import { buddy } from '../../ui/Buddy.js';

const WIRE_COLORS = [0xfacc15, 0x38bdf8, 0x22c55e, 0xf472b6, 0xf8fafc, 0xa78bfa];
const glowTex = (() => {
  let t = null;
  return () => {
    if (t) return t;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d'); const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    t = new THREE.CanvasTexture(cv); return t;
  };
})();

export class Game {
  constructor(host, ui, opts = {}) {
    this.stage = new Stage(host, opts);
    this.highlights = new Set();
    this.ui = ui;
    this.parts = []; this.wires = [];
    this.handlers = {};
    this.mode = 'idle';
    this.pending = null; this.binSelection = null;
    this.colorIdx = 0;
    this.stage.onEmptyClick = () => this.cancel();
    this.stage.onPointerMoveExtra = p => this.updateRubber(p);
    this.onKey = e => { if (e.key === 'Escape') this.cancel(); };
    window.addEventListener('keydown', this.onKey);
  }

  // ------------------------------------------------------------ level lifecycle
  load(level) {
    this.unload();
    this.level = level;
    this.stats = { hints: 0, mistakes: 0, probes: 0, start: performance.now() };
    this.done = false; this.objIdx = 0; this.st = {};
    this.colorIdx = 0;
    this.mode = level.locked ? 'locked' : 'idle';
    this._loading = true;
    level.setup(this, this.st);
    this._loading = false;
    const cam = level.camera || { pos: [0.4, 6.8, 7.8], target: [0.4, 0.3, 0.3] };
    this.stage.camera.position.set(cam.pos[0] * 1.25, cam.pos[1] * 1.25, cam.pos[2] * 1.25);
    this.stage.controls.target.set(...cam.target);
    this.stage.tweenCamera(cam.pos, cam.target, 1300);
    this.stage.updaters.add(dt => this.tick(dt));
    this.ui.startLevel(level, this);
  }

  unload() {
    this.cancel();
    this.stage.clearLevel();
    this.parts = []; this.wires = []; this.handlers = {};
    this.rubber = null; this.highlights = new Set(); this.pointers = [];
  }

  dispose() { this.unload(); this.stage.dispose(); window.removeEventListener('keydown', this.onKey); }

  // ------------------------------------------------------------ building
  add(Kind, opts) { const p = new Kind(this, opts); this.parts.push(p); return p; }
  supply(o) { return this.add(Supply, o); }
  slot(o) { return this.add(Slot, o); }
  switch(o) { return this.add(Switch, o); }
  meter(o) { return this.add(Meter, o); }
  bin(o) { return this.add(Bin, o); }
  get terminals() { return this.parts.flatMap(p => p.terminals); }

  wire(a, b, { locked = false, color } = {}) {
    if (a === b) return null;
    if (this.wires.some(w => (w.a === a && w.b === b) || (w.a === b && w.b === a))) return null;
    const col = color ?? this.pickColor(a, b);
    const pa = a.world(), pb = b.world();
    const d = pa.distanceTo(pb);
    const lift = 0.35 + d * 0.1;
    const mid = pa.clone().lerp(pb, 0.5); mid.y = Math.max(pa.y, pb.y) + lift;
    const curve = new THREE.CatmullRomCurve3([pa, pa.clone().add(new THREE.Vector3(0, 0.25, 0)), mid, pb.clone().add(new THREE.Vector3(0, 0.25, 0)), pb]);
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.05, emissive: 0x000000 });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.055, 10, false), mat);
    mesh.castShadow = true; mesh.userData.levelObj = true;
    this.stage.scene.add(mesh);
    // flowing electrons
    const n = Math.max(6, Math.round(curve.getLength() * 4));
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const pm = new THREE.PointsMaterial({ size: 0.2, map: glowTex(), color: 0x7dd3fc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, pm); pts.userData.levelObj = true; pts.visible = false;
    this.stage.scene.add(pts);
    const w = { a, b, mesh, curve, pts, n, t: 0, I: 0, locked, col };
    this.stage.pickable(mesh, {
      hover: on => { mat.emissive.set(on && !locked ? 0x334155 : 0x000000); this.tip(on ? `<b>Wire</b> · ${fmtI(w.I)}<small>${locked ? 'part of the level, can\'t remove' : 'click to remove it'}</small>` : null); },
      click: () => { if (!locked && this.mode !== 'locked') { this.removeWire(w); fx.tap(); } else this.say('That wire is part of the puzzle. Leave it in!'); },
    });
    a.wires.add(w); b.wires.add(w);
    this.wires.push(w);
    this.changed('wire');
    return w;
  }

  pickColor(a, b) {
    const isSupply = t => t.part.kind === 'supply' || t.part.kind === 'meter';
    for (const t of [a, b]) if (isSupply(t)) return t.key === '+' || t.key === 'red' ? 0xdc2626 : 0x1f2937;
    return WIRE_COLORS[this.colorIdx++ % WIRE_COLORS.length];
  }

  removeWire(w) {
    this.stage.unpickable(w.mesh);
    this.stage.scene.remove(w.mesh); this.stage.scene.remove(w.pts);
    w.mesh.geometry.dispose(); w.pts.geometry.dispose();
    w.a.wires.delete(w); w.b.wires.delete(w);
    this.wires = this.wires.filter(x => x !== w);
    this.tip(null);
    this.changed('unwire');
  }

  removePart(p) {
    if (!p) return;
    p.terminals.forEach(t => [...t.wires].forEach(w => this.removeWire(w)));
    p.group.traverse(o => {
      if (this.stage.pickables.includes(o)) this.stage.unpickable(o);
    });
    p.valueLabel?.remove?.();
    p.terminals.forEach(t => t.label?.remove?.());
    this.stage.scene.remove(p.group);
    this.parts = this.parts.filter(x => x !== p);
    this.tip(null);
    this.changed('removePart');
  }

  rebuildWiresFor(p) {
    const ws = new Set();
    p.terminals.forEach(t => t.wires.forEach(w => ws.add(w)));
    ws.forEach(w => {
      const pa = w.a.world(), pb = w.b.world();
      const d = pa.distanceTo(pb);
      const lift = 0.35 + d * 0.1;
      const mid = pa.clone().lerp(pb, 0.5); mid.y = Math.max(pa.y, pb.y) + lift;
      w.curve = new THREE.CatmullRomCurve3([
        pa,
        pa.clone().add(new THREE.Vector3(0, 0.25, 0)),
        mid,
        pb.clone().add(new THREE.Vector3(0, 0.25, 0)),
        pb,
      ]);
      w.mesh.geometry.dispose();
      w.mesh.geometry = new THREE.TubeGeometry(w.curve, 48, 0.055, 10, false);
    });
  }

  // ------------------------------------------------------------ interaction
  onTerminalClick(t) {
    if (this.mode === 'locked') return;
    if (this.binSelection) { this.cancel(); }
    if (this.level.allowWiring === false) { this.say(this.level.noWiringMsg || 'No new wires needed here. Use the parts on the bench!'); return; }
    buddy.onBenchTouch('terminal');
    if (!this.pending) {
      this.pending = t; fx.tap();
      this.startRubber(t);
      this.refreshTerminalRings();
      this.emit('wireStart', t);
      return;
    }
    if (t === this.pending) { this.cancel(); return; }
    const a = this.pending;
    this.cancel();
    if (this.level.maxWires && this.wires.filter(w => !w.locked).length >= this.level.maxWires) { this.say(`Only ${this.level.maxWires} wires allowed here. Click a wire to remove one.`); return; }
    const w = this.wire(a, t);
    if (w) { fx.zap(); this.emit('wired', w); if (w.a.part.kind === 'meter' || w.b.part.kind === 'meter') { this.stats.probes++; this.emit('probe', w); } }
  }

  onPartClick(part) {
    if (this.mode === 'locked') return;
    buddy.onBenchTouch('part');
    if (this.binSelection && part.kind === 'slot') {
      const item = this.binSelection;
      if (!part.accepts.includes(item.spec.type)) { this.say(`Wrong slot — that slot doesn't take a ${item.spec.type}.`); return; }
      if (part.locked) { this.say('That part is fixed in place for this level.'); return; }
      const old = part.content;
      item.bin.take(item);
      part.set(item.spec);
      if (old) item.bin.giveBack(old);
      this.binSelection = null; this.refreshSlotGlow();
      fx.good(); this.emit('placed', part, item.spec, old);
      this.changed('place');
      return;
    }
    if (part.kind === 'slot' && part.content && !part.locked && this.level.allowRemove) {
      const bin = this.parts.find(p => p.kind === 'bin');
      if (bin) { bin.giveBack(part.content); part.set(null); this.changed('remove'); fx.tap(); }
      return;
    }
    this.emit('partClick', part);
  }

  selectBinItem(item) {
    if (this.mode === 'locked') return;
    buddy.onBenchTouch('bin');
    item.bin = this.parts.find(p => p.kind === 'bin' && p.items.includes(item));
    this.cancel();
    this.binSelection = item;
    item.holder.position.y = 0.62;
    fx.tap();
    this.refreshSlotGlow();
    this.emit('binPick', item);
    this.ui.hintBar('Now click the slot where it should go.');
  }

  refreshSlotGlow() {
    this.parts.forEach(p => { if (p.kind === 'slot') p.setTargetGlow(!!this.binSelection && p.accepts.includes(this.binSelection.spec.type) && !p.locked); });
    this.parts.forEach(p => p.kind === 'bin' && p.items.forEach(i => { i.holder.position.y = i === this.binSelection ? 0.62 : 0.42; }));
  }

  cancel() {
    this.pending = null;
    if (this.rubber) { this.stage.scene.remove(this.rubber); this.rubber.geometry.dispose(); this.rubber = null; }
    if (this.binSelection) { this.binSelection = null; this.refreshSlotGlow(); }
    this.refreshTerminalRings();
    this.ui?.hintBar(null);
  }

  startRubber(t) {
    const geo = new THREE.BufferGeometry().setFromPoints([t.world(), t.world()]);
    this.rubber = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.15, gapSize: 0.1 }));
    this.rubber.userData.levelObj = true;
    this.stage.scene.add(this.rubber);
    this.ui.hintBar('Now click another terminal to finish the wire · Esc to cancel');
  }

  updateRubber(p) {
    if (!this.rubber || !this.pending) return;
    const hov = this.stage.hovered;
    const end = hov && this.terminals.find(t => t.post.children.includes(hov)) ? this.terminals.find(t => t.post.children.includes(hov)).world() : p;
    if (!end) return;
    this.rubber.geometry.setFromPoints([this.pending.world(), end]);
    this.rubber.computeLineDistances();
  }

  refreshTerminalRings() {
    const t0 = performance.now() / 1000;
    this.terminals.forEach(t => {
      const hl = this.highlights.has(t);
      const show = t === this.pending || t.hover || hl || (!!this.pending && t !== this.pending);
      t.ring.visible = show && this.mode !== 'locked';
      t.ring.material.color.set(t === this.pending ? 0x22c55e : t.hover || hl ? 0xfacc15 : 0x60a5fa);
      t.ring.material.opacity = t.hover || t === this.pending ? 0.95 : hl ? 0.6 + 0.4 * Math.sin(t0 * 6) : 0.45 + 0.3 * Math.sin(t0 * 5);
      const sc = hl && !t.hover ? 1 + 0.25 * (0.5 + 0.5 * Math.sin(t0 * 6)) : 1; t.ring.scale.setScalar(sc);
    });
  }

  // ------------------------------------------------------------ simulation
  changed(reason) {
    this.dirty = true;
    if (!this._loading && reason) buddy.onBenchTouch(reason);
    this.emit('change', reason);
  }

  tick(dt) {
    if (!this.level) return;
    const sim = this.simulate();
    this.sim = sim;
    this.parts.forEach(p => p.after(sim, dt));
    this.wires.forEach(w => this.flow(w, dt, sim));
    if (this.pending || this.highlights.size) this.refreshTerminalRings();
    if (this.level.highlight) { const want = new Set((this.level.highlight(this, this.st) || []).filter(Boolean)); if ([...want].some(t => !this.highlights.has(t)) || [...this.highlights].some(t => !want.has(t))) { this.highlights = want; this.refreshTerminalRings(); this.pointers?.forEach(L => L.remove()); this.pointers = [...want].map(t => this.stage.label(t.post || t.group || t, [0, 1.15, 0], '👇', 'pointer')); } }
    this.checkObjectives();
  }

  simulate() {
    const terms = this.terminals.map(t => t.id);
    const supply = this.parts.find(p => p.kind === 'supply');
    const ground = supply ? supply.T('-').id : terms[0];
    const base = this.parts.flatMap(p => p.elements());
    const wires = this.wires.map(w => ({ a: w.a.id, b: w.b.id, G: 100, wire: w }));
    const meters = this.parts.filter(p => p.kind === 'meter' && p.mode === 'Ω');
    let live = new Map();
    if (meters.length) {
      const els = [...base.filter(e => !e.ohm), ...wires];
      const V0 = solve(terms, els, ground);
      meters.forEach(m => live.set(m, Math.abs((V0.get(m.T('red').id) || 0) - (V0.get(m.T('com').id) || 0)) > 0.02));
    }
    const els = [...base, ...wires];
    const V = solve(terms, els, ground);
    wires.forEach(e => { e.wire.I = e.current; });
    return {
      V, els,
      v: t => V.get(t.id) || 0,
      elementsOf: p => els.filter(e => e.part === p && !e.ohm),
      liveAcross: m => !!live.get(m),
    };
  }

  flow(w, dt) {
    const I = w.I, a = Math.abs(I);
    const on = a > 2e-5;
    w.pts.visible = on;
    w.mesh.material.emissive.setRGB(a > 1.5 ? 0.5 : 0, 0, 0);
    if (!on) return;
    // electrons drift opposite to conventional current
    const speed = Math.min(2.8, Math.max(0.05, 0.12 + 0.24 * Math.log10(a / 1e-4))) / w.curve.getLength() * 1.6;
    w.t = (w.t - Math.sign(I) * speed * dt + 1) % 1;
    const pos = w.pts.geometry.attributes.position.array;
    const p = new THREE.Vector3();
    for (let i = 0; i < w.n; i++) {
      w.curve.getPointAt((w.t + i / w.n) % 1, p);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y + 0.06; pos[i * 3 + 2] = p.z;
    }
    w.pts.geometry.attributes.position.needsUpdate = true;
    w.pts.material.color.set(a > 1.5 ? 0xff5a5a : 0x7dd3fc);
    w.pts.material.size = a > 1.5 ? 0.3 : 0.2;
  }

  /** are two terminals joined by wires (directly or through other wires)? */
  joined(t1, t2) {
    const seen = new Set([t1]); const q = [t1];
    while (q.length) { const t = q.shift(); if (t === t2) return true; t.wires.forEach(w => { const o = w.a === t ? w.b : w.a; if (!seen.has(o)) { seen.add(o); q.push(o); } }); }
    return false;
  }

  // ------------------------------------------------------------ objectives & events
  checkObjectives() {
    if (this.done) return;
    const objs = this.level.objectives;
    if (!objs?.length) return;
    while (this.objIdx < objs.length && objs[this.objIdx].done(this, this.st)) {
      const o = objs[this.objIdx];
      this.objIdx++;
      this.ui.objectiveDone(this.objIdx - 1);
      fx.good();
      if (o.say) this.say(o.say, { mood: 'happy' });
      if (o.camera) this.stage.tweenCamera(o.camera.pos, o.camera.target);
      o.onDone?.(this, this.st);
    }
    if (this.objIdx >= objs.length) { this.done = true; setTimeout(() => this.ui.levelComplete(this), 900); }
  }

  on(ev, fn) { (this.handlers[ev] ||= []).push(fn); }
  emit(ev, ...args) {
    (this.handlers[ev] || []).forEach(fn => fn(...args));
    const lh = this.level?.on?.[ev];
    if (lh) lh(this, this.st, ...args);
    else if (DEFAULT_REACTIONS[ev]) DEFAULT_REACTIONS[ev](this, ...args);
  }

  say(text, o) {
    this.ui.say(text, o);
    buddy.onBenchEvent(text);
  }
  tip(html) { this.ui.tip(html); }
  mistake() {
    this.stats.mistakes++;
    buddy.onWrong();
  }
  sfx(k) { (fx[k] || fx.tap)(); }

  spark(pos) {
    fx.zap();
    const n = 40;
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(n * 3), vel = [];
    for (let i = 0; i < n; i++) { arr.set([pos.x, pos.y, pos.z], i * 3); vel.push(new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4)); }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const m = new THREE.PointsMaterial({ size: 0.18, map: glowTex(), color: 0xffc14d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, m); pts.userData.levelObj = true; this.stage.scene.add(pts);
    let life = 0;
    const up = dt => {
      life += dt; const a = geo.attributes.position.array;
      for (let i = 0; i < n; i++) { vel[i].y -= 9 * dt; a[i * 3] += vel[i].x * dt; a[i * 3 + 1] += vel[i].y * dt; a[i * 3 + 2] += vel[i].z * dt; }
      geo.attributes.position.needsUpdate = true; m.opacity = Math.max(0, 1 - life / 0.9);
      if (life > 0.9) { this.stage.updaters.delete(up); this.stage.scene.remove(pts); geo.dispose(); m.dispose(); }
    };
    this.stage.updaters.add(up);
  }
}

// What Sparky says when something dramatic happens and the level doesn't override it
const DEFAULT_REACTIONS = {
  overload: g => { g.say('💥 [[Short circuit]]! Almost zero resistance, so the current shot sky-high and the supply\'s protection tripped. Remove the short, then press the green power button.', { mood: 'shock' }); },
  fuseBlown: g => { g.say('💥 The [[fuse]] melted! Too much current, so it [[opened the circuit]] on purpose to protect everything else.', { mood: 'shock' }); },
  burnout: g => { g.say('💀 That lamp got way more power than it\'s rated for and burnt out.', { mood: 'shock' }); g.mistake(); },
  meterFuse: g => { g.say('💥 You put the [[ammeter]] straight across a voltage. Ammeters are nearly [[0 Ω]], so that\'s a short! They go [[in series]]: open the path and let the current flow THROUGH the meter.', { mood: 'shock' }); g.mistake(); },
  ohmLive: g => { g.say('⚠️ Ohmmeter on a [[live circuit]]! Switch the [[power OFF]] before measuring resistance.', { mood: 'shock' }); },
};

export function fmtI(I) {
  const a = Math.abs(I);
  if (a < 2e-5) return 'no current';
  return a >= 1 ? `${a.toFixed(2)} A` : a >= 0.001 ? `${(a * 1000).toFixed(1)} mA` : `${(a * 1e6).toFixed(0)} µA`;
}
