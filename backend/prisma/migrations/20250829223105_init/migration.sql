-- CreateEnum
CREATE TYPE "public"."PackageSize" AS ENUM ('S', 'M', 'L', 'XL');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shipment" (
    "id" SERIAL NOT NULL,
    "senderUserId" INTEGER NOT NULL,
    "originLocationId" INTEGER NOT NULL,
    "destinationLocationId" INTEGER NOT NULL,
    "size" "public"."PackageSize" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickupAt" TIMESTAMP(3),
    "expectedDeliveryAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Location_lat_lng_idx" ON "public"."Location"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Location_userId_nickname_key" ON "public"."Location"("userId", "nickname");

-- CreateIndex
CREATE INDEX "Shipment_senderUserId_idx" ON "public"."Shipment"("senderUserId");

-- CreateIndex
CREATE INDEX "Shipment_originLocationId_idx" ON "public"."Shipment"("originLocationId");

-- CreateIndex
CREATE INDEX "Shipment_destinationLocationId_idx" ON "public"."Shipment"("destinationLocationId");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_originLocationId_fkey" FOREIGN KEY ("originLocationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
