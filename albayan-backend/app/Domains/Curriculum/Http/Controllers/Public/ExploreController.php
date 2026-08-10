<?php

namespace App\Domains\Curriculum\Http\Controllers\Public;

use App\Domains\Curriculum\Http\Resources\Public\ExploreGradeResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreSemesterResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreStageResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreSubjectResource;
use App\Domains\Curriculum\Queries\ExploreQuery;
use App\Http\Controllers\Controller;
use App\Support\ExploreCache;

/**
 * استكشاف هرمي للمنهج — طبقة قراءة عامة (بلا تسجيل).
 *
 * Use Case فوق بيانات المنهج: لا يملك Business Rules، فقط يعيد الشجرة
 * (Stage ← Grade ← Semester ← Subject) عبر ExploreQuery.
 *
 * يُخزَّن الخرج الكامل مؤقتًا (Arrays نقية) لأن المحتوى شبه ثابت؛
 * أي تعديل إداري على المنهج يُبطله عبر ExploreCache::flush().
 */
class ExploreController extends Controller
{
    public function __construct(private readonly ExploreQuery $exploreQuery) {}

    public function stages()
    {
        return ['data' => ExploreCache::remember(
            'stages',
            '',
            fn () => ExploreStageResource::collection($this->exploreQuery->stages())->resolve(),
        )];
    }

    public function grades(string $stageKey)
    {
        return ['data' => ExploreCache::remember(
            'grades',
            $stageKey,
            fn () => ExploreGradeResource::collection($this->exploreQuery->grades($stageKey))->resolve(),
        )];
    }

    public function semesters(string $stageKey, string $gradeKey)
    {
        return ['data' => ExploreCache::remember(
            'semesters',
            $stageKey.':'.$gradeKey,
            fn () => ExploreSemesterResource::collection($this->exploreQuery->semesters($stageKey, $gradeKey))->resolve(),
        )];
    }

    public function subjects(string $stageKey, string $gradeKey, string $semesterKey)
    {
        return ['data' => ExploreCache::remember(
            'subjects',
            $stageKey.':'.$gradeKey.':'.$semesterKey,
            fn () => ExploreSubjectResource::collection($this->exploreQuery->subjects($stageKey, $gradeKey, $semesterKey))->resolve(),
        )];
    }

    public function subject(string $slug)
    {
        return ['data' => ExploreCache::remember(
            'subject',
            $slug,
            fn () => (new ExploreSubjectResource($this->exploreQuery->subject($slug)))->resolve(),
        )];
    }
}
