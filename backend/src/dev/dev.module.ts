import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DevController],
})
export class DevModule {}
