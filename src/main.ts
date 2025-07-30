import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  const frontendUrl = configService.get<string>('FRONTEND_URL');

  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  if (frontendUrl) {
    origins.unshift(frontendUrl);
  }

  // Enable CORS
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Tournament Management System API')
    .setDescription('API for managing tournament teams, players, matches, and payments')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Admin authentication endpoints')
    .addTag('Teams', 'Team registration and management')
    .addTag('Players', 'Player management')
    .addTag('Matches', 'Match scheduling and results')
    .addTag('Payments', 'Payment processing')
    .addTag('App', 'Application health and status')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Ensure uploads directory exists
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Tournament API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
