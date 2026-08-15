import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

/** حمولة حدث `generate-question` — threadId مطلوب فقط. */
export class GenerateQuestionDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف الجلسة يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف الجلسة يجب أن يكون رقماً موجباً.' })
  threadId: number;
}
