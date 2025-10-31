  import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
  import { PrismaClient } from '@prisma/client';

  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
      super();
    }

    async onModuleInit() {
      await super.$connect();
    }

    async onModuleDestroy() {
      await super.$disconnect();
    }
  }
