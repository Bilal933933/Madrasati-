import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** حمولة حدث `question` — threadId مطلوب، question مطلوب (مقتطع ومقيس)، subjectId اختياري. */
export class SendQuestionDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف الجلسة يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف الجلسة يجب أن يكون رقماً موجباً.' })
  threadId: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @IsNotEmpty({ message: 'السؤال لا يمكن أن يكون فارغاً.' })
  @IsString({ message: 'السؤال يجب أن يكون نصاً.' })
  @MinLength(2, { message: 'السؤال قصير جداً (حرفان على الأقل).' })
  @MaxLength(2000, { message: 'السؤال طويل جداً (2000 حرف كحد أقصى).' })
  question: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف المادة يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف المادة يجب أن يكون رقماً موجباً.' })
  subjectId?: number;
}
