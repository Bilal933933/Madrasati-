<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * يمنع الوصول إلى المسارات الإدارية لغير المشرفين.
 * يُستخدم من دومينات متعددة (Curriculum, Lesson, و لاحقًا Assessment/Exam)
 * لذلك وُضع في app/Http/Middleware وليس داخل دومين معيّن.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'غير مصرّح لك بالوصول إلى هذه الموارد.');
        }

        return $next($request);
    }
}
