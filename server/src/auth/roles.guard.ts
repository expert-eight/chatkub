import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoleUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { sub } = request.user;
    try {
      const data = await this.prisma.user.findUnique({ where: { id: sub } });
      if (data.tier !== 'MEMBER') {
        throw new UnauthorizedException('This user is not an MEMBER role.');
      }
      request['data'] = data;
      return true;
    } catch (error) {
      if (error.response) {
        throw new UnauthorizedException(error.response.message);
      } else {
        throw new UnauthorizedException('Error to filter role');
      }
    }
  }
}
