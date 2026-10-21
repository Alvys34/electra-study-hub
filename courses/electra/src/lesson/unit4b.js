// unit4b.js - Unit 4B: Atomic Theory & Conduction (Read the study sheet -> Do the hands-on steps).
import * as THREE from 'three';
import { FIG } from './visuals.js';

export const LESSON_4B = {
  id: 'unit4b',
  code: '4B',
  title: 'Atomic Theory & Conduction',
  color: '#38bdf8',
  minutesRead: 6,
  doneLead: 'You explored the Bohr atom, ionized a 3D Copper atom by exciting its outer valence electron into the conduction band, sorted conductors/semiconductors/insulators, and tested their conductivity on the 3D bench:',

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'The Bohr Model of the Atom & Atomic Number (Z)',
      body: `<p>All matter is made of atoms. Niels Bohr proposed a planetary model where electrons orbit a dense central [[nucleus]] like planets around the sun. An atom contains three fundamental subatomic particles:</p>
      <ul>
        <li><b>Protons (+):</b> Positively charged particles inside the nucleus.</li>
        <li><b>Neutrons (0):</b> Electrically neutral (uncharged) particles inside the nucleus.</li>
        <li><b>Electrons (−):</b> Tiny negatively charged particles orbiting the nucleus in discrete shells.</li>
        <li><b>Atomic Number (Z):</b> Equals the <b>number of protons</b> in the nucleus. In any electrically neutral atom, the number of orbiting electrons equals the number of protons (<code># protons = # electrons = Z</code>).</li>
        <li><b>Slide examples:</b> <b>Hydrogen (Z = 1)</b> has 1 proton and 1 electron; <b>Helium (Z = 2)</b> has 2 protons, 2 neutrons, and 2 electrons.</li>
      </ul>`,
      key: '[[Atomic number (Z)]] = number of [[protons]] in the nucleus (= number of [[electrons]] in a neutral atom).',
    },
    {
      title: 'Electron Shells, Energy Levels & the 2n² Rule',
      body: `<p>Electrons orbit only at certain allowed distances from the nucleus called [[electron shells]] (numbered <code>n = 1, 2, 3, 4…</code> outward from the nucleus):</p>
      <ul>
        <li><b>Energy & Distance:</b> Electrons near the nucleus have <b>low energy</b> and are tightly bound by attraction to the positive nucleus. Electrons in outer shells have <b>higher energy</b> and are <b>less tightly bound</b>.</li>
        <li><b>Maximum Shell Capacity (2n² Rule):</b> The maximum number of electrons that can fit in shell <code>n</code> is <code>N_e = 2n²</code>:
          <br>• <b>Shell 1 (n = 1):</b> <code>2 × 1² = 2 electrons</code>
          <br>• <b>Shell 2 (n = 2):</b> <code>2 × 2² = 8 electrons</code>
          <br>• <b>Shell 3 (n = 3):</b> <code>2 × 3² = 18 electrons</code>
          <br>• <b>Shell 4 (n = 4):</b> <code>2 × 4² = 32 electrons</code></li>
        <li><b>Valence-shell exception:</b> Inner shells fill to <code>2n²</code>. The outer [[valence shell]] holds at most <b>8</b> electrons, or <code>2n²</code> if that is smaller. So a valence shell 3 holds 8, not 18. Copper can still put 18 electrons in shell 3 because that shell is full and the valence electron sits in shell 4.</li>
      </ul>`,
      key: 'Maximum electrons in shell `n` is [[2n²]]: Shell 1 holds [[2]], Shell 2 holds [[8]], Shell 3 holds [[18]], Shell 4 holds [[32]]. A valence shell holds at most [[8]].',
      exam: 'The 3rd shell can hold 18 electrons (2 × 3²). If shell 3 is the valence shell, the maximum is 8.',
    },
    {
      title: 'Valence Electrons, Ionization & the Copper Atom (Z = 29)',
      body: `<p>The outermost occupied shell of an atom is called the [[valence shell]], and the electrons in that outer shell are called [[valence electrons]]:</p>
      <ul>
        <li><b>Why valence electrons matter:</b> Because they are farthest from the nucleus, they have the highest energy, are least tightly bound, and determine a material's chemical reactions and electrical conductivity.</li>
        <li>[[Ionization]] <b>& Free Electrons:</b> If a valence electron absorbs enough external energy (from heat, light, or an electric field), it breaks free from the parent atom and becomes a [[free electron]]. Losing a negative electron leaves the atom with a net positive charge — a [[positive ion]] (gaining an extra electron creates a <b>negative ion</b>).</li>
        <li><b>The Copper Atom (Z = 29):</b> Copper has 29 protons and 29 electrons filling shells <code>2 + 8 + 18 + 1 = 29</code>. That single lonely <b>1 valence electron</b> in the 4th shell is very weakly held and easily becomes a free electron!</li>
      </ul>`,
      key: '[[Copper (Z = 29)]] has shells `2 · 8 · 18 · 1` — just [[1 valence electron]] in the 4th shell, making it an ideal conductor.',
    },
    {
      title: 'Conductors, Semiconductors, Insulators & Energy Bands',
      fig: FIG.energyBands,
      body: `<p>All electrical materials fall into three categories based on their [[valence electrons]] and the width of the forbidden [[energy gap]] between the <b>valence band</b> and the <b>conduction band</b>:</p>
      <ul>
        <li>[[Conductors]] <b>(1–3 valence electrons; best have 1):</b> <i>Silver, Copper (Z=29), Gold, Aluminum</i>. Their valence band and conduction band <b>overlap (no energy gap)</b>, so room-temperature thermal energy creates a dense sea of free electrons.</li>
        <li>[[Semiconductors]] <b>(exactly 4 valence electrons):</b> <i>Silicon (Z=14) and Germanium (Z=32)</i>. They have a <b>narrow energy gap</b> and form the basis of diodes, transistors, and integrated circuits. Carbon also has 4 valence electrons, but it is not one of these semiconductors: diamond’s energy gap is about 5.5 eV, wide enough to be an insulator.</li>
        <li>[[Insulators]] <b>(best have 8 valence electrons):</b> <i>Glass, porcelain, Teflon, rubber, mica</i>. Their valence electrons are tightly bound across a <b>wide energy gap</b>, preventing current flow under normal voltages.</li>
      </ul>`,
      key: 'Valence electrons: [[1 = best conductor]] (Cu, Ag, Au) · [[4 = semiconductor]] (Si, Ge) · [[8 = best insulator]] (wide energy gap).',
      exam: 'Know the band-gap order: Insulator = widest energy gap, Semiconductor = narrow energy gap, Conductor = overlapping bands.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'bench-bohr-3d', kind: '3d', title: '3D Bohr Atom: Ionize Copper’s valence electron!',
      text: 'Behold a 3D [[Bohr model]] of **Copper (Z = 29)** hovering over your bench! Inside are shells `2 · 8 · 18`, and out in the 4th shell orbits a single golden [[valence electron]]. Click the **⚡ Excite Valence e⁻** switch on the bench to give that valence electron enough energy to jump into the [[conduction band]] as a [[free electron]]!',
      how: 'Click the <b>bench switch</b> in front of the 3D Copper atom to apply thermal/electrical energy and ionize the outer valence electron.',
      scene: {
        camera: { pos: [0, 5.8, 7.4], target: [0, 1.3, 0] },
        allowWiring: false,
        setup(g, s) {
          s.sw = g.switch({ pos: [0, 0, 2.2], closed: false });
          s.swLabel = g.stage.label(s.sw.group, [0, 1.1, 0], '⚡ Excite Valence e⁻', 'itag');

          // Build a 3D Bohr Copper Atom (Z = 29: 2, 8, 18, 1) above the bench
          const atom = new THREE.Group();
          atom.userData.levelObj = true;
          atom.position.set(0, 2.1, -0.4);
          g.stage.scene.add(atom);

          const nuc = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 24, 24),
            new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xbe123c, emissiveIntensity: 0.7, roughness: 0.3 })
          );
          atom.add(nuc);
          s.nucLabel = g.stage.label(atom, [0, 0.55, 0], 'Cu Nucleus (+29)', 'val');

          const counts = [2, 8, 18, 1];
          const radii = [0.75, 1.2, 1.68, 2.25];
          const rings = [];
          let valElectron = null;

          counts.forEach((cnt, idx) => {
            const r = radii[idx];
            const isVal = idx === 3;
            const ringGroup = new THREE.Group();
            ringGroup.rotation.x = idx === 3 ? 0.35 : 0.25 + idx * 0.22;
            ringGroup.rotation.z = idx * 0.18;
            atom.add(ringGroup);

            const torus = new THREE.Mesh(
              new THREE.TorusGeometry(r, isVal ? 0.025 : 0.014, 12, 64),
              new THREE.MeshBasicMaterial({ color: isVal ? 0xfacc15 : 0x38bdf8, transparent: true, opacity: isVal ? 0.85 : 0.35 })
            );
            torus.rotation.x = Math.PI / 2;
            ringGroup.add(torus);

            for (let j = 0; j < cnt; j++) {
              const a = (j / cnt) * Math.PI * 2;
              const el = new THREE.Mesh(
                new THREE.SphereGeometry(isVal ? 0.14 : 0.075, 16, 16),
                new THREE.MeshStandardMaterial({
                  color: isVal ? 0xfde047 : 0x7dd3fc,
                  emissive: isVal ? 0xfacc15 : 0x0284c7,
                  emissiveIntensity: isVal ? 1.2 : 0.5,
                })
              );
              el.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
              ringGroup.add(el);
              if (isVal) valElectron = el;
            }
            rings.push(ringGroup);
          });

          s.valTag = g.stage.label(valElectron, [0, 0.35, 0], '1 Valence e⁻ (n=4)', 'itag');
          let t = 0;
          g.stage.updaters.add(dt => {
            t += dt || 0.016;
            rings.forEach((rg, i) => { rg.rotation.y = t * (1.2 - i * 0.2); });
            const targetR = s.sw.closed ? 3.25 : 2.25;
            const curR = valElectron.position.length();
            const nextR = curR + (targetR - curR) * 0.1;
            valElectron.position.set(nextR, Math.sin(t * 4) * (s.sw.closed ? 0.25 : 0), 0);
            s.valTag.set(s.sw.closed ? '🚀 Free Electron (Conduction Band!)' : '1 Valence e⁻ (n=4)');
            s.nucLabel.set(s.sw.closed ? 'Cu⁺ Positive Ion (+29p, 28e⁻)' : 'Cu Nucleus (+29p, 29e⁻)');
          });
        },
        highlight(g, s) { return !s.sw.closed ? [s.sw] : []; },
      },
      tasks: [
        { text: 'Flip the switch to excite Copper’s outer valence electron into a free electron', done: (g, s) => s.sw.closed },
      ],
      success: 'That 1 outer valence electron jumped into the [[conduction band]] as a [[free electron]], leaving behind a [[positive ion]] (`Cu⁺`)!',
      question: {
        type: 'number',
        q: 'Using the `2n²` shell-capacity rule, what is the maximum number of electrons that can exist in the **3rd shell** (`n = 3`) of an atom?',
        answer: 18,
        unit: 'e⁻',
        fixedUnit: true,
        tol: 0.01,
        chips: ['6', '8', '18', '32'],
        why: 'The full shell capacity is `2 × 3² = [[18]]`. If shell 3 is the outer valence shell, the slides cap it at 8.',
      },
    },
    {
      id: 'atom-builder-4b', kind: 'visual', title: 'Find a semiconductor (4 valence e⁻)',
      text: 'Slide the **Atomic number (Z)** or click the element buttons below to see how electrons fill shells `2 · 8 · 18…`. Find [[silicon]] or [[germanium]], the course semiconductors, each with **4 valence electrons**. Carbon also has 4, but it is not one of them.',
      how: 'Click <b>Silicon (14)</b> or <b>Germanium (32)</b>. Carbon (atomic number 6) has 4 valence electrons and does <b>not</b> count.',
      visual: 'atomBuilder',
      tasks: [{ text: 'Select silicon or germanium (4 valence electrons)' }],
      success: 'With [[4 valence electrons]] in its outer shell, Silicon (`Z = 14`, shells `2 · 8 · 4`) is the #1 semiconductor in electronics!',
      question: {
        q: 'An atom of a [[semiconductor]] material (such as Silicon or Germanium) always has how many [[valence electrons]]? (Slide 14)',
        options: ['4 valence electrons', '1 valence electron', '8 valence electrons', '2 valence electrons'],
        correct: 0,
        why: '[[Conductors]] have 1–3 valence electrons (the best have 1). [[Semiconductors]] in this course are silicon and germanium, with **4 valence electrons**. The best [[insulators]] have 8.',
      },
    },
    {
      id: 'material-sort-4b', kind: 'visual', title: 'Sort Conductors, Semiconductors & Insulators',
      text: 'Classify each material below based on its [[valence shell]] and [[energy gap]]:',
      how: 'Click each material card above, then click the <b>Conductor</b>, <b>Semiconductor</b>, or <b>Insulator</b> bucket.',
      visual: 'materialSort4b',
      tasks: [{ text: 'Sort all 6 materials into Conductor, Semiconductor, or Insulator' }],
      success: 'Copper & Silver = Conductors (1 val e⁻); Silicon & Germanium = Semiconductors (4 val e⁻); Glass & Neon = Insulators!',
      question: {
        q: 'When a neutral atom absorbs heat or light energy and **loses** a valence electron, what does the atom become?',
        options: [
          'A positive ion',
          'A negative ion',
          'An insulator',
          'A neutron',
        ],
        correct: 0,
        why: 'Losing a negatively charged electron leaves the atom with more positive protons than electrons — a [[positive ion]].',
      },
    },
    {
      id: 'bench-conductivity-4b', kind: '3d', title: 'Conductor vs semiconductor vs insulator',
      text: 'On the 3D bench, a `12 V` supply is wired in series with an [[ammeter]], a `50 Ω` lamp, and a material test slot currently holding a **Glass Insulator** (`10 MΩ` → `I ≈ 0 A`, lamp dark). Swap the **Copper Conductor bar (1 Ω)** from the bin into the test slot so free electrons surge and light the lamp!',
      how: 'Click the <b>Copper (1 Ω)</b> sample in the parts bin, then click the <b>Material Test Slot</b> on the bench.',
      scene: {
        camera: { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.8, 0, -1.6], V: 12 });
          s.m = g.meter({ pos: [-1.2, 0, 1.4], mode: 'A', modes: ['A'] });
          s.sample = g.slot({
            pos: [0.8, 0, -1.4],
            content: { type: 'resistor', R: 10000000, tag: 'glass' },
            accepts: ['resistor'],
            label: 'Material Test Slot',
          });
          s.lamp = g.slot({ pos: [3.0, 0, 0.2], content: { type: 'lamp', R: 50, Prated: 2.88 }, locked: true, label: 'Indicator Lamp' });
          s.bin = g.bin({
            pos: [1.8, 0, 2.5],
            items: [
              { type: 'resistor', R: 1, tag: 'copper', label: 'Copper (1 Ω)' },
              { type: 'resistor', R: 500, tag: 'silicon', label: 'Silicon (500 Ω)' },
              { type: 'resistor', R: 10000000, tag: 'glass', label: 'Glass (10 MΩ)' },
            ],
            showValues: true,
            title: 'MATERIALS',
          });
          g.wire(s.ps.T('+'), s.sample.T('a'), { locked: true });
          g.wire(s.sample.T('b'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) {
          if (s.sample.content?.tag === 'copper') return [];
          return g.held ? [s.sample] : [s.bin];
        },
      },
      tasks: [
        { text: 'Swap the Copper (1 Ω) conductor sample into the Material Test Slot to light the lamp', done: (g, s) => s.sample.content?.tag === 'copper' },
      ],
      success: 'With Copper (`1 Ω`) in the slot, free electrons flow effortlessly (`235 mA`) and the indicator lamp shines bright!',
      question: {
        q: 'Which statement correctly compares the [[energy gap]] between the valence band and conduction band in insulators, semiconductors, and conductors? (Slide 13)',
        options: [
          'Insulators have the widest energy gap, semiconductors have a narrow gap, and conductors have overlapping bands',
          'Conductors have the widest energy gap and insulators have no gap',
          'Semiconductors have the widest energy gap',
          'All three materials have the exact same energy gap',
        ],
        correct: 0,
        why: '[[Insulators]] have a wide forbidden energy gap; [[semiconductors]] have a narrow gap; and in [[conductors]] the valence and conduction bands overlap.',
      },
    },
  ],
};
