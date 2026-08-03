<?php

namespace App\Domains\Curriculum\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stage extends Model
{
    protected $fillable = [
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
