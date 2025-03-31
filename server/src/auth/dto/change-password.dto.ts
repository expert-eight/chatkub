import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches, IsIn } from 'class-validator';

export class AuthChangePasswordDto {
  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'Password@123',
  })
  @IsNotEmpty()
  @Length(2, 30)
  oldPassword: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'Password@123',
  })
  @IsNotEmpty()
  @Length(2, 30)
  newPassword: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'Password@123',
  })
  @IsNotEmpty()
  @Length(2, 30)
  confirmPassword: string;
}
