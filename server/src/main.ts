import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS'u tüm domainler için etkinleştir
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  console.log(`Server starting on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: port ${port}`);
}
bootstrap();
