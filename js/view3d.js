// 3D-Ansicht: Projektionskugel, Äquatorebene mit dem Stereogramm, Symmetrieelemente,
// Objekte in allgemeiner Lage bzw. Polyeder, Flächennormalen und Projektionsstrahlen.
// Weltkoordinaten = kartesisches Kristallsystem (x ∥ a, y ∥ b, z ∥ c).

import * as THREE from '../lib/three.bundle.js';
import { SIZE, R, arcPoints } from './stereogram.js';

const V = (p) => new THREE.Vector3(p[0], p[1], p[2]);

export class View3D {
  constructor(container, { onSelect } = {}) {
    this.container = container;
    this.onSelect = onSelect;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);
    this.labelRenderer = new THREE.CSS2DRenderer();
    this.labelRenderer.domElement.className = 'labels3d';
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.up.set(0, 0, 1);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 12;
    this.controls.addEventListener('change', () => this.requestRender());
    this.setView('oblique');

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.8);
    dl.position.set(3, 2, 5);
    this.scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dl2.position.set(-3, -2, -4);
    this.scene.add(dl2);

    this.base = new THREE.Group();
    this.content = new THREE.Group();
    this.scene.add(this.base, this.content);

    // Stereogramm-Textur
    this.texCanvas = document.createElement('canvas');
    this.texCanvas.width = this.texCanvas.height = 1024;
    this.texture = new THREE.CanvasTexture(this.texCanvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;

    this.pickables = [];
    this._setupPicking();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(container);
    this.resize();
  }

  setView(kind) {
    const d = 5.2;
    if (kind === 'top') {
      // Blick von +z; Bildschirm: x nach unten, y nach rechts (wie im Stereogramm)
      const e = 1e-3;
      this.camera.position.set(d * Math.sin(e), 0, d * Math.cos(e));
    } else if (kind === 'side') {
      this.camera.position.set(d, 0.0001, 0.35);
    } else {
      this.camera.position.set(3.4, 1.7, 2.9).normalize().multiplyScalar(d);
    }
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.requestRender();
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = w + 'px';
    this.renderer.domElement.style.height = h + 'px';
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  requestRender() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      const moving = this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
      if (moving) this.requestRender();
    });
  }

  _setupPicking() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
      down = null;
      if (moved > 6 || !this.onSelect) return;
      const r = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, this.camera);
      const hit = rc.intersectObjects(this.pickables, false)[0];
      this.onSelect(hit ? hit.object.userData.idx : null);
    });
  }

  _dispose(group) {
    group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material !== this._texMat) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      }
      if (o.isCSS2DObject && o.element.parentNode) o.element.parentNode.removeChild(o.element);
    });
    group.clear();
  }

  /** Aktualisiert die Stereogramm-Textur aus einem SVG-String. */
  setStereoTexture(svg) {
    const token = (this._texToken = (this._texToken || 0) + 1);
    const img = new Image();
    img.onload = () => {
      if (token !== this._texToken) return;
      const ctx = this.texCanvas.getContext('2d');
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      this.texture.needsUpdate = true;
      this.requestRender();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  _buildBase(col, opts) {
    this._dispose(this.base);
    this.renderer.setClearColor(new THREE.Color(col.paper), 1);
    const c = (x) => new THREE.Color(x);
    // Kugel (sehr transparent) + Gradnetz
    const sph = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 40),
      new THREE.MeshBasicMaterial({ color: c(col.sphere), transparent: true, opacity: opts.showSphere ? 0.07 : 0, depthWrite: false, side: THREE.DoubleSide }),
    );
    this.base.add(sph);
    if (opts.showSphere) {
      const pts = [];
      for (let lon = 0; lon < 180; lon += 30) {
        const a = (lon * Math.PI) / 180;
        for (let i = 0; i < 96; i++) {
          const t1 = (i * 2 * Math.PI) / 96, t2 = ((i + 1) * 2 * Math.PI) / 96;
          pts.push(Math.cos(a) * Math.sin(t1), Math.sin(a) * Math.sin(t1), Math.cos(t1));
          pts.push(Math.cos(a) * Math.sin(t2), Math.sin(a) * Math.sin(t2), Math.cos(t2));
        }
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        if (lat === 0) continue;
        const z = Math.sin((lat * Math.PI) / 180), r = Math.cos((lat * Math.PI) / 180);
        for (let i = 0; i < 96; i++) {
          const t1 = (i * 2 * Math.PI) / 96, t2 = ((i + 1) * 2 * Math.PI) / 96;
          pts.push(r * Math.cos(t1), r * Math.sin(t1), z, r * Math.cos(t2), r * Math.sin(t2), z);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      this.base.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c(col.net), transparent: true, opacity: 0.45 })));
    }
    // Äquatorebene mit Stereogramm
    if (opts.showPlane) {
      const w = SIZE / R;
      if (!this._texMat) {
        this._texMat = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      }
      this._texMat.opacity = opts.planeOpacity ?? 0.9;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, w), this._texMat);
      plane.rotation.z = Math.PI / 2; // lokale X → Welt +y, lokale Y → Welt −x
      plane.renderOrder = 1;
      this.base.add(plane);
    }
    // Grundkreis
    const eq = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 160), new THREE.MeshBasicMaterial({ color: c(col.ink) }));
    this.base.add(eq);
    // Nord- und Südpol (Projektionszentren)
    for (const [z, name] of [[1, 'N'], [-1, 'S']]) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({ color: c(col.ink) }));
      m.position.set(0, 0, z);
      this.base.add(m);
      const el = document.createElement('div');
      el.className = 'lbl3d lbl-pole';
      el.textContent = name;
      const lab = new THREE.CSS2DObject(el);
      lab.position.set(0, 0, z * 1.12);
      this.base.add(lab);
    }
  }

  _axisArrows(axes, col) {
    for (const a of axes) {
      const d = V(a.dir).normalize();
      const arr = new THREE.ArrowHelper(d, new THREE.Vector3(0, 0, 0), 1.32, new THREE.Color(col.muted), 0.07, 0.04);
      this.content.add(arr);
      const el = document.createElement('div');
      el.className = 'lbl3d lbl-axis';
      el.textContent = a.name;
      const lab = new THREE.CSS2DObject(el);
      lab.position.copy(d.clone().multiplyScalar(1.42));
      this.content.add(lab);
    }
  }

  _rays(points, col) {
    // Projektionsstrahlen: obere Pole → Südpol, untere Pole → Nordpol
    const seg = [], dots = [];
    for (const p of points) {
      const upper = p[2] >= -1e-9;
      const ctr = upper ? [0, 0, -1] : [0, 0, 1];
      seg.push(...p, ...ctr);
      const d = upper ? 1 + p[2] : 1 - p[2];
      dots.push([p[0] / d, p[1] / d, 0]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    this.content.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: new THREE.Color(col.ray), transparent: true, opacity: 0.6 })));
    const sg = new THREE.SphereGeometry(0.016, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col.ray) });
    for (const q of dots) {
      const m = new THREE.Mesh(sg, mat);
      m.position.set(q[0], q[1], 0.002);
      this.content.add(m);
    }
  }

  /** Punktgruppen-Szene. */
  showPointGroup(data, col, opts) {
    this._buildBase(col, opts);
    this._dispose(this.content);
    this.pickables = [];
    const c = (x) => new THREE.Color(x);
    if (opts.showElements) {
      // Farben nach Blickrichtung (opts.dirColors[k]) oder neutral; ausgeblendete Blickrichtungen weglassen
      const hidden = opts.hiddenDirs || new Set();
      const dirCol = (k, fallback) => (opts.dirColors && k >= 0 ? opts.dirColors[k] : fallback);
      // Spiegelebenen als halbtransparente Scheiben
      data.mirrors.forEach((n, i) => {
        const k = data.mirrorCls ? data.mirrorCls[i] : -1;
        if (hidden.has(k)) return;
        const mc = c(dirCol(k, col.mirror3d));
        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(1, 96),
          new THREE.MeshBasicMaterial({ color: mc, transparent: true, opacity: opts.dirColors ? 0.14 : 0.1, side: THREE.DoubleSide, depthWrite: false }),
        );
        disc.lookAt(V(n));
        this.content.add(disc);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 6, 160), new THREE.MeshBasicMaterial({ color: mc }));
        ring.lookAt(V(n));
        this.content.add(ring);
      });
      // Drehachsen
      for (const ax of data.axes) {
        if (hidden.has(ax.cls)) continue;
        const d = V(ax.dir).normalize();
        const n = Math.abs(parseInt(ax.symbol, 10));
        const color = c(dirCol(ax.cls, col.ink));
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 2.5, 8), new THREE.MeshBasicMaterial({ color }));
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        this.content.add(cyl);
        for (const s of [1, -1]) {
          const shape = new THREE.Shape();
          const k = n === 2 ? 64 : n;
          for (let i = 0; i <= k; i++) {
            const a = (i / k) * Math.PI * 2;
            const sx = 0.07 * Math.cos(a), sy = (n === 2 ? 0.035 : 0.07) * Math.sin(a);
            if (i === 0) shape.moveTo(sx, sy); else shape.lineTo(sx, sy);
          }
          const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
          const inv = ax.symbol.startsWith('-');
          const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.6, emissive: inv ? c('#ffffff') : c('#000000'), emissiveIntensity: inv ? 0.35 : 0 }));
          m.position.copy(d.clone().multiplyScalar(1.25 * s));
          m.lookAt(d.clone().multiplyScalar(3 * s));
          this.content.add(m);
        }
      }
      if (data.centro) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: c(col.paper), roughness: 0.4 }));
        this.content.add(m);
      }
    }
    if (opts.showObject && data.orbit) {
      // asymmetrisches Objekt (Fähnchen) am Ausgangspol, mit allen Operationen abgebildet
      const p0 = V(data.p0).normalize();
      let t1 = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), p0);
      if (t1.lengthSq() < 1e-6) t1 = new THREE.Vector3(0, 1, 0);
      t1.normalize();
      const t2 = new THREE.Vector3().crossVectors(p0, t1).normalize();
      const base = [
        p0.clone(),
        p0.clone().addScaledVector(t1, 0.13),
        p0.clone().addScaledVector(t2, 0.07),
      ];
      const out = base.map((b) => b.clone().addScaledVector(p0, 0.05));
      const verts = [...base, ...out];
      const idx = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
      const sg = new THREE.SphereGeometry(0.022, 12, 10);
      data.orbit.forEach((o, i) => {
        const M = data.ops[o.op];
        const pos = [];
        for (const vv of verts) {
          const p = [vv.x, vv.y, vv.z];
          pos.push(
            M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2],
            M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2],
            M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2],
          );
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        const color = c(o.det > 0 ? col.upper : col.accent2);
        const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.55, flatShading: true }));
        this.content.add(mesh);
        const dot = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: i === 0 ? c(col.accent) : color }));
        dot.position.copy(V(o.p));
        this.content.add(dot);
      });
      if (opts.showRays) this._rays(data.orbit.map((o) => o.p), col);
    }
    if (opts.arc) this._arc(opts.arc, col);
    if (opts.showAxes) this._axisArrows(data.crystalAxes, col);
    this.requestRender();
  }

  /** Grosskreisbogen zwischen zwei Polen auf der Lagekugel mit Winkelangabe (Werkzeug Winkel). */
  _arc(arc, col) {
    const pts = arcPoints(arc.a, arc.b, 96).map((p) => V(p).multiplyScalar(1.004));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.014, 8, false), new THREE.MeshBasicMaterial({ color: new THREE.Color(col.accent) }));
    this.content.add(tube);
    if (arc.label) {
      const el = document.createElement('div');
      el.className = 'lbl3d lbl-angle';
      el.textContent = arc.label;
      const lab = new THREE.CSS2DObject(el);
      lab.position.copy(pts[Math.floor(pts.length / 2)].clone().multiplyScalar(1.12));
      this.content.add(lab);
    }
  }

  /** Polyeder-Szene. Flächen mit hidden (offene Form) werden nicht gezeichnet. */
  showPolyhedron(poly, col, opts, selected, labels) {
    this._buildBase(col, opts);
    this._dispose(this.content);
    this.pickables = [];
    const c = (x) => new THREE.Color(x);
    const k = opts.size;
    const vis = poly.faces.map((f, i) => ({ f, i })).filter(({ f }) => !f.hidden);
    // Hervorhebung: gewählte Fläche bzw. die beiden Zonen-Flächen kräftig, übrige Zonenflächen getönt,
    // alles andere zurückgenommen, sobald etwas hervorgehoben ist.
    const hi = new Set(selected != null ? [selected] : []);
    for (const k of opts.picked || []) hi.add(k);
    const inZone = new Set(opts.zone ? opts.zone.inZone : []);
    const focus = hi.size > 0 || inZone.size > 0;
    const accent = c(col.accent), paper = c(col.paper);
    const faceColor = (f, i) => {
      const base = c(f.color3d || col.crystal);
      if (hi.has(i)) return accent.clone();
      if (inZone.has(i)) return base.lerp(accent, 0.5);
      return focus ? base.lerp(paper, 0.45) : base;
    };
    vis.forEach(({ f, i }) => {
      const pos = [];
      for (let j = 1; j < f.verts.length - 1; j++) {
        for (const v of [f.verts[0], f.verts[j], f.verts[j + 1]]) pos.push(v[0] * k, v[1] * k, v[2] * k);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: faceColor(f, i), emissive: hi.has(i) ? accent : c('#000000'), emissiveIntensity: hi.has(i) ? 0.3 : 0,
        roughness: 0.45, metalness: 0.0, side: THREE.DoubleSide,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      });
      const m = new THREE.Mesh(g, mat);
      m.userData.idx = i;
      m.renderOrder = 2;
      this.content.add(m);
      this.pickables.push(m);
      const ep = [];
      for (let j = 0; j < f.verts.length; j++) {
        const a = f.verts[j], b = f.verts[(j + 1) % f.verts.length];
        ep.push(a[0] * k, a[1] * k, a[2] * k, b[0] * k, b[1] * k, b[2] * k);
      }
      const eg = new THREE.BufferGeometry();
      eg.setAttribute('position', new THREE.Float32BufferAttribute(ep, 3));
      this.content.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: c(col.edge) })));
    });
    // Flächenmuster (Flächensymmetrie): kleine asymmetrische Dreiecke, mit der Punktgruppe vervielfältigt
    if (opts.motifs && opts.motifs.length) {
      const mp = [];
      for (const m of opts.motifs) for (const v of m.pts) mp.push(v[0] * k, v[1] * k, v[2] * k);
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.Float32BufferAttribute(mp, 3));
      const mm = new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: c(col.edge), side: THREE.DoubleSide }));
      mm.renderOrder = 3;
      this.content.add(mm);
    }
    const sg = new THREE.SphereGeometry(0.026, 14, 10);
    if (opts.showNormals) {
      // Normale entlang n vom Lotfusspunkt auf der Flächenebene bis zum Flächenpol
      const np = [];
      vis.forEach(({ f }) => {
        const n = f.normal;
        const d = (n[0] * f.verts[0][0] + n[1] * f.verts[0][1] + n[2] * f.verts[0][2]) * k;
        np.push(n[0] * d, n[1] * d, n[2] * d, ...n);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(np, 3));
      this.content.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c(col.normal) })));
    }
    vis.forEach(({ f, i }) => {
      const isSel = hi.has(i), isZ = inZone.has(i);
      const pc = isSel || isZ ? col.accent : focus ? col.muted : f.role === 'aux' ? col.muted : f.color2d || col.normal;
      const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: c(pc) }));
      m.scale.setScalar(isSel ? 1.9 : isZ ? 1.4 : focus ? 0.85 : 1);
      m.position.copy(V(f.normal));
      m.userData.idx = i;
      this.content.add(m);
      this.pickables.push(m);
      if (labels && labels[i]) {
        const el = document.createElement('div');
        el.className = 'lbl3d lbl-hkl' + (isSel ? ' sel' : isZ ? ' zone' : focus ? ' dim' : '') + (f.role === 'aux' ? ' aux' : '');
        el.innerHTML = labels[i];
        const lab = new THREE.CSS2DObject(el);
        lab.position.copy(V(f.normal).multiplyScalar(1.13));
        this.content.add(lab);
      }
    });
    if (opts.zone) {
      const z = opts.zone, ax = V(z.axis).normalize(), acc = c(col.accent);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: acc }));
      ring.lookAt(ax);
      this.content.add(ring);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.7, 8), new THREE.MeshBasicMaterial({ color: acc }));
      rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax);
      this.content.add(rod);
      // Kanten zwischen Flächen der Zone: parallel zur Zonenachse
      const zs = new Set(z.inZone);
      const seen = new Set();
      vis.forEach(({ f, i }) => {
        if (!zs.has(i)) return;
        for (let j = 0; j < f.verts.length; j++) {
          const a = V(f.verts[j]).multiplyScalar(k), b = V(f.verts[(j + 1) % f.verts.length]).multiplyScalar(k);
          const d = b.clone().sub(a);
          if (d.length() < 1e-6 || d.clone().normalize().cross(ax).length() > 1e-4) continue;
          const key = [a, b].map((p) => p.toArray().map((x) => x.toFixed(4)).join(',')).sort().join('|');
          if (seen.has(key)) continue;
          seen.add(key);
          const e = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, d.length(), 8), new THREE.MeshBasicMaterial({ color: acc }));
          e.position.copy(a.clone().add(b).multiplyScalar(0.5));
          e.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
          this.content.add(e);
        }
      });
    }
    if (opts.arc) this._arc(opts.arc, col);
    if (opts.showRays) this._rays(vis.map(({ f }) => f.normal), col);
    if (opts.showAxes) this._axisArrows(poly.axes, col);
    this.requestRender();
  }
}
