import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findFirst({
      where: { toolId: dto.toolId, userId },
    });
    if (existing) throw new BadRequestException('User already has a review for this tool');

    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) throw new NotFoundException('Tool not found');

    const review = await this.prisma.review.create({
      data: {
        toolId: dto.toolId,
        userId,
        stars: dto.stars,
        comment: dto.comment ?? null,
      },
    });

    const avg = await this.prisma.review.aggregate({
      where: { toolId: dto.toolId },
      _avg: { stars: true },
    });

    await this.prisma.tool.update({
      where: { id: dto.toolId },
      data: { rating: avg._avg?.stars ?? dto.stars },
    });

    return review;
  }

  async getToolReviewsWithComments(toolId: string) {
    const tool = await this.prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) throw new NotFoundException('Tool not found');

    return this.prisma.review.findMany({
      where: {
        toolId,
        comment: { not: null },
      },
      include: { user: { select: { id: true, displayName: true } } },
    });
  }

  async getToolReviewStats(toolId: string) {
    const tool = await this.prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) throw new NotFoundException('Tool not found');

    const [count, avg] = await Promise.all([
      this.prisma.review.count({ where: { toolId } }),
      this.prisma.review.aggregate({
        where: { toolId },
        _avg: { stars: true },
      }),
    ]);

    return {
      toolId,
      totalReviews: count,
      averageRating: avg._avg.stars ?? 0,
    };
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const rev = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!rev) throw new NotFoundException('Review not found');
    if (rev.userId !== userId) throw new ForbiddenException('Not owner of review');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { stars: dto.stars, comment: dto.comment ?? null },
    });

    const avg = await this.prisma.review.aggregate({
      where: { toolId: rev.toolId },
      _avg: { stars: true },
    });

    await this.prisma.tool.update({
      where: { id: rev.toolId },
      data: { rating: avg._avg?.stars ?? updated.stars },
    });

    return updated;
  }

  async deleteReview(reviewId: string, userId: string) {
    const rev = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!rev) throw new NotFoundException('Review not found');
    if (rev.userId !== userId) throw new ForbiddenException('Not owner of review');

    await this.prisma.review.delete({ where: { id: reviewId } });

    const avg = await this.prisma.review.aggregate({
      where: { toolId: rev.toolId },
      _avg: { stars: true },
    });

    await this.prisma.tool.update({
      where: { id: rev.toolId },
      data: { rating: avg._avg?.stars ?? null },
    });

    return { success: true };
  }

  async getReviewByUserAndTool(userId: string, toolId: string) {
    return this.prisma.review.findFirst({ where: { userId, toolId } });
  }
}
