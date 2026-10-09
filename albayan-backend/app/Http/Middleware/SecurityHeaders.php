<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * رؤوس أمان أساسية على كل استجابة.
 * HSTS يُرسل فقط عبر HTTPS حتى لا يكسر بيئة التطوير المحلية (HTTP).
 * ملاحظة: لا CSP صارم هنا عمدًا — يُضاف لاحقًا بتقرير فقط (Report-Only) بعد تدقيق سكربتات الفرونت.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
