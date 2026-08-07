<?php

namespace Database\Seeders;

use App\Domains\Auth\Models\StudentProfile;
use App\Domains\Auth\Models\User;
use App\Domains\Curriculum\Models\Grade;
use Database\Seeders\Support\SeedRegistry;
use Illuminate\Database\Seeder;

/**
 * يربط الطالب التجريبي بصفه وفصله الدراسي (الملف الأكاديمي).
 *
 * يُستدعى بعد بذر المنهج (الصفوف والفصول موجودة) — فلا يمكن دمجه
 * في UserSeeder الذي يعمل قبل الهيكل الأكاديمي.
 */
class StudentProfileSeeder extends Seeder
{
    public function run(): void
    {
        $grade = Grade::findOrFail(SeedRegistry::$grades['primary_4']);
        $semester = $grade->semesters()->orderBy('sort_order')->firstOrFail();

        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            ['name' => 'طالب تجريبي', 'password' => 'password'],
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $student->id],
            ['grade_id' => $grade->id, 'semester_id' => $semester->id],
        );
    }
}
