import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthProviderList, User } from '@prisma/client';
import axios from 'axios';
import { AuthLoginDto } from './dto/login.dto';
import { PasswordService } from 'src/utils/password.service';
import { RandomService } from 'src/utils/random.service';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDto } from './dto/register.dto';
import { AuthChangePasswordDto } from './dto/change-password.dto';
import { RecaptchaService } from 'src/utils/recaptcha.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async me(sub: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      include: {
        Member: true,
      },
    });

    if (!user) {
      throw new BadRequestException('ไม่พบผู้ใช้');
    }

    delete user['password'];
    return user;
  }

  private htmlEntities: { [key: string]: string } = {
    '&': '',
    '<': '',
    '>': '',
    '"': '',
    "'": '',
    '/': '',
  };

  filterXSS(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    } else if (Array.isArray(input)) {
      return input.map((item) => this.filterXSS(item));
    } else if (typeof input === 'object' && input !== null) {
      const sanitizedObject: { [key: string]: any } = {};
      for (const property in input) {
        sanitizedObject[property] = this.filterXSS(input[property]);
      }
      return sanitizedObject;
    }
    return input;
  }

  private sanitizeString(input: string): string {
    return input.replace(/[&<>"'/]/g, (match) => this.htmlEntities[match]);
  }

  async validateLineUser(accessToken: string): Promise<User | false> {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { userId, displayName, pictureUrl, email } = response.data;

    try {
      const user = await this.prisma.user.upsert({
        where: { lineId: userId },
        update: {
          Member: {
            update: {
              email: this.filterXSS(email),
              full_name: this.filterXSS(displayName),
              profileImage: pictureUrl,
            },
          },
        },
        create: {
          username: `${userId}@LINE`,
          password: '-',
          real_username: `${userId}@LINE`,
          lineId: userId,
          Member: {
            create: {
              email: this.filterXSS(email),
              full_name: this.filterXSS(displayName),
              loginProvider: AuthProviderList.LINE,
              profileImage: pictureUrl,
              isActive: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      return false;
    }
  }

  async signIn(data: AuthLoginDto): Promise<{ access_token: string }> {
    const checkUser = await this.prisma.user.findFirst({
      where: {
        username: data.username,
        Member: {
          loginProvider: 'WEB',
        },
      },
      include: {
        Member: true,
      },
    });

    if (!checkUser) {
      throw new NotFoundException('ไม่พบชื่อผู้ใช้');
    }

    // if (!checkUser.Member.isActive) {
    //   throw new NotFoundException('ผู้ใช้นี้ยังไม่ได้รับการเปิดใช้งาน');
    // }

    const passwordValid = await this.passwordService.validatePassword(
      data.password,
      checkUser.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('รหัสผ่านไม่ถูกต้อง');
    }

    const payload = {
      sub: checkUser.id,
      username: checkUser.username,
      tier: checkUser.tier,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }

  async signUp(
    data: AuthRegisterDto,
  ): Promise<{ status: string; message: string; access_token: string }> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('รหัสผ่านไม่ตรงกัน');
    }

    const captcha_verify = await this.recaptchaService.verify(data.token);
    if (!captcha_verify) {
      throw new BadRequestException(
        'ไม่สามารถยืนยันแคปช่าได้ กรุณารีเฟรชหน้านี้',
      );
    }

    const checkUser = await this.prisma.user.findFirst({
      where: {
        username: data.username,
      },
    });

    if (checkUser) {
      throw new BadRequestException('ชื่อผู้ใช้ซ้ำ');
    }

    const checkEmail = await this.prisma.member.findFirst({
      where: {
        email: data.email,
      },
    });

    const checkPhone = await this.prisma.member.findFirst({
      where: {
        phone: data.phone,
      },
    });

    if (checkEmail) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    if (checkPhone) {
      throw new BadRequestException('เบอร์โทรนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      data.password,
    );

    const user = await this.prisma.user.create({
      data: {
        username: this.filterXSS(data.username),
        password: hashedPassword,
        real_username: this.filterXSS(data.username),
        Member: {
          create: {
            email: this.filterXSS(data.email),
            phone: this.filterXSS(data.phone),
            full_name: this.filterXSS(data.username),
            isActive: true,
          },
        },
      },
      include: {
        Member: true,
      },
    });

    const payload = {
      sub: user.id,
      username: user.username,
      tier: user.tier,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      status: 'success',
      message: 'สมัครสมาชิกสำเร็จ',
      access_token: token,
    };
  }

  async changePassword(
    sub: string,
    data: AuthChangePasswordDto,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      include: {
        Member: true,
      },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้');
    }

    if (user.Member.loginProvider != 'WEB') {
      throw new BadRequestException('ประเภทผู้ใช้ไม่ถูกต้อง');
    }

    const passwordValid = await this.passwordService.validatePassword(
      data.oldPassword,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('รหัสผ่านเก่าไม่ถูกต้อง');
    } else if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestException('รหัสผ่านใหม่ไม่ตรงกัน');
    } else if (data.oldPassword === data.confirmPassword) {
      throw new BadRequestException(
        'รหัสผ่านเก่ากับรหัสผ่านใหม่ต้องไม่เหมือนกัน',
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(
      data.newPassword,
    );

    return this.prisma.user.update({
      where: {
        id: sub,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
