import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { disposeGroup } from "../engine/dispose-group";
import type { LabFraming, LabReadout, LabSim } from "../engine/types";
import type { SceneManifest, SceneMotion, SceneObject, Vec3 } from "./schema";

/** ارتفاع التسمية في وحدات العالم */
const LABEL_HEIGHT = 0.34;
/** نص التسمية يُرسم بدقة مضاعفة ليبقى واضحاً عند التقريب */
const LABEL_DPR = 2;

interface MotionEntry {
  object: THREE.Object3D;
  motion: SceneMotion;
  base: THREE.Vector3;
}

interface FollowLabel {
  sprite: THREE.Sprite;
  targetId: string;
  offset: THREE.Vector3;
}

const PALETTE = ["#94a3b8", "#38bdf8", "#f59e0b", "#22c55e", "#ef4444", "#a855f7"];

/**
 * لاعب المشهد: يحوّل Manifest (بيانات) إلى مجسمات Three.js.
 *
 * يطبّق واجهة `LabSim` حتى يعيد استخدام `LabStage` كما هي (كاميرا، إضاءة،
 * تحكم مداري، حلقة رسم، تحرير ذاكرة) — بلا أي تعديل على محرّك الفيزياء.
 */
export class ScenePlayer implements LabSim {
  readonly group = new THREE.Group();
  readonly framing: LabFraming;

  private readonly lookup = new Map<string, THREE.Object3D>();
  private readonly clickable: THREE.Object3D[] = [];
  private readonly motions: MotionEntry[] = [];
  private readonly labels: FollowLabel[] = [];
  private readonly loader = new GLTFLoader();

  private time = 0;
  private disposed = false;

  constructor(manifest: SceneManifest) {
    this.framing = {
      position: manifest.camera.position,
      target: manifest.camera.target,
    };

    if (manifest.environment.grid) {
      const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x111827);
      grid.position.y = -1.2;
      this.group.add(grid);
    }

    for (const object of manifest.objects) {
      this.buildObject(object);
    }

    /* التسميات بعد بناء كل العناصر حتى تجد أهدافها */
    for (const object of manifest.objects) {
      if (object.type === "label") this.buildLabel(object);
    }
  }

  /* ------------------------------ البناء ------------------------------ */

  private buildObject(spec: SceneObject): void {
    const object = this.createNode(spec);
    if (!object) return;

    object.name = spec.id;
    this.lookup.set(spec.id, object);
    this.group.add(object);

    if (spec.motion) {
      this.motions.push({
        object,
        motion: spec.motion,
        base: object.position.clone(),
      });
    }
    if (spec.card) {
      this.clickable.push(object);
    }
  }

  private createNode(spec: SceneObject): THREE.Object3D | null {
    switch (spec.type) {
      case "box":
        return this.mesh(new THREE.BoxGeometry(...(spec.size ?? [1, 1, 1])), spec);
      case "sphere":
        return this.mesh(new THREE.SphereGeometry(spec.radius ?? 0.5, 32, 24), spec);
      case "cylinder":
        return this.mesh(
          new THREE.CylinderGeometry(
            spec.radius ?? 0.4,
            spec.radius ?? 0.4,
            spec.height ?? 1,
            spec.segments ?? 28,
          ),
          spec,
        );
      case "cone":
        return this.mesh(
          new THREE.ConeGeometry(spec.radius ?? 0.4, spec.height ?? 1, spec.segments ?? 28),
          spec,
        );
      case "torus":
        return this.mesh(
          new THREE.TorusGeometry(
            spec.radius ?? 0.6,
            spec.tube ?? 0.08,
            Math.max(3, Math.min(24, spec.segments ?? 20)),
            44,
          ),
          spec,
        );
      case "plane": {
        const plane = this.mesh(new THREE.PlaneGeometry(spec.width ?? 4, spec.height ?? 4), spec);
        plane.rotation.set(-Math.PI / 2, 0, 0);
        plane.castShadow = false;
        plane.receiveShadow = true;
        return plane;
      }
      case "gear":
        return this.gear(spec);
      case "arrow":
        return this.arrow(spec);
      case "model":
        return this.model(spec);
      default:
        return null;
    }
  }

  private material(spec: SceneObject): THREE.MeshStandardMaterial {
    const base = new THREE.Color(spec.color ?? PALETTE[0]);
    const material = new THREE.MeshStandardMaterial({
      color: base,
      roughness: spec.type === "plane" ? 1 : 0.45,
      metalness: spec.type === "plane" ? 0 : 0.15,
      transparent: (spec.opacity ?? 1) < 1,
      opacity: spec.opacity ?? 1,
    });
    if (spec.glow) {
      material.emissive = base;
      material.emissiveIntensity = 1.3;
    }
    if ((spec.opacity ?? 1) < 1) {
      material.depthWrite = false;
      material.side = THREE.DoubleSide;
      /* العناصر الشفافة الشديدة تُعرض كتوهّج لا كجسم معتم */
      if ((spec.opacity ?? 1) <= 0.3) material.blending = THREE.AdditiveBlending;
    }
    return material;
  }

  private mesh(geometry: THREE.BufferGeometry, spec: SceneObject): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, this.material(spec));
    this.applyTransform(mesh, spec);
    mesh.castShadow = spec.type !== "plane";
    mesh.receiveShadow = spec.type === "plane";
    return mesh;
  }

  /** ترس: جسم أسطواني + أسنان صناديق موزّعة على المحيط — كلها هندسة، بلا سكربت */
  private gear(spec: SceneObject): THREE.Group {
    const radius = spec.radius ?? 0.8;
    const height = spec.height ?? 0.3;
    const teeth = Math.round(spec.teeth ?? 12);
    const group = new THREE.Group();
    const material = this.material(spec);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, Math.max(24, teeth * 3)),
      material,
    );
    body.castShadow = true;
    group.add(body);

    const toothHeight = radius * 0.16;
    const toothWidth = Math.max(0.04, ((2 * Math.PI * radius) / teeth) * 0.45);
    const toothDepth = height * 0.92;

    for (let index = 0; index < teeth; index += 1) {
      const angle = (index / teeth) * Math.PI * 2;
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(toothWidth, toothDepth, toothHeight * 2),
        material,
      );
      tooth.position.set(
        Math.cos(angle) * (radius + toothHeight * 0.55),
        0,
        Math.sin(angle) * (radius + toothHeight * 0.55),
      );
      tooth.rotation.y = -(angle + Math.PI / 2);
      tooth.castShadow = true;
      group.add(tooth);
    }

    /* صرة مركزية داكنة تُظهر محور الدوران */
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.26, radius * 0.26, height * 1.2, 20),
      new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 }),
    );
    group.add(hub);

    this.applyTransform(group, spec);
    return group;
  }

  private applyTransform(object: THREE.Object3D, spec: SceneObject): void {
    object.position.fromArray(spec.position ?? [0, 0, 0]);
    if (spec.rotation) object.rotation.fromArray(spec.rotation);
    if (spec.scale) object.scale.fromArray(spec.scale);
  }

  private arrow(spec: SceneObject): THREE.Group {
    const from = new THREE.Vector3().fromArray(spec.from ?? [0, 0, 0]);
    const to = new THREE.Vector3().fromArray(spec.to ?? [0, 1, 0]);
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length() || 0.001;
    const headLength = Math.min(0.28, length * 0.35);
    const shaftLength = Math.max(0.01, length - headLength);

    const color = new THREE.Color(spec.color ?? PALETTE[1]);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, shaftLength, 16), material);
    shaft.position.y = shaftLength / 2;

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, headLength, 18), material);
    head.position.y = shaftLength + headLength / 2;

    const group = new THREE.Group();
    group.add(shaft, head);

    /* توجيه المحور y نحو الاتجاه المطلوب */
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    group.position.copy(from);
    return group;
  }

  private model(spec: SceneObject): THREE.Object3D {
    const group = new THREE.Group();
    this.applyTransform(group, spec);

    /* أصل بديل أثناء التحميل، و يبقى إن فشل التحميل */
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.color ?? PALETTE[0]),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      }),
    );
    group.add(placeholder);

    if (spec.src) {
      this.loader.load(
        spec.src,
        (gltf) => {
          if (this.disposed) {
            disposeGroup(gltf.scene as unknown as THREE.Group);
            return;
          }
          group.remove(placeholder);
          placeholder.geometry.dispose();
          (placeholder.material as THREE.Material).dispose();
          group.add(gltf.scene);
        },
        undefined,
        () => {
          /* فشل التحميل: يبقى الأصل البديل بدل مشهد فارغ */
        },
      );
    }

    return group;
  }

  private buildLabel(spec: SceneObject): void {
    if (!spec.text) return;

    const { texture, aspect } = makeLabelTexture(spec.text, spec.color ?? "#e2e8f0");
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    );

    sprite.scale.set(LABEL_HEIGHT * aspect, LABEL_HEIGHT, 1);
    sprite.name = spec.id;

    if (spec.follow) {
      const target = this.lookup.get(spec.follow);
      sprite.position.copy(target ? target.position : new THREE.Vector3());
      sprite.position.add(new THREE.Vector3().fromArray(spec.offset ?? [0, 0.6, 0]));
      this.labels.push({
        sprite,
        targetId: spec.follow,
        offset: new THREE.Vector3().fromArray(spec.offset ?? [0, 0.6, 0]),
      });
    } else {
      sprite.position.fromArray(spec.at ?? [0, 1, 0]);
    }

    sprite.renderOrder = 10;
    this.lookup.set(spec.id, sprite);
    this.group.add(sprite);

    if (spec.card) this.clickable.push(sprite);
  }

  /* ------------------------------ التشغيل ------------------------------ */

  update(dt: number): void {
    this.time += dt;

    for (const entry of this.motions) {
      const { object, motion, base } = entry;
      const axis = motion.axis ?? "y";

      if (motion.type === "spin") {
        object.rotation[axis] += motion.speed * dt;
        continue;
      }

      if (motion.type === "bob") {
        const amplitude = motion.amplitude ?? 0.1;
        object.position[axis] = base[axis] + Math.sin(this.time * motion.speed) * amplitude;
        continue;
      }

      const radius = motion.radius ?? 1;
      const angle = this.time * motion.speed;
      object.position.set(Math.cos(angle) * radius, base.y, Math.sin(angle) * radius);
    }

    for (const label of this.labels) {
      const target = this.lookup.get(label.targetId);
      if (!target) continue;
      label.sprite.position.copy(target.position).add(label.offset);
    }
  }

  readout(): LabReadout {
    /* مشهد عام بلا كميات فيزيائية — الأعمدة تبقى صفراً ولا تُعرض */
    return { ep: 0, ek: 0, et: 0, ref: 1, info: [] };
  }

  reset(): void {
    this.time = 0;
    for (const entry of this.motions) {
      entry.object.position.copy(entry.base);
      entry.object.rotation.set(0, 0, 0);
    }
  }

  setParam(): void {
    /* لا معاملات فيزيائية في المشاهد العامة */
  }

  /* ------------------------------ الاستعلام ------------------------------ */

  getObject(id: string): THREE.Object3D | null {
    return this.lookup.get(id) ?? null;
  }

  getClickable(): THREE.Object3D[] {
    return this.clickable;
  }

  dispose(): void {
    this.disposed = true;
    this.loader.manager.onError = () => {};
    this.group.traverse((node) => {
      const sprite = node as THREE.Sprite;
      if (sprite.isSprite) {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      }
    });
    disposeGroup(this.group);
  }
}

/* ------------------------------ رسم التسمية ------------------------------ */

function makeLabelTexture(text: string, color: string): { texture: THREE.CanvasTexture; aspect: number } {
  const font = `700 ${22 * LABEL_DPR}px "Segoe UI", Tahoma, system-ui, sans-serif`;
  const padding = 12 * LABEL_DPR;

  const measureCanvas = document.createElement("canvas");
  const measure = measureCanvas.getContext("2d");
  if (measure) measure.font = font;
  const textWidth = measure ? Math.ceil(measure.measureText(text).width) : 120;

  const canvas = document.createElement("canvas");
  canvas.width = textWidth + padding * 2;
  canvas.height = 22 * LABEL_DPR + padding * 2;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const radius = canvas.height / 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
    ctx.fillStyle = "rgba(8, 15, 30, 0.78)";
    ctx.fill();
    ctx.lineWidth = 1.5 * LABEL_DPR;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, aspect: canvas.width / canvas.height };
}

/** تحويل ثلاثية من المخطط إلى متجه — للاستخدام في الطبقة الواجهية إن لزم */
export function toVector3(value: Vec3): THREE.Vector3 {
  return new THREE.Vector3().fromArray(value);
}
