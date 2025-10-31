import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ha-af-jqu4.vercel.app',
    'https://ha-af-jqu4-d7n2ifui0-sewey69s-projects.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
