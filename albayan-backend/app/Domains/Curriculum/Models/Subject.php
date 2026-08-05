<?php

namespace App\Domains\Curriculum\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $grade_id
 * @property int|null $semester_id
 * @property string $name
 * @property string|null $slug
 * @property string|null $image
 * @property string|null $icon
 * @property string|null $color
 * @property int $sort_order
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Course> $courses
 * @property-read int|null $courses_count
 * @property-read Grade $grade
 * @property-read Semester|null $semester
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereGradeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subject whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Subject extends Model
{
    protected $fillable = [
        'grade_id',
        'semester_id',
        'name',
        'slug',
        'image',
        'icon',
        'color',
        'sort_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
