import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ErrorCode } from './common/exceptions/error-codes/error.code';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Enable validation globally with transformation and custom exception factory
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) =>
        new HttpException(
          {
            message: 'The provided data is invalid!',
            code: ErrorCode.INVALID_DATA,
            details: errors,
          },
          HttpStatus.BAD_REQUEST,
        ),
    }),
  );

  // Enable swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TDG Management API Documentation')
    .setContact('Mohamed Awedi', 'api', 'mohamedawedi@tawer.tn')
    .setDescription('TDG Management API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth() // Add Bearer token authentication
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
