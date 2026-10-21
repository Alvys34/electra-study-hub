// Stage.js - renderer, camera, workbench environment, picking (hover/click) and floating HTML labels
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Stage {
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1222);
    this.scene.fog = new THREE.Fog(0x0b1222, 18, 40);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 7.5, 9);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);

    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'g-labels';
    host.appendChild(this.labelLayer);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 16;
    this.controls.minPolarAngle = 0.25;
    this.controls.maxPolarAngle = 1.25;
    this.controls.target.set(0, 0.6, 0);
    if (opts.embedded) { this.controls.enableZoom = false; this.controls.minAzimuthAngle = -0.6; this.controls.maxAzimuthAngle = 0.6; this.controls.maxPolarAngle = 1.1; }

    this.updaters = new Set();
    this.labels = new Set();
    this.pickables = [];         // meshes with userData.pick = { hover(on), click(hit), cursor }
    this.hovered = null;
    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2();
    this.pointer = this.ptr;
    this.ptrScreen = { x: 0, y: 0 };
    this.onPointerMoveExtra = null;
    this.onEmptyClick = null;
    this.suppressNextClick = false;
    this.paused = false;

    this.buildEnvironment();
    this.bindInput();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  buildEnvironment() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a1408, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 11, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 1, far: 30 });
    key.shadow.bias = -0.0004;
    key.shadow.radius = 4;
    s.add(key);
    const rim = new THREE.DirectionalLight(0x60a5fa, 1.0); rim.position.set(-7, 5, -6); s.add(rim);
    const warm = new THREE.PointLight(0xffb86b, 18, 14, 1.6); warm.position.set(-5.5, 4.2, -2.5); s.add(warm);

    // table top: an anti-static lab mat with a subtle grid
    const matTex = this.canvasTexture(1024, 1024, (c, w, h) => {
      c.fillStyle = '#123a3a'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 2;
      for (let i = 0; i <= w; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 6; c.strokeRect(24, 24, w - 48, h - 48);
    });
    matTex.wrapS = matTex.wrapT = THREE.RepeatWrapping; matTex.repeat.set(2, 1.3);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(17, 0.08, 10.5), new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.85 }));
    mat.position.y = -0.04; mat.receiveShadow = true; s.add(mat);
    const wood = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 11.5), new THREE.MeshStandardMaterial({ color: 0x5b3a21, roughness: 0.7 }));
    wood.position.y = -0.33; wood.receiveShadow = true; s.add(wood);

    // pegboard wall
    const pegTex = this.canvasTexture(1024, 512, (c, w, h) => {
      c.fillStyle = '#1b2436'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#0d1320';
      for (let y = 20; y < h; y += 40) for (let x = 20; x < w; x += 40) { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); }
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(22, 10), new THREE.MeshStandardMaterial({ map: pegTex, roughness: 0.9 }));
    wall.position.set(0, 4.6, -5.4); s.add(wall);
    // a few tools hanging on the wall for flavour
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.3 });
    [[-6, 4.2], [-4.8, 4.5], [5.6, 4.3]].forEach(([x, y], i) => {
      const g = new THREE.Mesh(i === 2 ? new THREE.TorusGeometry(0.45, 0.07, 10, 30) : new THREE.CylinderGeometry(0.07, 0.07, 1.4, 10), toolMat);
      g.position.set(x, y, -5.3); if (i === 2) g.rotation.y = 0; s.add(g);
    });
    // neon sign
    const sign = this.canvasTexture(512, 128, (c, w, h) => {
      c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h);
      c.font = 'bold 76px "Space Grotesk", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = '#facc15'; c.shadowBlur = 24; c.fillStyle = '#fde68a'; c.fillText('⚡ ELECTRA LAB', w / 2, h / 2);
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshBasicMaterial({ map: sign, transparent: true }));
    signMesh.position.set(0, 6.4, -5.35); s.add(signMesh);

    // invisible plane used to place the "rubber band" wire under the cursor and drag parts on the bench
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.35);
    this.benchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }

  canvasTexture(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  bindInput() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    el.addEventListener('pointermove', e => {
      this.setPtr(e);
      this.updateHover();
      this.onPointerMoveExtra?.(this.pointOnBench());
    });
    el.addEventListener('pointerup', e => {
      if (this.suppressNextClick) {
        this.suppressNextClick = false;
        down = null;
        return;
      }
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return; // that was a camera drag, not a click
      this.setPtr(e);
      const hit = this.pick();
      if (hit?.object.userData.pick?.click) hit.object.userData.pick.click(hit);
      else this.onEmptyClick?.();
    });
    el.addEventListener('pointerleave', () => { this.setHovered(null); });
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  setPtr(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    this.ptrScreen = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  pick() {
    this.ray.setFromCamera(this.ptr, this.camera);
    const hits = this.ray.intersectObjects(this.pickables, false);
    return hits.find(h => h.object.visible && h.object.userData.pick && !h.object.userData.pick.disabled?.()) || null;
  }

  pointOnBench() {
    this.ray.setFromCamera(this.ptr, this.camera);
    const p = new THREE.Vector3();
    return this.ray.ray.intersectPlane(this.dragPlane, p) ? p : null;
  }

  updateHover() { const h = this.pick(); this.setHovered(h ? h.object : null); }

  setHovered(obj) {
    if (this.hovered === obj) return;
    this.hovered?.userData.pick?.hover?.(false);
    this.hovered = obj;
    obj?.userData.pick?.hover?.(true);
    this.renderer.domElement.style.cursor = obj ? 'pointer' : 'grab';
    this.onHoverChange?.(obj);
  }

  /** mark a mesh as clickable/hoverable */
  pickable(mesh, pick) { mesh.userData.pick = pick; this.pickables.push(mesh); return mesh; }
  unpickable(mesh) { this.pickables = this.pickables.filter(m => m !== mesh); if (this.hovered === mesh) this.setHovered(null); }

  /** a floating HTML label pinned to a 3D point (object3D + offset) */
  label(obj, offset, html, cls = '') {
    const el = document.createElement('div');
    el.className = `g-label ${cls}`;
    el.innerHTML = html;
    this.labelLayer.appendChild(el);
    const L = { obj, offset: new THREE.Vector3(...offset), el, set: h => { if (el._h !== h) { el.innerHTML = h; el._h = h; } }, remove: () => { el.remove(); this.labels.delete(L); } };
    this.labels.add(L);
    return L;
  }

  tweenCamera(pos, target, ms = 900) {
    const p0 = this.camera.position.clone(), t0 = this.controls.target.clone();
    const p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...target);
    const start = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / ms), e = 1 - Math.pow(1 - k, 3);
      this.camera.position.lerpVectors(p0, p1, e); this.controls.target.lerpVectors(t0, t1, e);
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  frame(pos = [0, 7.2, 6.8], target = [0, 0.2, 0.2]) {
    this.tweenCamera(pos, target, 650);
  }

  resize() {
    const w = this.host.clientWidth || window.innerWidth, h = this.host.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    // on narrow screens pull the camera back a bit so the whole bench fits
    this.camera.fov = w / h < 0.9 ? 62 : w / h < 1.3 ? 50 : 42;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  loop() {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.paused) return;
    this.controls.update();
    this.updaters.forEach(fn => fn(dt));
    this.renderer.render(this.scene, this.camera);
    // labels
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    const v = new THREE.Vector3();
    this.labels.forEach(L => {
      L.obj.getWorldPosition(v); v.add(L.offset); v.project(this.camera);
      const vis = v.z < 1 && L.obj.visible !== false;
      L.el.style.display = vis ? '' : 'none';
      L.el.style.transform = `translate(-50%, -100%) translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
    });
  }

  /** remove everything that a level added (keeps lights + environment) */
  clearLevel() {
    [...this.scene.children].forEach(c => { if (c.userData.levelObj) { this.scene.remove(c); disposeDeep(c); } });
    this.pickables = []; this.hovered = null;
    this.labels.forEach(L => L.el.remove()); this.labels.clear();
    this.updaters.clear();
    this.onPointerMoveExtra = null; this.onEmptyClick = null;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
    this.host.innerHTML = '';
  }
}

export function disposeDeep(obj) {
  obj.traverse(o => {
    o.geometry?.dispose?.();
    const m = o.material; if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach(mm => { mm.map?.dispose?.(); mm.dispose?.(); });
  });
}
