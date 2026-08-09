<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:frontend-rules -->
# Frontend rules

Feature-based structure (`features/{domain}/{components,hooks,services,types}`), TanStack Query for server state, Zustand for client state, all HTTP through `lib/apiClient.ts`, generated API types in `types/api.generated.ts`, Arabic/RTL UI, and error display via `lib/apiErrors.ts`. See `.cursor/rules/madrasati-frontend.mdc` for the full ruleset.
<!-- END:frontend-rules -->

<!-- BEGIN:lesson-engine -->
# محرك الدرس (Lesson Engine)

`features/lesson-engine/` — محرك تفاعلي لتقديم الدرس كرحلة تعلّم من 4 شاشات، لا كصفحة مقال.

## الشاشات الأربع

| الشاشة | `LessonScreenKind` | المكوّن | الوظيفة |
|--------|-------------------|---------|---------|
| البداية | `start` | `stages/start/StartStage.tsx` | استقبال الطالب: غلاف، أهداف، أزرار ابدأ/استئناف/إعادة |
| المحتوى | `content` | `stages/content/ContentStage.tsx` | يعرض أي كتلة (فقرة/فيديو) — switch داخلي حسب `block.kind` |
| التقييم | `assessment` | `stages/assessment/AssessmentStage.tsx` | تغليف `AssessmentComponent` (سير أسئلة موحّد لـ pre/formative/final) |
| النهاية | `finish` | `stages/finish/FinishStage.tsx` | احتفال بسيط بإكمال الدرس (لا درجات — رحلة تعلّم) |

## بنية المحرك

المحرك يفصل **التنقل** عن **العرض** عن **التخزين** عبر 4 طبقات:

### 1. Player (المشغّل)
- `components/lesson-player.tsx` — نقطة الدخول: يجلب API (TanStack Query)، يبني `LessonEngineData` عبر **Mapper**، يهيّئ المخزن (Zustand)، يختار الشاشة من `stageRenderer`، ويرسمها داخل `LessonShell`.
- يتعامل مع: تحميل، خطأ، استئناف تلقائي (من التقدم المحفوظ)، ومزامنة البداية/الإكمال مع الباك.

### 2. Engine (المحرك — فئة نقية)
- `engine/lesson-engine.ts` — فئة `LessonEngine` نقية (لا React): تحفظ الـ `flow` (مصفوفة `LessonFlowStep`) ومؤشرًا (`pointer`).
- دالات: `next()`, `back()`, `jumpTo(stepId)`, قارئات: `current`, `hasNext`, `hasPrev`, `total`.
- لا يعرف المحرك مصدر الرحلة أو طريقة عرضها — مجرد منفّذ للتنقل.

### 3. Store (حالة المحرك — Zustand)
- `engine/lesson-engine-store.ts` — `useLessonEngineStore`: جسر بين الفئة النقية ومكونات الواجهة.
- تحفظ `engine | null`, `data`, `current`, `currentIndex`, `total`, `flow`.
- `init(data)` ← تُنشئ `LessonEngine` من `LessonEngineData`.
- `next/back/jumpTo/reset` — تعدّل المؤشر وتُحدّث `current` و `currentIndex`.

### 4. Mapper (الخارط — API → Engine)
- `engine/lesson-mapper.ts` — `mapLesson(flow: LessonFlow)` يحوّل استجابة الـ API (`LessonFlowResource` من الباك) إلى `LessonEngineData`.
- `buildFlow(blocks)` يبني الرحلة: `[start] + كتل الـ Builder كما هي (حرفيًا) + [finish]`.
- يوزّع كل كتلة حسب `block.kind`:
  - `paragraph`/`lesson_video` ← شاشة `content` مع `LessonContentData`
  - `pre_assessment`/`formative_assessment`/`final_assessment` ← شاشة `assessment` مع `LessonAssessmentData`

### 5. Stage Renderer (مسجّل الشاشات)
- `engine/stage-renderer.tsx` — قاموس `Record<LessonScreenKind, ComponentType>` يربط كل شاشة بمكوّنها.

## أنواع الكتل (BuilderBlockKind)

| الكتلة | الشاشة | `AssessmentMode` |
|--------|--------|-----------------|
| `paragraph` | content | — |
| `lesson_video` | content | — |
| `pre_assessment` | assessment | `pre` |
| `formative_assessment` | assessment | `understanding` |
| `final_assessment` | assessment | `final` |

## تدفق البيانات

```
API (getBySlug)
  ↓ LessonFlowResponse
mapLesson() ← engine/lesson-mapper.ts
  ↓ LessonEngineData
useLessonEngineStore.init(data)
  ↓
LessonEngine (فئة نقية) + LessonEngineState (Zustand)
  ↓ current, currentIndex, total
stageRenderer[current.screen]  ←  رسم المكوّن المناسب داخل LessonShell
```

## تقدم الطالب (Progress)

### محلي (localStorage) — `lessonProgressStore`
- `state/lessonProgressStore.ts` — Zustand مع `persist` middleware تحت المفتاح `madrasati.lesson-progress.v1`.
- يسجّل: `lastStepId` (آخر شاشة — للاستئناف)، `visitedStepIds` (الشاشات المزارة — لحساب النسبة)، `completedAt`.
- `hooks/useLessonProgress.ts` — هوك يقرأ من المخزن ويعيد `lastStepId`, `percent`, `isCompleted`, `hasProgress`, `recordStep`, `markCompleted`, `clear`.

### مزامنة مع الباك — `useLessonProgressSync`
- `hooks/useLessonProgressSync.ts` — هوك يُشغّل مرة واحدة داخل `LessonPlayer`:
  - **start**: `POST /api/student/lessons/{slug}/start` عند الخروج من شاشة البداية (fire-and-forget).
  - **complete**: `POST /api/student/lessons/{slug}/complete` عند بلوغ شاشة `finish` (fire-and-forget).
  - **تسجيل محلي**: كل شاشة يصلها الطالب تُسجّل في `lessonProgressStore` (مع `Set` لمنع التكرار).

## أنواع البيانات الرئيسية

- `engine/types.ts` — `LessonScreenKind`, `AssessmentMode`, `BuilderBlockKind`, `LessonFlowStep`, `LessonEngineData`, `LessonContentData`, `LessonAssessmentData`, `AssessmentQuestion`.
- `types/progress.types.ts` — `LessonProgressEntry`, `PersistedLessonProgress`.

## إطار الشاشة (LessonShell)
- `components/lesson-shell.tsx` — إطار موحّد لكل الشاشات: Header (المادة · الدرس ← زر رجوع) → شريط تقدم ← بطاقة تركيز ← Footer (زر متابعة افتراضيًا أو مخصص).
- `components/progress-bar.tsx` — شريط تقدم (نسبة مئوية + تسمية موجّهة)، يُخفى على شاشة البداية.

## خدمة API
- `services/lessonApi.ts` — 3 دوال: `getBySlug(GET)`, `start(POST)`, `complete(POST)`.

## إضافة كتلة جديدة

1. أضف القيمة إلى `BuilderBlockKind` في `engine/types.ts`.
2. أضف الـ `case` في `stepFromBlock()` في `engine/lesson-mapper.ts`.
3. أضف المعالجة البصرية في `ContentStage` (إن كانت محتوى) أو `AssessmentComponent` (إن كانت تقييمًا).
4. أضف له الـ `case` في `LessonBlock` Controller/Migration في الباك.

## إضافة شاشة جديدة

1. أضف القيمة إلى `LessonScreenKind` في `engine/types.ts`.
2. أنشئ المكوّن في `stages/<name>/<Name>Stage.tsx`.
3. أضف المرجع في `engine/stage-renderer.tsx`.
4. أضف التسمية في `engine/journey.ts` (`PHASE_LABEL`) و `ProgressBar` (`SCREEN_HINT`).

## ملاحظات مهمة

- **ابدأ من `app/learn/[lessonSlug]/page.tsx`** — يدخل إلى `LessonPlayer`.
- **لا تعيد اختراع الرحلة** — المحرك لا يرتّب الكتل ولا يُدخل مراحل منطقية؛ `buildFlow` يستلم ترتيب الـ Builder حرفيًا.
- **التغذية الراجعة فورية** — إجابة صحيحة تنتقل تلقائيًا (2.8 ثانية)؛ خطأ ← أزرار [التالي] و [العودة إلى الفقرة].
- **صواب/خطأ** — يُعامل كخيارين ثابتين محليًا (`TRUE_OPTION_ID=1`, `FALSE_OPTION_ID=2`) لأن الباك لا يرسل options في هذا النوع.
<!-- END:lesson-engine -->
