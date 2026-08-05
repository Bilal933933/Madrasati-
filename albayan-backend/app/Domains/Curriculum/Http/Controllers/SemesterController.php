<?php

namespace App\Domains\Curriculum\Http\Controllers;

use App\Domains\Curriculum\Http\Resources\SemesterResource;
use App\Domains\Curriculum\Services\CurriculumService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * عرض عام — يعيد الفصول المنشورة فقط (للطالب).
 */
class SemesterController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index(Request $request)
    {
        return SemesterResource::collection(
            $this->curriculumService->publishedSemesters($request->integer('grade_id'))
        );
    }

    public function show(int $id)
    {
        return new SemesterResource($this->curriculumService->findPublishedSemester($id));
    }
}
