import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { PrismaService } from '../database/prisma.service';
import { ShipmentsController } from './shipments.controllers';

@Module({
  controllers: [ShipmentsController],
  providers: [ShipmentsService, PrismaService],
})
export class ShipmentsModule {}
