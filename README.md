# Madrasati (مدرستي)

منصة تعليمية للمدرسة: دروس واختبارات.

## بنية المشروع

| المجلد | الدور |
|--------|-------|
| `madrasati-backend` | سيرفر Laravel API |
| `madrasati-frontend` | واجهة Next.js |

## المتطلبات

- PHP 8.3+
- Node.js 20+
- PostgreSQL
- Composer
- npm

## التشغيل محلياً

### الخلفية (Laravel)

```
cd madrasati-backend
composer install
cp .env.example .env   # عدّل إعدادات قاعدة البيانات والمفاتيح
php artisan key:generate
php artisan migrate
php artisan serve
```

### الواجهة (Next.js)

```
cd madrasati-frontend
npm install
npm run dev
```

## الميزات

- تسجيل دخول بإيميل/كلمة سر
- تسجيل دخول عبر جوجل
- استرجاع كلمة السر
- أدوار: طالب ومشرف
