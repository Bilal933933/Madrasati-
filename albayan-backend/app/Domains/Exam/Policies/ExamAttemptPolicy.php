<?php

namespace App\Domains\Exam\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Exam\Models\ExamAttempt;

/**
 * صلاحيات الطالب على محاولات الامتحان — الملكية في المقام الأول.
 */
class ExamAttemptPolicy
{
    public function view(User $user, ExamAttempt $attempt): bool
    {
        return $this->owns($user, $attempt);
    }

    public function answer(User $user, ExamAttempt $attempt): bool
    {
        return $this->owns($user, $attempt);
    }

    public function updateProgress(User $user, ExamAttempt $attempt): bool
    {
        return $this->owns($user, $attempt);
    }

    public function submit(User $user, ExamAttempt $attempt): bool
    {
        return $this->owns($user, $attempt);
    }

    private function owns(User $user, ExamAttempt $attempt): bool
    {
        return $attempt->user_id === $user->id;
    }
}
