import { Test } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import { ShipmentsController } from '../shipments.controllers';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  const supa = {
    listShipments: jest.fn(),
    getShipment: jest.fn(),
    createShipment: jest.fn(),
    updateShipment: jest.fn(),
    deleteShipment: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [{ provide: SupabaseService, useValue: supa }],
    }).compile();

    controller = module.get(ShipmentsController);
    jest.resetAllMocks();
  });

  it('GET /shipments maps derived status + pagination', async () => {
    const now = new Date();
    supa.listShipments.mockResolvedValue([
      {
        id: 1,
        size: 'S',
        notes: null,
        pickupAt: new Date(now.getTime() - 2 * 3600_000).toISOString(),
        expectedDeliveryAt: new Date(
          now.getTime() - 1 * 3600_000,
        ).toISOString(),
        deliveredAt: new Date(now.getTime() - 90 * 60_000).toISOString(),
      },
      {
        id: 2,
        size: 'M',
        notes: null,
        pickupAt: new Date(now.getTime() - 5 * 3600_000).toISOString(),
        expectedDeliveryAt: new Date(
          now.getTime() - 2 * 3600_000,
        ).toISOString(),
        deliveredAt: new Date(now.getTime() - 30 * 60_000).toISOString(),
      },
      {
        id: 3,
        size: 'L',
        notes: null,
        pickupAt: new Date(now.getTime() - 1 * 3600_000).toISOString(),
        expectedDeliveryAt: new Date(
          now.getTime() + 6 * 3600_000,
        ).toISOString(),
        deliveredAt: null,
      },
    ]);

    const auth = 'Bearer test.jwt';
    const res = await controller.list(auth, { page: 2, perPage: 20 }); // Zod sets defaults etc.

    // controller should have asked for offset 20 (page 2)
    expect(supa.listShipments).toHaveBeenCalledWith(auth, 20, 20);

    const byId = Object.fromEntries(res.map((s: any) => [s.id, s.status]));
    expect(byId[1]).toBe('On Time');
    expect(byId[2]).toBe('Delayed');
    expect(byId[3]).toBe('In Transit');
  });

  it('GET /shipments/:id maps derived status', async () => {
    supa.getShipment.mockResolvedValue({
      id: 10,
      pickupAt: null,
      expectedDeliveryAt: null,
      deliveredAt: new Date().toISOString(),
    });

    const out = await controller.findOne('Bearer t', 10);
    expect(out.status).toBe('On Time');
    expect(supa.getShipment).toHaveBeenCalledWith('Bearer t', 10);
  });
});
