import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { ShipmentsService } from '../shipments.service';

// We can test the real deriveStatus behavior through the service
// (no need to mock the util), but feel free to mock it if desired.

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let prisma: { shipment: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      shipment: {
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('maps shipments and attaches derived status (On Time, Delayed, In Transit)', async () => {
    const now = new Date();

    prisma.shipment.findMany.mockResolvedValue([
      // On Time
      {
        id: 1,
        senderUserId: 10,
        originLocationId: 1,
        destinationLocationId: 2,
        size: 'S',
        createdAt: now,
        pickupAt: new Date(now.getTime() - 10 * 3600_000),
        expectedDeliveryAt: new Date(now.getTime() - 2 * 3600_000),
        deliveredAt: new Date(now.getTime() - 3 * 3600_000),
        notes: 'ot',
        origin: {},
        destination: {},
      },
      // Delayed
      {
        id: 2,
        senderUserId: 10,
        originLocationId: 1,
        destinationLocationId: 2,
        size: 'M',
        createdAt: now,
        pickupAt: new Date(now.getTime() - 6 * 3600_000),
        expectedDeliveryAt: new Date(now.getTime() - 2 * 3600_000),
        deliveredAt: new Date(now.getTime() - 30 * 60_000),
        notes: 'late',
        origin: {},
        destination: {},
      },
      // In Transit (picked up, not delivered)
      {
        id: 3,
        senderUserId: 10,
        originLocationId: 1,
        destinationLocationId: 2,
        size: 'L',
        createdAt: now,
        pickupAt: new Date(now.getTime() - 1 * 3600_000),
        expectedDeliveryAt: new Date(now.getTime() + 6 * 3600_000),
        deliveredAt: null,
        notes: 'moving',
        origin: {},
        destination: {},
      },
    ]);

    const result = await service.findAll(10);

    expect(prisma.shipment.findMany).toHaveBeenCalledWith({
      where: { senderUserId: 10 },
      include: { origin: true, destination: true },
    });

    const byId = Object.fromEntries(result.map((s) => [s.id, s.status]));
    expect(byId[1]).toBe('On Time');
    expect(byId[2]).toBe('Delayed');
    expect(byId[3]).toBe('In Transit');
  });
});
