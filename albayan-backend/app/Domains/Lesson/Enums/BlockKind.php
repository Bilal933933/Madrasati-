<?php

namespace App\Domains\Lesson\Enums;

/**
 * أنواع عناصر رحلة التعلم داخل الدرس (Lesson Blocks).
 * كل قيمة تعبّر عن دور العنصر داخل الرحلة، لا مجرد نوعه الفني.
 */
enum BlockKind: string
{
    case Paragraph = 'paragraph';
    case PreAssessment = 'pre_assessment';
    case FormativeAssessment = 'formative_assessment';
    case LessonVideo = 'lesson_video';
    case FinalAssessment = 'final_assessment';

    /**
     * نوع التقييم المطابق لهذه الكتلة في جدول assessments (إن كانت كتلة تقييم).
     */
    public function assessmentType(): ?string
    {
        return match ($this) {
            self::PreAssessment => 'pre',
            self::FormativeAssessment => 'formative',
            self::FinalAssessment => 'final',
            default => null,
        };
    }

    public function isAssessment(): bool
    {
        return $this->assessmentType() !== null;
    }

    public function isParagraph(): bool
    {
        return $this === self::Paragraph;
    }

    /**
     * كتلة الرحلة المطابقة لنوع تقييم في جدول assessments (إن وُجد).
     */
    public static function fromAssessmentType(string $type): ?self
    {
        return match ($type) {
            'pre' => self::PreAssessment,
            'formative' => self::FormativeAssessment,
            'final' => self::FinalAssessment,
            default => null,
        };
    }
}
