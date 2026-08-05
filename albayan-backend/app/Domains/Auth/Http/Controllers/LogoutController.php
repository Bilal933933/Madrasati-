<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\Auth\Services\AuthService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    /**
     * POST /api/logout
     */
    public function __invoke(Request $request)
    {
        $this->authService->logout();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح.',
        ]);
    }
}
