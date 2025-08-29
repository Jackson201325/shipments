import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.location.findMany({ where: { userId } });
  }

  create(userId: number, data: any) {
    return this.prisma.location.create({ data: { ...data, userId } });
  }

  remove(id: number) {
    return this.prisma.location.delete({ where: { id } });
  }
}
