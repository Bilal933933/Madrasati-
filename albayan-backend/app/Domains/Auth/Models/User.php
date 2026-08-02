<?php

namespace App\Domains\Auth\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * الحقول القابلة للتعبئة الجماعية (Mass Assignment)
     *
     * ملاحظة أمنية: عمود "role" غير موجود هنا عمدًا،
     * لمنع أي محاولة تصعيد صلاحيات (Privilege Escalation) عبر الطلبات القادمة من الفرونت.
     * قيمة role تُضبط دائمًا من داخل السيرفر فقط (AuthService).
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
    ];

    /**
     * الحقول المخفية عند تحويل الموديل إلى JSON/Array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    /**
     * تحويل الأنواع (Casts)
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // تشفير تلقائي عند أي عملية save() — لا تشفير يدوي متفرق
        ];
    }

    /**
     * هل المستخدم مشرف؟
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
