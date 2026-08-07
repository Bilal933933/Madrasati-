<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\Public\StudentHomeResource;
use App\Domains\Curriculum\Queries\StudentHomeQuery;
use App\Domains\Progress\Services\ProgressService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * بيت الطالب — صفحة «ما الذي سأدرسه اليوم؟» للمستخدم المسجّل.
 *
 * تعرض مواد صف/فصل الطالب من ملفه الأكاديمي (student_profiles)
 * مرتّبة بأولويته (آخر مادة استكشفها أولًا) + تقدمه في كل مادة.
 */
class StudentHomeController extends Controller
{
    public function __construct(
        private readonly StudentHomeQuery $query,
        private readonly ProgressService $progressService,
    ) {}

    public function __invoke(Request $request)
    {
        $profile = $request->user()->profile;

        abort_unless($profile, 404, 'لم يُحدَّد صف الطالب وفصله بعد.');

        $lastSubjectId = $request->user()->profile?->last_subject_id;

        $subjects = $this->query->subjects($profile, $lastSubjectId);

        $snapshots = $this->progressService->snapshotsForSubjects($request->user(), $subjects);

        return new StudentHomeResource($profile, $subjects, $snapshots);
    }
}
