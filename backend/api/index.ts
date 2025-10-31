import { createServer } from 'http';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Server } from 'http';

let server: Server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.init();

  server = createServer((req, res) => app.getHttpAdapter().getInstance()(req, res));
}

bootstrap();

export default async function handler(req: any, res: any) {
  if (!server) await bootstrap();
  server.emit('request', req, res);
}
