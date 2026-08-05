# Madrasati (مدرستي)

منصة تعليمية تتكون من مشروعين فرعيين:

| المشروع | التقنية | المسار |
|---------|---------|--------|
| الواجهة | Next.js 16 / React 19 / Tailwind 4 | `albayan-frontend` |
| الخلفية | Laravel 13 / PHP 8.4 / Sanctum | `albayan-backend` |

## تشغيل الأوامر
- أوامر الفرونت (`npm`) تُشغَّل داخل `albayan-frontend`.
- أوامر الباك (`php artisan` / `composer`) تُشغَّل داخل `albayan-backend`.

## ملفات التوجيه
- `albayan-backend/AGENTS.md` — قواعد الباك: البنية، الأمان، المحتوى، الأوامر، المشاكل المعروفة.
- `albayan-frontend/AGENTS.md` — تحذير إصدار Next.js (يحتوي تغييرات كسرية — راجع وثائقه قبل كتابة الكود).
- `docs/Student-Learning-Journey-Reference.md` — الوثيقة المرجعية الرسمية لرحلة الطالب. **يجب مراجعتها قبل تصميم أو تعديل أي صفحة من صفحات الطالب**، والرجوع إليها في التحليل قبل كتابة كود أي صفحة طالب (مثال: `docs/Student-Learning-Journey-Reference.md:5.4`).
- `docs/Visitor-Experience.md` — الوثيقة المرجعية لبوابة الزائر (العالم قبل التسجيل). **يجب مراجعتها قبل تصميم أو تعديل أي صفحة عامة/بوابة/هبوط**، والرجوع إليها في التحليل قبل كتابة كودها (مثال: `docs/Visitor-Experience.md:4`).
- `docs/Public-Landing-Page-Specification.md` — المرجع الرسمي لصفحة الهبوط/البوابة تحديدًا (أقسامها الثمانية وحالاتها وأزرارها). **يرجع إليها قبل تنفيذ واجهة البوابة** إضافة إلى `Visitor-Experience.md` (مثال: `docs/Public-Landing-Page-Specification.md:4`).
