<?php

namespace App\Domains\Lesson\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paragraph extends Model
{
    protected $fillable = [
        'lesson_id',
        'type',
        'slug',
        'image',
        'icon',
        'color',
        'content',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
