import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthProviderList } from '@prisma/client';
import { Strategy } from 'passport-facebook';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['id', 'emails', 'name'],
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    done: Function,
  ) {
    const { id, name, emails } = profile;
    const user = await this.prisma.user.upsert({
      where: {
        facebookId: id,
      },
      update: {},
      create: {
        username: `${id}@FB`,
        password: '-',
        real_username: `${id}@FB`,
        facebookId: id,
        Member: {
          create: {
            email: this.filterXSS(emails[0]?.value),
            full_name: this.filterXSS(`${name.givenName} ${name.familyName}`),
            loginProvider: AuthProviderList.FACEBOOK,
            isActive: true,
          },
        },
      },
    });
    done(null, user);
  }
}
