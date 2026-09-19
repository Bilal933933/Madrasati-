<?php

namespace App\Domains\AdminUser\Http\Controllers\Admin;

use App\Domains\AdminUser\Http\Requests\UpdateUserRoleRequest;
use App\Domains\AdminUser\Http\Requests\UpdateUserStatusRequest;
use App\Domains\AdminUser\Http\Resources\AdminUserResource;
use App\Domains\AdminUser\Services\AdminUserService;
use App\Domains\Auth\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * إدارة المستخدمين والأدوار من لوحة الأدمن.
 */
class UserController extends Controller
{
    public function __construct(private readonly AdminUserService $userService) {}

    /**
     * قائمة المستخدمين — بحث بالاسم/البريد + فلترة بالدور + ترقيم.
     *
     * @response {
     *   "data": { "id": 1, "name": "أحمد", "email": "ahmed@example.com", "avatar": null, "role": "student", "is_active": true, "email_verified_at": null, "created_at": "2026-08-01T00:00:00+00:00" }[]
     * }
     */
    public function index(Request $request)
    {
        return AdminUserResource::collection(
            $this->userService->paginate(
                $request->string('search')->toString() ?: null,
                $request->string('role')->toString() ?: null,
                $request->integer('per_page', 20)
            )
        );
    }

    /**
     * تعديل دور المستخدم.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user)
    {
        $updated = $this->userService->updateRole($user, $request->validated()['role']);

        return response()->json([
            'data' => new AdminUserResource($updated),
            'message' => 'تم تحديث دور المستخدم بنجاح.',
        ]);
    }

    /**
     * تفعيل/إيقاف حساب المستخدم.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $updated = $this->userService->updateStatus($user, (bool) $request->validated()['is_active']);

        return response()->json([
            'data' => new AdminUserResource($updated),
            'message' => $updated->is_active ? 'تم تفعيل الحساب.' : 'تم إيقاف الحساب.',
        ]);
    }
}
