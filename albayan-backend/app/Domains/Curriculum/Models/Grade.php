<?php

namespace App\Domains\Curriculum\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $stage_id
 * @property string $name
 * @property string|null $slug
 * @property string|null $image
 * @property string|null $icon
 * @property string|null $color
 * @property int $sort_order
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Stage $stage
 * @property-read Collection<int, Semester> $semesters
 * @property-read int|null $semesters_count
 * @property-read Collection<int, Subject> $subjects
 * @property-read int|null $subjects_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grade whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Grade extends Model
{
    protected $fillable = [
        'stage_id',
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

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }
}
