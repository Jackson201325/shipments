import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateShipmentSchema, UpdateShipmentSchema } from '@app/shared';
import { deriveStatus } from '@app/shared';

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
type ListQuery = z.infer<typeof ListQuerySchema>;

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly supa: SupabaseService) {}

  @Get()
  async list(
    @Headers('authorization') auth: string | undefined,
    @Query(new ZodValidationPipe(ListQuerySchema)) q: ListQuery,
  ) {
    const offset = (q.page - 1) * q.perPage;
    const rows = await this.supa.listShipments(auth!, q.perPage, offset);
    return rows.map((s: any) => ({
      ...s,
      status: deriveStatus({
        pickupAt: s.pickupAt,
        expectedDeliveryAt: s.expectedDeliveryAt,
        deliveredAt: s.deliveredAt,
      }),
    }));
  }

  @Get(':id')
  async findOne(
    @Headers('authorization') auth: string | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const s = await this.supa.getShipment(auth!, id);
    if (!s) return null;
    return {
      ...s,
      status: deriveStatus({
        pickupAt: s.pickupAt,
        expectedDeliveryAt: s.expectedDeliveryAt,
        deliveredAt: s.deliveredAt,
      }),
    };
  }

  @Post()
  create(
    @Headers('authorization') auth: string | undefined,
    @Body(new ZodValidationPipe(CreateShipmentSchema)) body: any,
  ) {
    return this.supa.createShipment(auth!, body);
  }

  @Patch(':id')
  update(
    @Headers('authorization') auth: string | undefined,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateShipmentSchema)) body: any,
  ) {
    return this.supa.updateShipment(auth!, id, body);
  }

  @Delete(':id')
  remove(
    @Headers('authorization') auth: string | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supa.deleteShipment(auth!, id);
  }

  @Post(':id/pickup')
  pickup(
    @Headers('authorization') auth: string | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supa.updateShipment(auth!, id, {
      pickupAt: new Date().toISOString(),
    });
  }

  @Post(':id/deliver')
  deliver(
    @Headers('authorization') auth: string | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supa.updateShipment(auth!, id, {
      deliveredAt: new Date().toISOString(),
    });
  }
}
