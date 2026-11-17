import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { disposeGroup } from "./dispose-group";
import type { LabSceneBridge, LabSim } from "./types";

const DEFAULT_CAMERA: [number, number, number] = [0, 1.6, 6.4];
const DEFAULT_TARGET: [number, number, number] = [0, 0.2, 0];

/**
 * مسرح Three.js — مشهد، كاميرا، إضاءة، حلقة رسم، وتقاطعات المؤشر.
 * لا يعرف شيئاً عن الفيزياء: كل مختبر يمرّر `LabSim` ويُضاف إلى المشهد.
 */
export class LabStage implements LabSceneBridge {
  readonly canvas: HTMLCanvasElement;
  onFrame: (() => void) | null = null;
  onFps: ((fps: number) => void) | null = null;

  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly clock = new THREE.Clock();
  private readonly observer: ResizeObserver;

  private sim: LabSim | null = null;
  private running = true;
  private frameId = 0;
  private frames = 0;
  private elapsed = 0;
  private disposed = false;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1220);
    this.scene.fog = new THREE.FogExp2(0x0b1220, 0.025);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    this.camera.position.fromArray(DEFAULT_CAMERA);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-label", "مشهد ثلاثي الأبعاد تفاعلي");
    container.appendChild(this.canvas);

    this.buildLights();
    this.controls = this.buildControls();

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);

    this.resize();
    this.loop = this.loop.bind(this);
    this.frameId = requestAnimationFrame(this.loop);
  }

  /* ------------------------------ الإعداد ------------------------------ */

  private buildLights(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    this.scene.add(key);

    const blueRim = new THREE.PointLight(0x3b82f6, 34, 30);
    blueRim.position.set(-5, 3, -4);
    this.scene.add(blueRim);

    const warmRim = new THREE.PointLight(0xf59e0b, 20, 26);
    warmRim.position.set(4, -1.5, 3);
    this.scene.add(warmRim);
  }

  private buildControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.target.fromArray(DEFAULT_TARGET);
    controls.update();
    return controls;
  }

  /* ------------------------------ إدارة المحاكاة ------------------------------ */

  setSim(sim: LabSim): void {
    if (this.sim) {
      this.sim.dispose();
      this.scene.remove(this.sim.group);
    }
    this.sim = sim;
    this.scene.add(sim.group);
    this.frame(sim.framing.position, sim.framing.target);
  }

  setRunning(running: boolean): void {
    this.running = running;
    if (running) this.clock.getDelta();
  }

  setDragLock(locked: boolean): void {
    this.controls.enabled = !locked;
  }

  /** يستدعيه المختبر عند تغيير الحجم من الواجهة */
  resetView(): void {
    if (!this.sim) return;
    this.frame(this.sim.framing.position, this.sim.framing.target);
  }

  /** يغيّر خلفية المسرح — تستخدمه المشاهد العامة (غير الفيزيائية) */
  setBackground(color: string): void {
    const next = new THREE.Color(color);
    this.scene.background = next;
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color = next;
    }
  }

  private frame(position: [number, number, number], target: [number, number, number]): void {
    this.camera.position.set(position[0], position[1], position[2]);
    this.controls.target.set(target[0], target[1], target[2]);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
  }

  /* ------------------------------ تقاطعات المؤشر ------------------------------ */

  hits(event: PointerEvent, object: THREE.Object3D): boolean {
    this.raycaster.setFromCamera(this.toNdc(event), this.camera);
    return this.raycaster.intersectObject(object, true).length > 0;
  }

  intersectZ0(event: PointerEvent): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.toNdc(event), this.camera);
    const point = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.plane, point) ? point : null;
  }

  private toNdc(event: PointerEvent): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return this.pointer;
  }

  /* ------------------------------ الحلقة ------------------------------ */

  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth || 1;
    const height = parent.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private loop(): void {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 1 / 30);

    if (this.sim && this.running && !document.hidden && dt > 0) {
      this.sim.update(dt);
    }

    this.controls.update();
    this.onFrame?.();
    this.renderer.render(this.scene, this.camera);
    this.trackFps(dt);
  }

  private trackFps(dt: number): void {
    this.frames += 1;
    this.elapsed += dt;
    if (this.elapsed < 0.5) return;
    this.onFps?.(Math.round(this.frames / this.elapsed));
    this.frames = 0;
    this.elapsed = 0;
  }

  /* ------------------------------ التحرير ------------------------------ */

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.observer.disconnect();
    this.controls.dispose();
    if (this.sim) {
      this.sim.dispose();
      this.scene.remove(this.sim.group);
      disposeGroup(this.sim.group);
      this.sim = null;
    }
    this.renderer.dispose();
    this.canvas.remove();
  }
}
