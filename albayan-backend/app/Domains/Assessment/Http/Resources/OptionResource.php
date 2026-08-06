<?php

namespace App\Domains\Assessment\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() === true;
        // داخل تدفق الدرس (رحلة التعلم) تُكشف الإجابة للطالب ليتلقى تغذية فورية.
        $exposeInFlow = $request->attributes->get('lesson_flow', false) === true;

        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'content' => $this->content,
            'sort_order' => $this->sort_order,
            'is_correct' => $this->when($isAdmin || $exposeInFlow, $this->is_correct),
        ];
    }
}
