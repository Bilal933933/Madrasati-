import { Type } from '@google/genai';
import type { Schema } from '@google/genai';

/**
 * شكل سؤال الاختبار الذي يولّده المعلم الذكي (Structured Output — JSON).
 * تُطابِق واجهة QuizQuestion في الفرونت.
 */
export interface QuizQuestion {
  subject?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

/**
 * مخطط JSON يُمرَّر عبر responseSchema ليُلزم النموذج بالبنية بدقة 100%.
 */
export const QUIZ_QUESTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctAnswerIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
  },
  required: ['question', 'options', 'correctAnswerIndex'],
};
