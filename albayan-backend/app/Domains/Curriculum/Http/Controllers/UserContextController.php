<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Requests\StoreUserContextRequest;
use App\Domains\Curriculum\Models\Subject;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * سياق التصفح — يُحدّث "آخر مادة استكشفها" للطالب المسجّل فقط.
 *
 * بسيط عمدًا: يُخزَّن last_subject_id فقط، وتُستنتج المرحلة/الصف/الفصل
 * من العلاقات (Subject ← Semester ← Grade ← Stage) عند الحاجة.
 */
class UserContextController extends Controller
{
    public function update(StoreUserContextRequest $request): JsonResponse
    {
        $subject = Subject::where('slug', $request->input('subject_slug'))->firstOrFail();

        $request->user()->context()->updateOrCreate(
            [],
            ['last_subject_id' => $subject->id],
        );

        return response()->json(['message' => 'تم تحديث سياق التصفح.']);
    }
}
