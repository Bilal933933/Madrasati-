<?php

namespace App\Domains\Assessment\Http\Controllers\Admin;

use App\Domains\Assessment\Http\Requests\OptionRequest;
use App\Domains\Assessment\Http\Resources\OptionResource;
use App\Domains\Assessment\Services\AssessmentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function __construct(private readonly AssessmentService $assessmentService) {}

    /**
     * @response {
     *   "data": [
     *     {
     *       "id": 1,
     *       "question_id": 1,
     *       "content": "خيار",
     *       "sort_order": 1,
     *       "is_correct": true
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        return OptionResource::collection(
            $this->assessmentService->options($request->integer('question_id'))
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
            'data' => ['next_order' => $this->assessmentService->nextOptionOrder($request->integer('question_id'))],
        ]);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "question_id": 1,
     *     "content": "خيار",
     *     "sort_order": 1,
     *     "is_correct": true
     *   },
     *   "message": "تم إنشاء الخيار بنجاح."
     * }
     */
    public function store(OptionRequest $request)
    {
        $option = $this->assessmentService->createOption($request->validated());

        return response()->json([
            'data' => new OptionResource($option),
            'message' => 'تم إنشاء الخيار بنجاح.',
        ], 201);
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "question_id": 1,
     *     "content": "خيار",
     *     "sort_order": 1,
     *     "is_correct": true
     *   }
     * }
     */
    public function show(int $id)
    {
        return new OptionResource($this->assessmentService->findOption($id));
    }

    /**
     * @response {
     *   "data": {
     *     "id": 1,
     *     "question_id": 1,
     *     "content": "خيار",
     *     "sort_order": 1,
     *     "is_correct": true
     *   },
     *   "message": "تم تحديث الخيار بنجاح."
     * }
     */
    public function update(OptionRequest $request, int $id)
    {
        $option = $this->assessmentService->updateOption($id, $request->validated());

        return response()->json([
            'data' => new OptionResource($option),
            'message' => 'تم تحديث الخيار بنجاح.',
        ]);
    }

    /**
     * @response {
     *   "message": "تم حذف الخيار بنجاح."
     * }
     */
    public function destroy(int $id)
    {
        $this->assessmentService->deleteOption($id);

        return response()->json([
            'message' => 'تم حذف الخيار بنجاح.',
        ]);
    }
}
