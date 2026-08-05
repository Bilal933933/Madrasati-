<?php

namespace App\Domains\Assessment\Http\Controllers\Admin;

use App\Domains\Assessment\Http\Requests\AssessmentRequest;
use App\Domains\Assessment\Http\Resources\AssessmentResource;
use App\Domains\Assessment\Services\AssessmentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function __construct(private readonly AssessmentService $assessmentService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "lesson_id": 1,
     *       "paragraph_id": null,
     *       "type": "quiz",
     *       "title": "تقييم الدرس",
     *       "sort_order": 1,
     *       "questions": [
     *         {
     *           "id": 1,
     *           "assessment_id": 1,
     *           "type": "multiple_choice",
     *           "content": "ما هي الإجابة الصحيحة؟",
     *           "explanation": "شرح الإجابة",
     *           "sort_order": 1,
     *           "correct_answer": "true",
     *           "options": [
     *             {
     *               "id": 1,
     *               "question_id": 1,
     *               "content": "خيار",
     *               "sort_order": 1,
     *               "is_correct": true
     *             }
     *           ]
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return AssessmentResource::collection(
            $this->assessmentService->assessments(
                $request->integer('lesson_id'),
                $request->integer('paragraph_id'),
                $request->input('type')
            )
        );
    }

    /**
     * @response {
     *   "data": {
     *     "next_order": 1
     *   }
     * }
     */
    public function nextOrder(Request $request)
    {
        return response()->json([
            'data' => ['next_order' => $this->assessmentService->nextAssessmentOrder($request->integer('lesson_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "paragraph_id": null,
     *     "type": "quiz",
     *     "title": "تقييم الدرس",
     *     "sort_order": 1,
     *     "questions": []
     *   },
     *   "message": "تم إنشاء التقييم بنجاح."
     * }
     */
    public function store(AssessmentRequest $request)
    {
        $assessment = $this->assessmentService->createAssessment($request->validated());

        return response()->json([
            'data' => new AssessmentResource($assessment),
            'message' => 'تم إنشاء التقييم بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "paragraph_id": null,
     *     "type": "quiz",
     *     "title": "تقييم الدرس",
     *     "sort_order": 1,
     *     "questions": []
     *   }
     * }
     */
    public function show(int $id)
    {
        return new AssessmentResource($this->assessmentService->findAssessment($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "lesson_id": 1,
     *     "paragraph_id": null,
     *     "type": "quiz",
     *     "title": "تقييم الدرس",
     *     "sort_order": 1,
     *     "questions": []
     *   },
     *   "message": "تم تحديث التقييم بنجاح."
     * }
     */
    public function update(AssessmentRequest $request, int $id)
    {
        $assessment = $this->assessmentService->updateAssessment($id, $request->validated());

        return response()->json([
            'data' => new AssessmentResource($assessment),
            'message' => 'تم تحديث التقييم بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف التقييم بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->assessmentService->deleteAssessment($id);

        return response()->json([
            'message' => 'تم حذف التقييم بنجاح.',
        ]);
    }
}
