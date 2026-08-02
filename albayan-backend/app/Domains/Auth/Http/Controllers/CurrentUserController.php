<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Http\Resources\UserResource;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    /**
     * GET /api/user
     * نقطة التحقق الأساسية: "هل المستخدم مسجل دخول؟"
     */
    public function __invoke(Request $request)
    {
        return new UserResource($request->user());
    }
}
