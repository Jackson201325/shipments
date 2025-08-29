import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { LocationsService } from '../locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: {
    location: {
      findMany: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      location: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LocationsService);
  });

  it('findAll filters by userId', async () => {
    prisma.location.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await service.findAll(42);
    expect(prisma.location.findMany).toHaveBeenCalledWith({
      where: { userId: 42 },
    });
    expect(res).toHaveLength(2);
  });

  it('create attaches userId', async () => {
    prisma.location.create.mockResolvedValue({ id: 9, userId: 42 });
    const dto = {
      nickname: 'Home',
      address1: '1 Main',
      city: 'Madrid',
      country: 'ES',
      lat: 1,
      lng: 2,
    };
    const res = await service.create(42, dto);
    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 42 },
    });
    expect(res).toEqual({ id: 9, userId: 42 });
  });

  it('remove passes id to delete', async () => {
    prisma.location.delete.mockResolvedValue({ id: 7 });
    const res = await service.remove(7);
    expect(prisma.location.delete).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(res).toEqual({ id: 7 });
  });
});
