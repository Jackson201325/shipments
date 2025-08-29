import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controllers';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ShipmentsController],
  providers: [],
})
export class ShipmentsModule {}
