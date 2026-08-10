<?php

namespace App\Domains\Curriculum\Models;

use App\Support\ClearsExploreCache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property string|null $image
 * @property string|null $icon
 * @property string|null $color
 * @property int $sort_order
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Grade> $grades
 * @property-read int|null $grades_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stage whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Stage extends Model
{
    use ClearsExploreCache;

    protected $fillable = [
        'key',
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

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
