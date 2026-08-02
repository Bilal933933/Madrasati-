<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Requests\LoginRequest;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Services\AuthService;

class LoginController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * POST /api/login
     */
    public function __invoke(LoginRequest $request)
    {
        $user = $this->authService->login($request->validated());

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح.',
            'user' => new UserResource($user),
        ]);
    }
}
