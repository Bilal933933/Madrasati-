<?php

namespace App\Domains\Progress\Http\Controllers;

use App\Domains\Progress\Http\Resources\CompletedLessonResource;
use App\Domains\Progress\Models\LessonCompletion;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * سجل الدروس المكتملة للطالب — قائمة من الأحدث مع إحصائيات.
 */
class StudentCompletedLessonsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $completions = LessonCompletion::query()
            ->forUser($user)
            ->completed()
            ->with(['lesson.course.subject'])
            ->orderByDesc('completed_at')
            ->get();

        return response()->json([
            'data' => CompletedLessonResource::collection($completions),
            'stats' => [
                'total' => $completions->count(),
                'subjects_count' => $completions
                    ->pluck('lesson.course.subject_id')
                    ->unique()
                    ->count(),
            ],
        ]);
    }
}
