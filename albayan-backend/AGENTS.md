# Backend — Albayan (Mardasati)

الخلفية: **PHP 8.4 · Laravel 13 · Sanctum (وضع SPA/Cookie) · SQLite** — الرجاء مراعاة هذه القواعد قبل تعديل أو إضافة أي كود.

## البنية (Domains)

الكود مُقسم على دومينات داخل `app/Domains/`، كل دومين مستقل بملفاته:

```
app/Domains/{Auth,Curriculum,Lesson,Assessment}/
├── Models/            موديلات Eloquent
├── Http/
│   ├── Controllers/   Controllers رقيقة (Admin + عام)
│   ├── Requests/      FormRequest مع رسائل تحقق عربية
│   └── Resources/     تحويل الموديل إلى JSON
├── Services/          منطق الأعمال (CRUD، تعقيم، حذف صور، توليد slug)
└── routes.php         مسارات الدومين — تُستدعى عبر require من routes/api.php
```

- **التسلسل التعليمي**: `Stage ← Grade ← Semester ← Subject ← Course ← Lesson ← Paragraph` + `Assessment (← Question ← Option)`.
- `subjects.semester_id` **nullable** حاليًا لعدم كسر واجهة إدارة المواد الحالية — يُشدد لاحقًا مع إضافة واجهة الفصول في الفرونت.

- **النمط المعتمد**: Controllers رقيقة تستدعي الـ Service، والـ Service يحتوي المنطق.
- المساعدة العامة في `app/Support/` (`ImageService`, `Slugger`, `HtmlSanitizerService`, `YouTubeUrl`, `Rules/`).

## قواعد الأمان

- **`role` خارج `$fillable` في `User`** عمدًا (app/Domains/Auth/Models/User.php) لمنع تصعيد الصلاحيات عبر الطلبات. تُضبط من السيرفر فقط. في الاختبارات يُضبط مباشرة: `$user->role = 'admin'; $user->save();`
- **الـ Resources تخفي الحساسات عن غير المشرف**: `is_correct` في OptionResource و`correct_answer` في QuestionResource تُعرض فقط عند `isAdmin()`.
- مسارات Admin محمية بـ `middleware(['auth:sanctum', 'admin'])`.

## قواعد المحتوى

- **HTML يُعقَّم في الـ Service** عبر `HtmlSanitizerService::sanitize()` (mews/purifier) — لا في الـ Requests.
- **الصور**: حذف القديمة عبر `ImageService->delete()` عند الاستبدال أو حذف الكيان.
- **slug**: يُولَّد بعد الإنشاء عبر `Slugger::from($title, $id)` إذا تُرك فارغًا.
- **الفيديو (يوتيوب)**: يُخزَّن الرابط الكامل، و`video_embed` يُحسب في الباك عبر `YouTubeUrl::embed()` — الفرونت يعرضه مباشرة.

## الترحيلات

- الترحيلات تُعدَّل مباشرة (في التطوير) ثم `php artisan migrate:fresh` — فقدان البيانات مقبول في هذه المرحلة.

## الأوامر

- `php artisan test` — الاختبارات (يجب أن تبقى 3/4 ناجحة).
- `./vendor/bin/pint --test` — فحص التنسيق (أو `./vendor/bin/pint` لإصلاحه).
- `php artisan migrate:fresh` — إعادة بناء قاعدة البيانات.
- `php artisan route:list` — مراجعة المسارات.

## مشاكل معروفة (لا تُصلَح إلا بطلب صريح)

(لا توجد حاليًا — كل الاختبارات 106/106 ناجحة. كان `ExampleTest` سابقًا يتوقع 200 على `/` في تطبيق API؛ أُصلح لفحص رفض `/api/user` للزائر بـ 401.)

## بيانات تجريبية (Seeder)

- `php artisan migrate:fresh --seed` يعمل ويبذر شجرة كاملة (مراحل ← صفوف ← مواد ← مقررات ← دروس ← فقرات + تقييمات).
- مستخدما البذر: `admin@example.com` و`student@example.com` — كلمة المرور `password` للاثنين.
- الـ `role` يُضبط مباشرة على الموديل (`$admin->role = 'admin'; $admin->save();`) لأنها خارج `$fillable`.
