import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors.map((err) => Object.values(err.constraints)[0])[0],
      });
    }

    return value;
  }

  private toValidate(type: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(type);
  }
}
