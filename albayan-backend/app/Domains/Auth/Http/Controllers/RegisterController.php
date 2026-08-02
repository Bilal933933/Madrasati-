<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Requests\RegisterRequest;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Services\AuthService;

class RegisterController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * POST /api/register
     */
    public function __invoke(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح.',
            'user' => new UserResource($user),
        ], 201);
    }
}
