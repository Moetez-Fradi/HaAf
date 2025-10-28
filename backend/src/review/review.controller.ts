import { Controller, Post, Body, UseGuards, Request, Put, Param, Delete, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('tool/:toolId/comments')
  async getToolReviewsWithComments(@Param('toolId') toolId: string) {
    return this.reviewService.getToolReviewsWithComments(toolId);
  }

  @Get('tool/:toolId/stats')
  async getToolReviewStats(@Param('toolId') toolId: string) {
    return this.reviewService.getToolReviewStats(toolId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.updateReview(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.reviewService.deleteReview(id, req.user.id);
  }
}
