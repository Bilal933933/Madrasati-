# خطة: إعادة بناء هيدر بيت الطالب (هيدر مخصص ثابت بدل هيدر البوابة)

- المصدر: تدقيق `/home` — البند 1 من جدول النتائج (الأعلى رافعة).
- النطاق: ملف جديد واحد + سطر واحد في `layout.tsx`. ممنوع لمس أي ملف آخر.
- الأساس (commit): `d441e8a` — أُعيد فتح كل المصادر أدناه عليه قبل كتابة الخطة.

## التحليل

- هيكل الطالب `albayan-frontend/app/(student)/layout.tsx:52` يستخدم `SiteNavbar` (هيدر البوابة التسويقي).
- `SiteNavbar` (`components/shared/site-navbar.tsx:60-99`) هيدر ذكي للبوابة: مستمع `scroll` + `setHidden(y > 120 && delta > 0)` + `-translate-y-[calc(100%+1rem)]` عند النزول + حبّة عائمة (`top-2 rounded-full shadow-xl`) عند التمرير.
- النتيجة في مساحة تطبيق مغلقة: التنقل يختفي أثناء تمرير المحتوى الدراسي، والشكل (حبّة عائمة) لغة البوابة لا لغة الفصل.
- ازدواج ثانوي داخل نفس البند: `features/student/constants/nav.tsx:46-47` يعرّف `الرئيسية` و`المواد` لنفس الوجهة `/home` — يُوحَّد ضمن الهيدر الجديد (مصدر واحد).

## التصميم

- مكوّن جديد `StudentHeader` (Client Component) ثابت دائمًا:
  - `sticky top-0 z-50 border-b bg-background/85 backdrop-blur` — بلا مستمعي تمرير، بلا `hidden`، بلا `scrolled`، بلا حبّة.
  - الشعار: `BrandMark` + اسم "مدرستي" → `brandHref="/home"` (نفس سلوك اليوم).
  - الوسط (شاشات `lg+`): روابط `STUDENT_LINKS` الأربعة كما هي، والحالة النشطة عبر ورقة `NavLink` (نسخة من نمط `site-navbar.tsx:173-224`: `usePathname` محصور في الورقة + `aria-current="page"` + `text-primary` للنشط).
  - الطرف: نفس `actions` الحالية (`<ThemeToggle /><UserMenu />`) تبقى ظاهرة دائمًا.
  - الجوال (`lg:hidden`): زر قائمة (`Menu`, `aria-label="القائمة"`) → `Sheet side="right" w-[280px]` فيه ترويسة `BrandMark` + قائمة `STUDENT_LINKS` (تُغلق عند النقر) — بلا `mobileActions` (غير مستخدمة في مساحة الطالب اليوم).
- تدفق البيانات: `StudentAreaLayout` يمرر `links=STUDENT_LINKS` + `actions` نفسها → `StudentHeader` يعرض فقط، بلا جلب بيانات.
- الأسطح المتأثرة (تشترك كلها في `StudentAreaLayout`): `/home` وفروعها، `/exams*`، `/results`، `/achievements`. خارج النطاق: البوابة `/` و`(workspace)` (`/exams/attempt`, `/ai-tutor`) و`SiteNavbar` نفسه — لا تُلمس.

## الهيكلة

| الملف | الدور |
|-------|-------|
| `albayan-frontend/features/student/components/student-header.tsx` (جديد) | الهيدر المخصص: الشعار + روابط `STUDENT_LINKS` + `actions` + قائمة جوال — العرض فقط |
| `albayan-frontend/app/(student)/layout.tsx` (سطر واحد) | استبدال استيراد/وسم `SiteNavbar` بـ `StudentHeader` بنفس الـ props |

## شرح الملفات والدوال

- `student-header.tsx` (يُنشأ):
  - `StudentHeader({ links, actions })`: مدخلات `links: NavItem[]` + `actions: ReactNode` ← مخرجات شريط `<header>` ثابت؛ يدير `open` للـ Sheet فقط (الحالة الوحيدة).
  - `StudentNavLink({ link, close, className })`: مدخلات رابط + إغلاق اختياري ← مخرجات `<Link>` أو `<button>` مع `isActive` من `usePathname` (`pathname === href` أو بادئة `href/`)، وروابط `#` لا تُعتبر نشطة أبدًا (نفس عقد `SiteNavbar`).
- `(student)/layout.tsx`: `StudentAreaLayout` — يُستبدل السطر 52 فقط:
  - قبل: `<SiteNavbar brandHref="/home" links={STUDENT_LINKS} actions={...} />`
  - بعد: `<StudentHeader links={STUDENT_LINKS} actions={...} />` (نفس `actions` حرفيًا).
  - `STUDENT_LINKS` تُستخدم كما هي؛ توحيد `الرئيسية`/`المواد` في الـ Dock يُترك لخطة لاحقة (ممنوع هنا).

## التغيير المطلوب

1. قبل كتابة أي كود: اقرأ الدليل ذا الصلة في `albayan-frontend/node_modules/next/dist/docs/` (قاعدة `AGENTS.md` — إصدار Next.js فيه تغييرات كسرية) والتزم بأي تنبيه إهمال.
2. أنشئ `features/student/components/student-header.tsx` حسب التصميم أعلاه، معيدًا استخدام: `BrandMark`، `Button`، `Sheet/SheetContent/SheetTrigger/SheetTitle`، نوع `NavItem`، `cn` — بلا قيم/ألوان مخترعة (نفس توكنات `background/border/muted/primary` المستخدمة اليوم).
3. عدّل سطرًا واحدًا في `(student)/layout.tsx` (الاستيراد + الوسم) — لا تحذف `ThemeToggle` ولا `UserMenu` ولا `StudentDock` ولا `LandingFooter` (الفوتر بند مستقل قادم).
4. ممنوع: أي تعديل على `site-navbar.tsx` (يبقى للبوابة)، وأي تغيير على `nav.tsx` أو `StudentHomePage` أو `SubjectCard` أو الـ Dock.

## التحقق

- `npm run typecheck` (أو `tsc --noEmit`) داخل `albayan-frontend` — يجب أن ينجح.
- افتح `/home` (بعد تسجيل الدخول): الهيدر ظاهر أعلى الصفحة، ومرّر لأسفل — يجب أن **يبقى ثابتًا** (لا يختفي ولا يتحول لحبّة).
- تنقّل بين `/home` و`/exams` و`/results` و`/achievements`: الرابط النشط بلون `primary` ومعه `aria-current="page"`.
- جوال (عرض `<lg`): زر القائمة يفتح الدرج، والنقر على رابط يغلقه؛ `ThemeToggle` و`UserMenu` ظاهران في الشريط.
- البوابة `/` لم تتغير (ما زالت تستخدم `SiteNavbar` الأصلي).

## ملاحظات موثقة (لا تنفيذ لها هنا)

- البند 2 (كتلة الرحلة: ترحيب + تقدم كلي + درس بطل فوق قائمة المواد) — بانتظار اختيارك.
- البند 3 (حذف `LandingFooter` من `StudentAreaLayout`) — بانتظار اختيارك.
- توحيد `الرئيسية`/`المواد` في `studentDockItems` وإضافة حالة نشطة للـ Dock — يُقترح ضمن خطة الهيدر التنفيذية اللاحقة لا هنا.
