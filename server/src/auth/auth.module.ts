import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma.service';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { RandomService } from 'src/utils/random.service';
import { LineStrategy } from './line.strategy';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { PasswordService } from 'src/utils/password.service';
import { RecaptchaService } from 'src/utils/recaptcha.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    GoogleStrategy,
    FacebookStrategy,
    DiscordStrategy,
    LineStrategy,
    RandomService,
    PasswordService,
    RecaptchaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
