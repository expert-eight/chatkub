import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsIn,
  MinLength,
} from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    description: 'example',
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 30, { message: 'ชื่อต้องมีความยาวอย่างน้อย 4-20 หลัก ' })
  username: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'z3566018',
  })
  @IsNotEmpty()
  @Length(8, 30, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 หลัก' })
  password: string;
}
