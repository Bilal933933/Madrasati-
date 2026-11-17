import * as THREE from "three";
import { disposeGroup } from "../dispose-group";
import { param, toParamValues } from "../params";
import type { LabControlSpec, LabReadout, LabSceneBridge, LabSim } from "../types";

/**
 * الدرس ٣ — النابض المرن (حركة توافقية بسيطة).
 * x'' = −(k/m)·x  مُكامَلة بـ Velocity-Verlet
 * Ep = ½·k·x²   Ek = ½·m·v²   Et = ½·k·A²
 */

const WALL_X = -1.9;
const BLOCK_HALF = 0.27;
const SPRING_LENGTH = 1.6;
const SPRING_RADIUS = 0.17;
const COILS = 11;

export function createSpring(bridge: LabSceneBridge, controls: LabControlSpec[]): LabSim {
  const params = toParamValues(controls);
  const state = { x: param(params, "amplitude", 1.1), v: 0, dragging: false };
  const group = new THREE.Group();

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.7, 0.95),
    new THREE.MeshStandardMaterial({ color: 0x33425c, roughness: 0.85, metalness: 0.2 }),
  );
  wall.position.set(WALL_X - 0.09, 0.05, 0);
  wall.castShadow = true;
  wall.receiveShadow = true;

  const springMesh = buildSpring();

  const block = new THREE.Mesh(
    new THREE.BoxGeometry(BLOCK_HALF * 2, BLOCK_HALF * 2, BLOCK_HALF * 2),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.25,
      metalness: 0.5,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
    }),
  );
  block.castShadow = true;
  block.receiveShadow = true;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 7),
    new THREE.MeshStandardMaterial({ color: 0x0e1a2e, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -BLOCK_HALF;
  ground.receiveShadow = true;

  const grid = new THREE.GridHelper(12, 24, 0x1e293b, 0x16233a);
  grid.position.y = -BLOCK_HALF + 0.005;

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.012, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.3 }),
  );
  marker.position.set(0, -BLOCK_HALF + 0.007, 0);

  group.add(wall, springMesh, block, ground, grid, marker);

  const render = (): void => {
    const length = state.x - BLOCK_HALF - WALL_X;
    springMesh.scale.x = Math.max(length, 0.08) / SPRING_LENGTH;
    block.position.set(state.x, 0, 0);
  };

  const reset = (): void => {
    state.x = param(params, "amplitude", 1.1);
    state.v = 0;
    render();
  };

  const readout = (): LabReadout => {
    const stiffness = param(params, "stiffness", 26);
    const mass = param(params, "mass", 1.2);
    const amplitude = param(params, "amplitude", 1.1);

    const ep = 0.5 * stiffness * state.x * state.x;
    const ek = 0.5 * mass * state.v * state.v;
    const period = 2 * Math.PI * Math.sqrt(mass / stiffness);

    return {
      ep,
      ek,
      et: ep + ek,
      ref: Math.max(0.5 * stiffness * amplitude * amplitude, 0.001),
      info: [
        { label: "الإزاحة", value: `${state.x.toFixed(2)} m` },
        { label: "السرعة", value: `${state.v.toFixed(2)} m/s` },
        { label: "الزمن الدوري", value: `${period.toFixed(2)} s` },
      ],
    };
  };

  const detach = attachDrag(bridge, block, state, () => param(params, "amplitude", 1.1), render);

  reset();

  return {
    group,
    framing: { position: [2.4, 2.2, 6.8], target: [0, 0, 0] },
    update(dt) {
      if (!state.dragging) step(dt, state, params);
      render();
    },
    readout,
    reset,
    setParam(id, value) {
      params[id] = value;
      if (id === "amplitude" || id === "stiffness") reset();
    },
    dispose() {
      detach();
      disposeGroup(group);
    },
  };
}

/* ------------------------------ الفيزياء ------------------------------ */

function step(
  dt: number,
  state: { x: number; v: number },
  params: Record<string, number>,
): void {
  const omegaSquared = param(params, "stiffness", 26) / param(params, "mass", 1.2);
  const steps = 4;
  const h = dt / steps;

  for (let i = 0; i < steps; i += 1) {
    const a1 = -omegaSquared * state.x;
    state.x += state.v * h + 0.5 * a1 * h * h;
    const a2 = -omegaSquared * state.x;
    state.v += 0.5 * (a1 + a2) * h;
  }
}

/* ------------------------------ البناء البصري ------------------------------ */

function buildSpring(): THREE.Mesh {
  const points: THREE.Vector3[] = [];
  const samples = 260;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const angle = t * COILS * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        t * SPRING_LENGTH,
        Math.cos(angle) * SPRING_RADIUS,
        Math.sin(angle) * SPRING_RADIUS,
      ),
    );
  }

  const spring = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 320, 0.026, 6, false),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.9 }),
  );
  spring.position.x = WALL_X;
  spring.castShadow = true;
  return spring;
}

/* ------------------------------ السحب بالمؤشر ------------------------------ */

function attachDrag(
  bridge: LabSceneBridge,
  block: THREE.Mesh,
  state: { x: number; v: number; dragging: boolean },
  amplitude: () => number,
  render: () => void,
): () => void {
  const { canvas } = bridge;

  const onDown = (event: PointerEvent): void => {
    if (!bridge.hits(event, block)) return;
    state.dragging = true;
    state.v = 0;
    bridge.setDragLock(true);
    canvas.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event: PointerEvent): void => {
    if (!state.dragging) return;
    const point = bridge.intersectZ0(event);
    if (!point) return;
    const limit = amplitude();
    state.x = Math.max(-limit, Math.min(limit, point.x));
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
