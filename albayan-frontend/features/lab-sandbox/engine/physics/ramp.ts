import * as THREE from "three";
import { disposeGroup } from "../dispose-group";
import { param, toParamValues } from "../params";
import type { LabControlSpec, LabReadout, LabSceneBridge, LabSim } from "../types";

/**
 * الدرس ٢ — المسار المكافئ y = k·x².
 * الحركة على طول القوس مُكامَلة بـ RK4، والطاقة تُحسب من الحالة الفعلية
 * (لا تُفبرك من قانون الحفظ) — فيبقى Et ثابتاً كدليل تجريبي.
 */

const G = 9.81;
const X_MAX = 2.2;
const BALL_RADIUS = 0.17;
const TRACK_RADIUS = 0.045;

export function createRamp(bridge: LabSceneBridge, controls: LabControlSpec[]): LabSim {
  const params = toParamValues(controls);
  const state = { x: -X_MAX * 0.97, v: 0, spin: 0, dragging: false };
  const group = new THREE.Group();

  const curvature = (): number => param(params, "curvature", 0.42);
  const heightAt = (x: number): number => curvature() * x * x;

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.45,
      emissive: 0x047857,
      emissiveIntensity: 0.3,
    }),
  );
  ball.castShadow = true;
  ball.receiveShadow = true;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 10),
    new THREE.MeshStandardMaterial({ color: 0x0e1a2e, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.55;
  ground.receiveShadow = true;

  const grid = new THREE.GridHelper(18, 36, 0x1e293b, 0x16233a);
  grid.position.y = -0.54;

  const trackMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.72,
  });
  let track: THREE.Mesh | null = null;

  group.add(ball, ground, grid);

  const buildTrack = (): void => {
    if (track) {
      group.remove(track);
      track.geometry.dispose();
    }
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i += 1) {
      const x = -X_MAX + (2 * X_MAX * i) / segments;
      points.push(new THREE.Vector3(x, heightAt(x), 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    track = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, TRACK_RADIUS, 8, false), trackMaterial);
    track.castShadow = true;
    group.add(track);
  };

  const derivative = (x: number, v: number): { dx: number; dv: number } => {
    const slope = 2 * curvature() * x;
    const tangent = Math.hypot(1, slope);
    return { dx: v / tangent, dv: (-G * slope) / tangent };
  };

  const integrate = (h: number): void => {
    const a = derivative(state.x, state.v);
    const b = derivative(state.x + (a.dx * h) / 2, state.v + (a.dv * h) / 2);
    const c = derivative(state.x + (b.dx * h) / 2, state.v + (b.dv * h) / 2);
    const d = derivative(state.x + c.dx * h, state.v + c.dv * h);

    const dx = (h / 6) * (a.dx + 2 * b.dx + 2 * c.dx + d.dx);
    state.x += dx;
    state.v += (h / 6) * (a.dv + 2 * b.dv + 2 * c.dv + d.dv);
    state.spin += dx / BALL_RADIUS;

    if (Math.abs(state.x) > X_MAX) {
      state.x = Math.sign(state.x) * X_MAX;
      state.v = 0;
    }
  };

  const render = (): void => {
    const slope = 2 * curvature() * state.x;
    const normalLength = Math.hypot(1, slope);
    const offset = BALL_RADIUS + TRACK_RADIUS;

    ball.position.set(
      state.x - (slope / normalLength) * offset,
      heightAt(state.x) + (1 / normalLength) * offset,
      0,
    );
    ball.rotation.z = -state.spin;
  };

  const reset = (): void => {
    state.x = -X_MAX * 0.97;
    state.v = 0;
    state.spin = 0;
    render();
  };

  const readout = (): LabReadout => {
    const mass = param(params, "mass", 1.2);
    const height = heightAt(state.x);
    const peak = curvature() * X_MAX * X_MAX;
    const speed = Math.abs(state.v);

    const ep = mass * G * height;
    const ek = 0.5 * mass * speed * speed;

    return {
      ep,
      ek,
      et: ep + ek,
      ref: Math.max(mass * G * peak, 0.001),
      info: [
        { label: "السرعة", value: `${speed.toFixed(2)} m/s` },
        { label: "الارتفاع", value: `${height.toFixed(2)} m` },
        { label: "الإزاحة", value: `${state.x.toFixed(2)} m` },
      ],
    };
  };

  const detach = attachDrag(bridge, ball, state, render);

  buildTrack();
  reset();

  return {
    group,
    framing: { position: [0, 2.4, 9], target: [0, 1.1, 0] },
    update(dt) {
      if (!state.dragging) {
        const steps = 4;
        const h = dt / steps;
        for (let i = 0; i < steps; i += 1) integrate(h);
      }
      render();
    },
    readout,
    reset,
    setParam(id, value) {
      params[id] = value;
      if (id !== "curvature") return;
      buildTrack();
      reset();
    },
    dispose() {
      detach();
      disposeGroup(group);
    },
  };
}

function attachDrag(
  bridge: LabSceneBridge,
  ball: THREE.Mesh,
  state: { x: number; v: number; dragging: boolean },
  render: () => void,
): () => void {
  const { canvas } = bridge;

  const onDown = (event: PointerEvent): void => {
    if (!bridge.hits(event, ball)) return;
    state.dragging = true;
    state.v = 0;
    bridge.setDragLock(true);
    canvas.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event: PointerEvent): void => {
    if (!state.dragging) return;
    const point = bridge.intersectZ0(event);
    if (!point) return;
    state.x = Math.max(-X_MAX, Math.min(X_MAX, point.x));
    state.v = 0;
    render();
  };

  const onUp = (): void => {
    if (!state.dragging) return;
    state.dragging = false;
    state.v = 0;
    bridge.setDragLock(false);
    render();
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  return () => {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };
}
