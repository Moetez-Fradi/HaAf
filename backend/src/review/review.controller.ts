import { Controller, Post, Body, UseGuards, Request, Put, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(req.user.id, dto);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.updateReview(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.reviewService.deleteReview(id, req.user.id);
  }
}
