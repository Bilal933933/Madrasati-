<?php

namespace App\Domains\Lesson\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $lesson_id
 * @property string $title
 * @property string $type
 * @property string|null $slug
 * @property string|null $image
 * @property string|null $video
 * @property string|null $icon
 * @property string|null $color
 * @property string $content
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lesson $lesson
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereLessonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Paragraph whereVideo($value)
 *
 * @mixin \Eloquent
 */
class Paragraph extends Model
{
    protected $fillable = [
        'lesson_id',
        'title',
        'type',
        'slug',
        'image',
        'video',
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
