<?php

namespace App\Domains\Settings\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * إعدادات المنصة العامة — مخزن مفاتيح/قيم.
 */
class PlatformSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'string',
        ];
    }
}
