import { z } from "zod";

const PackageSizeSchema = z.enum(["S", "M", "L", "XL"]);

export const ShipmentSchema = z.object({
  id: z.number(),
  size: PackageSizeSchema,
  pickupAt: z.string().nullable(),
  expectedDeliveryAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
});

export const PaginatedShipments = z.array(ShipmentSchema);

const DateLikeNullable = z.union([z.date(), z.string().datetime()]).nullable();

export const CreateShipmentSchema = z
  .object({
    originLocationId: z.number().int().positive(),
    destinationLocationId: z.number().int().positive(),
    size: PackageSizeSchema,
    pickupAt: DateLikeNullable.optional(),
    expectedDeliveryAt: DateLikeNullable.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.originLocationId === val.destinationLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "originLocationId cannot equal destinationLocationId",
        path: ["destinationLocationId"],
      });
    }
  });

export const UpdateShipmentSchema = z.object({
  destinationLocationId: z.number().int().positive().optional(),
  size: PackageSizeSchema.optional(),
  expectedDeliveryAt: DateLikeNullable.optional(),
});

export type CreateShipment = z.infer<typeof CreateShipmentSchema>;
export type UpdateShipment = z.infer<typeof UpdateShipmentSchema>;
export type PackageSize = z.infer<typeof PackageSizeSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).nullable().optional(),
  createdAt: z.string(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).nullable().optional(),
});

export const UsersArraySchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const APILocationSchema = z.object({
  id: z.number().int().positive(),
  nickname: z.string(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string(),
  state: z.string().optional().nullable(),
  country: z.string(),
  postalCode: z.string().optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.string().optional().nullable(),
});

export const APIShipmentSchema = ShipmentSchema.extend({
  origin: APILocationSchema.nullable(),
  destination: APILocationSchema.nullable(),
});

export const APIShipmentsArraySchema = z.array(APIShipmentSchema);

export type APILocation = z.infer<typeof APILocationSchema>;
export type APIShipment = z.infer<typeof APIShipmentSchema>;
