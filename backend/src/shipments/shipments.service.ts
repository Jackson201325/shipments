import { CreateShipment, deriveStatus, UpdateShipment } from '@app/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  private toDate(d?: string | Date | null) {
    if (d === undefined) return undefined;
    if (d === null) return null;
    return d instanceof Date ? d : new Date(d);
  }

  private async assertOriginOwnedBy(userId: number, originLocationId: number) {
    const origin = await this.prisma.location.findUnique({
      where: { id: originLocationId },
      select: { id: true, userId: true },
    });
    if (!origin) throw new BadRequestException('origin location not found');
    if (origin.userId !== userId) {
      throw new ForbiddenException('origin must be owned by sender');
    }
  }

  async create(senderUserId: number, dto: CreateShipment) {
    if (dto.originLocationId === dto.destinationLocationId) {
      throw new BadRequestException('origin cannot equal destination');
    }
    await this.assertOriginOwnedBy(senderUserId, dto.originLocationId);

    const created = await this.prisma.shipment.create({
      data: {
        senderUserId,
        originLocationId: dto.originLocationId,
        destinationLocationId: dto.destinationLocationId,
        size: dto.size,
        pickupAt: this.toDate(dto.pickupAt) ?? undefined,
        expectedDeliveryAt: this.toDate(dto.expectedDeliveryAt) ?? undefined,
      },
      include: { origin: true, destination: true },
    });

    return {
      ...created,
      status: deriveStatus({
        pickupAt: created.pickupAt,
        expectedDeliveryAt: created.expectedDeliveryAt,
        deliveredAt: created.deliveredAt,
      }),
    };
  }

  async findOne(id: number) {
    const s = await this.prisma.shipment.findUnique({
      where: { id },
      include: { origin: true, destination: true },
    });
    if (!s) throw new NotFoundException('shipment not found');

    return {
      ...s,
      status: deriveStatus({
        pickupAt: s.pickupAt,
        expectedDeliveryAt: s.expectedDeliveryAt,
        deliveredAt: s.deliveredAt,
      }),
    };
  }

  async findAll(params: {
    userId: number;
    status?: 'In Transit' | 'On Time' | 'Delayed';
    page?: number;
    perPage?: number;
  }) {
    const { userId, status, page = 1, perPage = 20 } = params;

    const rows = await this.prisma.shipment.findMany({
      where: { senderUserId: userId },
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { origin: true, destination: true },
    });

    const mapped = rows.map((s) => ({
      ...s,
      status: deriveStatus({
        pickupAt: s.pickupAt,
        expectedDeliveryAt: s.expectedDeliveryAt,
        deliveredAt: s.deliveredAt,
      }),
    }));

    return status ? mapped.filter((s) => s.status === status) : mapped;
  }

  async update(id: number, userId: number, dto: UpdateShipment) {
    const existing = await this.prisma.shipment.findUnique({
      where: { id },
      select: { id: true, senderUserId: true, originLocationId: true },
    });
    if (!existing) throw new NotFoundException('shipment not found');
    if (existing.senderUserId !== userId) {
      throw new ForbiddenException('cannot update a shipment you do not own');
    }

    if (
      dto.destinationLocationId !== undefined &&
      dto.destinationLocationId === existing.originLocationId
    ) {
      throw new BadRequestException('origin cannot equal destination');
    }

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: {
        destinationLocationId: dto.destinationLocationId,
        size: dto.size,
        expectedDeliveryAt: this.toDate(dto.expectedDeliveryAt),
      },
      include: { origin: true, destination: true },
    });

    return {
      ...updated,
      status: deriveStatus({
        pickupAt: updated.pickupAt,
        expectedDeliveryAt: updated.expectedDeliveryAt,
        deliveredAt: updated.deliveredAt,
      }),
    };
  }

  async remove(id: number, userId: number) {
    const existing = await this.prisma.shipment.findUnique({
      where: { id },
      select: {
        id: true,
        senderUserId: true,
        deliveredAt: true,
        pickupAt: true,
      },
    });
    if (!existing) throw new NotFoundException('shipment not found');
    if (existing.senderUserId !== userId) {
      throw new ForbiddenException('cannot delete a shipment you do not own');
    }
    if (existing.pickupAt) {
      throw new BadRequestException(
        'cannot delete a shipment after pickup; cancel instead',
      );
    }

    return this.prisma.shipment.delete({ where: { id } });
  }

  async markPickedUp(id: number, userId: number, at?: Date | string) {
    const existing = await this.prisma.shipment.findUnique({
      where: { id },
      select: { id: true, senderUserId: true },
    });
    if (!existing) throw new NotFoundException('shipment not found');
    if (existing.senderUserId !== userId) {
      throw new ForbiddenException('cannot update a shipment you do not own');
    }

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { pickupAt: this.toDate(at) ?? new Date() },
      include: { origin: true, destination: true },
    });

    return {
      ...updated,
      status: deriveStatus({
        pickupAt: updated.pickupAt,
        expectedDeliveryAt: updated.expectedDeliveryAt,
        deliveredAt: updated.deliveredAt,
      }),
    };
  }

  async markDelivered(id: number, userId: number, at?: Date | string) {
    const existing = await this.prisma.shipment.findUnique({
      where: { id },
      select: { id: true, senderUserId: true },
    });
    if (!existing) throw new NotFoundException('shipment not found');
    if (existing.senderUserId !== userId) {
      throw new ForbiddenException('cannot update a shipment you do not own');
    }

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { deliveredAt: this.toDate(at) ?? new Date() },
      include: { origin: true, destination: true },
    });

    return {
      ...updated,
      status: deriveStatus({
        pickupAt: updated.pickupAt,
        expectedDeliveryAt: updated.expectedDeliveryAt,
        deliveredAt: updated.deliveredAt,
      }),
    };
  }
}
