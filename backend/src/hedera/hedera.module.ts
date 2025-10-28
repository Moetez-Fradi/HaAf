import { Module } from '@nestjs/common';
import { HederaService } from './hedera.service';

@Module({
  providers: [HederaService]
})
export class HederaModule {}
