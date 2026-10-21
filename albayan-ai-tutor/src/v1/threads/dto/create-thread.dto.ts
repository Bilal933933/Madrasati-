import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

/** جسم POST /api/threads — كلاهما اختياري، موجب عند وجوده. */
export class CreateThreadDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف المادة يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف المادة يجب أن يكون رقماً موجباً.' })
  subjectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'معرف الدرس يجب أن يكون رقماً.' })
  @Min(1, { message: 'معرف الدرس يجب أن يكون رقماً موجباً.' })
  lessonId?: number;
}
