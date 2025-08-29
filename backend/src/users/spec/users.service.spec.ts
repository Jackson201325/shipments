// backend/src/users/spec/users.service.spec.ts
import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../database/prisma.service';
import { UserSchema } from '@app/shared';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } } as any;

    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  it('should return a user by email (validated by shared schema)', async () => {
    const now = new Date();
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      createdAt: now,
    });

    const result = await service.findByEmail('alice@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'alice@example.com' },
    });

    // Validate shape using @app/shared
    const parsed = UserSchema.parse(result);
    expect(parsed).toEqual({
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      createdAt: now.toISOString(),
    });
  });

  it('should return null if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.findByEmail('doesnotexist@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'doesnotexist@example.com' },
    });
    expect(result).toBeNull();
  });
});
