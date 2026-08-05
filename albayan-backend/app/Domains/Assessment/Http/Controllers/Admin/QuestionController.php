<?php

namespace App\Domains\Assessment\Http\Controllers\Admin;

use App\Domains\Assessment\Http\Requests\QuestionRequest;
use App\Domains\Assessment\Http\Resources\QuestionResource;
use App\Domains\Assessment\Services\AssessmentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(private readonly AssessmentService $assessmentService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "assessment_id": 1,
     *       "type": "multiple_choice",
     *       "content": "ما هي الإجابة الصحيحة؟",
     *       "explanation": "شرح الإجابة",
     *       "sort_order": 1,
     *       "correct_answer": "true",
     *       "options": [
     *         {
     *           "id": 1,
     *           "question_id": 1,
     *           "content": "خيار",
     *           "sort_order": 1,
     *           "is_correct": true
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return QuestionResource::collection(
            $this->assessmentService->questions($request->integer('assessment_id'))
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
            'data' => ['next_order' => $this->assessmentService->nextQuestionOrder($request->integer('assessment_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "assessment_id": 1,
     *     "type": "multiple_choice",
     *     "content": "ما هي الإجابة الصحيحة؟",
     *     "explanation": "شرح الإجابة",
     *     "sort_order": 1,
     *     "correct_answer": "true",
     *     "options": []
     *   },
     *   "message": "تم إنشاء السؤال بنجاح."
     * }
     */
    public function store(QuestionRequest $request)
    {
        $question = $this->assessmentService->createQuestion($request->validated());

        return response()->json([
            'data' => new QuestionResource($question),
            'message' => 'تم إنشاء السؤال بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "assessment_id": 1,
     *     "type": "multiple_choice",
     *     "content": "ما هي الإجابة الصحيحة؟",
     *     "explanation": "شرح الإجابة",
     *     "sort_order": 1,
     *     "correct_answer": "true",
     *     "options": []
     *   }
     * }
     */
    public function show(int $id)
    {
        return new QuestionResource($this->assessmentService->findQuestion($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "assessment_id": 1,
     *     "type": "multiple_choice",
     *     "content": "ما هي الإجابة الصحيحة؟",
     *     "explanation": "شرح الإجابة",
     *     "sort_order": 1,
     *     "correct_answer": "true",
     *     "options": []
     *   },
     *   "message": "تم تحديث السؤال بنجاح."
     * }
     */
    public function update(QuestionRequest $request, int $id)
    {
        $question = $this->assessmentService->updateQuestion($id, $request->validated());

        return response()->json([
            'data' => new QuestionResource($question),
            'message' => 'تم تحديث السؤال بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف السؤال بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->assessmentService->deleteQuestion($id);

        return response()->json([
            'message' => 'تم حذف السؤال بنجاح.',
        ]);
    }
}
