// FreeLab.js - Open-ended 3D electronics workbench sandbox at #/lab using the Game + MNA engine.
import * as THREE from 'three';
import { Game, fmtI } from '../game/engine/Game.js';
import { hl } from '../core/text.js';
import { eng, sig } from '../core/num.js';
import { sfx, toast } from '../core/fx.js';
import { buddy } from '../ui/Buddy.js';

const SAVE_KEY = 'electra.freelab.v1';
const E12_PRESETS = [10, 47, 100, 220, 330, 470, 1000, 2200, 4700, 10000, 47000, 100000];
const LIMITS = { supply: 3, resistor: 12, lamp: 8, switch: 6, fuse: 6, meter: 4 };
export class FreeLab {
  constructor(root, nav) {
    this.root = root;
    this.nav = nav;
    this.selected = null;
    this.drag = null;
    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
  }

  mount() {
    document.body.classList.add('playing', 'lab-open');
    const wrap = document.createElement('div');
    wrap.className = 'g-wrap fl-wrap';
    wrap.innerHTML = `
      <div class="g-stage" id="flStage"></div>
      <div class="g-hud">
        <div class="g-top fl-top">
          <a class="g-btn" href="#/" title="Back to Home">← Home</a>
          <div class="g-title"><b>Free Workbench</b></div>
          <div class="fl-shelf" id="flShelf">
            <button class="g-btn fl-add" data-add="supply" title="Add DC Power Supply">🔋 +Supply</button>
            <button class="g-btn fl-add" data-add="resistor" title="Add Resistor">🟫 +Resistor</button>
            <button class="g-btn fl-add" data-add="lamp" title="Add Lamp">💡 +Lamp</button>
            <button class="g-btn fl-add" data-add="switch" title="Add Switch">🔀 +Switch</button>
            <button class="g-btn fl-add" data-add="fuse" title="Add Fuse">🧨 +Fuse</button>
            <button class="g-btn fl-add" data-add="meter" title="Add Digital Multimeter">📟 +Meter</button>
          </div>
          <div class="g-top-r">
            <select class="g-btn fl-tpl" id="flTpl" aria-label="Load starter circuit">
              <option value="">Starter circuits…</option>
              <option value="lamp">Lamp & fuse loop</option>
              <option value="ohm">Ohm's law (V & A)</option>
              <option value="divider">Voltage divider</option>
              <option value="parallel">Parallel branches</option>
              <option value="combo">Series–parallel</option>
              <option value="empty">Clear bench</option>
            </select>
            <button class="g-btn" id="flArrange" title="Tidy & separate all parts on the bench">✨ Tidy</button>
            <button class="g-btn" id="flView" title="Recenter 3D camera">🎯 View</button>
            <button class="g-btn" id="flClearWires" title="Remove all wires">✂️ Unwire</button>
          </div>
        </div>
        <div class="fl-tele" id="flTele"></div>
        <div class="fl-insp" id="flInsp" hidden></div>
        <div class="fl-help">Drag to move · Click terminals to wire · Click a wire to cut · Click a part to inspect</div>
        <div class="g-hintbar" id="flHint" hidden></div>
        <div class="g-tip" id="flTip" hidden></div>
      </div>`;
    document.body.appendChild(wrap);
    this.root = wrap;

    const tip = this.root.querySelector('#flTip');
    const hint = this.root.querySelector('#flHint');
    this.onTipMove = e => {
      if (!tip.hidden) {
        tip.style.left = e.clientX + 16 + 'px';
        tip.style.top = e.clientY + 16 + 'px';
      }
    };
    window.addEventListener('pointermove', this.onTipMove);

    const ui = {
      startLevel() {},
      panel() {},
      ask() {},
      objectiveDone() {},
      levelComplete() {},
      say: t => {
        toast(hl(t).replace(/<[^>]+>/g, ''));
        buddy.onBenchEvent(t);
      },
      tip: html => {
        if (!html) { tip.hidden = true; return; }
        tip.innerHTML = html;
        tip.hidden = false;
      },
      hintBar: t => {
        hint.hidden = !t;
        if (t) hint.innerHTML = hl(t);
      },
    };

    const stageEl = this.root.querySelector('#flStage');
    this.game = new Game(stageEl, ui);
    window.__electraGame = this.game;

    this.game.on('partClick', p => {
      if (this.justDragged) return;
      this.selectPart(p);
    });
    this.game.on('change', () => {
      this.saveState();
      this.updateTelemetry();
      if (this.selected) this.renderInspector();
    });

    // Attach drag handlers on the WebGL canvas (capture phase so we intercept part drags before OrbitControls)
    const dom = this.game.stage.renderer.domElement;
    dom.addEventListener('pointerdown', this.onDown, true);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp, true);

    this.root.querySelector('#flShelf').onclick = e => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      this.spawnPart(b.dataset.add);
    };

    const tpl = this.root.querySelector('#flTpl');
    tpl.onchange = () => {
      const v = tpl.value;
      tpl.value = '';
      if (!v) return;
      this.loadTemplate(v);
    };

    this.root.querySelector('#flArrange').onclick = () => {
      this.autoArrange();
      sfx.tap();
      buddy.onBenchTouch('arrange');
    };

    this.root.querySelector('#flView').onclick = () => {
      this.game.stage.frame([0, 9.4, 9.8], [0, 0.1, 0.1]);
      sfx.tap();
    };

    this.root.querySelector('#flClearWires').onclick = () => {
      [...this.game.wires].forEach(w => this.game.removeWire(w));
      sfx.tap();
      this.saveState();
      this.updateTelemetry();
    };

    // Load saved state or default starter template
    if (!this.loadSaved()) {
      this.loadTemplate('ohm');
    } else {
      // Ensure any previously overlapping parts from old saves are gently separated
      this.separateOverlaps();
    }
    const defaultPart = this.game.parts.find(p => p.kind === 'slot') || this.game.parts[0];
    if (defaultPart) setTimeout(() => this.selectPart(defaultPart), 80);
    setTimeout(() => this.updateTelemetry(), 80);
  }

  unmount() {
    document.body.classList.remove('playing', 'lab-open');
    window.removeEventListener('pointermove', this.onTipMove);
    const dom = this.game?.stage?.renderer?.domElement;
    if (dom) dom.removeEventListener('pointerdown', this.onDown, true);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp, true);
    this.game?.dispose();
    this.root?.remove();
  }

  // ------------------------------------------------------------------ Dragging parts on bench
  partExtents(p) {
    const t = typeof p === 'string' ? p : this.partType(p);
    const rot = typeof p === 'object' && p?.group ? Math.abs(Math.sin(p.group.rotation.y || 0)) > 0.5 : false;
    // True half-width (X) and half-depth (Z) on the 3D mat
    let hw = 1.38, hd = 0.78;
    if (t === 'supply') { hw = 1.45; hd = 1.15; }
    else if (t === 'meter') { hw = 0.95; hd = 1.25; }
    return rot ? [hd, hw] : [hw, hd];
  }

  isTerminalMesh(obj) {
    let cur = obj;
    while (cur) {
      if (this.game.terminals.some(t => t.post === cur)) return true;
      cur = cur.parent;
    }
    return false;
  }

  partFromHit(obj) {
    if (this.isTerminalMesh(obj)) return null;
    let cur = obj;
    while (cur) {
      const found = this.game.parts.find(p => p.group === cur);
      if (found) return found;
      cur = cur.parent;
    }
    return null;
  }

  resolveNonOverlappingPos(movingPart, targetX, targetZ) {
    let x = Math.max(-7.1, Math.min(7.1, targetX));
    let z = Math.max(-4.0, Math.min(3.9, targetZ));
    const [hwA, hdA] = this.partExtents(movingPart);

    // Iteratively push away from any overlapping neighbor using true 2D bounding boxes
    for (let iter = 0; iter < 5; iter++) {
      for (const other of this.game.parts) {
        if (other === movingPart) continue;
        const [hwB, hdB] = this.partExtents(other);
        const minX = hwA + hwB + 0.18;
        const minZ = hdA + hdB + 0.18;
        const dx = x - other.group.position.x;
        const dz = z - other.group.position.z;
        const overX = minX - Math.abs(dx);
        const overZ = minZ - Math.abs(dz);
        if (overX > 0 && overZ > 0) {
          if (overX < overZ) {
            x += (dx >= 0 ? 1 : -1) * (overX + 0.03);
          } else {
            z += (dz >= 0 ? 1 : -1) * (overZ + 0.03);
          }
          x = Math.max(-7.1, Math.min(7.1, x));
          z = Math.max(-4.0, Math.min(3.9, z));
        }
      }
    }
    return [x, z];
  }

  onDown(e) {
    if (e.button !== 0 || this.game.pending) return;
    const st = this.game.stage;
    st.setPtr(e);
    st.ray.setFromCamera(st.ptr, st.camera);

    // First check if user clicked directly on a terminal post (let wiring happen normally)
    const pickHits = st.ray.intersectObjects(st.pickables, true);
    if (pickHits.length && this.isTerminalMesh(pickHits[0].object)) {
      return;
    }

    // Raycast against all part 3D groups so ANY part (Supply, Resistor, Lamp, Switch, Fuse, Meter) can be dragged!
    const partGroups = this.game.parts.map(p => p.group);
    const hits = st.ray.intersectObjects(partGroups, true);
    if (!hits.length) return;

    const topObj = hits[0].object;
    const p = this.partFromHit(topObj);
    if (!p) return;

    const planeHit = new THREE.Vector3();
    if (!st.ray.ray.intersectPlane(st.benchPlane, planeHit)) return;

    // Immediately pause OrbitControls rotation while holding a part
    st.controls.enabled = false;
    this.drag = {
      part: p,
      hitObj: topObj,
      startX: e.clientX,
      startY: e.clientY,
      offset: p.group.position.clone().sub(planeHit),
      moved: false,
    };
  }

  onMove(e) {
    const st = this.game?.stage;
    if (!st) return;

    if (!this.drag) {
      // Show grab cursor when hovering over any draggable part body
      if (!st.hovered) {
        st.setPtr(e);
        st.ray.setFromCamera(st.ptr, st.camera);
        const hits = st.ray.intersectObjects(this.game.parts.map(p => p.group), true);
        if (hits.length && !this.isTerminalMesh(hits[0].object)) {
          st.renderer.domElement.style.cursor = 'grab';
        }
      }
      return;
    }

    const dx = e.clientX - this.drag.startX;
    const dy = e.clientY - this.drag.startY;
    if (!this.drag.moved && Math.hypot(dx, dy) > 5) {
      this.drag.moved = true;
      st.suppressNextClick = true;
      st.renderer.domElement.style.cursor = 'grabbing';
      this.selectPart(this.drag.part);
      buddy.onBenchTouch('drag');
    }
    if (!this.drag.moved) return;

    st.setPtr(e);
    st.ray.setFromCamera(st.ptr, st.camera);
    const hit = new THREE.Vector3();
    if (st.ray.ray.intersectPlane(st.benchPlane, hit)) {
      const desired = hit.add(this.drag.offset);
      const [nx, nz] = this.resolveNonOverlappingPos(this.drag.part, desired.x, desired.z);
      this.drag.part.group.position.set(nx, 0, nz);
      this.game.rebuildWiresFor(this.drag.part);
    }
  }

  onUp() {
    if (!this.drag) return;
    const { part, hitObj, moved } = this.drag;
    const st = this.game.stage;
    st.controls.enabled = true;
    st.renderer.domElement.style.cursor = 'grab';
    this.drag = null;

    if (moved) {
      this.justDragged = true;
      setTimeout(() => { this.justDragged = false; }, 80);
      this.saveState();
    } else {
      // If the user clicked a part mesh that isn't in st.pickables (e.g. Supply housing), select it in the Inspector!
      let hasPick = false;
      let cur = hitObj;
      while (cur) {
        if (cur.userData?.pick) { hasPick = true; break; }
        cur = cur.parent;
      }
      if (!hasPick) {
        this.selectPart(part);
        buddy.onBenchTouch('inspect');
      }
    }
  }

  // ------------------------------------------------------------------ Spawning & Non-Overlapping Layout
  partType(p) {
    if (p.kind === 'slot') return p.content?.type || 'resistor';
    return p.kind;
  }

  findFreeSpot(type = 'resistor') {
    const [hwNew, hdNew] = this.partExtents(type);
    // Clean 4-column x 3-row bench grid + extra outer slots so wide components never touch horizontally
    const candidates = [
      [-1.1, 0.2], [2.3, -2.0], [-1.1, 2.3], [2.3, 2.3],
      [-4.4, 2.2], [5.4, -0.4], [5.4, -2.3], [5.4, 1.9],
      [-4.4, -3.2], [-1.1, -3.2], [2.3, -3.2], [5.4, -3.2],
      [-4.4, 3.3], [-1.1, 3.3], [2.3, 3.3], [5.4, 3.3],
      [-6.5, -1.6], [-6.5, 0.6], [-6.5, 2.5], [6.6, -1.6], [6.6, 0.6], [6.6, 2.5],
    ];

    const hitsAny = (x, z) => this.game.parts.some(p => {
      const [hwP, hdP] = this.partExtents(p);
      const minX = hwNew + hwP + 0.32;
      const minZ = hdNew + hdP + 0.32;
      return Math.abs(p.group.position.x - x) < minX && Math.abs(p.group.position.z - z) < minZ;
    });

    for (const [x, z] of candidates) {
      if (!hitsAny(x, z)) return [x, 0, z];
    }

    // Fine grid search across the mat
    for (let z = -3.4; z <= 3.4; z += 0.65) {
      for (let x = -6.6; x <= 6.6; x += 0.75) {
        if (!hitsAny(x, z)) return [Math.round(x * 10) / 10, 0, Math.round(z * 10) / 10];
      }
    }

    // Fallback: pick spot with largest bounding-box clearance
    let best = [0, 0, 0];
    let bestClearance = -Infinity;
    for (let z = -3.5; z <= 3.5; z += 0.7) {
      for (let x = -6.8; x <= 6.8; x += 0.8) {
        let minClear = Infinity;
        for (const p of this.game.parts) {
          const [hwP, hdP] = this.partExtents(p);
          const cx = Math.abs(p.group.position.x - x) - (hwNew + hwP);
          const cz = Math.abs(p.group.position.z - z) - (hdNew + hdP);
          const clear = Math.max(cx, cz);
          if (clear < minClear) minClear = clear;
        }
        if (minClear > bestClearance) {
          bestClearance = minClear;
          best = [Math.round(x * 10) / 10, 0, Math.round(z * 10) / 10];
        }
      }
    }
    return best;
  }

  separateOverlaps() {
    if (!this.game?.parts?.length) return;
    let changed = false;
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < this.game.parts.length; i++) {
        const a = this.game.parts[i];
        const [hwA, hdA] = this.partExtents(a);
        for (let j = i + 1; j < this.game.parts.length; j++) {
          const b = this.game.parts[j];
          const [hwB, hdB] = this.partExtents(b);
          const minX = hwA + hwB + 0.22;
          const minZ = hdA + hdB + 0.22;
          let dx = b.group.position.x - a.group.position.x;
          let dz = b.group.position.z - a.group.position.z;
          const overX = minX - Math.abs(dx);
          const overZ = minZ - Math.abs(dz);
          if (overX > 0 && overZ > 0) {
            if (overX < overZ) {
              const s = dx >= 0 ? 1 : -1;
              a.group.position.x = Math.max(-7.0, Math.min(7.0, a.group.position.x - s * overX * 0.55));
              b.group.position.x = Math.max(-7.0, Math.min(7.0, b.group.position.x + s * overX * 0.55));
            } else {
              const s = dz >= 0 ? 1 : -1;
              a.group.position.z = Math.max(-3.9, Math.min(3.9, a.group.position.z - s * overZ * 0.55));
              b.group.position.z = Math.max(-3.9, Math.min(3.9, b.group.position.z + s * overZ * 0.55));
            }
            changed = true;
          }
        }
      }
    }
    if (changed) {
      this.game.parts.forEach(p => this.game.rebuildWiresFor(p));
      this.saveState();
    }
  }

  autoArrange() {
    const parts = this.game?.parts || [];
    if (!parts.length) return;
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(parts.length * 1.25))));
    const rows = Math.ceil(parts.length / cols);
    const xStep = cols > 1 ? Math.min(3.4, 11.8 / (cols - 1)) : 0;
    const zStep = rows > 1 ? Math.min(2.3, 6.2 / (rows - 1)) : 0;
    const x0 = -((cols - 1) * xStep) / 2;
    const z0 = -((rows - 1) * zStep) / 2;

    parts.forEach((p, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      p.group.position.set(Math.round((x0 + c * xStep) * 100) / 100, 0, Math.round((z0 + r * zStep) * 100) / 100);
    });
    parts.forEach(p => this.game.rebuildWiresFor(p));
    this.saveState();
    toast('✨ Bench parts arranged neatly!');
  }

  spawnPart(type, customOpts = null) {
    const count = this.game.parts.filter(p => this.partType(p) === type).length;
    if (!customOpts && count >= (LIMITS[type] || 8)) {
      toast(`Maximum of ${LIMITS[type]} ${type}s on the bench.`);
      return null;
    }
    const pos = customOpts?.pos || this.findFreeSpot(type);
    const rotY = customOpts?.rotY || 0;
    let p = null;
    if (type === 'supply') {
      p = this.game.supply({ pos, rotY, V: customOpts?.V ?? 12, on: customOpts?.on ?? true, adjustable: true, min: 0, max: 30, step: 1 });
    } else if (type === 'resistor') {
      const idx = count + 1;
      p = this.game.slot({
        pos, rotY,
        content: { type: 'resistor', R: customOpts?.R ?? 1000, tol: customOpts?.tol ?? 5, Prated: customOpts?.Prated ?? 0.5 },
        label: customOpts?.label ?? `R${idx}`,
      });
    } else if (type === 'lamp') {
      p = this.game.slot({
        pos, rotY,
        content: { type: 'lamp', R: customOpts?.R ?? 50, Prated: customOpts?.Prated ?? 2.88, canBurn: false },
        label: customOpts?.label ?? `L${count + 1}`,
      });
    } else if (type === 'fuse') {
      p = this.game.slot({
        pos, rotY,
        content: { type: 'fuse', rating: customOpts?.rating ?? 0.5, blown: !!customOpts?.blown },
        label: customOpts?.label ?? `F${count + 1}`,
      });
    } else if (type === 'switch') {
      p = this.game.switch({ pos, rotY, closed: customOpts?.closed ?? false });
    } else if (type === 'meter') {
      p = this.game.meter({ pos, rotY, mode: customOpts?.mode ?? 'V', modes: ['OFF', 'V', 'A', 'Ω'] });
    }
    if (p && !customOpts) {
      sfx.tap();
      this.selectPart(p);
      buddy.onBenchTouch('spawn');
      this.saveState();
    }
    return p;
  }

  loadTemplate(name) {
    this.selected = null;
    this.root.querySelector('#flInsp').hidden = true;
    this.game.load({
      id: 'freelab-' + name,
      objectives: [],
      camera: { pos: [0, 9.4, 9.8], target: [0, 0.1, 0.1] },
      setup: g => {
        if (name === 'empty') return;
        if (name === 'lamp') {
          const ps = this.spawnPart('supply', { pos: [-3.8, 0, -1.2], V: 12, on: true });
          const fz = this.spawnPart('fuse', { pos: [-1.0, 0, -2.0], rating: 0.5, label: 'F1 (0.5 A)' });
          const sw = this.spawnPart('switch', { pos: [1.8, 0, -2.0], closed: true });
          const lp = this.spawnPart('lamp', { pos: [2.2, 0, 1.0], R: 50, Prated: 2.88, label: 'Lamp (50 Ω)' });
          const m = this.spawnPart('meter', { pos: [-1.2, 0, 1.6], mode: 'V' });
          g.wire(ps.T('+'), fz.T('a'));
          g.wire(fz.T('b'), sw.T('a'));
          g.wire(sw.T('b'), lp.T('a'));
          g.wire(lp.T('b'), ps.T('-'));
          g.wire(m.T('red'), lp.T('a'));
          g.wire(m.T('com'), lp.T('b'));
        } else if (name === 'ohm') {
          const ps = this.spawnPart('supply', { pos: [-3.8, 0, -1.4], V: 12, on: true });
          const ma = this.spawnPart('meter', { pos: [-0.8, 0, -1.8], mode: 'A' });
          const r1 = this.spawnPart('resistor', { pos: [2.4, 0, -0.4], R: 1000, tol: 5, label: 'R1' });
          const mv = this.spawnPart('meter', { pos: [1.6, 0, 2.0], mode: 'V' });
          g.wire(ps.T('+'), ma.T('red'));
          g.wire(ma.T('com'), r1.T('a'));
          g.wire(r1.T('b'), ps.T('-'));
          g.wire(mv.T('red'), r1.T('a'));
          g.wire(mv.T('com'), r1.T('b'));
        } else if (name === 'divider') {
          const ps = this.spawnPart('supply', { pos: [-3.8, 0, -1.4], V: 12, on: true });
          const r1 = this.spawnPart('resistor', { pos: [-0.6, 0, -1.8], R: 1000, tol: 5, label: 'R1' });
          const r2 = this.spawnPart('resistor', { pos: [2.4, 0, -0.6], R: 2000, tol: 5, label: 'R2' });
          const mv = this.spawnPart('meter', { pos: [1.8, 0, 2.0], mode: 'V' });
          g.wire(ps.T('+'), r1.T('a'));
          g.wire(r1.T('b'), r2.T('a'));
          g.wire(r2.T('b'), ps.T('-'));
          g.wire(mv.T('red'), r2.T('a'));
          g.wire(mv.T('com'), r2.T('b'));
        } else if (name === 'parallel') {
          const ps = this.spawnPart('supply', { pos: [-3.9, 0, -1.2], V: 12, on: true });
          const ma = this.spawnPart('meter', { pos: [-1.4, 0, -2.0], mode: 'A' });
          const r1 = this.spawnPart('resistor', { pos: [2.2, 0, -1.6], R: 200, tol: 5, label: 'R1' });
          const sw = this.spawnPart('switch', { pos: [0.0, 0, 1.2], closed: true });
          const r2 = this.spawnPart('resistor', { pos: [2.6, 0, 1.2], R: 300, tol: 5, label: 'R2' });
          g.wire(ps.T('+'), ma.T('red'));
          g.wire(ma.T('com'), r1.T('a'));
          g.wire(r1.T('b'), ps.T('-'));
          g.wire(r1.T('a'), sw.T('a'));
          g.wire(sw.T('b'), r2.T('a'));
          g.wire(r2.T('b'), r1.T('b'));
        } else if (name === 'combo') {
          const ps = this.spawnPart('supply', { pos: [-3.9, 0, -1.4], V: 14, on: true });
          const r1 = this.spawnPart('resistor', { pos: [-0.8, 0, -2.0], R: 400, tol: 5, label: 'R1' });
          const r2 = this.spawnPart('resistor', { pos: [2.4, 0, -1.2], R: 600, tol: 5, label: 'R2' });
          const r3 = this.spawnPart('resistor', { pos: [2.4, 0, 1.0], R: 600, tol: 5, label: 'R3' });
          const mv = this.spawnPart('meter', { pos: [-1.0, 0, 1.8], mode: 'V' });
          g.wire(ps.T('+'), r1.T('a'));
          g.wire(r1.T('b'), r2.T('a'));
          g.wire(r2.T('a'), r3.T('a'));
          g.wire(r2.T('b'), r3.T('b'));
          g.wire(r2.T('b'), ps.T('-'));
          g.wire(mv.T('red'), r2.T('a'));
          g.wire(mv.T('com'), r2.T('b'));
        }
      },
    });
    this.saveState();
    const firstSlot = this.game.parts.find(p => p.kind === 'slot') || this.game.parts[0];
    if (firstSlot) setTimeout(() => this.selectPart(firstSlot), 50);
    setTimeout(() => this.updateTelemetry(), 50);
  }

  updateTelemetry() {
    const el = this.root?.querySelector('#flTele');
    if (!el || !this.game) return;
    const ps = this.game.parts.find(p => p.kind === 'supply');
    const I = ps ? Math.abs(ps.I || 0) : 0;
    const P = ps && ps.on ? Math.abs(ps.V * I) : 0;
    const statusDot = ps?.shorted ? '🔴 SHORT' : (ps?.on && I > 1e-5 ? '🟢 LIVE' : '⚪ IDLE');
    el.innerHTML = `
      <span class="fl-tele-badge">${statusDot}</span>
      <span>Supply: <b>${ps ? (ps.on ? ps.V.toFixed(1) + ' V' : 'OFF') : '—'}</b></span>
      <span>I_total: <b>${fmtI(I)}</b></span>
      <span>P_total: <b>${eng(P, 'W')}</b></span>
      <span>Parts: <b>${this.game.parts.length}</b> · Wires: <b>${this.game.wires.length}</b></span>
    `;
  }

  // ------------------------------------------------------------------ Inspector Popover
  selectPart(p) {
    this.selected = p;
    this.renderInspector();
  }

  renderInspector() {
    const box = this.root.querySelector('#flInsp');
    const p = this.selected;
    if (!p || !this.game.parts.includes(p)) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const type = this.partType(p);

    let bodyHtml = '';
    if (type === 'supply') {
      bodyHtml = `
        <div class="fl-row">
          <label>Voltage: <b>${p.V.toFixed(1)} V</b></label>
          <input type="range" id="flSupV" min="0" max="30" step="0.5" value="${p.V}">
        </div>
        <div class="fl-row">
          <span>Current drawn: <b>${fmtI(p.I || 0)}</b></span>
          <button class="btn xs ${p.on && !p.tripped ? 'primary' : 'danger'}" id="flSupPwr">${p.tripped ? '⚠️ Reset Overload' : p.on ? 'Power: ON' : 'Power: OFF'}</button>
        </div>`;
    } else if (type === 'resistor') {
      const c = p.content;
      const I = Math.abs(p.I || 0), V = Math.abs(p.Vd || 0), P = I * I * c.R;
      bodyHtml = `
        <div class="fl-stats">V = <b>${sig(V, 3)} V</b> · I = <b>${fmtI(I)}</b> · P = <b>${eng(P, 'W')}</b></div>
        <div class="fl-presets">${E12_PRESETS.map(v => `<button class="pchip ${c.R === v ? 'on' : ''}" data-r="${v}">${eng(v, 'Ω')}</button>`).join('')}</div>
        <div class="fl-row">
          <label>Custom Ω:</label>
          <input class="inp xs" id="flResInput" type="number" min="1" max="10000000" step="any" value="${c.R}">
          <select class="inp xs" id="flResTol">
            <option value="5" ${c.tol === 5 ? 'selected' : ''}>±5% (Gold)</option>
            <option value="10" ${c.tol === 10 ? 'selected' : ''}>±10% (Silver)</option>
          </select>
        </div>`;
    } else if (type === 'lamp') {
      const c = p.content;
      const I = Math.abs(p.I || 0), V = Math.abs(p.Vd || 0), P = I * I * c.R;
      bodyHtml = `
        <div class="fl-stats">V = <b>${sig(V, 3)} V</b> · I = <b>${fmtI(I)}</b> · P = <b>${eng(P, 'W')}</b></div>
        <div class="fl-row">
          <label>Lamp R: <b>${c.R} Ω</b></label>
          <input type="range" id="flLampR" min="10" max="200" step="10" value="${c.R}">
        </div>`;
    } else if (type === 'fuse') {
      const c = p.content;
      bodyHtml = `
        <div class="fl-row">
          <label>Fuse Rating:</label>
          <div class="chips" id="flFuseR">${[0.25, 0.5, 1, 2].map(r => `<button class="pchip ${c.rating === r ? 'on' : ''}" data-r="${r}">${r} A</button>`).join('')}</div>
        </div>
        ${c.blown ? `<button class="btn primary sm" id="flFuseFix">🔧 Replace Blown Fuse</button>` : `<div class="fl-stats">Status: <b>Intact</b> (I = ${fmtI(p.I || 0)})</div>`}`;
    } else if (type === 'switch') {
      bodyHtml = `
        <div class="fl-row">
          <span>State: <b>${p.closed ? 'CLOSED (conducting)' : 'OPEN (broken)'}</b></span>
          <button class="btn sm primary" id="flSwTog">${p.closed ? 'Open Switch' : 'Close Switch'}</button>
        </div>`;
    } else if (type === 'meter') {
      bodyHtml = `
        <div class="fl-row">
          <label>Mode:</label>
          <div class="chips" id="flMeterM">${['OFF', 'V', 'A', 'Ω'].map(m => `<button class="pchip ${p.mode === m ? 'on' : ''}" data-m="${m}">${m}</button>`).join('')}</div>
        </div>
        ${p.fuseBlown ? `<button class="btn danger sm" id="flMeterFix">🔧 Replace Blown Ammeter Fuse</button>` : ''}`;
    }

    const titles = { supply: '🔋 DC Power Supply', resistor: '🟫 Resistor', lamp: '💡 Lamp Load', fuse: '🧨 Fuse', switch: '🔀 SPST Switch', meter: '📟 Digital Multimeter' };
    box.innerHTML = `
      <div class="fl-insp-h">
        <b>${titles[type] || 'Part'}</b>
        <div class="fl-insp-acts">
          <button class="icon-btn xs" id="flRot" title="Rotate 90°">↻</button>
          <button class="icon-btn xs" id="flDel" title="Delete part">🗑️</button>
          <button class="icon-btn xs" id="flClose" title="Close">✕</button>
        </div>
      </div>
      <div class="fl-insp-b">${bodyHtml}</div>
    `;

    box.querySelector('#flClose').onclick = () => { this.selected = null; box.hidden = true; };
    box.querySelector('#flRot').onclick = () => {
      p.group.rotation.y = (p.group.rotation.y + Math.PI / 2) % (Math.PI * 2);
      this.game.rebuildWiresFor(p);
      sfx.tap();
      this.saveState();
    };
    box.querySelector('#flDel').onclick = () => {
      this.game.removePart(p);
      this.selected = null;
      box.hidden = true;
      sfx.tap();
      this.saveState();
    };

    if (type === 'supply') {
      box.querySelector('#flSupV').oninput = e => {
        p.V = +e.target.value;
        this.game.changed('voltage');
      };
      box.querySelector('#flSupPwr').onclick = () => {
        if (p.tripped) p.tripped = false;
        else p.on = !p.on;
        this.game.changed('power');
      };
    } else if (type === 'resistor') {
      box.querySelectorAll('.fl-presets .pchip').forEach(b => b.onclick = () => {
        p.set({ ...p.content, R: +b.dataset.r });
        sfx.tap();
        this.game.changed('edit');
      });
      box.querySelector('#flResInput').onchange = e => {
        const v = Math.max(1, Math.min(10000000, parseFloat(e.target.value) || 1000));
        p.set({ ...p.content, R: v });
        this.game.changed('edit');
      };
      box.querySelector('#flResTol').onchange = e => {
        p.set({ ...p.content, tol: +e.target.value });
        this.game.changed('edit');
      };
    } else if (type === 'lamp') {
      box.querySelector('#flLampR').oninput = e => {
        p.set({ ...p.content, R: +e.target.value });
        this.game.changed('edit');
      };
    } else if (type === 'fuse') {
      box.querySelectorAll('#flFuseR .pchip').forEach(b => b.onclick = () => {
        p.set({ ...p.content, rating: +b.dataset.r, blown: false });
        sfx.tap();
        this.game.changed('edit');
      });
      const fix = box.querySelector('#flFuseFix');
      if (fix) fix.onclick = () => {
        p.set({ ...p.content, blown: false });
        sfx.good();
        this.game.changed('edit');
      };
    } else if (type === 'switch') {
      box.querySelector('#flSwTog').onclick = () => {
        p.closed = !p.closed;
        p.updatePose();
        sfx.tap();
        this.game.changed('switch');
      };
    } else if (type === 'meter') {
      box.querySelectorAll('#flMeterM .pchip').forEach(b => b.onclick = () => {
        p.mode = b.dataset.m;
        p.updateDial();
        sfx.tap();
        this.game.changed('meter');
      });
      const fix = box.querySelector('#flMeterFix');
      if (fix) fix.onclick = () => {
        p.fuseBlown = false;
        sfx.good();
        this.game.changed('meter');
      };
    }
  }

  // ------------------------------------------------------------------ Save / Load Bench State
  saveState() {
    if (!this.game?.parts) return;
    try {
      const parts = this.game.parts.map(p => {
        const type = this.partType(p);
        return {
          type,
          pos: [
            Math.round(p.group.position.x * 100) / 100,
            0,
            Math.round(p.group.position.z * 100) / 100,
          ],
          rotY: Math.round(p.group.rotation.y * 100) / 100,
          V: p.V,
          on: p.on,
          closed: p.closed,
          mode: p.mode,
          label: p.labelText,
          R: p.content?.R,
          tol: p.content?.tol,
          Prated: p.content?.Prated,
          rating: p.content?.rating,
        };
      });
      const wires = this.game.wires.map(w => ({
        pa: this.game.parts.indexOf(w.a.part),
        ka: w.a.key,
        pb: this.game.parts.indexOf(w.b.part),
        kb: w.b.key,
      })).filter(w => w.pa >= 0 && w.pb >= 0);
      localStorage.setItem(SAVE_KEY, JSON.stringify({ parts, wires }));
    } catch {}
  }

  loadSaved() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!raw || !Array.isArray(raw.parts)) return false;
      this.game.load({
        id: 'freelab-saved',
        objectives: [],
        camera: { pos: [0, 9.4, 9.8], target: [0, 0.1, 0.1] },
        setup: g => {
          const spawned = raw.parts.map(spec => this.spawnPart(spec.type, spec));
          (raw.wires || []).forEach(w => {
            const a = spawned[w.pa]?.T(w.ka);
            const b = spawned[w.pb]?.T(w.kb);
            if (a && b) g.wire(a, b);
          });
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
