# Animation Loop Reference

## The Standard Loop

```ts
const tick = () => {
  requestAnimationFrame(tick);
  // update scene state
  renderer.render(scene, camera);
};
tick();
```

**ALWAYS** use `requestAnimationFrame` — it syncs to the display refresh rate, pauses when the tab is hidden, and is what the browser optimizes for.

**NEVER** use `setInterval` for rendering — it runs even when the tab is hidden and ignores VSync.

## Time-Based Animation

Drive animation with elapsed time, not frame count — frame count drifts when the device drops frames.

```ts
const tick = () => {
  requestAnimationFrame(tick);
  const t = performance.now() * 0.001; // seconds since page load

  group.rotation.y = t * 0.07;                   // constant angular velocity
  group.rotation.x = Math.sin(t * 0.035) * 0.1; // oscillation
  renderer.render(scene, camera);
};
```

For delta-based updates (physics, easing), track the previous timestamp:

```ts
let prev = performance.now();
const tick = () => {
  requestAnimationFrame(tick);
  const now = performance.now();
  const dt = Math.min((now - prev) / 1000, 0.05); // cap dt to avoid spiral-of-death
  prev = now;
  velocity += acceleration * dt;
  mesh.position.x += velocity * dt;
  renderer.render(scene, camera);
};
```

## Smooth Mouse Parallax (Lerp)

Interpolate toward the target mouse position each frame for a smooth lag effect:

```ts
let mxT = 0, myT = 0; // target (set on mousemove)
let mxC = 0, myC = 0; // current (lerped each frame)

window.addEventListener('mousemove', (e: MouseEvent) => {
  mxT = e.clientX / window.innerWidth  - 0.5; // –0.5 … 0.5
  myT = e.clientY / window.innerHeight - 0.5;
});

const tick = () => {
  requestAnimationFrame(tick);
  mxC += (mxT - mxC) * 0.04; // lerp factor: lower = more lag
  myC += (myT - myC) * 0.04;
  camera.position.x = mxC * 4;
  camera.position.y = -myC * 3;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
};
```

**AVOID** setting camera position directly to mouse position — the jump is jarring.

## Render-on-Demand

For static scenes that only change on user interaction (no continuous animation), render only when needed:

```ts
let rafId: number | null = null;
let dirty = true;

const scheduleRender = () => {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    if (dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  });
};

controls.addEventListener('change', () => { dirty = true; scheduleRender(); });
window.addEventListener('resize', () => { dirty = true; scheduleRender(); });
```

**PREFER** this pattern for interactive configurators, model viewers, and any scene without autonomous motion — it eliminates idle GPU work.

## Stopping the Loop

Store the `requestAnimationFrame` ID to cancel it on component destroy:

```ts
let animId: number;
const tick = () => {
  animId = requestAnimationFrame(tick);
  renderer.render(scene, camera);
};
tick();

// On destroy:
cancelAnimationFrame(animId);
```

## Avoiding Per-Frame Allocations

The GC is the enemy of smooth 60fps. Never allocate inside the loop:

```ts
// AVOID — allocates a new Vector3 every frame
const dir = new THREE.Vector3(x, y, z).normalize();

// PREFER — reuse a pre-allocated Vector3
const dir = new THREE.Vector3();
const tick = () => {
  requestAnimationFrame(tick);
  dir.set(x, y, z).normalize(); // mutates in-place
  renderer.render(scene, camera);
};
```

Pre-allocate every vector, matrix, or color that the loop needs, then mutate in place.

## prefers-reduced-motion

Always check before starting animations:

```ts
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  tick(); // only start the loop if motion is allowed
}
```

Skip the canvas entirely rather than slowing the animation — a static scene is better than a slowed-motion one for users who need this setting.
