import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthProviderList } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  private htmlEntities: { [key: string]: string } = {
    '&': '',
    '<': '',
    '>': '',
    '"': '',
    "'": '',
    '/': '',
  };

  private sanitizeString(input: string): string {
    return input.replace(/[&<>"'/]/g, (match) => this.htmlEntities[match]);
  }

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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = await this.prisma.user.upsert({
      where: { googleId: id },
      update: {},
      create: {
        username: `${id}@GOOGLE`,
        password: '-',
        real_username: `${id}@GOOGLE`,
        googleId: id,
        Member: {
          create: {
            email: this.filterXSS(emails[0]?.value),
            full_name: this.filterXSS(
              `${name.givenName ?? ''} ${name.familyName ?? ''}`,
            ),
            loginProvider: AuthProviderList.GOOGLE,
            profileImage: photos[0].value ?? '-',
            isActive: true,
          },
        },
      },
    });

    done(null, user);
  }
}
