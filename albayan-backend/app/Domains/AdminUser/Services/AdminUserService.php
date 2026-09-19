<?php

namespace App\Domains\AdminUser\Services;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

/**
 * إدارة المستخدمين من لوحة الأدمن — عرض، بحث، تعديل الدور، تفعيل/إيقاف.
 *
 * ملاحظة أمنية: role خارج $fillable في User، لذلك تُضبط هنا عبر forceFill
 * من السيرفر فقط ولا تُقرأ قيمة الدور من الطلب إلا ضمن قائمة مسموحة.
 */
class AdminUserService
{
    /**
     * قائمة المستخدمين مع بحث اختياري وفلترة بالدور — بترقيم.
     */
    public function paginate(?string $search = null, ?string $role = null, int $perPage = 20)
    {
        return User::query()
            ->when($search, fn (Builder $q) => $q->where(function (Builder $sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($role, fn (Builder $q) => $q->where('role', $role))
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * تعديل دور مستخدم مع حماية المسؤول نفسه من خفض دوره.
     *
     * @throws ValidationException
     */
    public function updateRole(User $user, string $role): User
    {
        if (auth()->id() === $user->id) {
            throw ValidationException::withMessages([
                'role' => ['لا يمكنك تعديل دور حسابك الحالي.'],
            ]);
        }

        $user->forceFill(['role' => $role])->save();

        return $user->fresh();
    }

    /**
     * تفعيل/إيقاف حساب — يمنع إيقاف الحساب الجاري لتفادي قفل الأدمن نفسه.
     *
     * @throws ValidationException
     */
    public function updateStatus(User $user, bool $isActive): User
    {
        if (auth()->id() === $user->id && ! $isActive) {
            throw ValidationException::withMessages([
                'is_active' => ['لا يمكنك إيقاف حسابك الحالي.'],
            ]);
        }

        $user->forceFill(['is_active' => $isActive])->save();

        return $user->fresh();
    }
}
