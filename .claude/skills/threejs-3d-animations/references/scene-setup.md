# Scene Setup Reference

## Renderer

```ts
const renderer = new THREE.WebGLRenderer({
  canvas,           // bind to existing <canvas> element
  alpha: true,      // transparent background
  antialias: true,  // smoother edges (skip on low-end GPU targets)
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap at 2× for perf
renderer.setSize(W, H, false); // false = skip CSS resize (respect CSS-sized canvas)
```

**Common mistakes:**
- Calling `setSize(W, H)` (no `false`) on a CSS-sized canvas creates a double-scale blur
- Forgetting `setPixelRatio` causes blurry rendering on Retina/HiDPI screens

## Scene Graph

The scene is a tree. Parent transformations cascade to children.

```ts
const scene = new THREE.Scene();

const group = new THREE.Group();
group.add(mesh);
group.add(lines);
scene.add(group);

// Rotating the group moves both children together
group.rotation.y += 0.01;
```

**PREFER** grouping related objects under `THREE.Group` so you can transform them as a unit.

## PerspectiveCamera

```ts
const camera = new THREE.PerspectiveCamera(
  55,       // vertical FOV in degrees (35–75 is typical)
  W / H,    // aspect ratio — update on resize
  0.1,      // near clip plane (nothing closer than this renders)
  200       // far clip plane (nothing farther renders)
);
camera.position.z = 22;
camera.lookAt(scene.position); // usually (0,0,0)
```

**Near/far ratio matters:** a ratio > 1:10000 causes z-fighting. Keep the range as tight as your scene allows.

**After resize:** always call `camera.updateProjectionMatrix()` when changing `aspect`.

## OrthographicCamera

Use for 2D overlays, isometric views, or technical drawings — no perspective distortion.

```ts
const camera = new THREE.OrthographicCamera(
  -W / 2, W / 2,  // left, right
  H / 2, -H / 2,  // top, bottom
  0.1, 1000
);
```

## BufferGeometry

**ALWAYS** use `BufferGeometry` with typed arrays — never the deprecated `Geometry`.

```ts
const geo = new THREE.BufferGeometry();
const positions = new Float32Array(N * 3); // x,y,z per vertex
// ... populate positions ...
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

For particles: set `position` only.  
For indexed meshes: also set `index` via `geo.setIndex(...)`.

## Materials

| Material | Use case |
|---|---|
| `MeshBasicMaterial` | Unlit, flat color, wireframe |
| `MeshStandardMaterial` | PBR lit — needs lights in scene |
| `MeshPhongMaterial` | Cheaper lit — adequate for non-PBR |
| `PointsMaterial` | Particle clouds (`sizeAttenuation: true` for depth feel) |
| `LineBasicMaterial` | Wireframe edges, connection lines |

## Lighting

`MeshBasicMaterial` ignores lights. All other mesh materials require at minimum:

```ts
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(ambient, dir);
```

## Points & Lines (particle network pattern)

```ts
// Particles
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pMat = new THREE.PointsMaterial({ color: 0xD4668A, size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.85 });
const points = new THREE.Points(pGeo, pMat);

// Connection lines between nearby points
const lGeo = new THREE.BufferGeometry();
lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
const lMat = new THREE.LineBasicMaterial({ color: 0xD4668A, transparent: true, opacity: 0.18 });
const lines = new THREE.LineSegments(lGeo, lMat);
```

Build line vertices with a proximity threshold — cap the segment count to avoid GPU overload:

```ts
const THRESH = 5.5;
const MAX_SEGS = 520;
outer: for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const dx = pos[i*3] - pos[j*3], dy = pos[i*3+1] - pos[j*3+1], dz = pos[i*3+2] - pos[j*3+2];
    if (dx*dx + dy*dy + dz*dz < THRESH * THRESH) {
      lineVerts.push(pos[i*3], pos[i*3+1], pos[i*3+2], pos[j*3], pos[j*3+1], pos[j*3+2]);
      if (lineVerts.length / 6 >= MAX_SEGS) break outer;
    }
  }
}
```
