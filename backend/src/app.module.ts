import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DevModule } from './dev/dev.module';
import { LocationsModule } from './locations/locations.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    ShipmentsModule,
    DevModule,
    LocationsModule,
  ],
})
export class AppModule {}
