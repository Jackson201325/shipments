import {
  CreateShipmentSchema,
  UpdateShipmentSchema,
  type CreateShipment,
  type UpdateShipment,
} from '@app/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ShipmentsService } from './shipments.service';

const ShipmentStatusSchema = z.enum(['In Transit', 'On Time', 'Delayed']);
const ListShipmentsQuerySchema = z.object({
  userId: z.coerce.number().int().positive(),
  status: ShipmentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
type ListShipmentsQuery = z.infer<typeof ListShipmentsQuerySchema>;

const UserIdOnlySchema = z.object({
  userId: z.coerce.number().int().positive(),
});
type UserIdOnly = z.infer<typeof UserIdOnlySchema>;
const UpdateWithUserIdSchema = UpdateShipmentSchema.extend({
  userId: z.coerce.number().int().positive(),
});
type UpdateWithUserId = z.infer<typeof UpdateWithUserIdSchema>;

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ListShipmentsQuerySchema))
    q: ListShipmentsQuery,
  ) {
    const { userId, status, page, perPage } = q;
    return this.shipments.findAll({ userId, status, page, perPage });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipments.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateShipmentSchema)) dto: CreateShipment,
  ) {
    return this.shipments.create(dto.senderUserId, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateWithUserIdSchema)) dto: UpdateWithUserId,
  ) {
    const { userId, ...rest } = dto as UpdateShipment & { userId: number };
    return this.shipments.update(id, userId, rest);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UserIdOnlySchema)) body: UserIdOnly,
  ) {
    return this.shipments.remove(id, body.userId);
  }

  @Post(':id/pickup')
  pickup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UserIdOnlySchema)) body: UserIdOnly,
  ) {
    return this.shipments.markPickedUp(id, body.userId);
  }

  @Post(':id/deliver')
  deliver(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UserIdOnlySchema)) body: UserIdOnly,
  ) {
    return this.shipments.markDelivered(id, body.userId);
  }
}
