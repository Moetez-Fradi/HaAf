import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    const maxRetries = 50; // max attempts
    const delayMs = 10000; // 3 seconds between retries
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await super.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (err) {
        attempt++;
        this.logger.warn(
          `Database connection failed (attempt ${attempt}/${maxRetries}): ${err.message}`,
        );
        if (attempt >= maxRetries) {
          this.logger.error('Max retries reached. Could not connect to database.');
          throw err;
        }
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await super.$disconnect();
  }
}
