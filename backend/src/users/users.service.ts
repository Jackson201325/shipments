import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findByEmail(email: string) {
    console.log('👉 Inside findByEmail(), email =', email);
    return this.prisma.user.findUnique({ where: { email } });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
