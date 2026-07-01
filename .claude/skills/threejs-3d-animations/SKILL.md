---
name: threejs-3d-animations
description: Build high-quality Three.js 3D animations inside Angular components — correct scene setup, smooth animation loops, memory safety, SSR guards, and performance patterns drawn from the Three.js manual
references:
  - references/scene-setup.md
  - references/animation-loop.md
  - references/performance.md
  - references/angular-integration.md
---

# Three.js 3D Animations in Angular

This project uses Three.js for WebGL-based 3D scenes embedded in Angular components. Always follow these practices to get correct, performant, and SSR-safe results.

> **References** — load these for deeper coverage:
> - [[references/scene-setup.md]] — renderer, camera, scene graph, materials, lighting
> - [[references/animation-loop.md]] — `requestAnimationFrame`, timing, render-on-demand
> - [[references/performance.md]] — disposal, memory leaks, instancing, pixel ratio
> - [[references/angular-integration.md]] — lazy import, `afterNextRender`, SSR guards, resize, cleanup

## Core Setup  [[references/scene-setup.md]]

The three pillars of every Three.js scene are **Scene → Camera → Renderer**. Always wire them in this order and never skip the resize handler.

```ts
const THREE = await import('three');  // lazy-load; keeps initial bundle small

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H, false);  // false = don't set CSS size (canvas is CSS-sized already)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
camera.position.z = 22;
```

- **PREFER** `alpha: true` when the canvas overlays page content (transparent background)
- **PREFER** `antialias: true` unless you hit GPU budget constraints
- **AVOID** `renderer.setSize(W, H)` (without `false`) when the canvas is CSS-sized — it double-scales

## Animation Loop  [[references/animation-loop.md]]

- **ALWAYS** use `requestAnimationFrame` — never `setInterval`
- **ALWAYS** drive animation with `performance.now()` (or a delta), never frame count
- **AVOID** per-frame allocations (no `new THREE.Vector3()` inside the tick)

```ts
const tick = () => {
  requestAnimationFrame(tick);
  const t = performance.now() * 0.001;   // seconds
  group.rotation.y = t * 0.07;
  renderer.render(scene, camera);
};
tick();
```

## Geometry & Materials  [[references/scene-setup.md]]

- **PREFER** `BufferGeometry` + typed arrays (`Float32Array`) — never the legacy `Geometry`
- **PREFER** `MeshStandardMaterial` for lit objects; use `MeshBasicMaterial` only for unlit/wireframe
- For particles: `Points` + `PointsMaterial` with `sizeAttenuation: true`
- For connection lines: `LineSegments` + `LineBasicMaterial`

## Resize Handling

Always update **both** the renderer size and camera projection matrix:

```ts
const onResize = () => {
  const w = parent.offsetWidth;
  const h = parent.offsetHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();  // REQUIRED after changing aspect
};
window.addEventListener('resize', onResize);
```

## Angular Integration  [[references/angular-integration.md]]

- **ALWAYS** run Three.js init inside `afterNextRender()` — it is browser-only and must run after the canvas is in the DOM
- **ALWAYS** gate on `prefers-reduced-motion` before starting animations
- **ALWAYS** lazy-import `three` with `await import('three')` to keep it out of the SSR bundle
- **ALWAYS** remove event listeners and dispose resources on component destroy

## Memory Safety  [[references/performance.md]]

Three.js does **not** garbage-collect GPU resources automatically.

```ts
// On component destroy:
renderer.dispose();
geometry.dispose();
material.dispose();
texture.dispose();
window.removeEventListener('resize', onResize);
window.removeEventListener('mousemove', onMouse);
```

- **AVOID** creating new geometries or materials inside the animation loop
- **PREFER** `InstancedMesh` when rendering many copies of the same geometry

## Theme / Dark Mode

Read theme state inside the animation loop using a lightweight diff check to avoid per-frame DOM reads:

```ts
let lastTheme = '';
const tick = () => {
  requestAnimationFrame(tick);
  const theme = document.documentElement.dataset['theme'] ?? '';
  if (theme !== lastTheme) {
    lastTheme = theme;
    material.opacity = theme === 'dark' ? 0.9 : 0.65;
  }
  renderer.render(scene, camera);
};
```
