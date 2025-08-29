// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateUser, User } from '@app/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private toUserDto(row: {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(dto: CreateUser): Promise<User> {
    const row = await this.prisma.user.create({ data: dto });
    return this.toUserDto(row);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return rows.map(this.toUserDto);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toUserDto(row) : null;
  }

  async remove(id: number): Promise<User> {
    const row = await this.prisma.user.delete({ where: { id } });
    return this.toUserDto(row);
  }
}
