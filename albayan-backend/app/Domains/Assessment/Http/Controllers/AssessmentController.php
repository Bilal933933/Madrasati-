<?php

namespace App\Domains\Assessment\Http\Controllers;

use App\Domains\Assessment\Http\Resources\AssessmentResource;
use App\Domains\Assessment\Services\AssessmentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function __construct(private readonly AssessmentService $assessmentService) {}

    public function index(Request $request)
    {
        return AssessmentResource::collection(
            $this->assessmentService->publishedAssessments(
                $request->integer('lesson_id'),
                $request->integer('paragraph_id'),
                $request->input('type')
            )
        );
    }

    public function show(int $id)
    {
        return new AssessmentResource($this->assessmentService->publishedAssessment($id));
    }
}
