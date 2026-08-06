<?php

namespace App\Domains\Curriculum\Http\Controllers\Public;

use App\Domains\Curriculum\Http\Resources\Public\ExploreGradeResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreSemesterResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreStageResource;
use App\Domains\Curriculum\Http\Resources\Public\ExploreSubjectResource;
use App\Domains\Curriculum\Queries\ExploreQuery;
use App\Http\Controllers\Controller;

/**
 * استكشاف هرمي للمنهج — طبقة قراءة عامة (بلا تسجيل).
 *
 * Use Case فوق بيانات المنهج: لا يملك Business Rules، فقط يعيد الشجرة
 * (Stage ← Grade ← Semester ← Subject) عبر ExploreQuery.
 */
class ExploreController extends Controller
{
    public function __construct(private readonly ExploreQuery $exploreQuery) {}

    public function stages()
    {
        return ExploreStageResource::collection($this->exploreQuery->stages());
    }

    public function grades(string $stageKey)
    {
        return ExploreGradeResource::collection($this->exploreQuery->grades($stageKey));
    }

    public function semesters(string $stageKey, string $gradeKey)
    {
        return ExploreSemesterResource::collection($this->exploreQuery->semesters($stageKey, $gradeKey));
    }

    public function subjects(string $stageKey, string $gradeKey, string $semesterKey)
    {
        return ExploreSubjectResource::collection($this->exploreQuery->subjects($stageKey, $gradeKey, $semesterKey));
    }

    public function subject(string $slug)
    {
        return new ExploreSubjectResource($this->exploreQuery->subject($slug));
    }
}
