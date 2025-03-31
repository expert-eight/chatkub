import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthProviderList } from '@prisma/client';
import { Strategy } from 'passport-line';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  constructor(private prisma: PrismaService) {
    super({
      channelID: process.env.LINE_CLIENT_ID,
      channelSecret: process.env.LINE_CLIENT_SECRET,
      callbackURL: process.env.LINE_CALLBACK_URL,
      scope: ['profile', 'openid', 'email'],
      state: true,
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

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, displayName, pictureUrl, email } = profile;

    try {
      const user = await this.prisma.user.upsert({
        where: { lineId: id },
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
          username: `${id}@LINE`,
          password: '-',
          real_username: `${id}@LINE`,
          lineId: id,
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
}
