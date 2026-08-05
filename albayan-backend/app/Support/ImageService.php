<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * خدمة مساعدة لرفع وحذف صور الكيانات.
 * تُخزَّن الصور في disk عام وتُحذف تلقائياً عند الاستبدال أو حذف الكيان.
 */
class ImageService
{
    public function store(UploadedFile $file): string
    {
        $path = $file->store('images', 'public');

        return '/storage/'.$path;
    }

    public function delete(?string $imagePath): void
    {
        if (! $imagePath || ! str_starts_with($imagePath, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(substr($imagePath, strlen('/storage/')));
    }
}
