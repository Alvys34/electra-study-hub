// scene.js - the 3D bench: the part on a surface plate, hover and click on its faces, and the tool drawn where
// it was put. All the measuring logic is in measure.js; this file only draws and reports clicks.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const COL = { part: 0xb7c1cb, hover: 0x1aa6c8, picked: 0xf2b84b, edge: 0x1d2630, steel: 0xdfe4e9, dark: 0x3c4a5a, granite: 0x2a2f37 };
const v3 = a => new THREE.Vector3(...a);

export class Bench {
  constructor(host, { onHover, onClick }) {
    this.host = host; this.onHover = onHover; this.onClick = onClick;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.02, 200);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    host.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.1, enablePan: false, maxPolarAngle: 1.52 });

    // A soft studio reflection so the steel reads as metal.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; pmrem.dispose();
    this.scene.environmentIntensity = 0.7;
    this.scene.add(new THREE.HemisphereLight(0xe6f0ff, 0x30281c, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 9, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9cc8ff, 0.8); fill.position.set(-6, 3, -4); this.scene.add(fill);

    this.plate = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 9), new THREE.MeshStandardMaterial({ color: COL.granite, roughness: 0.75 }));
    this.plate.position.y = -0.3; this.plate.receiveShadow = true;
    this.plate.userData.surface = 'plate';
    this.scene.add(this.plate);

    this.partGroup = new THREE.Group(); this.scene.add(this.partGroup);
    this.tool = null; this.meshes = []; this.hovered = null; this.state = {};
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2();
    this.bindInput();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.resize();
    this.tick = this.tick.bind(this); this.raf = requestAnimationFrame(this.tick);
  }

  setTheme(light) {
    this.scene.background = new THREE.Color(light ? 0xe9ecef : 0x0f1822);
  }

  // Builds one mesh per surface (so each can light up on its own) plus dark outlines on the edges.
  setPart(geo, scale, flipped) {
    this.partGroup.clear(); this.meshes = []; this.geo = geo; this.scale = scale;
    for (const s of geo.surfaces) {
      const mat = new THREE.MeshStandardMaterial({ color: COL.part, metalness: 0.55, roughness: 0.38, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      let g, edges;
      if (s.poly && s.axis === 'z') {
        const shape = new THREE.Shape(s.poly.map(([x, y]) => new THREE.Vector2(x, y)));
        g = new THREE.ShapeGeometry(shape); g.translate(0, 0, s.at);
        edges = [s.poly];
      } else if (s.poly) {
        g = new THREE.BufferGeometry().setFromPoints(s.poly.map(v3)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
        edges = [s.poly];
      } else if (s.ring) {
        g = new THREE.RingGeometry(s.ring[0], s.ring[1], 72); g.rotateX(-Math.PI / 2); g.translate(0, s.at, 0);
        edges = s.ring.filter(r => r > 0).map(r => Array.from({ length: 73 }, (_, i) => [r * Math.cos(i / 72 * 2 * Math.PI), s.at, r * Math.sin(i / 72 * 2 * Math.PI)]));
      } else {
        g = new THREE.CylinderGeometry(s.r, s.r, s.y1 - s.y0, 72, 1, true); g.translate(0, (s.y0 + s.y1) / 2, 0);
        edges = [];
      }
      const m = new THREE.Mesh(g, mat);
      m.castShadow = !s.inside; m.receiveShadow = true; m.userData.surface = s;
      this.partGroup.add(m); this.meshes.push(m);
      for (const loop of edges) {
        const pts = loop.map(v3); if (s.poly) pts.push(pts[0]);
        this.partGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: COL.edge })));
      }
    }
    this.setFlipped(flipped, true);
  }

  // Upside down = half a turn about x. Then sit the part on the plate, centred.
  setFlipped(flipped, frame = false) {
    const g = this.partGroup;
    g.scale.setScalar(this.scale); g.rotation.set(flipped ? Math.PI : 0, 0, 0); g.position.set(0, 0, 0);
    g.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -box.min.y, -c.z); g.updateMatrixWorld(true);
    this.box = new THREE.Box3().setFromObject(g);
    if (frame) this.frame();
  }

  frame() {
    const size = this.box.getSize(new THREE.Vector3()), c = this.box.getCenter(new THREE.Vector3()), R = Math.max(size.x, size.y, size.z, 2.2);
    this.controls.target.copy(c);
    this.camera.position.set(c.x + R * 0.9, c.y + R * 0.95, c.z + R * 1.9);
    this.controls.minDistance = R * 0.5; this.controls.maxDistance = R * 5;
    this.controls.update();
  }

  // { hover: surface, picked: [surfaces] } -> colours.
  paint(state) {
    this.state = state;
    for (const m of this.meshes) {
      const s = m.userData.surface, picked = state.picked?.includes(s);
      m.material.emissive.setHex(picked ? COL.picked : s === state.hover ? COL.hover : 0x000000);
      m.material.emissiveIntensity = picked ? (state.placed ? 0.22 : 0.55) : 0.5;
    }
    this.plate.material.emissive.setHex(state.picked?.some(s => s.plate) ? 0x5a3f08 : state.hover?.plate ? 0x0b4b5c : 0);
  }

  toWorld(p) { return this.partGroup.localToWorld(v3(p)); }

  bindInput() {
    const el = this.renderer.domElement;
    let down = null;
    const hit = e => {
      const r = el.getBoundingClientRect();
      this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.ray.setFromCamera(this.ptr, this.camera);
      const h = this.ray.intersectObjects([...this.meshes, this.plate], false)[0];
      if (!h) return null;
      const s = h.object.userData.surface;
      return { surface: s, point: this.partGroup.worldToLocal(h.point.clone()).toArray() };
    };
    el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && !e.buttons) this.onHover(hit(e)); });
    el.addEventListener('pointerleave', () => this.onHover(null));
    el.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
      down = null;
      this.onClick(hit(e));
    });
    this.cursor = c => { el.style.cursor = c; };
  }

  // Draws the tool for a measurement. `r` comes from measure(): contact points A and B in part coordinates.
  showTool(kind, r) {
    this.clearTool();
    const A = this.toWorld(r.A), B = this.toWorld(r.B), g = new THREE.Group(), moving = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: COL.steel, metalness: 0.75, roughness: 0.28 });
    const dark = new THREE.MeshStandardMaterial({ color: COL.dark, metalness: 0.3, roughness: 0.5 });
    // u: along the measured line, from A to B (the part's axis for that dimension, turned with the part).
    const u = v3({ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[r.axis || 'x']).transformDirection(this.partGroup.matrixWorld);
    if (B.clone().sub(A).dot(u) < 0) u.negate();
    const len = B.clone().sub(A).dot(u);
    let open = new THREE.Vector3();

    if (kind === 'height') {
      const cx = this.box.max.x + 0.9, top = Math.max(this.box.max.y + 1.2, 2.5);
      g.add(box([cx, 0.15, A.z], [1.3, 0.3, 1.1], dark));
      g.add(bar(v3([cx, 0.3, A.z]), v3([cx, top, A.z]), 0.18, 0.32, steel));
      moving.add(box([cx, A.y + 0.12, A.z], [0.4, 0.5, 0.45], steel));
      moving.add(bar(v3([cx - 0.2, A.y + 0.02, A.z]), v3([A.x, A.y + 0.02, A.z]), 0.04, 0.12, steel, new THREE.Vector3(0, 0, 1)));
      open.set(0, 0.5, 0);
    } else if (kind === 'depthmic' || r.mode === 'depth rod') {
      // u points down from the base face to the floor.
      const upw = u.clone().negate();
      if (kind === 'depthmic') {
        g.add(box([A.x, A.y + 0.07, A.z], [2.4, 0.14, 0.38], steel));
        g.add(cylinder(A.clone().addScaledVector(upw, 0.14), A.clone().addScaledVector(upw, 1.1), 0.11, steel));
        moving.add(cylinder(A.clone().addScaledVector(upw, 0.75), A.clone().addScaledVector(upw, 1.55), 0.16, steel));
      } else {
        g.add(bar(A, A.clone().addScaledVector(upw, 4), 0.09, 0.32, steel, new THREE.Vector3(0, 0, 1)));
        moving.add(box([A.x, A.y + 1.6, A.z], [0.2, 0.9, 0.5], steel));
      }
      moving.add(cylinder(A.clone().addScaledVector(upw, 0.6), B, 0.025, steel));
      open.copy(upw).multiplyScalar(Math.min(0.5, len));
    } else {
      // Caliper, micrometer, rule: the tool lies in the plane of u and d, offset from the part along d.
      const round = r.round === 'outside';
      // Vertical lines get the tool from the right, so its flat side faces you; diameters from the front.
      const d = new THREE.Vector3(...(Math.abs(u.y) > 0.9 ? [1, 0, 0] : round ? [0, 0, 1] : [0, 1, 0]));
      // Both contacts in one plane of u and d (the jaws stay parallel).
      const AB = B.clone().sub(A);
      B.copy(A).addScaledVector(u, AB.dot(u)).addScaledVector(d, AB.dot(d));
      const reach = Math.max(...corners(this.box).map(c => c.dot(d))) + 0.3;
      const out = p => p.clone().addScaledVector(d, reach - p.dot(d));
      if (kind === 'rule') {
        // Laid flat against the top (or front) of the part, its end lined up with the first face.
        const flat = p => out(p).addScaledVector(d, -0.28);
        g.add(bar(flat(A), flat(B).addScaledVector(u, 1.2), 0.55, 0.025, steel, d));
        g.add(bar(A, flat(A), 0.012, 0.012, dark, u), bar(B, flat(B), 0.012, 0.012, dark, u));
      } else if (kind === 'mic') {
        const a0 = A.clone().addScaledVector(u, -0.3), s0 = B.clone().addScaledVector(u, 0.5);
        g.add(cylinder(a0, A, 0.09, steel));
        g.add(bar(a0, out(a0), 0.16, 0.22, dark, u), bar(out(a0), out(s0), 0.16, 0.22, dark, d), bar(out(s0), s0, 0.16, 0.22, dark, u));
        moving.add(cylinder(B, s0.clone().addScaledVector(u, 0.6), 0.09, steel));
        g.add(cylinder(s0, s0.clone().addScaledVector(u, 0.9), 0.13, steel));
        moving.add(cylinder(s0.clone().addScaledVector(u, 0.75), s0.clone().addScaledVector(u, 1.6), 0.18, steel));
        moving.add(cylinder(s0.clone().addScaledVector(u, 1.6), s0.clone().addScaledVector(u, 1.9), 0.11, steel));
        open.copy(u).multiplyScalar(0.25);
      } else {
        const sgn = r.mode === 'inside jaws' ? -1 : 1;
        g.add(bar(out(A).addScaledVector(u, -0.8), out(B).addScaledVector(u, 2.4), 0.07, 0.34, steel, d));
        g.add(bar(A, out(A), 0.05, 0.14, steel, u));
        moving.add(bar(B, out(B), 0.05, 0.14, steel, u));
        moving.add(box(out(B).addScaledVector(u, 0.35).toArray(), [0, 0, 0], steel, { along: u, d, size: [0.8, 0.5, 0.14] }));
        open.copy(u).multiplyScalar(0.35 * sgn);
      }
    }
    g.add(moving);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    this.scene.add(g);
    this.tool = g;
    // The moving jaw / spindle starts open and closes onto the part.
    this.anim = { obj: moving, from: open, t0: performance.now() };
  }

  clearTool() {
    if (!this.tool) return;
    this.scene.remove(this.tool);
    this.tool.traverse(o => { o.geometry?.dispose(); });
    this.tool = null; this.anim = null;
  }

  resize() {
    const w = this.host.clientWidth || 600, h = this.host.clientHeight || 400;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    if (this.anim) {
      const k = Math.min(1, (now - this.anim.t0) / 420), ease = 1 - (1 - k) ** 3;
      this.anim.obj.position.copy(this.anim.from).multiplyScalar(1 - ease);
      if (k === 1) this.anim = null;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.raf); this.ro.disconnect(); this.controls.dispose(); this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

const corners = b => [0, 1, 2, 3, 4, 5, 6, 7].map(i => new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));

// A box from p to q: `w` across, `h` along `upHint` (projected square to the bar).
function bar(p, q, w, h, mat, upHint = new THREE.Vector3(0, 1, 0)) {
  const dir = q.clone().sub(p), len = Math.max(dir.length(), 1e-4); dir.normalize();
  const yAx = upHint.clone().addScaledVector(dir, -upHint.dot(dir));
  if (yAx.lengthSq() < 1e-6) { yAx.set(...(Math.abs(dir.y) < 0.9 ? [0, 1, 0] : [1, 0, 0])); yAx.addScaledVector(dir, -yAx.dot(dir)); }
  yAx.normalize();
  const xAx = new THREE.Vector3().crossVectors(yAx, dir);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), mat);
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAx, yAx, dir));
  m.position.copy(p).add(q).multiplyScalar(0.5);
  return m;
}

// An axis-aligned box at c, or (with opts) one lined up with u and d.
function box(c, size, mat, opts) {
  if (opts) {
    const { along, d, size: [l, h, w] } = opts, p = v3(c);
    return bar(p.clone().addScaledVector(along, -l / 2), p.clone().addScaledVector(along, l / 2), w, h, mat, d);
  }
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  m.position.set(...c);
  return m;
}

function cylinder(p, q, r, mat) {
  const dir = q.clone().sub(p), len = Math.max(dir.length(), 1e-4);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 28), mat);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.position.copy(p).add(q).multiplyScalar(0.5);
  return m;
}
