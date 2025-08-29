import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { deriveStatus } from '../common/utils/shiptment-status';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(senderUserId: number, dto: any) {
    if (dto.originLocationId === dto.destinationLocationId) {
      throw new BadRequestException('origin cannot equal destination');
    }

    // Ensure origin belongs to sender
    const origin = await this.prisma.location.findUnique({
      where: { id: dto.originLocationId },
    });
    if (!origin || origin.userId !== senderUserId) {
      throw new ForbiddenException('origin must be owned by sender');
    }

    return this.prisma.shipment.create({
      data: {
        senderUserId,
        originLocationId: dto.originLocationId,
        destinationLocationId: dto.destinationLocationId,
        size: dto.size,
        pickupAt: dto.pickupAt,
        expectedDeliveryAt: dto.expectedDeliveryAt,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: number) {
    const shipments = await this.prisma.shipment.findMany({
      where: { senderUserId: userId },
      include: { origin: true, destination: true },
    });

    // add derived status
    return shipments.map((s) => ({
      ...s,
      status: deriveStatus({
        pickupAt: s.pickupAt,
        expectedDeliveryAt: s.expectedDeliveryAt,
        deliveredAt: s.deliveredAt,
      }),
    }));
  }

  async markDelivered(id: number) {
    return this.prisma.shipment.update({
      where: { id },
      data: { deliveredAt: new Date() },
    });
  }
}
