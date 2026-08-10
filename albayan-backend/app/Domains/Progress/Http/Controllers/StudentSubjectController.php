<?php

namespace App\Domains\Progress\Http\Controllers;

use App\Domains\Progress\Http\Resources\StudentSubjectResource;
use App\Domains\Progress\Queries\StudentSubjectQuery;
use App\Domains\Progress\Services\ProgressAggregator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * صفحة المادة للطالب — المادة بمقرراتها ودروسها + تقدم كل مقرر للمستخدم الحالي.
 */
class StudentSubjectController extends Controller
{
    public function __construct(
        private readonly StudentSubjectQuery $query,
        private readonly ProgressAggregator $progressAggregator,
    ) {}

    public function show(string $slug, Request $request)
    {
        $subject = $this->query->subject($slug);

        return new StudentSubjectResource(
            $subject,
            $this->progressAggregator->snapshotForSubject($request->user(), $subject),
        );
    }
}
