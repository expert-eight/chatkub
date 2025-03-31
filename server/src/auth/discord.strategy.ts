import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthProviderList } from '@prisma/client';
import { Strategy } from 'passport-discord';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_REDIRECT_URI,
      scope: ['identify', 'email'],
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

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const userProfile = { ...profile, accessToken };
    const { id, avatar } = profile;

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(id) % 5}.png`;

    const user = await this.prisma.user.upsert({
      where: {
        discordId: id,
      },
      update: {},
      create: {
        username: `${id}@DISCORD`,
        password: '-',
        real_username: `${id}@DISCORD`,
        discordId: id,
        Member: {
          create: {
            email: this.filterXSS(userProfile.email),
            full_name: this.filterXSS(userProfile.global_name),
            profileImage: avatarUrl,
            loginProvider: AuthProviderList.DISCORD,
            isActive: true,
          },
        },
      },
    });
    return user;
  }
}
