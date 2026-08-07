<?php

namespace App\Domains\Auth\Models;

use App\Domains\Curriculum\Models\Grade;
use App\Domains\Curriculum\Models\Semester;
use App\Domains\Curriculum\Models\Subject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * الملف الأكاديمي للطالب — الحالة الحالية للطالب في المنهج:
 * صفه وفصله الدراسي + آخر مادة استكشفها.
 *
 * @property int $id
 * @property int $user_id
 * @property int $grade_id
 * @property int $semester_id
 * @property int|null $last_subject_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Grade $grade
 * @property-read Semester $semester
 * @property-read Subject|null $lastSubject
 *
 * @mixin \Eloquent
 */
class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'grade_id',
        'semester_id',
        'last_subject_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function lastSubject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
