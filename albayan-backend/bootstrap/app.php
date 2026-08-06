<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof ValidationException) {
                    return null;
                }

                if ($e instanceof AuthenticationException) {
                    return response()->json(['message' => 'يجب تسجيل الدخول للوصول إلى هذا المورد.'], 401);
                }

                if ($e instanceof AuthorizationException) {
                    return response()->json(['message' => 'غير مصرّح لك بالوصول إلى هذا المورد.'], 403);
                }

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : ($e->getCode() ?: 500);

                // ModelNotFoundException يُحوَّل مسبقًا إلى NotFoundHttpException برسالة إنجليزية
                if (str_contains($e->getMessage(), 'No query results for model')) {
                    return response()->json(['message' => 'المورد المطلوب غير موجود.'], 404);
                }

                if ($e instanceof HttpExceptionInterface && $e->getMessage() !== '') {
                    return response()->json(['message' => $e->getMessage()], $status);
                }

                $messages = [
                    403 => 'غير مصرّح لك بالوصول إلى هذا المورد.',
                    404 => 'المورد المطلوب غير موجود.',
                    405 => 'الطريقة غير مسموح بها لهذا الطلب.',
                    419 => 'انتهت صلاحية الجلسة، يرجى إعادة المحاولة.',
                    429 => 'لقد أرسلت عددًا كبيرًا من الطلبات، يرجى المحاولة لاحقًا.',
                    500 => 'حدث خطأ غير متوقع، يرجى المحاولة لاحقًا.',
                    503 => 'الخدمة غير متاحة حاليًا، يرجى المحاولة لاحقًا.',
                ];

                if (isset($messages[$status])) {
                    return response()->json(['message' => $messages[$status]], $status);
                }
            }

            return null;
        });
    })->create();
