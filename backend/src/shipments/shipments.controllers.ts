import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get(':userId')
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.shipments.findAll(userId);
  }

  @Post(':userId')
  create(@Param('userId', ParseIntPipe) userId: number, @Body() dto: any) {
    return this.shipments.create(userId, dto);
  }

  @Post('deliver/:id')
  markDelivered(@Param('id', ParseIntPipe) id: number) {
    return this.shipments.markDelivered(id);
  }
}
