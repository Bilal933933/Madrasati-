/**
 * مخطط المشهد (Scene Manifest v1) — بيانات لا كود.
 *
 * هذا هو «العقد» الذي يقرأه العارض المحلي، ويمكن لاحقاً تسليمه كما هو لخدمة
 * مشاهد مستقلة على نطاق آخر كما هو دون تحويل.
 *
 * لا يوجد تنفيذ JS هنا: كل ما يُقبل هو بدائيات هندسية + حركات معلومة + بطاقات.
 * أي مفتاح غير معروف يُرفض، وكل رقم يُقصّ داخل مدى آمن.
 */

export type Vec3 = [number, number, number];

export type SceneAxis = "x" | "y" | "z";

export type ScenePrimitiveType =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "plane"
  | "gear"
  | "arrow"
  | "label"
  | "model";

/** حركة بسيطة ومحدودة — لا سكربتات ولا منحنيات مخصصة */
export interface SceneMotion {
  type: "spin" | "bob" | "orbit";
  /** سرعة زاويّة/خطيّة — سالبة تعكس الاتجاه */
  speed: number;
  axis?: SceneAxis;
  /** للحركة المدارية */
  radius?: number;
  /** للحركة التذبذبية */
  amplitude?: number;
}

/** بطاقة تُفتح عند النقر على العنصر */
export interface SceneCard {
  title?: string;
  text: string;
}

export interface SceneObject {
  id: string;
  type: ScenePrimitiveType;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  /** box */
  size?: Vec3;
  /** sphere / cylinder / cone / torus */
  radius?: number;
  /** cylinder / cone */
  height?: number;
  /** torus */
  tube?: number;
  /** plane */
  width?: number;
  /** gear: عدد الأسنان */
  teeth?: number;
  /** عدد أضلاع المقطع — cone بـ 4 = هرم، cylinder بـ 6 = منشور سداسي */
  segments?: number;
  /** إضاءة ذاتية (مصباح/نجم/شاشة) */
  glow?: boolean;
  /** arrow */
  from?: Vec3;
  to?: Vec3;
  /** label */
  at?: Vec3;
  text?: string;
  /** label: يتبع عنصراً متحركاً بدل نقطة ثابتة */
  follow?: string;
  /** label: إزاحة عن موضع العنصر المتبوع */
  offset?: Vec3;
  /** model: مسار أصل ثلاثي الأبعاد (GLB) */
  src?: string;
  color?: string;
  opacity?: number;
  motion?: SceneMotion;
  card?: SceneCard;
}

export interface SceneManifest {
  version: 1;
  title: string;
  camera: { position: Vec3; target: Vec3 };
  environment: { background?: string; grid?: boolean };
  objects: SceneObject[];
}

export type SceneValidation = { ok: true; data: SceneManifest } | { ok: false; issues: string[] };

/* ------------------------------ الحدود ------------------------------ */

export const SCENE_LIMITS = {
  objects: 120,
  text: 160,
  title: 80,
  idPattern: /^[a-z0-9_-]{1,40}$/,
  colorPattern: /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i,
} as const;

const OBJECT_KEYS = new Set([
  "id",
  "type",
  "position",
  "rotation",
  "scale",
  "size",
  "radius",
  "height",
  "width",
  "teeth",
  "tube",
  "segments",
  "glow",
  "from",
  "to",
  "at",
  "text",
  "follow",
  "offset",
  "src",
  "color",
  "opacity",
  "motion",
  "card",
]);

const MOTION_KEYS = new Set(["type", "speed", "axis", "radius", "amplitude"]);
const CARD_KEYS = new Set(["title", "text"]);
const TYPES: ScenePrimitiveType[] = [
  "box",
  "sphere",
  "cylinder",
  "cone",
  "torus",
  "plane",
  "gear",
  "arrow",
  "label",
  "model",
];

/* ------------------------------ أدوات ------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(
  value: unknown,
  path: string,
  issues: string[],
  min: number,
  max: number,
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push(`${path}: رقم غير صالح`);
    return null;
  }
  if (value < min || value > max) {
    issues.push(`${path}: خارج المدى المسموح [${min} … ${max}]`);
    return null;
  }
  return value;
}

function readVec3(value: unknown, path: string, issues: string[]): Vec3 | null {
  if (!Array.isArray(value) || value.length !== 3) {
    issues.push(`${path}: يجب أن يكون ثلاثية [x, y, z]`);
    return null;
  }
  const out: Vec3 = [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    const item = readNumber(value[index], `${path}[${index}]`, issues, -100, 100);
    if (item === null) return null;
    out[index] = item;
  }
  return out;
}

function readText(value: unknown, path: string, issues: string[], max: number): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(`${path}: نص مطلوب`);
    return null;
  }
  if (value.length > max) {
    issues.push(`${path}: أطول من ${max} حرفاً`);
    return null;
  }
  return value;
}

function readColor(value: unknown, path: string, issues: string[]): string | null {
  if (typeof value !== "string" || !SCENE_LIMITS.colorPattern.test(value)) {
    issues.push(`${path}: لون يجب أن يكون بصيغة #rgb أو #rrggbb`);
    return null;
  }
  return value;
}

function readAxis(value: unknown, path: string, issues: string[]): SceneAxis | null {
  if (value === "x" || value === "y" || value === "z") return value;
  issues.push(`${path}: المحور يجب أن يكون x أو y أو z`);
  return null;
}

function rejectUnknownKeys(
  raw: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  issues: string[],
): void {
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) issues.push(`${path}.${key}: مفتاح غير معروف`);
  }
}

/* ------------------------------ الأجزاء ------------------------------ */

function readMotion(value: unknown, path: string, issues: string[]): SceneMotion | null {
  if (!isRecord(value)) {
    issues.push(`${path}: كائن حركة غير صالح`);
    return null;
  }
  rejectUnknownKeys(value, MOTION_KEYS, path, issues);

  const type = value.type;
  if (type !== "spin" && type !== "bob" && type !== "orbit") {
    issues.push(`${path}.type: يدعم spin أو bob أو orbit`);
    return null;
  }

  const speed = readNumber(value.speed, `${path}.speed`, issues, -6, 6);
  if (speed === null) return null;

  const motion: SceneMotion = { type, speed };

  if (value.axis !== undefined) {
    const axis = readAxis(value.axis, `${path}.axis`, issues);
    if (axis === null) return null;
    motion.axis = axis;
  }
  if (value.radius !== undefined) {
    const radius = readNumber(value.radius, `${path}.radius`, issues, 0.1, 30);
    if (radius === null) return null;
    motion.radius = radius;
  }
  if (value.amplitude !== undefined) {
    const amplitude = readNumber(value.amplitude, `${path}.amplitude`, issues, 0.01, 10);
    if (amplitude === null) return null;
    motion.amplitude = amplitude;
  }
  if (type === "orbit" && motion.radius === undefined) {
    issues.push(`${path}.radius: مطلوب للحركة المدارية`);
    return null;
  }
  if (type === "bob" && motion.amplitude === undefined) {
    issues.push(`${path}.amplitude: مطلوب للحركة التذبذبية`);
    return null;
  }

  return motion;
}

function readCard(value: unknown, path: string, issues: string[]): SceneCard | null {
  if (!isRecord(value)) {
    issues.push(`${path}: كائن بطاقة غير صالح`);
    return null;
  }
  rejectUnknownKeys(value, CARD_KEYS, path, issues);

  const text = readText(value.text, `${path}.text`, issues, SCENE_LIMITS.text);
  if (text === null) return null;

  const card: SceneCard = { text };
  if (value.title !== undefined) {
    const title = readText(value.title, `${path}.title`, issues, 60);
    if (title === null) return null;
    card.title = title;
  }
  return card;
}

function readObject(
  value: unknown,
  index: number,
  issues: string[],
  seen: Set<string>,
): SceneObject | null {
  const path = `objects[${index}]`;
  if (!isRecord(value)) {
    issues.push(`${path}: كائن غير صالح`);
    return null;
  }
  rejectUnknownKeys(value, OBJECT_KEYS, path, issues);

  const id = value.id;
  if (typeof id !== "string" || !SCENE_LIMITS.idPattern.test(id)) {
    issues.push(`${path}.id: معرّف بحروف صغيرة/أرقام فقط`);
    return null;
  }
  if (seen.has(id)) {
    issues.push(`${path}.id: معرّف مكرر «${id}»`);
    return null;
  }
  seen.add(id);

  const type = TYPES.find((item) => item === value.type);
  if (!type) {
    issues.push(`${path}.type: نوع غير مدعوم`);
    return null;
  }

  const object: SceneObject = { id, type };

  if (value.position !== undefined) {
    const position = readVec3(value.position, `${path}.position`, issues);
    if (!position) return null;
    object.position = position;
  }
  if (value.rotation !== undefined) {
    const rotation = readVec3(value.rotation, `${path}.rotation`, issues);
    if (!rotation) return null;
    object.rotation = rotation;
  }
  if (value.scale !== undefined) {
    const scale = readVec3(value.scale, `${path}.scale`, issues);
    if (!scale) return null;
    object.scale = scale;
  }
  if (value.size !== undefined) {
    const size = readVec3(value.size, `${path}.size`, issues);
    if (!size) return null;
    object.size = size;
  }
  if (value.radius !== undefined) {
    const radius = readNumber(value.radius, `${path}.radius`, issues, 0.01, 50);
    if (radius === null) return null;
    object.radius = radius;
  }
  if (value.height !== undefined) {
    const height = readNumber(value.height, `${path}.height`, issues, 0.01, 100);
    if (height === null) return null;
    object.height = height;
  }
  if (value.tube !== undefined) {
    const tube = readNumber(value.tube, `${path}.tube`, issues, 0.01, 10);
    if (tube === null) return null;
    object.tube = tube;
  }
  if (value.width !== undefined) {
    const width = readNumber(value.width, `${path}.width`, issues, 0.1, 100);
    if (width === null) return null;
    object.width = width;
  }
  if (value.teeth !== undefined) {
    const teeth = readNumber(value.teeth, `${path}.teeth`, issues, 6, 40);
    if (teeth === null || !Number.isInteger(teeth)) {
      issues.push(`${path}.teeth: عدد صحيح من 6 إلى 40`);
      return null;
    }
    object.teeth = teeth;
  }
  if (value.segments !== undefined) {
    const segments = readNumber(value.segments, `${path}.segments`, issues, 3, 64);
    if (segments === null || !Number.isInteger(segments)) {
      issues.push(`${path}.segments: عدد صحيح من 3 إلى 64`);
      return null;
    }
    object.segments = segments;
  }
  if (value.glow !== undefined) {
    if (typeof value.glow !== "boolean") {
      issues.push(`${path}.glow: يجب أن يكون true أو false`);
      return null;
    }
    object.glow = value.glow;
  }
  if (value.from !== undefined) {
    const from = readVec3(value.from, `${path}.from`, issues);
    if (!from) return null;
    object.from = from;
  }
  if (value.to !== undefined) {
    const to = readVec3(value.to, `${path}.to`, issues);
    if (!to) return null;
    object.to = to;
  }
  if (value.at !== undefined) {
    const at = readVec3(value.at, `${path}.at`, issues);
    if (!at) return null;
    object.at = at;
  }
  if (value.text !== undefined) {
    const text = readText(value.text, `${path}.text`, issues, SCENE_LIMITS.text);
    if (text === null) return null;
    object.text = text;
  }
  if (value.follow !== undefined) {
    const follow = value.follow;
    if (typeof follow !== "string" || !SCENE_LIMITS.idPattern.test(follow)) {
      issues.push(`${path}.follow: معرّف عنصر غير صالح`);
      return null;
    }
    object.follow = follow;
  }
  if (value.offset !== undefined) {
    const offset = readVec3(value.offset, `${path}.offset`, issues);
    if (!offset) return null;
    object.offset = offset;
  }
  if (value.src !== undefined) {
    const src = value.src;
    if (typeof src !== "string" || !src.startsWith("/") || src.length > 200) {
      issues.push(`${path}.src: مسار محلي يبدأ بـ "/"`);
      return null;
    }
    object.src = src;
  }
  if (value.color !== undefined) {
    const color = readColor(value.color, `${path}.color`, issues);
    if (color === null) return null;
    object.color = color;
  }
  if (value.opacity !== undefined) {
    const opacity = readNumber(value.opacity, `${path}.opacity`, issues, 0, 1);
    if (opacity === null) return null;
    object.opacity = opacity;
  }
  if (value.motion !== undefined) {
    const motion = readMotion(value.motion, `${path}.motion`, issues);
    if (!motion) return null;
    object.motion = motion;
  }
  if (value.card !== undefined) {
    const card = readCard(value.card, `${path}.card`, issues);
    if (!card) return null;
    object.card = card;
  }

  /* الحقول الإلزامية لكل نوع */
  if (type === "box" && object.size === undefined) object.size = [1, 1, 1];
  if (["sphere", "cylinder", "cone", "torus", "gear"].includes(type) && object.radius === undefined) {
    issues.push(`${path}.radius: مطلوب للنوع ${type}`);
    return null;
  }
  if (type === "cylinder" || type === "cone" || type === "gear") {
    if (object.height === undefined) {
      issues.push(`${path}.height: مطلوب للنوع ${type}`);
      return null;
    }
  }
  if (type === "torus" && object.tube === undefined) {
    issues.push(`${path}.tube: مطلوب للنوع torus`);
    return null;
  }
  if (type === "plane" && (object.width === undefined || object.height === undefined)) {
    issues.push(`${path}: المستوى يحتاج width و height`);
    return null;
  }
  if (type === "arrow" && (object.from === undefined || object.to === undefined)) {
    issues.push(`${path}: السهم يحتاج from و to`);
    return null;
  }
  if (type === "label" && (object.text === undefined || (object.at === undefined && object.follow === undefined))) {
    issues.push(`${path}: التسمية تحتاج text و(at أو follow)`);
    return null;
  }
  if (type === "model" && object.src === undefined) {
    issues.push(`${path}.src: مطلوب للنوع model`);
    return null;
  }

  return object;
}

/** التحقق الكامل: يعيد مشهداً منظّماً أو قائمة أخطاء عربية مفهومة */
export function validateScene(input: unknown): SceneValidation {
  const issues: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, issues: ["المشهد يجب أن يكون كائناً (JSON object)"] };
  }

  if (input.version !== 1) {
    issues.push("version: الإصدار المدعوم هو 1");
  }

  const title = readText(input.title, "title", issues, SCENE_LIMITS.title);
  if (title === null) return { ok: false, issues };

  const cameraRaw = input.camera;
  let camera: SceneManifest["camera"] = { position: [0, 2, 6], target: [0, 0, 0] };
  if (!isRecord(cameraRaw)) {
    issues.push("camera: مطلوب position و target");
  } else {
    rejectUnknownKeys(cameraRaw, new Set(["position", "target"]), "camera", issues);
    const position = readVec3(cameraRaw.position, "camera.position", issues);
    const target = readVec3(cameraRaw.target, "camera.target", issues);
    if (position && target) camera = { position, target };
  }

  const environmentRaw = input.environment;
  const environment: SceneManifest["environment"] = { grid: false };
  if (isRecord(environmentRaw)) {
    rejectUnknownKeys(environmentRaw, new Set(["background", "grid"]), "environment", issues);
    if (environmentRaw.background !== undefined) {
      const background = readColor(environmentRaw.background, "environment.background", issues);
      if (background) environment.background = background;
    }
    if (environmentRaw.grid !== undefined) {
      if (typeof environmentRaw.grid !== "boolean") {
        issues.push("environment.grid: يجب أن يكون true أو false");
      } else {
        environment.grid = environmentRaw.grid;
      }
    }
  }

  const rawObjects = input.objects;
  const objects: SceneObject[] = [];
  if (!Array.isArray(rawObjects)) {
    issues.push("objects: مصفوفة مطلوبة");
  } else if (rawObjects.length === 0) {
    issues.push("objects: مشهد فارغ");
  } else if (rawObjects.length > SCENE_LIMITS.objects) {
    issues.push(`objects: الحد الأقصى ${SCENE_LIMITS.objects} عنصراً`);
  } else {
    const seen = new Set<string>();
    rawObjects.forEach((raw, index) => {
      const object = readObject(raw, index, issues, seen);
      if (object) objects.push(object);
    });
  }

  if (issues.length > 0) return { ok: false, issues };

  /* تمريرة ثانية: التسميات التابعة يجب أن تشير لعنصر موجود */
  const knownIds = new Set(objects.map((object) => object.id));
  for (const object of objects) {
    if (object.follow && !knownIds.has(object.follow)) {
      issues.push(`objects.${object.id}.follow: لا يوجد عنصر بالمعرّف «${object.follow}»`);
    }
  }
  if (issues.length > 0) return { ok: false, issues };

  return { ok: true, data: { version: 1, title, camera, environment, objects } };
}
