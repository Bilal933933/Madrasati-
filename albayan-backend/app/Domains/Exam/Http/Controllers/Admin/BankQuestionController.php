<?php

namespace App\Domains\Exam\Http\Controllers\Admin;

use App\Domains\Exam\Http\Requests\BankQuestionRequest;
use App\Domains\Exam\Http\Resources\BankQuestionResource;
use App\Domains\Exam\Services\ExamBankService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BankQuestionController extends Controller
{
    public function __construct(private readonly ExamBankService $examBankService) {}

    public function index(Request $request)
    {
        return BankQuestionResource::collection(
            $this->examBankService->questions(
                $request->integer('lesson_id'),
                $request->string('difficulty')->toString() ?: null,
                $request->string('type')->toString() ?: null,
            )
        );
    }

    public function show(int $id)
    {
        return new BankQuestionResource($this->examBankService->findQuestion($id));
    }

    public function store(BankQuestionRequest $request)
    {
        $question = $this->examBankService->createQuestion($request->validated());

        return response()->json([
            'data' => new BankQuestionResource($question),
            'message' => 'تم إنشاء السؤال بنجاح.',
        ], 201);
    }

    public function update(BankQuestionRequest $request, int $id)
    {
        $question = $this->examBankService->updateQuestion($id, $request->validated());

        return response()->json([
            'data' => new BankQuestionResource($question),
            'message' => 'تم تحديث السؤال بنجاح.',
        ]);
    }

    public function destroy(int $id)
    {
        $this->examBankService->deleteQuestion($id);

        return response()->json([
            'message' => 'تم حذف السؤال بنجاح.',
        ]);
    }
}
