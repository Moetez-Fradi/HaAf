import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ReviewService],
  controllers: [ReviewController],
  imports: [PrismaModule]
})
export class ReviewModule {}
