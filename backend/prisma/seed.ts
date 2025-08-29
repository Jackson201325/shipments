/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const now = new Date();
const hoursFromNow = (h) => new Date(now.getTime() + h * 3600 * 1000);

async function main() {
  const [u1, u2] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: { email: 'alice@example.com', name: 'Alice' },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: { email: 'bob@example.com', name: 'Bob' },
    }),
  ]);

  const locations = await prisma.$transaction([
    prisma.location.create({
      data: {
        userId: u1.id,
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
        userId: u1.id,
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
        userId: u1.id,
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
        userId: u2.id,
        nickname: 'Home',
        address1: '10 Market St',
        city: 'Valencia',
        country: 'ES',
        lat: 39.4699,
        lng: -0.3763,
      },
    }),
    prisma.location.create({
      data: {
        userId: u2.id,
        nickname: 'Office',
        address1: '11 Office Rd',
        city: 'Seville',
        country: 'ES',
        lat: 37.3891,
        lng: -5.9845,
      },
    }),
    prisma.location.create({
      data: {
        userId: u2.id,
        nickname: 'Warehouse',
        address1: '12 Docks',
        city: 'Bilbao',
        country: 'ES',
        lat: 43.263,
        lng: -2.935,
      },
    }),
  ]);

  const [aHome, aOffice, aWh, bHome, bOffice, bWh] = locations;

  const createShipment = (data) => {
    if (data.originLocationId === data.destinationLocationId) {
      throw new Error('origin cannot equal destination');
    }
    return prisma.shipment.create({ data });
  };

  await Promise.all([
    // In Transit
    createShipment({
      senderUserId: u1.id,
      originLocationId: aHome.id,
      destinationLocationId: aWh.id,
      size: 'M',
      pickupAt: hoursFromNow(-2),
      expectedDeliveryAt: hoursFromNow(6),
      deliveredAt: null,
      notes: 'Books',
    }),

    // On Time
    createShipment({
      senderUserId: u1.id,
      originLocationId: aOffice.id,
      destinationLocationId: bHome.id,
      size: 'S',
      pickupAt: hoursFromNow(-10),
      expectedDeliveryAt: hoursFromNow(-2),
      deliveredAt: hoursFromNow(-3),
      notes: 'Small parcel',
    }),

    // Delayed
    createShipment({
      senderUserId: u1.id,
      originLocationId: aWh.id,
      destinationLocationId: bOffice.id,
      size: 'XL',
      pickupAt: hoursFromNow(-20),
      expectedDeliveryAt: hoursFromNow(-5),
      deliveredAt: hoursFromNow(-1),
      notes: 'Furniture',
    }),

    // In Transit
    createShipment({
      senderUserId: u2.id,
      originLocationId: bHome.id,
      destinationLocationId: aHome.id,
      size: 'L',
      pickupAt: hoursFromNow(-1),
      expectedDeliveryAt: hoursFromNow(12),
      deliveredAt: null,
      notes: 'Clothes',
    }),

    // On Time
    createShipment({
      senderUserId: u2.id,
      originLocationId: bOffice.id,
      destinationLocationId: aOffice.id,
      size: 'M',
      pickupAt: hoursFromNow(-8),
      expectedDeliveryAt: hoursFromNow(-1),
      deliveredAt: hoursFromNow(-1),
      notes: 'Docs',
    }),

    // Delayed
    createShipment({
      senderUserId: u2.id,
      originLocationId: bWh.id,
      destinationLocationId: aWh.id,
      size: 'S',
      pickupAt: hoursFromNow(-30),
      expectedDeliveryAt: hoursFromNow(-10),
      deliveredAt: hoursFromNow(-2),
      notes: 'Gadgets',
    }),

    // Scheduled (not picked up yet) – you can treat as In Transit only after pickup
    createShipment({
      senderUserId: u1.id,
      originLocationId: aHome.id,
      destinationLocationId: bWh.id,
      size: 'XL',
      pickupAt: hoursFromNow(5),
      expectedDeliveryAt: hoursFromNow(24),
      deliveredAt: null,
      notes: 'Scheduled pickup',
    }),

    // Another On Time
    createShipment({
      senderUserId: u2.id,
      originLocationId: bHome.id,
      destinationLocationId: aOffice.id,
      size: 'L',
      pickupAt: hoursFromNow(-15),
      expectedDeliveryAt: hoursFromNow(-2),
      deliveredAt: hoursFromNow(-2),
      notes: 'Hardware',
    }),
  ]);

  console.log('✅ Seeded users, locations, and shipments');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
