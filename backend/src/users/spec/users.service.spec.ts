import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../database/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return a user by email', async () => {
    const mockUser = { id: 1, email: 'alice@example.com', name: 'Alice' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.findByEmail('alice@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'alice@example.com' },
    });
    expect(result).toEqual(mockUser);
  });

  it('should return null if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await service.findByEmail('doesnotexist@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'doesnotexist@example.com' },
    });
    expect(result).toBeNull();
  });
});
