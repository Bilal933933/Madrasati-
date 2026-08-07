<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Requests\StoreStudentProfileRequest;
use App\Domains\Curriculum\Http\Requests\StoreUserContextRequest;
use App\Domains\Curriculum\Models\Subject;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * الحالة الأكاديمية الحالية للطالب (student_profiles).
 *
 * - ربط الطالب بمحتواه: يخزّن (أو يحدّث) صف الطالب وفصله الدراسي.
 * - تحديث آخر مادة استكشفها (أولوية الترتيب في بيت الطالب).
 *
 * يعتمد updateOrCreate على علاقة profile ذات user_id فريد:
 * - أول مرة: إنشاء الملف.
 * - مرات لاحقة: تحديث الصف/الفصل فقط.
 */
class StudentProfileController extends Controller
{
    public function update(StoreStudentProfileRequest $request): JsonResponse
    {
        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'grade_id' => $request->integer('grade_id'),
                'semester_id' => $request->integer('semester_id'),
            ],
        );

        return response()->json(['message' => 'تم ربط بياناتك الدراسية بنجاح.']);
    }

    /**
     * آخر مادة استكشفها الطالب — يُحدَّث من صفحة المادة (نفس مسار user-context السابق).
     */
    public function updateLastSubject(StoreUserContextRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;

        abort_unless($profile, 404, 'لم يُحدَّد صف الطالب وفصله بعد.');

        $subject = Subject::where('slug', $request->input('subject_slug'))->firstOrFail();

        $profile->update(['last_subject_id' => $subject->id]);

        return response()->json(['message' => 'تم تحديث سياق التصفح.']);
    }
}
