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

export class AuthRegisterDto {
  @ApiProperty({
    description: 'example',
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 20, { message: 'ชื่อต้องมีความยาวอย่างน้อย 4-20 หลัก ' })
  username: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'z3566018',
  })
  @IsNotEmpty()
  @Length(8, 30, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 หลัก' })
  password: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'z3566018',
  })
  @IsNotEmpty()
  @Length(8, 30, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 หลัก' })
  confirmPassword: string;

  @ApiProperty({
    description: 'example',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'example',
  })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก' })
  @Length(8, 10, { message: 'เบอร์โทรต้องมีความยาว 8-10 หลัก' })
  phone: string;

  @ApiProperty({
    description: 'example',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
