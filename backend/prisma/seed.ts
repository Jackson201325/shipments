// prisma/seed.ts
import { PrismaClient, Prisma, PackageSize } from '@prisma/client';

const prisma = new PrismaClient();
const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 3600 * 1000);

async function clearAll() {
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Shipment", "Location", "User" RESTART IDENTITY CASCADE;
    `);
  } catch (e) {
    console.warn('TRUNCATE failed, falling back to deleteMany');
    await prisma.shipment.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
  }
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Removed "scheduled", added "delivered"
type Kind = 'inTransit' | 'onTime' | 'delayed' | 'delivered';

function makeShipmentData(
  senderUserId: number,
  originId: number,
  destinationId: number,
): Prisma.ShipmentCreateInput {
  if (originId === destinationId) {
    throw new Error('origin cannot equal destination');
  }

  const kind: Kind = rand(['inTransit', 'onTime', 'delayed', 'delivered']);

  let pickupAt: Date | null = null;
  let expectedDeliveryAt: Date | null = null;
  let deliveredAt: Date | null = null;

  switch (kind) {
    case 'inTransit':
      pickupAt = h(-Math.floor(Math.random() * 24));
      expectedDeliveryAt = h(Math.floor(Math.random() * 24) + 2);
      deliveredAt = null;
      break;

    case 'onTime':
      pickupAt = h(-Math.floor(Math.random() * 48));
      expectedDeliveryAt = h(-Math.floor(Math.random() * 12));
      deliveredAt = expectedDeliveryAt; // delivered on time
      break;

    case 'delayed':
      pickupAt = h(-Math.floor(Math.random() * 72));
      expectedDeliveryAt = h(-Math.floor(Math.random() * 24));
      deliveredAt = h(-Math.floor(Math.random() * 5)); // delivered after deadline
      break;

    case 'delivered':
      pickupAt = h(-Math.floor(Math.random() * 72));
      expectedDeliveryAt = h(-Math.floor(Math.random() * 48));
      if (Math.random() < 0.5) {
        deliveredAt = expectedDeliveryAt; // on time
      } else {
        deliveredAt = h(-Math.floor(Math.random() * 5)); // late
      }
      break;
  }

  return {
    size: rand<PackageSize>(['S', 'M', 'L', 'XL']),
    pickupAt,
    expectedDeliveryAt,
    deliveredAt,
    sender: { connect: { id: senderUserId } },
    origin: { connect: { id: originId } },
    destination: { connect: { id: destinationId } },
  };
}

async function createManyWithConnect(
  rows: Prisma.ShipmentCreateInput[],
  chunk = 100,
) {
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    await prisma.$transaction(
      slice.map((d) => prisma.shipment.create({ data: d })),
    );
  }
}

async function main() {
  await clearAll();

  const [alice, bob] = await prisma.$transaction([
    prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice' } }),
    prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob' } }),
  ]);

  const [aHome, aOffice, aWh, bHome, bOffice, bWh] = await prisma.$transaction([
    prisma.location.create({
      data: {
        userId: alice.id,
        nickname: 'Home',
        address1: '1 Main St',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
      },
    }),
    prisma.location.create({
      data: {
        userId: alice.id,
        nickname: 'Office',
        address1: '2 Gran Via',
        city: 'Madrid',
        country: 'ES',
        lat: 40.42,
        lng: -3.705,
      },
    }),
    prisma.location.create({
      data: {
        userId: alice.id,
        nickname: 'Warehouse',
        address1: '3 Calle A',
        city: 'Barcelona',
        country: 'ES',
        lat: 41.3874,
        lng: 2.1686,
      },
    }),
    prisma.location.create({
      data: {
        userId: bob.id,
        nickname: 'Home',
        address1: '10 Market',
        city: 'Valencia',
        country: 'ES',
        lat: 39.4699,
        lng: -0.3763,
      },
    }),
    prisma.location.create({
      data: {
        userId: bob.id,
        nickname: 'Office',
        address1: '11 Office',
        city: 'Seville',
        country: 'ES',
        lat: 37.3891,
        lng: -5.9845,
      },
    }),
    prisma.location.create({
      data: {
        userId: bob.id,
        nickname: 'Warehouse',
        address1: '12 Docks',
        city: 'Bilbao',
        country: 'ES',
        lat: 43.263,
        lng: -2.935,
      },
    }),
  ]);

  const aliceLocs = [aHome.id, aOffice.id, aWh.id];
  const bobLocs = [bHome.id, bOffice.id, bWh.id];

  const shipments: Prisma.ShipmentCreateInput[] = [];
  const COUNT_PER_USER = 120;

  for (let i = 1; i <= COUNT_PER_USER; i++) {
    const origin = rand(aliceLocs);
    const dest = rand(bobLocs);
    if (origin !== dest)
      shipments.push(makeShipmentData(alice.id, origin, dest));
  }

  for (let i = 1; i <= COUNT_PER_USER; i++) {
    const origin = rand(bobLocs);
    const dest = rand(aliceLocs);
    if (origin !== dest) shipments.push(makeShipmentData(bob.id, origin, dest));
  }

  await createManyWithConnect(shipments, 100);

  console.log(`✅ Seeded ${shipments.length} shipments for Alice and Bob`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
