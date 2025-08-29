import { z } from "zod";

export const PackageSizeSchema = z.enum(["S", "M", "L", "XL"]);

export const ShipmentSchema = z.object({
  id: z.number(),
  size: PackageSizeSchema,
  notes: z.string().nullable(),
  pickupAt: z.string().nullable(),
  expectedDeliveryAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
});

export const ShipmentsPageSchema = z.array(ShipmentSchema);

export type Shipment = z.infer<typeof ShipmentSchema>;
