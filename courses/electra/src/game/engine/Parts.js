// Parts.js - interactive 3D bench parts. Each part owns a THREE.Group, a set of terminals, the circuit
// elements it contributes, and live visuals that react to the solved currents (no scene rebuilds).
import * as THREE from 'three';
import { BANDS, GOLD, SILVER } from '../../practice/generators.js';
import { eng } from '../../core/num.js';

let _uid = 0;
const uid = k => `${k}${++_uid}`;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1, ...o });
const BRASS = () => std(0xd6a53a, { metalness: 0.85, roughness: 0.28 });
const STEEL = () => std(0xc9ced6, { metalness: 0.9, roughness: 0.25 });

export function bandsFor(R, tol = 5) {
  const exp = Math.floor(Math.log10(R)) - 1;
  const digits = Math.round(R / Math.pow(10, exp));
  const d1 = Math.floor(digits / 10), d2 = digits % 10;
  const mult = exp === -1 ? GOLD : exp === -2 ? SILVER : BANDS[exp];
  const tolB = tol === 5 ? GOLD : tol === 10 ? SILVER : tol === 1 ? BANDS[1] : BANDS[2];
  return [BANDS[d1], BANDS[d2], mult, tolB];
}

// =====================================================================
export class Part {
  constructor(game, o = {}) {
    this.game = game; this.stage = game.stage;
    this.kind = this.kind || 'part';
    this.id = o.id || uid(this.kind);
    this.name = o.name || this.kind;
    this.locked = !!o.locked;
    this.group = new THREE.Group();
    this.group.userData.levelObj = true;
    this.group.position.set(...(o.pos || [0, 0, 0]));
    this.group.rotation.y = o.rotY || 0;
    this.terminals = [];
    this.stage.scene.add(this.group);
  }

  /** brass binding post you can clip wires onto */
  addTerminal(key, x, z, { color = 0xd6a53a, label = '', y = 0 } = {}) {
    const post = new THREE.Group();
    post.position.set(x, y, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.12, 20), std(0x1f2937));
    base.position.y = 0.06; post.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.32, 16), color === 0xd6a53a ? BRASS() : std(color, { metalness: 0.3, roughness: 0.35 }));
    stem.position.y = 0.26; stem.castShadow = true; post.add(stem);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), color === 0xd6a53a ? BRASS() : std(color, { metalness: 0.3, roughness: 0.3 }));
    cap.position.y = 0.44; post.add(cap);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 32), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.44; ring.visible = false; post.add(ring);
    // generous invisible hit-box so terminals are easy to click
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.36; post.add(hit);
    this.group.add(post);
    const t = {
      id: `${this.id}:${key}`, key, part: this, post, ring, label, wires: new Set(),
      world: () => cap.getWorldPosition(new THREE.Vector3()),
      hover: false, target: false,
    };
    this.stage.pickable(hit, {
      hover: on => { t.hover = on; this.game.refreshTerminalRings(); this.game.tip(on ? this.terminalTip(t) : null); },
      click: () => this.game.onTerminalClick(t),
      disabled: () => this.game.mode === 'locked',
    });
    this.terminals.push(t);
    return t;
  }

  terminalTip(t) { return `<b>${this.name}</b>${t.label ? ` · ${t.label}` : ''}<small>click to connect a wire</small>`; }
  T(key) { return this.terminals.find(t => t.key === key); }

  /** make a mesh clickable as "this part" */
  body(mesh, { tip, click } = {}) {
    const mats = [];
    mesh.traverse(o => { if (o.isMesh && o.material?.emissive) { o.material = o.material.clone(); mats.push(o.material); } });
    const base = mats.map(m => m.emissive.clone());
    this.stage.pickable(mesh, {
      hover: on => { mats.forEach((m, i) => m.emissive.copy(on ? new THREE.Color(0x2a3550) : base[i])); this.game.tip(on ? (tip ? tip() : `<b>${this.name}</b>`) : null); },
      click: () => (click ? click() : this.game.onPartClick(this)),
    });
    return mesh;
  }

  elements() { return []; }
  after() {}
  reset() {}
}

// =====================================================================
// Bench power supply
export class Supply extends Part {
  constructor(game, o = {}) {
    super(game, { name: 'Power supply', ...o });
    this.kind = 'supply';
    this.V = o.V ?? 12; this.min = o.min ?? 0; this.max = o.max ?? 24; this.step = o.step ?? 1;
    this.adjustable = !!o.adjustable;
    this.on = o.on ?? true; this.tripped = false; this.overT = 0;
    this.I = 0;
    const g = this.group;
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 1.9), std(0x2b2f3a, { metalness: 0.55, roughness: 0.4 }));
    chassis.position.y = 0.95; chassis.castShadow = true; chassis.receiveShadow = true; g.add(chassis);
    const face = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 0.05), std(0x3c4252, { metalness: 0.4 }));
    face.position.set(0, 0.95, 0.96); g.add(face);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.06), std(0xfacc15, { emissive: 0x6b5300 }));
    stripe.position.set(0, 1.78, 0.97); g.add(stripe);
    this.screen = this.makeScreen(); this.screen.mesh.position.set(-0.35, 1.3, 0.99); g.add(this.screen.mesh);
    // knob
    this.knob = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.22, 28), std(0x111827, { metalness: 0.6, roughness: 0.3 }));
    this.knob.rotation.x = Math.PI / 2; this.knob.position.set(0.85, 1.3, 1.07); g.add(this.knob);
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), std(0xffffff)); notch.position.set(0, 0.12, 0.08); notch.rotation.x = -Math.PI / 2; this.knob.add(notch);
    if (this.adjustable) {
      const mkBtn = (txt, x, d) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.1), std(0x334155, { emissive: 0x0b1220 }));
        b.position.set(x, 0.86, 1.02); g.add(b);
        const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), new THREE.MeshBasicMaterial({ map: this.stage.canvasTexture(64, 48, (c) => { c.fillStyle = '#e2e8f0'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 32, 26); }), transparent: true }));
        lab.position.set(x, 0.86, 1.075); g.add(lab);
        this.body(b, { tip: () => `<b>Voltage ${txt}</b><small>${d > 0 ? 'turn the voltage up' : 'turn it down'}</small>`, click: () => this.nudge(d) });
      };
      mkBtn('−', 0.6, -1); mkBtn('+', 1.1, 1);
    }
    // power button
    this.pwr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 20), std(0x22c55e, { emissive: 0x16a34a, emissiveIntensity: 1 }));
    this.pwr.rotation.x = Math.PI / 2; this.pwr.position.set(-1.0, 0.55, 1.0); g.add(this.pwr);
    this.body(this.pwr, { tip: () => `<b>Power ${this.on ? 'ON' : 'OFF'}</b><small>click to switch ${this.on ? 'off' : 'on'}${this.tripped ? ' (resets the overload trip)' : ''}</small>`, click: () => { this.on = !this.on; this.tripped = false; this.game.changed('power'); } });
    this.body(chassis, { tip: () => `<b>Power supply</b> · ${this.V} V<small>the <span class="kw">source</span>: it pushes current around the loop</small>` });
    this.addTerminal('+', -0.4, 1.25, { color: 0xdc2626, label: '+ (positive)' });
    this.addTerminal('-', 0.4, 1.25, { color: 0x111827, label: '− (negative)' });
    this.draw();
  }

  makeScreen() {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 200;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.58), new THREE.MeshBasicMaterial({ map: tex }));
    return { cv, tex, mesh };
  }

  draw() {
    const key = `${this.on}|${this.tripped}|${this.V}|${Math.round(Math.abs(this.I) * 1000)}`;
    if (key === this._drawn) return; this._drawn = key;
    const { cv, tex } = this.screen; const c = cv.getContext('2d');
    c.fillStyle = '#05080d'; c.fillRect(0, 0, 512, 200);
    c.strokeStyle = '#1f2937'; c.lineWidth = 8; c.strokeRect(4, 4, 504, 192);
    c.font = 'bold 22px monospace'; c.fillStyle = '#64748b'; c.fillText('VOLTS', 24, 40); c.fillText('AMPS', 290, 40);
    c.font = 'bold 76px monospace'; c.textAlign = 'right';
    const live = this.on && !this.tripped;
    c.shadowBlur = 14;
    if (this.tripped) { c.fillStyle = '#ef4444'; c.shadowColor = '#ef4444'; c.textAlign = 'center'; c.fillText('OVERLOAD', 256, 130); }
    else {
      c.fillStyle = live ? '#f87171' : '#3f1d1d'; c.shadowColor = '#ef4444'; c.fillText(this.V.toFixed(1), 250, 140);
      const I = Math.abs(this.I);
      c.fillStyle = live ? '#22d3ee' : '#0e3a40'; c.shadowColor = '#06b6d4';
      c.fillText(I >= 1 ? I.toFixed(2) : (I * 1000).toFixed(0), 490, 140);
      c.font = 'bold 26px monospace'; c.fillText(I >= 1 ? 'A' : 'mA', 490, 180);
    }
    tex.needsUpdate = true;
    this.pwr.material.emissiveIntensity = live ? 1.2 : 0.05;
    this.pwr.material.color.set(this.tripped ? 0xef4444 : 0x22c55e);
    this.knob.rotation.y = (this.V / this.max) * 4.5;
  }

  nudge(d) {
    if (!this.adjustable) return;
    this.V = Math.round(Math.min(this.max, Math.max(this.min, this.V + d * this.step)) * 100) / 100;
    this.game.changed('voltage');
  }

  elements() {
    if (!this.on || this.tripped) return [];
    return [{ a: this.T('+').id, b: this.T('-').id, V: this.V, Rint: 0.05, part: this }];
  }

  after(sim, dt) {
    const e = sim.elementsOf(this)[0];
    this.I = e ? e.current : 0;
    if (Math.abs(this.I) > 3) {
      this.overT += dt || 0.016;
      if (this.overT > 0.9) { this.tripped = true; this.overT = 0; this.game.emit('overload'); this.game.changed('trip'); }
    } else this.overT = 0;
    this.draw();
  }
}

// =====================================================================
// A two-terminal slot: holds a resistor, lamp or fuse (or nothing). Contents can be swapped from the bin.
export class Slot extends Part {
  constructor(game, o = {}) {
    super(game, o);
    this.kind = 'slot';
    this.span = o.span ?? 2.4;
    this.accepts = o.accepts || ['resistor', 'lamp', 'fuse'];
    this.showValue = o.showValue ?? true;
    this.labelText = o.label;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(this.span + 0.7, 0.08, 0.9), std(0x0f172a, { roughness: 0.7 }));
    plate.position.y = 0.04; plate.receiveShadow = true; this.group.add(plate);
    this.outline = new THREE.Mesh(new THREE.BoxGeometry(this.span - 0.3, 0.02, 0.62), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.0 }));
    this.outline.position.y = 0.1; this.group.add(this.outline);
    this.addTerminal('a', -this.span / 2, 0);
    this.addTerminal('b', this.span / 2, 0);
    this.model = null; this.light = null;
    this.valueLabel = this.stage.label(this.group, [0, 1.25, 0], '', 'val');
    this.body(plate, { tip: () => this.tipText() });
    this.set(o.content ?? null);
  }

  get name() { return this._name || (this.content ? ({ resistor: 'Resistor', lamp: 'Lamp', fuse: 'Fuse' })[this.content.type] : 'Empty slot'); }
  set name(v) { this._name = v === 'part' ? null : v; }

  tipText() {
    const c = this.content;
    if (!c) return `<b>Empty slot</b><small>${this.game.binSelection ? 'click to drop the part here' : 'pick a part from the bin first'}</small>`;
    if (c.type === 'resistor') {
      const b = bandsFor(c.R, c.tol ?? 5);
      return `<b>Resistor</b>${c.mystery ? ' · <span class="kw">mystery!</span>' : ''}<small>${c.mystery ? 'bands hidden. Measure it!' : b.map(x => x.n).join(' · ')}${this.showValue && !c.mystery ? ` = ${eng(c.R, 'Ω')}` : ''}</small>`;
    }
    if (c.type === 'lamp') return `<b>Lamp</b> · ${c.burnt ? 'burnt out' : eng(c.R, 'Ω')}<small>a <span class="kw">load</span>: turns electrical energy into light</small>`;
    if (c.type === 'fuse') return `<b>Fuse</b> · ${c.rating} A ${c.blown ? '· <span class="kw bad">BLOWN</span>' : ''}<small>${c.blown ? 'click it to swap in a spare (if the bin has one)' : 'melts if current goes over its rating'}</small>`;
    return '';
  }

  set(content) {
    if (this.model) { this.group.remove(this.model); this.model.traverse(o => { if (this.stage.pickables.includes(o)) this.stage.unpickable(o); }); this.model = null; this.light = null; }
    this.content = content ? { ...content } : null;
    if (content) {
      this.model = buildModel(this.content, this.span);
      this.model.position.y = 0.38;
      this.group.add(this.model);
      this.light = this.model.userData.light || null;
      this.model.traverse(o => { if (o.isMesh && !o.userData.noPick) this.body(o, { tip: () => this.tipText() }); });
    }
    this.updateLabel();
  }

  updateLabel() {
    const c = this.content;
    let txt = this.labelText || '';
    if (c?.type === 'resistor' && this.showValue && !c.mystery) txt = `${txt ? txt + ' · ' : ''}${eng(c.R, 'Ω')}`;
    if (c?.type === 'resistor' && c.mystery) txt = `${txt ? txt + ' · ' : ''}R = ?`;
    if (c?.type === 'fuse' && c.blown) txt = '💥 blown';
    if (c?.type === 'lamp' && c.burnt) txt = '💀 burnt out';
    this.valueLabel.set(txt);
    this.valueLabel.el.style.visibility = txt ? 'visible' : 'hidden';
  }

  elements() {
    const c = this.content; if (!c) return [];
    const a = this.T('a').id, b = this.T('b').id;
    if (c.type === 'resistor') return [{ a, b, G: 1 / c.R, part: this }];
    if (c.type === 'lamp') return c.burnt || c.dead ? [] : [{ a, b, G: 1 / c.R, part: this }];
    if (c.type === 'fuse') return c.blown ? [] : [{ a, b, G: 100, part: this }];
    return [];
  }

  after(sim) {
    const c = this.content; if (!c) return;
    const e = sim.elementsOf(this)[0];
    this.I = e ? e.current : 0;
    this.Vd = sim.v(this.T('a')) - sim.v(this.T('b'));
    if (c.type === 'lamp') {
      const P = this.I * this.I * c.R;
      const k = Math.min(1.4, P / (c.Prated || 1));
      setLampGlow(this.model, c.burnt ? 0 : k);
      if (!c.burnt && c.canBurn && P > (c.Prated || 1) * 3.5) { c.burnt = true; this.game.emit('burnout', this); this.updateLabel(); setLampGlow(this.model, 0, true); this.game.changed('burnout'); }
    }
    if (c.type === 'fuse' && !c.blown && Math.abs(this.I) > c.rating) {
      c.blown = true; this.game.emit('fuseBlown', this);
      this.set(c); this.game.spark(this.group.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
      this.game.changed('fuse');
    }
    if (c.type === 'resistor') {
      const P = this.I * this.I * c.R;
      const heat = Math.min(1, P / ((c.Prated || 0.5) * 1.5));
      this.model.userData.setHeat?.(heat);
    }
  }

  setTargetGlow(on) { this.outline.material.opacity = on ? 0.55 : 0; }
}

function setLampGlow(model, k, dead = false) {
  const { filament, glass, light } = model.userData;
  if (!filament) return;
  filament.material.emissiveIntensity = k * 6;
  filament.material.color.setHSL(0.09 + Math.min(k, 1) * 0.04, 1, 0.2 + Math.min(k, 1) * 0.6);
  filament.material.emissive.copy(filament.material.color);
  glass.material.emissive.setHSL(0.12, 1, 0.5); glass.material.emissiveIntensity = Math.min(k, 1.2) * 0.55;
  light.intensity = Math.min(k, 1.3) * 9;
  glass.material.opacity = 0.35 + Math.min(k, 1) * 0.45;
  glass.material.color.set(dead ? 0x6b7280 : 0xffffff);
  const halo = model.userData.halo;
  if (halo) { halo.material.opacity = Math.min(1, k) * 0.95; halo.scale.setScalar(0.4 + Math.min(k, 1.3) * 2.6); }
}

let _halo = null;
function haloTex() {
  if (_halo) return _halo;
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d'); const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.25, 'rgba(255,214,120,.7)'); g.addColorStop(1, 'rgba(255,170,60,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  _halo = new THREE.CanvasTexture(cv); return _halo;
}

/** 3D models for slot contents (also used small in the parts bin) */
export function buildModel(c, span = 2.4) {
  const g = new THREE.Group();
  if (c.type === 'resistor') {
    const leadMat = STEEL();
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, span, 10), leadMat);
    lead.rotation.z = Math.PI / 2; g.add(lead);
    const bodyMat = std(0xe3cf9f, { roughness: 0.55, emissive: 0x000000 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.75, 8, 24), bodyMat);
    body.rotation.z = Math.PI / 2; body.castShadow = true; g.add(body);
    const bands = c.mystery ? null : bandsFor(c.R, c.tol ?? 5);
    const xs = [-0.32, -0.15, 0.02, 0.3];
    if (bands) bands.forEach((b, i) => {
      const metal = b.n === 'Gold' || b.n === 'Silver';
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.228, 0.228, 0.08, 28), std(b.hex, { metalness: metal ? 0.9 : 0.05, roughness: metal ? 0.25 : 0.45 }));
      ring.rotation.z = Math.PI / 2; ring.position.x = xs[i]; g.add(ring);
    });
    else {
      const tape = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.7, 28), std(0xf8fafc, { roughness: 0.9 }));
      tape.rotation.z = Math.PI / 2; g.add(tape);
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), new THREE.MeshBasicMaterial({ map: textTex('?', '#0f172a'), transparent: true }));
      q.position.set(0, 0.24, 0); q.rotation.x = -Math.PI / 2; q.userData.noPick = true; g.add(q);
    }
    g.userData.setHeat = h => { body.material.emissive?.setRGB(h * 0.9, h * 0.25, 0); };
  } else if (c.type === 'lamp') {
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, span, 10), STEEL());
    lead.rotation.z = Math.PI / 2; lead.position.y = -0.2; g.add(lead);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 28), std(0x1f2937)); base.position.y = -0.22; base.castShadow = true; g.add(base);
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.32, 24), BRASS()); sock.position.y = 0.05; g.add(sock);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0, emissive: 0x000000 }));
    glass.scale.set(1, 1.2, 1); glass.position.y = 0.62; g.add(glass);
    const filament = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 10, 24), std(0x4b1d06, { emissive: 0x000000 }));
    filament.position.y = 0.62; filament.rotation.x = Math.PI / 2; filament.userData.noPick = true; g.add(filament);
    const light = new THREE.PointLight(0xffd59a, 0, 7, 1.6); light.position.y = 0.7; g.add(light);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.y = 0.62; halo.scale.setScalar(0.1); halo.userData.noPick = true; g.add(halo);
    Object.assign(g.userData, { filament, glass, light, halo });
    if (c.burnt) glass.material.color.set(0x6b7280);
    [base, sock, glass, filament, halo].forEach(o => { o.position.y = o.position.y * 1.25 + 0.05; o.scale.multiplyScalar(1.25); });
    halo.scale.setScalar(0.1);
  } else if (c.type === 'fuse') {
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, span, 10), STEEL());
    lead.rotation.z = Math.PI / 2; lead.position.y = -0.1; g.add(lead);
    const holder = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 0.42), std(0x7f1d1d)); holder.position.y = -0.12; holder.castShadow = true; g.add(holder);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.85, 22, 1, true), new THREE.MeshStandardMaterial({ color: c.blown ? 0x57534e : 0xe0f2fe, transparent: true, opacity: c.blown ? 0.75 : 0.35, side: THREE.DoubleSide, emissive: 0x000000 }));
    tube.rotation.z = Math.PI / 2; tube.position.y = 0.1; g.add(tube);
    [-0.45, 0.45].forEach(x => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 22), STEEL()); cap.rotation.z = Math.PI / 2; cap.position.set(x, 0.1, 0); g.add(cap); });
    if (!c.blown) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.8, 8), std(0xe5e7eb, { metalness: 0.8 })); w.rotation.z = Math.PI / 2; w.position.y = 0.1; g.add(w); }
    else { const s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), std(0x0c0a09, { roughness: 1 })); s.position.y = 0.1; g.add(s); }
  }
  return g;
}

function textTex(txt, color = '#fff', bg = null, w = 128, h = 96, font = 'bold 72px Arial') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); }
  c.fillStyle = color; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// =====================================================================
export class Switch extends Part {
  constructor(game, o = {}) {
    super(game, { name: 'Switch', ...o });
    this.kind = 'switch';
    this.closed = o.closed ?? false;
    const span = 2.4;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(span + 0.7, 0.08, 0.9), std(0x0f172a, { roughness: 0.7 })); plate.position.y = 0.04; this.group.add(plate);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.7), std(0x5b2c0e, { roughness: 0.6 })); base.position.y = 0.16; base.castShadow = true; this.group.add(base);
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.2), BRASS()); hinge.position.set(-0.55, 0.38, 0); this.group.add(hinge);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.2), BRASS()); jaw.position.set(0.55, 0.4, 0); this.group.add(jaw);
    this.pivot = new THREE.Group(); this.pivot.position.set(-0.55, 0.5, 0); this.group.add(this.pivot);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.09, 0.05), std(0xc2410c, { metalness: 0.85, roughness: 0.2 })); blade.position.x = 0.58; this.pivot.add(blade);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 14), std(0x111827)); handle.rotation.x = Math.PI / 2; handle.position.x = 1.15; this.pivot.add(handle);
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, span, 8), STEEL()); lead.rotation.z = Math.PI / 2; lead.position.y = 0.2; this.group.add(lead);
    this.addTerminal('a', -span / 2, 0); this.addTerminal('b', span / 2, 0);
    this.angle = this.closed ? 0 : 0.85;
    this.pivot.rotation.z = this.angle;
    [base, blade, handle, hinge, jaw].forEach(m => this.body(m, { tip: () => `<b>Switch</b> · ${this.closed ? '<span class="kw">CLOSED</span>' : '<span class="kw">OPEN</span>'}<small>${this.locked ? 'locked for this level' : 'click to flip'}</small>`, click: () => this.toggle() }));
    this.stage.updaters.add(dt => { const tgt = this.closed ? 0 : 0.85; this.angle += (tgt - this.angle) * Math.min(1, dt * 12); this.pivot.rotation.z = this.angle; });
  }
  toggle() { if (this.locked) return this.game.say('That switch is locked for now.'); this.closed = !this.closed; this.game.sfx('click'); this.game.changed('switch'); }
  elements() { return this.closed ? [{ a: this.T('a').id, b: this.T('b').id, G: 100, part: this }] : []; }
}

// =====================================================================
// Digital multimeter: mode dial (OFF / V / A / Ω) and two jacks you wire probes from.
export class Meter extends Part {
  constructor(game, o = {}) {
    super(game, { name: 'Multimeter', ...o });
    this.kind = 'meter';
    this.modes = o.modes || ['OFF', 'V', 'A', 'Ω'];
    this.mode = o.mode || 'OFF';
    this.fuseBlown = false; this.reading = '';
    const g = this.group;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 2.4), std(0xf59e0b, { roughness: 0.55 }));
    body.position.y = 0.14; body.castShadow = true; g.add(body);
    const faceM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 2.2), std(0x1f2937)); faceM.position.y = 0.3; g.add(faceM);
    // screen
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 220;
    this.scr = { cv, tex: new THREE.CanvasTexture(cv) }; this.scr.tex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.52), new THREE.MeshBasicMaterial({ map: this.scr.tex }));
    screen.rotation.x = -Math.PI / 2; screen.position.set(0, 0.33, -0.65); g.add(screen);
    // dial
    this.dial = new THREE.Group(); this.dial.position.set(0, 0.36, 0.2); g.add(this.dial);
    const dialM = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.12, 32), std(0x111827, { metalness: 0.4 })); this.dial.add(dialM);
    const ptr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.36), std(0xffffff, { emissive: 0x999999 })); ptr.position.set(0, 0.07, -0.18); this.dial.add(ptr);
    const ringTex = this.stage.canvasTexture(256, 256, (c) => {
      c.fillStyle = '#e2e8f0'; c.font = 'bold 34px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      this.modes.forEach((m, i) => { const a = -Math.PI / 2 + (i - (this.modes.length - 1) / 2) * 0.75; c.fillText(m, 128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); });
    });
    const ringLab = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true }));
    ringLab.rotation.x = -Math.PI / 2; ringLab.position.set(0, 0.325, 0.2); g.add(ringLab);
    [dialM, ptr].forEach(m => this.body(m, { tip: () => `<b>Mode dial</b> · ${this.label()}<small>click to change: ${this.modes.join(' → ')}</small>`, click: () => this.cycle() }));
    this.body(body, { tip: () => `<b>Multimeter</b> · ${this.label()}<small><span class="kw">V</span>: probes across (parallel) · <span class="kw">A</span>: in the path (series) · <span class="kw">Ω</span>: power OFF</small>` });
    this.addTerminal('com', -0.35, 0.95, { color: 0x111827, label: 'COM (black probe)', y: 0.28 });
    this.addTerminal('red', 0.35, 0.95, { color: 0xdc2626, label: 'V Ω A (red probe)', y: 0.28 });
    this.readLabel = this.stage.label(this.group, [0, 1.0, -0.65], '', 'meter');
    this.draw();
  }

  label() { return { OFF: 'off', V: 'volts', A: 'amps', 'Ω': 'ohms' }[this.mode]; }

  cycle() {
    const i = this.modes.indexOf(this.mode);
    this.mode = this.modes[(i + 1) % this.modes.length];
    this.fuseBlown = false;
    this.game.sfx('click');
    this.game.changed('meterMode');
  }

  elements() {
    const a = this.T('red').id, b = this.T('com').id;
    if (this.mode === 'V') return [{ a, b, G: 1e-7, part: this }];
    if (this.mode === 'A' && !this.fuseBlown) return [{ a, b, G: 20, part: this }];
    if (this.mode === 'Ω') return [{ a, b, I: 0.001, part: this, ohm: true }, { a, b, G: 1e-9, part: this }];
    return [];
  }

  after(sim) {
    const vd = sim.v(this.T('red')) - sim.v(this.T('com'));
    let txt = '', unit = '';
    if (this.mode === 'OFF') txt = '';
    else if (this.mode === 'V') { txt = fmtMeter(vd); unit = 'V'; this.value = vd; }
    else if (this.mode === 'A') {
      if (this.fuseBlown) txt = 'FUSE';
      else {
        const I = vd * 20; this.value = I;
        if (Math.abs(I) > 2.5) { this.fuseBlown = true; this.game.emit('meterFuse', this); this.game.changed('meterFuse'); txt = 'FUSE'; }
        else if (Math.abs(I) < 1) { txt = fmtMeter(I * 1000); unit = 'mA'; } else { txt = fmtMeter(I); unit = 'A'; }
      }
    } else if (this.mode === 'Ω') {
      if (sim.liveAcross(this)) { txt = 'LIVE!'; this.value = NaN; if (!this._warnedLive) { this._warnedLive = true; this.game.emit('ohmLive', this); } }
      else {
        this._warnedLive = false;
        const R = vd / 0.001; this.value = R;
        if (R > 2e7) txt = 'OL';
        else { const s = eng(R, 'Ω', 4).split(' '); txt = s[0]; unit = s[1] || 'Ω'; }
      }
    }
    this.reading = txt; this.unit = unit;
    this.draw();
  }

  draw() {
    const key = `${this.mode}|${this.reading}|${this.unit}`;
    if (key === this._drawn) return; this._drawn = key;
    const { cv, tex } = this.scr; const c = cv.getContext('2d');
    c.fillStyle = this.mode === 'OFF' ? '#3a4a3a' : '#a3c79a'; c.fillRect(0, 0, 512, 220);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(10, 10, 492, 200);
    c.fillStyle = '#0b1a0b'; c.font = 'bold 28px monospace'; c.fillText(this.mode === 'OFF' ? '' : this.mode === 'Ω' ? 'OHMS' : this.mode === 'V' ? 'DC VOLTS' : 'DC AMPS', 24, 44);
    c.font = 'bold 110px monospace'; c.textAlign = 'right';
    c.fillText(this.reading, 400, 170);
    c.font = 'bold 44px monospace'; c.fillText(this.unit || '', 494, 170);
    tex.needsUpdate = true;
    this.dial.rotation.y = -(this.modes.indexOf(this.mode) - (this.modes.length - 1) / 2) * 0.75;
    this.readLabel.set(this.mode === 'OFF' ? '' : `<b>${this.reading}</b> ${this.unit || ''}`);
    this.readLabel.el.style.visibility = this.mode === 'OFF' ? 'hidden' : 'visible';
  }
}

function fmtMeter(x) {
  const a = Math.abs(x);
  if (a < 0.0005) return '0.00';
  if (a >= 100) return x.toFixed(1);
  if (a >= 10) return x.toFixed(2);
  return x.toFixed(3);
}

// =====================================================================
// Parts bin: a tray of spare parts you click to pick up, then click a slot to drop in.
export class Bin extends Part {
  constructor(game, o = {}) {
    super(game, { name: 'Parts bin', ...o });
    this.kind = 'bin';
    this.items = [];
    this.showValues = o.showValues ?? false;
    const n = Math.max(o.items.length, 3);
    const w = n * 1.1 + 0.4;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, 1.6), std(0x1d4ed8, { roughness: 0.6 })); tray.position.y = 0.09; tray.castShadow = true; this.group.add(tray);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.06, 1.4), std(0x0b1d4d)); inner.position.y = 0.17; this.group.add(inner);
    this.binLabel = this.stage.label(this.group, [0, 0.35, 1.0], o.title || 'PARTS BIN', 'bin');
    this.layout = o.items.map((spec, i) => ({ spec, x: -w / 2 + 0.75 + i * 1.1 }));
    this.layout.forEach(({ spec, x }) => this.addItem(spec, x));
  }

  addItem(spec, x) {
    const holder = new THREE.Group(); holder.position.set(x, 0.42, 0);
    const m = buildModel(spec, 0.95); m.scale.setScalar(0.72);
    holder.add(m); this.group.add(holder);
    const item = { spec: { ...spec }, holder, x, used: false };
    const lab = this.stage.label(holder, [0, 0.7, 0], this.itemLabel(spec), 'binitem');
    item.lab = lab;
    m.traverse(o => {
      if (!o.isMesh || o.userData.noPick) return;
      this.stage.pickable(o, {
        hover: on => { holder.position.y = on || this.game.binSelection === item ? 0.62 : 0.42; this.game.tip(on ? this.itemTip(item.spec) : null); },
        click: () => this.game.selectBinItem(item),
        disabled: () => item.used,
      });
    });
    this.items.push(item);
    return item;
  }

  itemLabel(s) {
    if (s.type === 'resistor') return this.showValues ? eng(s.R, 'Ω') : '';
    if (s.type === 'fuse') return `spare fuse`;
    if (s.type === 'lamp') return 'lamp';
    return '';
  }
  itemTip(s) {
    if (s.type === 'resistor') { const b = bandsFor(s.R, s.tol ?? 5); return `<b>Resistor</b><small>${b.map(x => `<i class="sw" style="--c:${x.hex}"></i>${x.n}`).join(' ')}${this.showValues ? ` = ${eng(s.R, 'Ω')}` : ''}</small>`; }
    if (s.type === 'fuse') return `<b>Spare fuse</b> · ${s.rating} A<small>click, then click the blown fuse</small>`;
    return '<b>Lamp</b>';
  }

  take(item) { item.used = true; item.holder.visible = false; item.lab.el.style.display = 'none'; }
  giveBack(spec) {
    const free = this.items.find(i => i.used);
    if (free) { free.spec = { ...spec }; free.used = false; free.holder.clear(); const m = buildModel(spec, 0.95); m.scale.setScalar(0.72); free.holder.add(m); free.holder.visible = true;
      m.traverse(o => { if (o.isMesh && !o.userData.noPick) this.stage.pickable(o, { hover: on => { free.holder.position.y = on ? 0.62 : 0.42; this.game.tip(on ? this.itemTip(free.spec) : null); }, click: () => this.game.selectBinItem(free), disabled: () => free.used }); });
      free.lab.set(this.itemLabel(spec)); free.lab.el.style.display = ''; }
  }
}

// =====================================================================
// A little monitor on a stand (graphs, readouts). Levels draw on it with draw(fn).
export class Screen extends Part {
  constructor(game, o = {}) {
    super(game, { name: 'Bench monitor', ...o });
    this.kind = 'screen';
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.1, 12), std(0x334155, { metalness: 0.6 })); stand.position.y = 0.55; this.group.add(stand);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.08, 24), std(0x1f2937)); foot.position.y = 0.04; this.group.add(foot);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.15, 0.14), std(0x111827, { metalness: 0.4 })); frame.position.y = 2.0; frame.castShadow = true; this.group.add(frame);
    const cv = document.createElement('canvas'); cv.width = 768; cv.height = 480;
    this.cv = cv; this.tex = new THREE.CanvasTexture(cv); this.tex.colorSpace = THREE.SRGBColorSpace;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.94), new THREE.MeshBasicMaterial({ map: this.tex }));
    scr.position.set(0, 2.0, 0.075); this.group.add(scr);
    this.group.rotation.x = 0;
    this.draw(() => {});
  }
  draw(fn) {
    const c = this.cv.getContext('2d');
    c.fillStyle = '#04110f'; c.fillRect(0, 0, 768, 480);
    fn(c, 768, 480);
    this.tex.needsUpdate = true;
  }
}
