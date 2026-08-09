<?php

namespace App\Domains\Auth\Models;

use App\Domains\Achievement\Models\Achievement;
use App\Domains\Achievement\Models\UserAchievement;
use App\Domains\Progress\Models\LessonCompletion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $password
 * @property string|null $google_id
 * @property string|null $avatar
 * @property Carbon|null $email_verified_at
 * @property string $role
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read Collection<int, Achievement> $achievements
 * @property-read Collection<int, UserAchievement> $userAchievements
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGoogleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
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

    /**
     * الملف الأكاديمي للطالب — الحالة الحالية: صفه وفصله وآخر مادة استكشفها
     * (عبر student_profiles).
     */
    public function profile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * سجلات تقدّم الطالب في الدروس (بدءًا وإكمالًا).
     */
    public function lessonCompletions(): HasMany
    {
        return $this->hasMany(LessonCompletion::class);
    }

    /**
     * صلات الإنجازات المفتوحة (القيد الفريد user_id + achievement_id).
     */
    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    /**
     * الأوسمة المفتوحة (علاقة BelongsToMany عبر الحجز user_achievements).
     */
    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('unlocked_at')
            ->withTimestamps();
    }
}
