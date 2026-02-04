import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function - Application entry point
 * 
 * Key configurations:
 * 1. ValidationPipe - Auto-validates DTOs using class-validator
 * 2. CORS - Allows frontend to call API
 * 3. API Prefix - All routes prefixed with /api
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  // Automatically validates all incoming requests against DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true,        // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types (string to number)
      },
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'], // Frontend URLs
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // API prefix - all routes will be /api/...
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();

