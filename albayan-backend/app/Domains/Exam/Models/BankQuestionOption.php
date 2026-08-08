<?php

namespace App\Domains\Exam\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $bank_question_id
 * @property string $content
 * @property bool $is_correct
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read BankQuestion $question
 */
class BankQuestionOption extends Model
{
    protected $fillable = [
        'bank_question_id',
        'content',
        'is_correct',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(BankQuestion::class, 'bank_question_id');
    }
}
