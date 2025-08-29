import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateUserSchema, type CreateUser } from '@app/shared';
import { z } from 'zod';

const FindByQuerySchema = z.object({
  email: z.string().email().optional(),
});
type FindByQuery = z.infer<typeof FindByQuerySchema>;

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUser) {
    return this.users.create(dto);
  }

  @Get()
  findByQuery(@Query(new ZodValidationPipe(FindByQuerySchema)) q: FindByQuery) {
    if (q.email) return this.users.findByEmail(q.email);
    return this.users.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}
