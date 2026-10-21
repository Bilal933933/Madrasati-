import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationError as ClassValidatorError,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../errors/validation-error.js';

/**
 * Pipe تحويل + تحقق للـ DTOs (تحقق نحوي فقط — فحص الـ DB يبقى في الخدمات).
 * - enableImplicitConversion: يحوّل "5" ← 5 (الفرونت يرسل أحيانًا أرقامًا كنصوص).
 * - whitelist: يتجاهل الحقول غير المعروفة ولا يمرّرها للخدمة.
 * أي فشل = ValidationError (يلتقطه الفلتر العام لـ HTTP و WS معًا).
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const ctor = metadata.metatype;
    if (metadata.type !== 'body' || !ctor || typeof ctor !== 'function') {
      return value;
    }

    const object = plainToInstance(ctor as ClassConstructor<object>, value, {
      enableImplicitConversion: true,
    });

    const errors: ClassValidatorError[] = await validate(object, {
      whitelist: true,
    });
    if (errors.length === 0) return object;

    const fieldErrors = errors.map((error) => ({
      field: error.property,
      messages: Object.values(error.constraints ?? {}),
    }));

    const message = fieldErrors
      .map(({ field, messages }) => `${field}: ${messages.join('، ')}`)
      .join('; ');

    throw new ValidationError(`خطأ في البيانات المرسلة: ${message}`, {
      fieldErrors,
    });
  }
}
