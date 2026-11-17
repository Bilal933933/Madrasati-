import * as THREE from "three";
import { disposeGroup } from "../dispose-group";
import { param, toParamValues } from "../params";
import type { LabControlSpec, LabReadout, LabSceneBridge, LabSim } from "../types";

/**
 * الدرس ١ — البندول البسيط.
 * θ'' = −(g/L)·sin θ − b·θ'   مُكامَلة بـ RK4 (ثبات الطاقة)
 * Ep = m·g·L·(1 − cos θ)      Ek = ½·m·(L·θ')²
 */

const G = 9.81;
const PIVOT_Y = 1.9;
const START_ANGLE = Math.PI / 4;
const MAX_ANGLE = 1.45;
const UP = new THREE.Vector3(0, 1, 0);
const PIVOT = new THREE.Vector3(0, PIVOT_Y, 0);

export function createPendulum(bridge: LabSceneBridge, controls: LabControlSpec[]): LabSim {
  const params = toParamValues(controls);
  const state = { theta: START_ANGLE, omega: 0, refAngle: START_ANGLE, dragging: false };
  const group = new THREE.Group();

  const parts = buildPendulum(group, params);
  const physics = createPhysics(params, state);

  const render = (): void => {
    const length = param(params, "length", 2.2);
    const dir = new THREE.Vector3(Math.sin(state.theta), -Math.cos(state.theta), 0);

    parts.rod.scale.y = length;
    parts.rod.position.copy(PIVOT).addScaledVector(dir, length / 2);
    parts.rod.quaternion.setFromUnitVectors(UP, dir);
    parts.bob.position.copy(PIVOT).addScaledVector(dir, length);
  };

  const reset = (): void => {
    state.theta = START_ANGLE;
    state.omega = 0;
    state.refAngle = START_ANGLE;
    render();
  };

  const readout = (): LabReadout => {
    const length = param(params, "length", 2.2);
    const mass = param(params, "mass", 1.5);
    const height = length * (1 - Math.cos(state.theta));
    const speed = Math.abs(state.omega * length);

    const ep = mass * G * height;
    const ek = 0.5 * mass * speed * speed;
    const budget = mass * G * length * (1 - Math.cos(state.refAngle));

    return {
      ep,
      ek,
      et: ep + ek,
      ref: Math.max(budget, 0.001),
      info: [
        { label: "الزاوية", value: `${((state.theta * 180) / Math.PI).toFixed(0)}°` },
        { label: "السرعة", value: `${speed.toFixed(2)} m/s` },
        { label: "المفقود", value: `${Math.max(0, budget - ep - ek).toFixed(2)} J` },
      ],
    };
  };

  const detach = attachDrag(bridge, parts.bob, state, render);

  parts.bob.scale.setScalar(bobRadius(param(params, "mass", 1.5)));
  reset();

  return {
    group,
    framing: { position: [0, 1.5, 6.6], target: [0, 0.15, 0] },
    update(dt) {
      if (!state.dragging) physics.step(dt);
      render();
    },
    readout,
    reset,
    setParam(id, value) {
      params[id] = value;
      if (id === "mass") parts.bob.scale.setScalar(bobRadius(value));
      if (id === "length") reset();
    },
    dispose() {
      detach();
      disposeGroup(group);
    },
  };
}

/* ------------------------------ الفيزياء ------------------------------ */

function createPhysics(
  params: Record<string, number>,
  state: { theta: number; omega: number },
): { step: (dt: number) => void } {
  const derivative = (theta: number, omega: number) => ({
    dTheta: omega,
    dOmega:
      -(G / param(params, "length", 2.2)) * Math.sin(theta) -
      param(params, "damping", 0) * omega,
  });

  const integrate = (h: number): void => {
    const a = derivative(state.theta, state.omega);
    const b = derivative(state.theta + (a.dTheta * h) / 2, state.omega + (a.dOmega * h) / 2);
    const c = derivative(state.theta + (b.dTheta * h) / 2, state.omega + (b.dOmega * h) / 2);
    const d = derivative(state.theta + c.dTheta * h, state.omega + c.dOmega * h);

    state.theta += (h / 6) * (a.dTheta + 2 * b.dTheta + 2 * c.dTheta + d.dTheta);
    state.omega += (h / 6) * (a.dOmega + 2 * b.dOmega + 2 * c.dOmega + d.dOmega);
  };

  return {
    step(dt: number) {
      const steps = 4;
      const h = dt / steps;
      for (let i = 0; i < steps; i += 1) integrate(h);
    },
  };
}

/* ------------------------------ البناء البصري ------------------------------ */

const bobRadius = (mass: number): number => 0.13 + 0.022 * mass;

function buildPendulum(group: THREE.Group, params: Record<string, number>) {
  const metal = new THREE.MeshStandardMaterial({ color: 0x8794a8, roughness: 0.35, metalness: 0.85 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1b2a45, roughness: 0.8, metalness: 0.25 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.14, 1.1), darkMetal);
  base.position.set(0, -1.75, 0);
  base.receiveShadow = true;

  const postGeometry = new THREE.BoxGeometry(0.12, 3.72, 0.12);
  const posts = [-1.65, 1.65].map((x) => {
    const post = new THREE.Mesh(postGeometry, metal);
    post.position.set(x, 0.11, 0);
    post.castShadow = true;
    return post;
  });

  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 0.12), metal);
  beam.position.set(0, PIVOT_Y, 0);
  beam.castShadow = true;

  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 18), metal);
  axle.rotation.x = Math.PI / 2;
  axle.position.copy(PIVOT);

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1, 10),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55, metalness: 0.4 }),
  );
  rod.castShadow = true;

  const bob = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.16,
      metalness: 0.5,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
    }),
  );
  bob.castShadow = true;
  bob.receiveShadow = true;
  bob.scale.setScalar(bobRadius(param(params, "mass", 1.5)));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 9),
    new THREE.MeshStandardMaterial({ color: 0x0e1a2e, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.77;
  ground.receiveShadow = true;

  const grid = new THREE.GridHelper(16, 32, 0x1e293b, 0x16233a);
  grid.position.y = -1.76;

  group.add(base, ...posts, beam, axle, rod, bob, ground, grid);
  return { rod, bob };
}

/* ------------------------------ السحب بالمؤشر ------------------------------ */

function attachDrag(
  bridge: LabSceneBridge,
  bob: THREE.Mesh,
  state: { theta: number; omega: number; refAngle: number; dragging: boolean },
  render: () => void,
): () => void {
  const { canvas } = bridge;

  const onDown = (event: PointerEvent): void => {
    if (!bridge.hits(event, bob)) return;
    state.dragging = true;
    state.omega = 0;
    bridge.setDragLock(true);
    canvas.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event: PointerEvent): void => {
    if (!state.dragging) return;
    const point = bridge.intersectZ0(event);
    if (!point) return;
    const raw = Math.atan2(point.x, PIVOT_Y - point.y);
    state.theta = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, raw));
    state.omega = 0;
    render();
  };

  const onUp = (): void => {
    if (!state.dragging) return;
    state.dragging = false;
    state.omega = 0;
    state.refAngle = state.theta;
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
