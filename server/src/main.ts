import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/custom-validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  if (process.env.NODE_ENV != 'production') {
    const config = new DocumentBuilder()
      .setTitle('Chatkub API')
      .setDescription('Chatkub API 1.0')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://49.231.43.101:5173',
        'https://chatkub.com',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  await app.listen(5000);
}
bootstrap();
