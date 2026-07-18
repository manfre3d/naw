import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  viewChild,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  output,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as THREE from 'three';

// Browser-only 3D portrait rendered into the hero photo frame. The static
// <img> sibling stays as the SSR / reduced-motion / load-failure fallback: the
// canvas is transparent until the model loads, then fades in over the photo.
// Lifecycle mirrors SceneBackgroundComponent (lazy three, afterNextRender,
// reduced-motion bail, paused when hidden/offscreen) with full GPU disposal.
@Component({
  selector: 'app-hero-portrait-3d',
  standalone: true,
  templateUrl: './hero-portrait-3d.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero-portrait-3d.component.scss',
})
export class HeroPortrait3dComponent implements OnDestroy {
  modelPath = input.required<string>();

  // Portrait framing: fraction of the figure's height shown in the frame
  // (head → crossed arms). Larger = zoom out (more of the body); smaller = zoom
  // in on the face. The rest of the body falls out the bottom of the frame.
  showFraction = input(0.58);

  // Emitted only when the 3D portrait cannot be shown (reduced motion, no
  // WebGL, or the model failed to load) so the hero can reveal the <img>
  // fallback. On success nothing is emitted and the photo is never rendered.
  readonly fallback = output<void>();

  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);

  private rafId = 0;
  private running = false;
  private tickFn: (() => void) | null = null;

  private renderer: THREE.WebGLRenderer | null = null;
  private pmrem: THREE.PMREMGenerator | null = null;
  private envTex: THREE.Texture | null = null;
  private model: THREE.Object3D | null = null;

  private resizeObs?: ResizeObserver;
  private themeObs?: MutationObserver;
  private io?: IntersectionObserver;

  private onPointerMove?: (e: PointerEvent) => void;
  private onVisibility?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.fallback.emit();
        return;
      }
      this.zone.runOutsideAngular(() => this.init());
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.stop();
    if (this.onPointerMove) window.removeEventListener('pointermove', this.onPointerMove);
    if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
    this.resizeObs?.disconnect();
    this.themeObs?.disconnect();
    this.io?.disconnect();
    this.disposeModel();
    this.envTex?.dispose();
    this.pmrem?.dispose();
    this.renderer?.dispose();
  }

  private start(): void {
    if (this.running || !this.tickFn) return;
    this.running = true;
    this.tickFn();
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private async init(): Promise<void> {
    const canvasEl = this.canvasRef()?.nativeElement;
    if (!canvasEl) return;
    const frame = canvasEl.parentElement;
    if (!frame) return;

    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');

    let W = frame.clientWidth || 290;
    let H = frame.clientHeight || 380;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    } catch {
      // No WebGL — reveal the photo fallback.
      this.zone.run(() => this.fallback.emit());
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Image-based lighting — no HDR asset, generated from RoomEnvironment.
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.pmrem = pmrem;
    const roomEnv = new RoomEnvironment();
    this.envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = this.envTex;
    (roomEnv as unknown as { dispose?: () => void }).dispose?.();

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2, 2.5, 3);
    // Soft fill opposite the key — lifts the shadow side of the face/hair.
    const fill = new THREE.DirectionalLight(0xffffff, 0.55);
    fill.position.set(-2.5, 0.5, 2);
    // Teal accent rim — separates the figure and ties it to the Deep Teal palette.
    const rim = new THREE.DirectionalLight(0x2CC0DE, 1.0);
    rim.position.set(-3, 1.5, -2.5);
    const ambient = new THREE.AmbientLight(0xffffff, 0.32);
    scene.add(key, fill, rim, ambient);

    const group = new THREE.Group();
    scene.add(group);

    // ── Interaction state (no per-frame allocation) ──────────────────────────
    let pxT = 0, pyT = 0, pxC = 0, pyC = 0;
    this.onPointerMove = (e: PointerEvent) => {
      pxT = e.clientX / window.innerWidth - 0.5;
      pyT = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });

    this.resizeObs = new ResizeObserver(() => {
      W = frame.clientWidth || W;
      H = frame.clientHeight || H;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
    this.resizeObs.observe(frame);

    // Theme-aware exposure/key (mirrors scene-background reading data-theme).
    const applyTheme = () => {
      const dark = document.documentElement.dataset['theme'] === 'dark';
      renderer.toneMappingExposure = dark ? 1.0 : 1.15;
      key.intensity = dark ? 2.0 : 2.4;
      fill.intensity = dark ? 0.4 : 0.6;
      // Teal rim: strong in dark mode to separate the figure from the near-black
      // background and echo the accent; subtler in light mode.
      rim.intensity = dark ? 2.8 : 1.3;
    };
    applyTheme();
    this.themeObs = new MutationObserver(applyTheme);
    this.themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Run only while the frame is on screen and the tab is visible.
    let inView = true;
    const update = () => {
      if (inView && !document.hidden) this.start();
      else this.stop();
    };
    this.io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        update();
      },
      { threshold: 0 },
    );
    this.io.observe(frame);

    this.onVisibility = update;
    document.addEventListener('visibilitychange', this.onVisibility);

    // ── Load the model ───────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      this.modelPath(),
      (gltf) => {
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Frame the top `showFraction` of the figure into the visible height,
        // anchoring the head just inside the top edge (legs fall out the bottom).
        const VISIBLE_H = 2.7; // < the camera's ~3.15 visible units, for margin
        const height = size.y || 1;
        const scale = VISIBLE_H / (this.showFraction() * height);
        obj.scale.setScalar(scale);
        obj.position.x = -center.x * scale;
        obj.position.z = -center.z * scale;
        obj.position.y = 1.25 - box.max.y * scale;

        group.add(obj);
        this.model = obj;
        canvasEl.classList.add('is-ready');
      },
      undefined,
      (err) => {
        console.warn('[hero-portrait-3d] model load failed', err);
        this.zone.run(() => this.fallback.emit());
      },
    );

    // ── Render loop ──────────────────────────────────────────────────────────
    // Resting portrait orientation — a 3/4 turn reads more dynamic than dead-on.
    const BASE_YAW = 0.24;    // ~ +14° yaw (turn direction)
    const BASE_PITCH = 0.05;  // slight upward tilt (confident chin-up)
    this.tickFn = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(this.tickFn!);
      const t = performance.now() * 0.001;
      pxC += (pxT - pxC) * 0.05;
      pyC += (pyT - pyC) * 0.05;
      // Resting 3/4 pose — a flattering angle vs. a flat, dead-on portrait, with
      // a slight chin-up for confidence. Mouse-follow + idle drift modulate it.
      group.rotation.y = BASE_YAW + pxC * 0.55 + Math.sin(t * 0.5) * 0.07;
      group.rotation.x = BASE_PITCH + pyC * 0.3 + Math.sin(t * 0.7) * 0.035;
      group.position.y = Math.sin(t * 0.8) * 0.04;
      renderer.render(scene, camera);
    };
    this.start();
  }

  private disposeModel(): void {
    this.model?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => this.disposeMaterial(m));
      else if (mat) this.disposeMaterial(mat);
    });
  }

  private disposeMaterial(m: THREE.Material): void {
    const rec = m as unknown as Record<string, unknown>;
    for (const key in rec) {
      const val = rec[key];
      if (val && typeof val === 'object' && (val as THREE.Texture).isTexture) {
        (val as THREE.Texture).dispose();
      }
    }
    m.dispose();
  }
}
