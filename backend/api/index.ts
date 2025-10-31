import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Server } from 'node:http'

let cachedServer: Server

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule)

    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })

    await app.init()
    const expressApp = app.getHttpAdapter().getInstance()
    cachedServer = createServer(expressApp)
  }

  return cachedServer.emit('request', req, res)
}
