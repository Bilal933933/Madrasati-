<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\ImageService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private readonly ImageService $imageService) {}

    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,webp,gif', 'max:2048'],
        ], [
            'image.required' => 'الصورة مطلوبة.',
            'image.image' => 'الملف المرفوع يجب أن يكون صورة.',
            'image.mimes' => 'الصيغ المدعومة: JPG، PNG، WebP، GIF.',
            'image.max' => 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت.',
        ]);

        return response()->json([
            'data' => [
                'path' => $this->imageService->store($request->file('image')),
            ],
        ], 201);
    }
}
