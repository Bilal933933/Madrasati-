import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { AiQuestionType } from '../exam.types.js';

class CriterionDto {
  @IsString({ message: 'اسم المعيار يجب أن يكون نصاً.' })
  @IsNotEmpty({ message: 'اسم المعيار لا يمكن أن يكون فارغاً.' })
  @MaxLength(200, { message: 'اسم المعيار طويل جداً (200 حرف كحد أقصى).' })
  criterion: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'وزن المعيار يجب أن يكون رقماً.' })
  @Min(0, { message: 'وزن المعيار لا يمكن أن يكون سالباً.' })
  weight?: number;
}

export class GradeQuestionDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف السؤال يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف السؤال يجب أن يكون رقماً موجباً.' })
  questionId: number;

  @IsIn(['short_answer', 'essay', 'numeric'], {
    message: 'نوع السؤال غير مدعوم في التصحيح الذكي.',
  })
  type: AiQuestionType;

  @IsString({ message: 'نص السؤال يجب أن يكون نصاً.' })
  @IsNotEmpty({ message: 'نص السؤال لا يمكن أن يكون فارغاً.' })
  @MaxLength(2000, { message: 'نص السؤال طويل جداً (2000 حرف كحد أقصى).' })
  question: string;

  @IsOptional()
  @IsString({ message: 'نموذج الإجابة يجب أن يكون نصاً.' })
  @MaxLength(4000, { message: 'نموذج الإجابة طويل جداً (4000 حرف كحد أقصى).' })
  modelAnswer?: string;

  @IsString({ message: 'إجابة الطالب يجب أن تكون نصاً.' })
  @IsNotEmpty({ message: 'إجابة الطالب لا يمكن أن تكون فارغة.' })
  @MaxLength(8000, { message: 'إجابة الطالب طويلة جداً (8000 حرف كحد أقصى).' })
  studentAnswer: string;

  @IsOptional()
  @IsArray({ message: 'الإجابات المقبولة البديلة يجب أن تكون مصفوفة.' })
  @ArrayMaxSize(10, { message: 'حد أقصى 10 إجابات بديلة.' })
  @IsString({ each: true, message: 'كل إجابة بديلة يجب أن تكون نصاً.' })
  acceptedAnswers?: string[];

  @IsOptional()
  @IsBoolean({ message: 'حساسية الحالة يجب أن تكون قيمة منطقية.' })
  caseSensitive?: boolean;

  @IsOptional()
  @IsArray({ message: 'عناصر التقييم يجب أن تكون مصفوفة.' })
  @ArrayMaxSize(8, { message: 'حد أقصى 8 معايير تقييم.' })
  @ValidateNested({ each: true })
  @Type(() => CriterionDto)
  criteria?: CriterionDto[];

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'القيمة العددية الصحيحة يجب أن تكون رقماً.' })
  correctValue?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'السماحية يجب أن تكون رقماً.' })
  @Min(0, { message: 'السماحية لا يمكن أن تكون سالبة.' })
  tolerance?: number;

  @IsOptional()
  @IsString({ message: 'الوحدة يجب أن تكون نصاً.' })
  @MaxLength(50, { message: 'الوحدة طويلة جداً (50 حرف كحد أقصى).' })
  units?: string;

  @IsOptional()
  @IsString({ message: 'سياق السؤال يجب أن يكون نصاً.' })
  @MaxLength(12000, { message: 'سياق السؤال طويل جداً (12000 حرف كحد أقصى).' })
  context?: string;
}

export class ExamContextDto {
  @IsOptional()
  @IsString({ message: 'سياق المنهج يجب أن يكون نصاً.' })
  @MaxLength(40000, { message: 'سياق المنهج طويل جداً (40000 حرف كحد أقصى).' })
  text?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'معرف الدرس يجب أن يكون رقماً.' })
  lessonId?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'معرف المادة يجب أن يكون رقماً.' })
  subjectId?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'معرف الصف يجب أن يكون رقماً.' })
  gradeId?: number;
}

export class GradeExamDto {
  @IsArray({ message: 'قائمة الأسئلة يجب أن تكون مصفوفة.' })
  @ArrayMinSize(1, { message: 'أرسل سؤالاً واحداً على الأقل للتصحيح.' })
  @ArrayMaxSize(100, { message: 'حد أقصى 100 سؤال لكل دفعة تصحيح.' })
  @ValidateNested({ each: true })
  @Type(() => GradeQuestionDto)
  questions: GradeQuestionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ExamContextDto)
  context?: ExamContextDto;
}