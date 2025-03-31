import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RoleUserGuard } from './roles.guard';
import { AuthGuard as SocialGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { RandomService } from 'src/utils/random.service';
import axios from 'axios';
import * as qs from 'qs';
import { AuthRegisterDto } from './dto/register.dto';
import { AuthLoginDto } from './dto/login.dto';
import { AuthChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard, RoleUserGuard)
  @ApiBearerAuth()
  @Get('/me')
  async me(@Request() req): Promise<User> {
    return await this.authService.me(req.user.sub);
  }

  @UseGuards(AuthGuard, RoleUserGuard)
  @ApiBearerAuth()
  @Post('/change-password')
  async changePassword(
    @Request() req,
    @Body() data: AuthChangePasswordDto,
  ): Promise<User> {
    return await this.authService.changePassword(req.user.sub, data);
  }

  @Post('/login')
  async signin(@Body() data: AuthLoginDto): Promise<{ access_token: string }> {
    return await this.authService.signIn(data);
  }

  @Post('/signup')
  async signup(
    @Body() data: AuthRegisterDto,
  ): Promise<{ status: string; message: string; access_token: string }> {
    return await this.authService.signUp(data);
  }

  @Get('facebook')
  @UseGuards(SocialGuard('facebook'))
  async facebookAuth(@Req() req) {}

  @Get('facebook/callback')
  @UseGuards(SocialGuard('facebook'))
  facebookAuthRedirect(@Req() req, @Res() res) {
    const payload = {
      sub: req.user.id,
      username: req.user.username,
      tier: req.user.tier,
    };

    const access_token = this.jwtService.sign(payload);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/login?token=${encodeURIComponent(access_token)}`,
    );
  }

  @Get('google')
  @UseGuards(SocialGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(SocialGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    const payload = {
      sub: req.user.id,
      username: req.user.username,
      tier: req.user.tier,
    };

    const access_token = this.jwtService.sign(payload);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/login?token=${encodeURIComponent(access_token)}`,
    );
  }

  @Get('line')
  @UseGuards(SocialGuard('line'))
  async lineLogin() {}

  @Get('line/callback')
  @UseGuards(SocialGuard('line'))
  async lineCallback(@Req() req, @Res() res) {
    const user = req.user;

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
    }
    const payload = {
      sub: user['id'],
      username: user['username'],
      tier: user['tier'],
    };
    const access_token = await this.jwtService.signAsync(payload);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/login?token=${encodeURIComponent(access_token)}`,
    );
  }

  @Get('discord')
  @UseGuards(SocialGuard('discord'))
  async discordLogin() {
    // Initiates Discord OAuth2 login
  }

  @Get('discord/redirect')
  @UseGuards(SocialGuard('discord'))
  async discordRedirect(@Req() req, @Res() res) {
    const user = req.user;

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
    }
    const payload = {
      sub: user['id'],
      username: user['username'],
      tier: user['tier'],
    };

    const access_token = await this.jwtService.signAsync(payload);

    // console.log(access_token);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/login?token=${encodeURIComponent(access_token)}`,
    );
    return req.user;
  }
}
