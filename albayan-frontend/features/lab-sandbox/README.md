# lab-sandbox — مختبر فيزيائي ثلاثي الأبعاد (بيئة معزولة)

> ⚠️ **بيئة تجريبية معزولة — ليست جزءاً من المنصة الحالية**
> هذه التجربة مرجعية فقط: لا تُستخدم في الدروس الحقيقية، والمحرك الوحيد المعتمد للإنتاج الآن هو `features/lesson-engine` (محرك الدرس الحالي). لا يُدمج `interactive_lab` (الكتلة التفاعلية داخل الدرس) إلا في خطة تطوير لاحقة (Roadmap = خطة مستقبلية).

نسخة تجريبية مستقلة لتقييم دمج مختبر تفاعلي في محرك الدرس، **دون أي أثر** على المشروع
أو الخادم. كل شيء هنا إضافي، والبيانات ثابتة داخل المستودع.

## العزل — ما لا يفعله هذا المجلد

- لا `fetch`، لا شبكة، لا `localStorage`.
- لا استيراد من `features/lesson-engine` أو `lib/` (عدا `cn` من `lib/utils` للأنماط).
- لا TanStack Query، ولا مفاتيح جديدة في مخزن الاستعلامات.
- لا تعديل على `app/layout.tsx` أو أي ملف قائم.

## التشغيل

- الفهرس: `/sandbox/lab`
- مختبر: `/sandbox/lab/pendulum?variant=book`
- **عارض المشاهد العامة**: `/sandbox/lab/scene`
- **عشرة دروس بعشرة مشاهد**: `/sandbox/scenes`
- **محاكاة الدرس كاملاً**: `/sandbox/lesson?variant=compact`
- المختبرات: `pendulum` · `ramp` · `spring`
- الهياكل: `book` (صفحتا كتاب) · `focus` (مسرح واسع + شرح أسفله) · `compact` (بعرض `LessonShell`)
- الثيم: `?theme=dark` أو `?theme=light` (الافتراضي فاتح)

## محاكاة محرك الدرس

`/sandbox/lesson` يعيد إيقاع المحرك الحقيقي دون استيراد أي شيء منه:

| الخطوة | المحتوى |
|---|---|
| `start` | عنوان، صف، مدة، أهداف الدرس |
| `content` | فقرة (TipTap JSON) تحوي عقدة `interactive_lab` — المختبر داخل النص |
| `assessment` (تكويني) | ٣ أسئلة: اختيار من متعدد + صح/خطأ، تحقّق وتغذية راجعة |
| `assessment` (ختامي) | ٣ أسئلة تُحسب في النتيجة |
| `finish` | نتيجتا التقييمين والنتيجة الكلية ونسبة النجاح (٦٠٪) |

- التنقّل: شريط خطوات + شريط تقدم + السابق/التالي، ولا يُفتح التالي قبل إغلاق أسئلة المرحلة.
- داخل الدرس، الهيئة `compact` تعني بعرض `LessonShell` (42rem)، و`book`/`focus` توسّع المشهد فقط
  (دون تكرار لوحة الشرح، لأن خطوة المحتوى تحتوي الشرح أصلاً). أما صفحة المختبر وحدها فتعرض
  الهياكل الثلاثة كاملة مع الشرح للمقارنة.
- كل الحالة في الذاكرة: لا `localStorage` ولا إرسال نتائج.
- ملفات المحاكاة: `mock/lesson.ts` (البيانات + الحساب)، `components/sandbox-assessment.tsx`،
  `components/sandbox-lesson-stages.tsx`، `components/sandbox-lesson-page.tsx`.

## المختبر عقدة داخل الفقرة

المحتوى في خطوة `content` مستند JSON بشكل TipTap — نفس ما يعيده
`ParagraphResource.content` — والمختبر عقدة وسيطة فيه لا مكوّن ملتصق:

```
doc
├─ paragraph   «الطاقة لا تفنى…»
├─ interactive_lab { labKind, caption }   ← المختبر
├─ heading     «لماذا يبقى المجموع ثابتاً؟»
├─ paragraph   فيه marks (bold)
└─ blockquote  «Ep + Ek = Et»
```

| الملف | الدور |
|---|---|
| `mock/paragraph.ts` | أنواع عقد المستند + `findLabNodes()` / `hasLab()` |
| `mock/lessons.ts` | عشرة دروس + `lessonDoc()` يحوّل الدرس إلى مستند فيه عقدة مشهد |
| `components/sandbox-rich-content.tsx` | عارض المستند، نظير `rich-lesson-content` في المشروع |
| `mock/lesson.ts` | مستند الفقرة الثابتة (`content`) |

- النص محصور بـ `max-w-2xl` (42rem)، وعقدة المختبر تخرج للعرض الكامل (breakout)
  لأن مشهداً ثلاثي الأبعاد بعرض نص ضيق غير قابل للاستخدام.
- في المشروع الحقيقي يكفي إضافة فرع `case "interactive_lab"` في
  `components/shared/rich-lesson-content.tsx` — مثل فرع `diagram` الموجود — دون
  أي تغيير في الباك أو `lesson-mapper`.

## المشاهد العامة (Scene Manifest v1)

أي مشهد في أي مادة = **بيانات**، لا سكربت:
`/sandbox/lab/scene` (`?scene=<id>`) لعارض واحد، و`/sandbox/scenes` فهرس عشرة دروس
بعشرة مشاهد مختلفة (`/sandbox/scenes/[lessonId]`).

| # | المشهد | id | المادة | ما يعرضه |
|---|---|---|---|---|
| ١ | المجموعة الشمسية | `solar-system` | علوم | مدارات الكواكب وحجمها النسبي |
| ٢ | جزيء الماء | `water-molecule` | كيمياء | الروابط القطبية وزاوية 104.5° |
| ٣ | الخلية الحيوانية | `cell` | أحياء | غشاء شفاف + نواة وميتوكندريا ورايبوسوم |
| ٤ | طبقات الأرض | `earth-layers` | جغرافيا | لب متوهّج وقشرة ووشاح شفافان |
| ٥ | شجرة الإعراب | `syntax-tree` | لغة عربية | عقد وأسهم وتسميات في جملة فعلية |
| ٦ | المجسمات الفضائية | `solids` | رياضيات | مكعب وكرة وأسطوانة ومخروط على أرضية |
| ٧ | دائرة كهربائية | `circuit` | فيزياء | بطارية ومصباح متوهّج ومفتاح وأسلاك |
| ٨ | القلب ومسار الدم | `heart` | أحياء | قلب نابض + أبهر وشريان رئوي |
| ٩ | التروس | `gears` | تقنية | ترسان متشابكان يدوران باتجاهين متعاكسين |
| ١٠ | الأهرامات | `pyramid` | تاريخ | هرمان بأوجه مثلثة على أرضية صحراوية |

- كل درس في `mock/lessons.ts` يتحول إلى مستند `lessonDoc()` فيه عقدة `interactive_lab`
  واحدة تحمل `sceneId` — لا يوجد قارئ خاص لكل مادة.

```json
{
  "version": 1,
  "title": "جزيء الماء",
  "camera": { "position": [0, 1.6, 4.6], "target": [0, 0.35, 0] },
  "environment": { "background": "#0b1220", "grid": false },
  "objects": [
    { "id": "oxygen", "type": "sphere", "radius": 0.52, "position": [0, 0, 0],
      "color": "#ef4444", "card": { "title": "ذرة الأكسجين", "text": "…" } },
    { "id": "h-a", "type": "sphere", "radius": 0.3, "position": [0.88, 0.55, 0],
      "motion": { "type": "bob", "speed": 1.4, "amplitude": 0.07, "axis": "y" } },
    { "id": "bond", "type": "arrow", "from": [0.1, 0.08, 0], "to": [0.8, 0.5, 0] },
    { "id": "h-a-label", "type": "label", "text": "H", "follow": "h-a", "offset": [0, 0.62, 0] }
  ]
}
```

| العنصر | الحقول |
|---|---|
| `box` | `size` |
| `sphere` | `radius` |
| `cylinder` / `cone` | `radius`, `height`, `segments` (cone بـ 4 = هرم) |
| `torus` | `radius`, `tube` |
| `plane` | `width`, `height` (أرضية أفقية تستقبل الظل) |
| `gear` | `radius`, `height`, `teeth` (أسنان هندسية تُبنى من العدد) |
| `arrow` | `from`, `to` |
| `label` | `text` + (`at` أو `follow` + `offset`) |
| `model` | `src` (مسار GLB محلي) |

### أصل ثلاثي الأبعاد حقيقي (GLB)

مشهد القلب يستخدم أصلاً حقيقياً لا مجسمات مركّبة: `public/sandbox/models/heart.glb`
(glTF 2.0 ثنائي، ‎13,428 رأساً، ‎316KB) يُحمَّل عبر `GLTFLoader` في بدائية `model`.

- المولّد: `features/lab-sandbox/tools/make-heart-glb.mjs`
  (`node features/lab-sandbox/tools/make-heart-glb.mjs`) — يبني الشكل بـ `ExtrudeGeometry`
  ثم يكتب حاوية GLB يدوياً، لأن `GLTFExporter` الرسمي يعتمد على `FileReader` غير المتوفر في Node.
- الناتج glTF قياسي: أي محرر (Blender) أو عارض يمكنه فتحه وتعديله، ثم إعادة تصديره بنفس المسار.
- أثناء التحميل يظهر أصل بديل شبكي، وعند الفشل يبقى بدل مشهد فارغ.
- **العزل:** هذا الأصل هو الملف الوحيد خارج المجلدين. للحذف الكامل أضف
  `public/sandbox` إلى أمر الحذف أدناه.

- مشترك: `position` · `rotation` · `scale` · `color` · `opacity` (≤0.3 = توهّج إضافي) ·
  `glow` (إضاءة ذاتية للمصابيح والنجوم) · `motion` · `card`.
- `motion`: `spin` · `bob` (يحتاج `amplitude`) · `orbit` (يحتاج `radius`).
- `card` يجعل العنصر قابلاً للنقر ويفتح بطاقة داخل المشهد.
- التحقق (`scene/schema.ts`) يرفض أي مفتاح غير معروف، ويقصّ الأرقام داخل مدى آمن،
  ويتحقق أن `follow` يشير إلى عنصر موجود، ويعيد أخطاء عربية مفهومة بدل انهيار المشهد. لا يوجد `eval` ولا تنفيذ كود.

| الملف | الدور |
|---|---|
| `scene/schema.ts` | الأنواع + التحقق الكامل |
| `scene/scenes.ts` | مشاهد جاهزة + `loadScene()` |
| `scene/scene-player.ts` | بيانات → Three.js (يعيد استخدام `LabStage`) |
| `scene/scene-viewport.tsx` | التركيب، النقر، المؤشر، FPS |
| `scene/scene-panel.tsx` | تأطير اللوحة والبطاقة والأزرار |

- نفس الـ JSON هو عقد الخدمة المستقلة لاحقاً: يكفي نقل العارض إلى نطاق آخر
  وتخزين `sceneId` + `version` في العقدة — بلا تغيير في الدروس.
- العقدة في الفقرة: `{ "labKind": "scene", "sceneId": "water-molecule" }`
  داخل `interactive_lab` — تعمل مع مختبرات الفيزياء في نفس المستند.

## الهيكلة

| الملف | الدور |
|------|-------|
| `engine/types.ts` | عقود `LabSim` / `LabDefinition` / `LabSceneBridge` |
| `engine/stage.ts` | مسرح Three.js: كاميرا، إضاءة، `OrbitControls`، حلقة رسم، FPS، تقاطعات المؤشر |
| `engine/sim-registry.ts` | مصنع المحاكاة حسب النوع — نقطة التوسّع الوحيدة |
| `engine/params.ts` | `toParamValues(controls)` — مصدر واحد للقيم الابتدائية |
| `engine/physics/*.ts` | محاكاة نقية (بلا React): RK4 للبندول والمسار، Velocity-Verlet للنابض |
| `mock/labs.ts` | "استجابة الباك" الثابتة (تعريفات المختبرات) |
| `mock/mock-api.ts` | وعد محلي بتأخير 220ms لاختبار الهياكل العظمية |
| `mock/block.ts` | شكل كتلة `interactive_lab` المتوقعة عند الدمج الحقيقي |
| `hooks/use-mock-lab.ts` | قراءة المختبر من الموك |
| `components/lab-viewport.tsx` | حاوية `LabStage` — تُستورد فقط عبر `next/dynamic` |
| `components/lab-sim-panel.tsx` | مشهد + عدّادات طاقة + أدوات + منزلقات |
| `components/lab-frame.tsx` | الهياكل الثلاثة |
| `components/lab-sandbox-page.tsx` | الترويسة والمبدّلات |
| `app/sandbox/lab/**` | المسارات (ملفات إضافية) |

## الفيزياء

- البندول: `θ'' = −(g/L)·sin θ − b·θ'` مكامَلة بـ RK4، والطاقة محسوبة من الحالة الفعلية.
- المسار: حركة على قوس `y = k·x²` بـ RK4، والطاقة تُقاس من `h` و`v` لا من قانون الحفظ.
- النابض: `x'' = −(k/m)·x` بـ Velocity-Verlet.
- كل الأعمدة تُقاس على مرجع واحد (`readout.ref`) لذلك `Ep + Ek = Et` مقروءة بصرياً.

## الحذف الكامل

```powershell
Remove-Item -Recurse -Force app/sandbox, features/lab-sandbox, public/sandbox
npm uninstall three
```

لا يتبقى أي أثر: لا استيرادات من هذه المجلدات في ملفات أخرى، ولا تعديلات على ملفات قائمة.

## الدمج الحقيقي لاحقاً (خارج هذه البيئة)

1. في `features/lesson-engine/engine/types.ts`: إضافة `"interactive_lab"` إلى `BuilderBlockKind`.
2. في `lesson-mapper.ts`: حالة في `stepFromBlock()` تحمل `lab` و`variant` من `block.data`.
3. في `ContentStage.tsx`: فرع يعرض `LabFrame` (بعد نقل `engine/` و`components/` إلى الميزة الحقيقية).
4. اختيار الهيكل: `compact` يطابق قيد `max-w-2xl` الحالي في `LessonShell`؛ `focus` يتطلب توسيع المحتوى.

ملاحظة: `three` (~600KB مصغّرة) لا تدخل حزمة الدرس إلا عبر `next/dynamic`، فلا تبطئ الصفحات
التي لا تحتوي مختبراً.
