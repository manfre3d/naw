# Performance & Memory Reference

## GPU Resource Disposal

Three.js does **not** garbage-collect GPU resources (buffers, textures, programs). You must dispose explicitly.

```ts
// On component destroy — dispose everything uploaded to the GPU
geometry.dispose();
material.dispose();
texture.dispose();       // if any
renderer.dispose();
renderer.forceContextLoss(); // optional: release WebGL context on single-page apps
```

**Rule:** for every `new THREE.*Geometry()`, `new THREE.*Material()`, and `new THREE.Texture()` call, there must be a corresponding `.dispose()` call somewhere on the teardown path.

**AVOID** calling `.dispose()` on shared resources (e.g., a material used by multiple meshes) until all meshes are removed.

## Checking for Leaks

```ts
// Log renderer's tracked GPU objects (useful for debugging)
console.log(renderer.info.memory);
// { geometries: N, textures: N }
```

## PixelRatio

Cap device pixel ratio at 2 — going higher taxes the GPU with no visible benefit at normal viewing distances:

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

## Lazy-Loading Three.js

Always import Three.js dynamically so it lands in a separate chunk and stays out of the SSR/initial bundle:

```ts
const THREE = await import('three');
// OrbitControls, etc. are separate imports:
const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
```

This keeps the initial JS payload under budget and lets Angular's SSR prerender without a WebGL context.

## InstancedMesh

When rendering many copies of the same geometry, replace individual `Mesh` objects with a single `InstancedMesh` — one draw call for all instances:

```ts
const count = 1000;
const mesh = new THREE.InstancedMesh(geometry, material, count);

const matrix = new THREE.Matrix4(); // reuse — no per-frame allocation
for (let i = 0; i < count; i++) {
  matrix.setPosition(x[i], y[i], z[i]);
  mesh.setMatrixAt(i, matrix);
}
mesh.instanceMatrix.needsUpdate = true;
scene.add(mesh);
```

**When to prefer `InstancedMesh`:** more than ~50 identical objects.

## Geometry Merging

For static objects that won't move independently, merge their geometries into one:

```ts
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const merged = mergeGeometries([geo1, geo2, geo3]);
const mesh = new THREE.Mesh(merged, material);
// Now 1 draw call instead of 3
```

**Use only for static geometry** — merged objects can't be individually transformed.

## BufferAttribute Tips

Use the most compact typed array that fits your data:

| Data | Array type |
|---|---|
| Positions, normals, UVs | `Float32Array` |
| Vertex indices (< 65536 verts) | `Uint16Array` |
| Vertex indices (≥ 65536 verts) | `Uint32Array` |
| Colors (0–1 range) | `Float32Array` |

Mark an attribute dirty after updating it in place:

```ts
geometry.attributes['position'].needsUpdate = true;
```

## Particle Count Budget

For a background particle network (no physics):

- **≤ 500 particles** — safe on all devices with proximity-line computation
- **500–2000 particles** — pre-compute lines at init; don't recompute per-frame
- **> 2000 particles** — use GPU-computed shaders (custom `ShaderMaterial`) instead

Cap line segment count explicitly (the O(N²) proximity loop grows fast):

```ts
const MAX_SEGS = 520;
outer: for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    // ... push verts ...
    if (lineVerts.length / 6 >= MAX_SEGS) break outer;
  }
}
```

## Reducing Draw Calls

Each `Mesh`, `Points`, or `Line` object is a draw call. Reduce by:
1. Merging static geometries
2. Using `InstancedMesh` for repeated objects
3. Batching objects under a shared material
4. Removing invisible objects from the scene (`scene.remove(mesh)`) instead of hiding with `visible = false` when off-screen long-term
