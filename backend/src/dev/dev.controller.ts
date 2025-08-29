import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';

@Controller('dev')
export class DevController {
  constructor(private prisma: PrismaService) {}

  @Get('impersonate/:userId')
  async impersonate(@Param('userId', ParseIntPipe) userId: number) {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) throw new UnauthorizedException('SUPABASE_JWT_SECRET missing');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const token = jwt.sign(
      {
        aud: 'authenticated',
        role: 'authenticated',
        sub: randomUUID(),
        app_user_id: userId,
        email: user.email,
      },
      secret,
      {
        algorithm: 'HS256',
        issuer: 'supabase',
        expiresIn: '30d',
      },
    );

    const decoded = jwt.decode(token);
    const exp = (decoded && typeof decoded === 'object' && 'exp' in decoded)
      ? (decoded as { exp: number }).exp
      : undefined;

    return { token, email: user.email, userId, exp };
  }
}
