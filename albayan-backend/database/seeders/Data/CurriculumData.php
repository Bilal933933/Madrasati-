<?php

namespace Database\Seeders\Data;

/**
 * بيانات هيكل المنهج — مرجع واحد لإنشاء المراحل والصفوف والفصول والمواد.
 *
 * key = مفتاح مرحلي ثابت تُستخدمه الـ Seeders اللاحقة لمطابقة المراحل الرائدة.
 */
class CurriculumData
{
    /** أسماء الفصلين: الفهرس 0 = الأول، 1 = الثاني. */
    public const SEMESTER_NAMES = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني'];

    /** المراحل (Stage) الثلاث. */
    public static function stages(): array
    {
        return [
            ['key' => 'primary', 'name' => 'المرحلة الابتدائية', 'icon' => 'School', 'color' => '#10b981'],
            ['key' => 'prep', 'name' => 'المرحلة الإعدادية', 'icon' => 'BookOpen', 'color' => '#3b82f6'],
            ['key' => 'secondary', 'name' => 'المرحلة الثانوية', 'icon' => 'GraduationCap', 'color' => '#8b5cf6'],
        ];
    }

    /** صفوف كل مرحلة — مفتاح المرحلة => أسماء الصفوف. */
    public static function gradesByStage(): array
    {
        return [
            'primary' => [
                'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
                'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
            ],
            'prep' => ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'],
            'secondary' => ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'],
        ];
    }

    /**
     * أيقونة كل صف (مرجع يطابق ترتيب gradesByStage) — اسم lucide مخزَّن كنص.
     * مفتاح المرحلة => أيقونات الصفوف بترتيبها.
     */
    public static function gradeIconsByStage(): array
    {
        return [
            'primary' => [
                'NotebookPen', 'NotebookText', 'BookCopy', 'BookOpenCheck', 'LibraryBig', 'BookCheck',
            ],
            'prep' => ['ClipboardList', 'ClipboardCheck', 'ClipboardPen'],
            'secondary' => ['GraduationCap', 'School', 'Medal'],
        ];
    }

    /**
     * المراحل الرائدة (Flagship): الصفوف التي يُبنى لها محتوى تعليمي عميق حقيقي.
     * مفتاح الصف => اسم الصف (مفتاح فريد يرتبط به المقررات والدروس).
     */
    public static function flagshipGrades(): array
    {
        return [
            'primary_4' => 'الصف الرابع الابتدائي',
            'prep_1' => 'الصف الأول الإعدادي',
            'secondary_1' => 'الصف الأول الثانوي',
        ];
    }

    /** مواد كل مرحلة — مفتاح المرحلة => مواد بخصائصها البصرية. */
    public static function subjectsByStage(): array
    {
        return [
            'primary' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'الرياضيات', 'icon' => 'Calculator', 'color' => '#ef4444'],
                ['name' => 'العلوم', 'icon' => 'Atom', 'color' => '#22c55e'],
                ['name' => 'الدراسات الاجتماعية', 'icon' => 'Globe2', 'color' => '#a855f7'],
                ['name' => 'المهارات المهنية', 'icon' => 'Wrench', 'color' => '#64748b'],
                ['name' => 'التربية الدينية', 'icon' => 'Landmark', 'color' => '#84cc16'],
            ],
            'prep' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'الرياضيات', 'icon' => 'Calculator', 'color' => '#ef4444'],
                ['name' => 'العلوم', 'icon' => 'FlaskConical', 'color' => '#22c55e'],
                ['name' => 'الدراسات الاجتماعية', 'icon' => 'Globe2', 'color' => '#a855f7'],
                ['name' => 'الحاسب الآلي', 'icon' => 'Cpu', 'color' => '#6366f1'],
                ['name' => 'التربية الدينية', 'icon' => 'Landmark', 'color' => '#84cc16'],
            ],
            'secondary' => [
                ['name' => 'اللغة العربية', 'icon' => 'BookMarked', 'color' => '#f59e0b'],
                ['name' => 'اللغة الإنجليزية', 'icon' => 'Languages', 'color' => '#06b6d4'],
                ['name' => 'اللغة الفرنسية', 'icon' => 'Languages', 'color' => '#0ea5e9'],
                ['name' => 'الرياضيات', 'icon' => 'FunctionSquare', 'color' => '#ef4444'],
                ['name' => 'الفيزياء', 'icon' => 'Atom', 'color' => '#3b82f6'],
                ['name' => 'الكيمياء', 'icon' => 'TestTube', 'color' => '#22c55e'],
                ['name' => 'الأحياء', 'icon' => 'Microscope', 'color' => '#10b981'],
                ['name' => 'التاريخ', 'icon' => 'Landmark', 'color' => '#a855f7'],
                ['name' => 'الجغرافيا', 'icon' => 'Globe2', 'color' => '#f97316'],
                ['name' => 'الفلسفة والمنطق', 'icon' => 'Brain', 'color' => '#64748b'],
            ],
        ];
    }
}
