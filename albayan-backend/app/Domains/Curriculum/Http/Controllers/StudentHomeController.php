<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\Public\StudentHomeResource;
use App\Domains\Curriculum\Queries\StudentHomeQuery;
use App\Domains\Progress\Services\ProgressAggregator;
use App\Http\Controllers\Controller;
use App\Support\StudentHomeCache;
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
        private readonly ProgressAggregator $progressAggregator,
    ) {}

    public function __invoke(Request $request)
    {
        $profile = $request->user()->profile;

        abort_unless($profile, 404, 'لم يُحدَّد صف الطالب وفصله بعد.');

        $lastSubjectId = $request->user()->profile?->last_subject_id;

        // يُفسَّر الخرج (Arrays نقية) ويُخزَّن لكل طالب لفترة قصيرة؛
        // يُبطَل عند إكمال درس أو تعديل ملفه الأكاديمي (راجع StudentHomeCache::forget).
        $payload = StudentHomeCache::remember($request->user()->id, function () use ($request, $lastSubjectId, $profile) {
            $subjects = $this->query->subjects($profile, $lastSubjectId);

            $snapshots = $this->progressAggregator->snapshotsForSubjects($request->user(), $subjects);

            return (new StudentHomeResource($profile, $subjects, $snapshots))->resolve($request);
        });

        // الحفاظ على غلاف `data` الذي تتوقعه الواجهة من JsonResource العادي.
        return ['data' => $payload];
    }
}
