import type { SceneManifest } from "./schema";
import { validateScene } from "./schema";

/**
 * عشرة مشاهد لعشر مواد/دروس — بيانات فقط.
 * إضافة مشهد جديد = كائن هنا (أو من الباك لاحقاً)، بلا كود React ولا سكربت.
 */

/* ١) فلك — علوم */
const SOLAR_SYSTEM: SceneManifest = {
  version: 1,
  title: "المجموعة الشمسية — نموذج مبسّط",
  camera: { position: [0, 6, 10], target: [0, 0, 0] },
  environment: { grid: false, background: "#070b16" },
  objects: [
    {
      id: "sun",
      type: "sphere",
      radius: 1.1,
      position: [0, 0, 0],
      color: "#f59e0b",
      glow: true,
      card: {
        title: "الشمس",
        text: "نجم مركزي يحتوي معظم كتلة النظام الشمسي، وهو مصدر الطاقة الضوئية والحرارية للكواكب.",
      },
    },
    {
      id: "sun-glow",
      type: "sphere",
      radius: 1.4,
      position: [0, 0, 0],
      color: "#fbbf24",
      opacity: 0.16,
      motion: { type: "spin", speed: 0.15 },
    },
    {
      id: "earth",
      type: "sphere",
      radius: 0.34,
      position: [3.2, 0, 0],
      color: "#38bdf8",
      motion: { type: "orbit", speed: 0.35, radius: 3.2 },
      card: {
        title: "الأرض",
        text: "تكمّل دورة حول الشمس في نحو 365 يوماً، وهي الكوكب الوحيد المعروف بوجود حياة عليه.",
      },
    },
    {
      id: "mars",
      type: "sphere",
      radius: 0.24,
      position: [4.9, 0, 0],
      color: "#ef4444",
      motion: { type: "orbit", speed: 0.22, radius: 4.9 },
      card: {
        title: "المريخ",
        text: "الكوكب الأحمر؛ لونه من أكسيد الحديد في ترابه، ويُكمل دورته حول الشمس في نحو 687 يوماً.",
      },
    },
    { id: "sun-label", type: "label", text: "الشمس", at: [0, 1.75, 0] },
    { id: "earth-label", type: "label", text: "الأرض", follow: "earth", offset: [0, 0.75, 0] },
    { id: "mars-label", type: "label", text: "المريخ", follow: "mars", offset: [0, 0.65, 0] },
  ],
};

/* ٢) كيمياء */
const WATER_MOLECULE: SceneManifest = {
  version: 1,
  title: "جزيء الماء H₂O",
  camera: { position: [0, 1.6, 4.6], target: [0, 0.35, 0] },
  environment: { grid: false, background: "#0b1220" },
  objects: [
    {
      id: "oxygen",
      type: "sphere",
      radius: 0.52,
      position: [0, 0, 0],
      color: "#ef4444",
      card: {
        title: "ذرة الأكسجين",
        text: "تحتوي 8 بروتونات، وتشارك إلكترونين مع ذرتي الهيدروجين لتكوين رابطة تساهمية قطبية.",
      },
    },
    {
      id: "hydrogen-a",
      type: "sphere",
      radius: 0.3,
      position: [0.88, 0.55, 0],
      color: "#e2e8f0",
      motion: { type: "bob", speed: 1.4, amplitude: 0.07, axis: "y" },
      card: {
        title: "ذرة هيدروجين",
        text: "أصغر العناصر؛ ترتبط بالأكسجين برابطة تساهمية، وزاوية الرابطة في الماء نحو 104.5°.",
      },
    },
    {
      id: "hydrogen-b",
      type: "sphere",
      radius: 0.3,
      position: [-0.88, 0.55, 0],
      color: "#e2e8f0",
      motion: { type: "bob", speed: 1.4, amplitude: 0.07, axis: "y" },
      card: {
        title: "ذرة هيدروجين",
        text: "الذرتان لا تقعان على استقامة واحدة مع الأكسجين، ولهذا يكون الجزيء قطبيّاً.",
      },
    },
    { id: "bond-a", type: "arrow", from: [0.1, 0.08, 0], to: [0.8, 0.5, 0], color: "#93c5fd" },
    { id: "bond-b", type: "arrow", from: [-0.1, 0.08, 0], to: [-0.8, 0.5, 0], color: "#93c5fd" },
    { id: "oxygen-label", type: "label", text: "O", follow: "oxygen", offset: [0, 0.85, 0] },
    { id: "hydrogen-a-label", type: "label", text: "H", follow: "hydrogen-a", offset: [0, 0.62, 0] },
    { id: "hydrogen-b-label", type: "label", text: "H", follow: "hydrogen-b", offset: [0, 0.62, 0] },
  ],
};

/* ٣) أحياء — الخلية */
const CELL: SceneManifest = {
  version: 1,
  title: "الخلية الحيوانية",
  camera: { position: [0, 3.4, 7.4], target: [0, 0, 0] },
  environment: { grid: false, background: "#06140f" },
  objects: [
    {
      id: "membrane",
      type: "sphere",
      radius: 2.5,
      position: [0, 0, 0],
      color: "#38bdf8",
      opacity: 0.12,
      motion: { type: "spin", speed: 0.12 },
    },
    {
      id: "nucleus",
      type: "sphere",
      radius: 0.9,
      position: [0.6, 0.35, 0],
      color: "#a855f7",
      motion: { type: "bob", speed: 0.9, amplitude: 0.08, axis: "y" },
      card: {
        title: "النواة",
        text: "تحتوي المادة الوراثية (DNA) وتنظّم أنشطة الخلية، ويحيط بها غلاف نووي مثقّب.",
      },
    },
    {
      id: "nucleolus",
      type: "sphere",
      radius: 0.32,
      position: [0.9, 0.5, 0.5],
      color: "#c084fc",
      card: { title: "النوية", text: "منطقة داخل النواة تُصنَّع فيها الرايبوسومات." },
    },
    {
      id: "mito-a",
      type: "cylinder",
      radius: 0.18,
      height: 0.95,
      position: [-1.5, -0.2, 0.4],
      rotation: [0.4, 0, 0.9],
      color: "#f97316",
      card: {
        title: "ميتوكندريا",
        text: "مصنع الطاقة في الخلية؛ تُنتج ATP من تحلل الجلوكوز بالتنفس الخلوي.",
      },
    },
    {
      id: "mito-b",
      type: "cylinder",
      radius: 0.16,
      height: 0.8,
      position: [-0.6, 0.9, 0.9],
      rotation: [0.2, 0.4, 1.2],
      color: "#fb923c",
    },
    {
      id: "ribosome",
      type: "sphere",
      radius: 0.13,
      position: [1.4, -1.1, 0.6],
      color: "#22c55e",
      motion: { type: "bob", speed: 1.8, amplitude: 0.1, axis: "y" },
      card: { title: "رايبوسوم", text: "يترجم الرسالة الوراثية إلى بروتين." },
    },
    { id: "nucleus-label", type: "label", text: "النواة", follow: "nucleus", offset: [0, 1.25, 0] },
    { id: "mito-label", type: "label", text: "ميتوكندريا", follow: "mito-a", offset: [0, 0.8, 0] },
    { id: "ribo-label", type: "label", text: "رايبوسوم", follow: "ribosome", offset: [0, 0.45, 0] },
  ],
};

/* ٤) جغرافيا — طبقات الأرض */
const EARTH_LAYERS: SceneManifest = {
  version: 1,
  title: "طبقات الأرض",
  camera: { position: [0, 2.6, 7.6], target: [0, 0, 0] },
  environment: { grid: false, background: "#0a0f1f" },
  objects: [
    {
      id: "core",
      type: "sphere",
      radius: 1,
      position: [0, 0, 0],
      color: "#f59e0b",
      glow: true,
      card: {
        title: "اللب",
        text: "حديد ونيكل بدرجة حرارة تقارب 5000°م؛ حركته تولّد المجال المغناطيسي للأرض.",
      },
    },
    {
      id: "mantle",
      type: "sphere",
      radius: 1.75,
      position: [0, 0, 0],
      color: "#dc2626",
      opacity: 0.28,
      card: {
        title: "الوشاح",
        text: "صخور لدنة شبه منصهرة تحرّك الصفائح الأرضية عبر تيارات الحمل.",
      },
    },
    {
      id: "crust",
      type: "sphere",
      radius: 2.15,
      position: [0, 0, 0],
      color: "#22c55e",
      opacity: 0.16,
      card: {
        title: "القشرة",
        text: "أرقّ طبقة (5–70 كم)، وتتركب من صفائح تتحرك ببضع سنتيمترات سنوياً.",
      },
    },
    { id: "core-label", type: "label", text: "اللب", at: [0, 1.3, 0] },
    { id: "mantle-label", type: "label", text: "الوشاح", at: [1.9, 0.9, 0] },
    { id: "crust-label", type: "label", text: "القشرة", at: [-1.9, 1.1, 0] },
  ],
};

/* ٥) لغة عربية — شجرة الإعراب */
const SYNTAX_TREE: SceneManifest = {
  version: 1,
  title: "شجرة الإعراب — جملة فعلية",
  camera: { position: [0, 1.9, 7.4], target: [0, 1.5, 0] },
  environment: { grid: false, background: "#141018" },
  objects: [
    {
      id: "root",
      type: "box",
      size: [2.3, 0.6, 0.28],
      position: [0, 2.95, 0],
      color: "#a855f7",
      card: { title: "الجملة الفعلية", text: "تبدأ بفعل، ثم فاعل، ثم مفعول به إن كان الفعل متعدياً." },
    },
    {
      id: "verb",
      type: "box",
      size: [1.6, 0.56, 0.26],
      position: [0, 1.85, 0],
      color: "#f59e0b",
      card: { title: "يقرأُ", text: "فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة على آخره." },
    },
    {
      id: "subject",
      type: "box",
      size: [1.6, 0.56, 0.26],
      position: [1.85, 0.75, 0],
      color: "#38bdf8",
      card: { title: "الطالبُ", text: "فاعل مرفوع، وعلامة رفعه الضمة الظاهرة." },
    },
    {
      id: "object",
      type: "box",
      size: [1.6, 0.56, 0.26],
      position: [-1.85, 0.75, 0],
      color: "#22c55e",
      card: { title: "الدرسَ", text: "مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة." },
    },
    { id: "edge-root-verb", type: "arrow", from: [0, 2.6, 0], to: [0, 2.16, 0], color: "#64748b" },
    { id: "edge-verb-subject", type: "arrow", from: [0.45, 1.62, 0], to: [1.6, 1.02, 0], color: "#64748b" },
    { id: "edge-verb-object", type: "arrow", from: [-0.45, 1.62, 0], to: [-1.6, 1.02, 0], color: "#64748b" },
    { id: "verb-label", type: "label", text: "يقرأُ — فعل", follow: "verb", offset: [1.75, 0, 0] },
    { id: "subject-label", type: "label", text: "الطالبُ — فاعل مرفوع", follow: "subject", offset: [2.05, 0, 0] },
    { id: "object-label", type: "label", text: "الدرسَ — مفعول به منصوب", follow: "object", offset: [-2.1, 0, 0] },
    { id: "root-label", type: "label", text: "الجملة الفعلية", follow: "root", offset: [0, 0.6, 0] },
  ],
};

/* ٦) رياضيات — المجسمات */
const SOLIDS: SceneManifest = {
  version: 1,
  title: "المجسمات الفضائية",
  camera: { position: [0, 3, 8], target: [0, 0.8, 0] },
  environment: { grid: false, background: "#0e1117" },
  objects: [
    { id: "ground", type: "plane", width: 11, height: 5, position: [0, 0, 0], color: "#1e293b" },
    {
      id: "cube",
      type: "box",
      size: [1.3, 1.3, 1.3],
      position: [-2.6, 0.66, 0],
      color: "#38bdf8",
      card: { title: "المكعب", text: "الحجم = الضلع³، ومساحة السطح = 6 × الضلع²." },
    },
    {
      id: "sphere",
      type: "sphere",
      radius: 0.7,
      position: [-0.85, 0.72, 0],
      color: "#22c55e",
      card: { title: "الكرة", text: "الحجم = 4/3 πr³، ومساحة السطح = 4πr²." },
    },
    {
      id: "cylinder",
      type: "cylinder",
      radius: 0.62,
      height: 1.45,
      position: [0.85, 0.73, 0],
      color: "#f59e0b",
      card: { title: "الأسطوانة", text: "الحجم = πr²h، ومساحة السطح الجانبية = 2πrh." },
    },
    {
      id: "cone",
      type: "cone",
      radius: 0.72,
      height: 1.45,
      position: [2.6, 0.73, 0],
      color: "#ef4444",
      card: { title: "المخروط", text: "الحجم = 1/3 πr²h — ثلث حجم أسطوانة بنفس القاعدة والارتفاع." },
    },
    { id: "cube-label", type: "label", text: "مكعب", follow: "cube", offset: [0, 1.15, 0] },
    { id: "sphere-label", type: "label", text: "كرة", follow: "sphere", offset: [0, 1.05, 0] },
    { id: "cylinder-label", type: "label", text: "أسطوانة", follow: "cylinder", offset: [0, 1.15, 0] },
    { id: "cone-label", type: "label", text: "مخروط", follow: "cone", offset: [0, 1.15, 0] },
  ],
};

/* ٧) فيزياء — دائرة كهربائية */
const CIRCUIT: SceneManifest = {
  version: 1,
  title: "دائرة كهربائية بسيطة",
  camera: { position: [0, 2.2, 7.2], target: [0, 0.9, 0] },
  environment: { grid: false, background: "#0b1220" },
  objects: [
    {
      id: "battery",
      type: "box",
      size: [1.1, 0.6, 0.45],
      position: [-2.6, 0.4, 0],
      color: "#f59e0b",
      card: { title: "البطارية", text: "مصدر فرق جهد ثابت يدفع الشحنات في الدائرة المغلقة." },
    },
    {
      id: "bulb",
      type: "sphere",
      radius: 0.38,
      position: [2.3, 1.5, 0],
      color: "#fde68a",
      glow: true,
      motion: { type: "bob", speed: 2.2, amplitude: 0.04, axis: "y" },
      card: {
        title: "المصباح",
        text: "يحوّل الطاقة الكهربائية إلى ضوء وحرارة عبر فتيل يقاوم مرور التيار.",
      },
    },
    {
      id: "switch",
      type: "box",
      size: [0.8, 0.22, 0.3],
      position: [0, 2.35, 0],
      rotation: [0, 0, 0.35],
      color: "#94a3b8",
      card: { title: "المفتاح", text: "يغلق الدائرة أو يفتحها؛ بلا دائرة مغلقة لا يمر تيار." },
    },
    { id: "wire-a", type: "arrow", from: [-2, 0.4, 0], to: [1.8, 0.4, 0], color: "#64748b" },
    { id: "wire-b", type: "arrow", from: [2.3, 0.4, 0], to: [2.3, 1.05, 0], color: "#64748b" },
    { id: "wire-c", type: "arrow", from: [2.3, 1.95, 0], to: [-2.6, 1.95, 0], color: "#64748b" },
    { id: "wire-d", type: "arrow", from: [-2.6, 1.9, 0], to: [-2.6, 0.75, 0], color: "#64748b" },
    { id: "battery-label", type: "label", text: "بطارية", follow: "battery", offset: [0, 0.75, 0] },
    { id: "bulb-label", type: "label", text: "مصباح", follow: "bulb", offset: [0, 0.75, 0] },
    { id: "switch-label", type: "label", text: "مفتاح", follow: "switch", offset: [0, 0.55, 0] },
  ],
};

/* ٨) أحياء — القلب */
const HEART: SceneManifest = {
  version: 1,
  title: "القلب ومسار الدم",
  camera: { position: [0, 1.2, 6.4], target: [0, 0.5, 0] },
  environment: { grid: false, background: "#160b12" },
  objects: [
    /* جسم القلب من أصل GLB حقيقي، والأوعية والتسميات من بيانات المشهد */
    {
      id: "heart",
      type: "model",
      src: "/sandbox/models/heart.glb",
      position: [0, 0.5, 0],
      scale: [0.85, 0.85, 0.85],
      color: "#e11d48",
      motion: { type: "bob", speed: 4.6, amplitude: 0.03, axis: "y" },
      card: {
        title: "القلب",
        text: "مضخة عضلية بأربع حجرات؛ يدفع الدم المؤكسج للجسم والدم غير المؤكسج للرئتين.",
      },
    },
    {
      id: "aorta",
      type: "cylinder",
      radius: 0.14,
      height: 1.35,
      position: [-0.3, 1.9, 0],
      rotation: [0, 0, 0.18],
      color: "#ef4444",
      card: { title: "الأبهر", text: "أكبر شريان في الجسم، ينقل الدم المؤكسج من البطين الأيسر." },
    },
    {
      id: "pulmonary",
      type: "cylinder",
      radius: 0.12,
      height: 1.15,
      position: [0.45, 1.85, 0],
      rotation: [0, 0, -0.3],
      color: "#3b82f6",
      card: { title: "الشريان الرئوي", text: "ينقل الدم غير المؤكسج من البطين الأيمن إلى الرئتين." },
    },
    { id: "aorta-label", type: "label", text: "الأبهر", follow: "aorta", offset: [-1.15, 0.25, 0] },
    { id: "pulmonary-label", type: "label", text: "الشريان الرئوي", follow: "pulmonary", offset: [1.15, 0.1, 0] },
    { id: "heart-label", type: "label", text: "القلب", follow: "heart", offset: [0, -1.05, 0] },
  ],
};

/* ٩) تقنية — التروس */
const GEARS: SceneManifest = {
  version: 1,
  title: "التروس ونقل الحركة",
  camera: { position: [0, 2.6, 6.4], target: [0, 0.9, 0] },
  environment: { grid: false, background: "#0d1117" },
  objects: [
    {
      id: "gear-large",
      type: "gear",
      radius: 1,
      height: 0.34,
      teeth: 16,
      position: [-0.92, 1, 0],
      rotation: [Math.PI / 2, 0, 0],
      color: "#94a3b8",
      motion: { type: "spin", speed: 0.9, axis: "z" },
      card: {
        title: "الترس الكبير",
        text: "قطره أكبر فيدور أبطأ، لكن عزومته (قوة الدوران) أعلى.",
      },
    },
    {
      id: "gear-small",
      type: "gear",
      radius: 0.58,
      height: 0.34,
      teeth: 9,
      position: [0.91, 1, 0],
      rotation: [Math.PI / 2, 0, 0],
      color: "#f59e0b",
      motion: { type: "spin", speed: -1.55, axis: "z" },
      card: {
        title: "الترس الصغير",
        text: "يدور أسرع في الاتجاه المعاكس؛ نسبة السرعة تساوي نسبة القطرين.",
      },
    },
    {
      id: "axle",
      type: "cylinder",
      radius: 0.1,
      height: 3.2,
      position: [0, 1, -0.32],
      rotation: [0, 0, Math.PI / 2],
      color: "#475569",
    },
    { id: "large-label", type: "label", text: "ترس كبير", follow: "gear-large", offset: [-0.1, 1.5, 0] },
    { id: "small-label", type: "label", text: "ترس صغير", follow: "gear-small", offset: [0.35, 1.05, 0] },
  ],
};

/* ١٠) تاريخ/هندسة — الأهرامات */
const PYRAMID: SceneManifest = {
  version: 1,
  title: "الأهرامات — هندسة البناء",
  camera: { position: [0, 3.2, 9], target: [0, 1.1, 0] },
  environment: { grid: false, background: "#1a1208" },
  objects: [
    {
      id: "great",
      type: "cone",
      radius: 2.2,
      height: 2.6,
      segments: 4,
      position: [-1, 1.3, 0],
      rotation: [0, Math.PI / 4, 0],
      color: "#d4a373",
      card: {
        title: "الهرم الأكبر",
        text: "قاعدة مربعة وأربعة أوجه مثلثة تلتقي في قمة واحدة؛ ارتفاعه الأصلي نحو 146 متراً.",
      },
    },
    {
      id: "small",
      type: "cone",
      radius: 1.1,
      height: 1.3,
      segments: 4,
      position: [2.4, 0.65, -0.4],
      rotation: [0, Math.PI / 4, 0],
      color: "#c08a5a",
      card: { title: "هرم صغير", text: "أهرامات الملكات؛ تُبنى بنفس النسبة مع تصغير الأبعاد." },
    },
    { id: "ground", type: "plane", width: 18, height: 16, position: [0, 0, -1], color: "#4a3826" },
    { id: "apex-label", type: "label", text: "القمة", follow: "great", offset: [0, 1.7, 0] },
    { id: "base-label", type: "label", text: "قاعدة مربعة", at: [-1, -0.05, 2.1] },
  ],
};

export interface SceneEntry {
  id: string;
  title: string;
  subject: string;
  summary: string;
  manifest: SceneManifest;
}

export const SCENES: SceneEntry[] = [
  { id: "solar-system", title: "المجموعة الشمسية", subject: "علوم", summary: "مدارات الكواكب وزمن الدورة", manifest: SOLAR_SYSTEM },
  { id: "water-molecule", title: "جزيء الماء", subject: "كيمياء", summary: "الروابط القطبية وزاوية الرابطة", manifest: WATER_MOLECULE },
  { id: "cell", title: "الخلية الحيوانية", subject: "أحياء", summary: "العضيات ووظائفها", manifest: CELL },
  { id: "earth-layers", title: "طبقات الأرض", subject: "جغرافيا", summary: "اللب والوشاح والقشرة", manifest: EARTH_LAYERS },
  { id: "syntax-tree", title: "شجرة الإعراب", subject: "لغة عربية", summary: "العلاقات الإعرابية في جملة فعلية", manifest: SYNTAX_TREE },
  { id: "solids", title: "المجسمات الفضائية", subject: "رياضيات", summary: "الحجم ومساحة السطح", manifest: SOLIDS },
  { id: "circuit", title: "دائرة كهربائية", subject: "فيزياء", summary: "بطارية ومصباح ومفتاح", manifest: CIRCUIT },
  { id: "heart", title: "القلب ومسار الدم", subject: "أحياء", summary: "الحجرات والأوعية الكبرى", manifest: HEART },
  { id: "gears", title: "التروس", subject: "تقنية", summary: "نقل الحركة ونسبة السرعة", manifest: GEARS },
  { id: "pyramid", title: "الأهرامات", subject: "تاريخ", summary: "الهرم كمشروع هندسي", manifest: PYRAMID },
];

export function getScene(id: string): SceneEntry | null {
  return SCENES.find((scene) => scene.id === id) ?? null;
}

/**
 * نفس التحقق الذي سيُطبَّق على مشهد قادم من الباك.
 * يعيد سبباً واضحاً بدل انهيار المشهد.
 */
export function loadScene(id: string): { ok: true; entry: SceneEntry } | { ok: false; issues: string[] } {
  const entry = getScene(id);
  if (!entry) {
    return { ok: false, issues: [`لا يوجد مشهد بالمعرّف «${id}»`] };
  }

  const result = validateScene(entry.manifest);
  if (!result.ok) {
    return { ok: false, issues: result.issues };
  }

  return { ok: true, entry: { ...entry, manifest: result.data } };
}
