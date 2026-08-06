<?php

namespace App\Domains\Lesson\Http\Controllers;

use App\Domains\Lesson\Http\Resources\LessonFlowResource;
use App\Domains\Lesson\Services\TrialService;
use App\Http\Controllers\Controller;

/**
 * النسخة التجريبية (Trial) — عامة للزائر بلا تسجيل.
 *
 * يرجع رحلة درس مصغّرة (فقرة + فيديو قصير + سؤالين) بنفس عقدة
 * LessonFlowResource، فيستهلكها نفس محرك الدرس في الواجهة.
 */
class TrialController extends Controller
{
    public function __construct(
        private readonly TrialService $trialService,
    ) {}

    public function show()
    {
        return new LessonFlowResource(
            $this->trialService->build($this->trialService->resolveLesson())
        );
    }
}
