<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\Auth\Models\User;
use App\Http\Controllers\Controller;
use Firebase\JWT\JWT;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/ai/session
 *
 * يُصدر تذكرة AI session قصيرة العمر (JWT HS256) موقّعة بسر مشترك بين Laravel
 * وNestJS (services.ai.service_secret). تُرسل للفرونت ثم يُمرّرها عبر WebSocket
 * handshake إلى NestJS الذي يفحصها بنفس السر.
 *
 * الأمان:
 * - التذكرة للطلاب فقط (دور غير الطالب = 403).
 * - `sub` = معرّف الطالب من الجلسة الحاليّة، لا يُقبل من الطلب مطلقًا.
 * - المدة قصيرة (افتراضية 15 دقيقة) لكل اتصال جديد.
 */
class AiSessionController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $user = request()->user();

        if (! $user instanceof User || $user->role !== 'student') {
            return response()->json(['message' => 'غير مصرّح لك بالوصول إلى هذا المورد.'], 403);
        }

        $now = time();
        $ttlMinutes = (int) config('services.ai.ticket_ttl_minutes', 15);
        $secret = (string) config('services.ai.service_secret');

        $token = JWT::encode([
            'sub' => (int) $user->id,
            'role' => $user->role,
            'iat' => $now,
            'exp' => $now + ($ttlMinutes * 60),
            'iss' => (string) config('app.url'),
        ], $secret, 'HS256');

        return response()->json([
            'token' => $token,
            'expires_in' => $ttlMinutes * 60,
        ]);
    }
}