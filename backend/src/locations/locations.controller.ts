import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get(':userId')
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.locations.findAll(userId);
  }

  @Post(':userId')
  create(@Param('userId', ParseIntPipe) userId: number, @Body() dto: any) {
    return this.locations.create(userId, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locations.remove(id);
  }
}
