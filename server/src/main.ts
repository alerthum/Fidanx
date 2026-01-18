import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix - Vercel ve standart uyumluluk için
  app.setGlobalPrefix('api');

  // CORS'u tüm domainler için etkinleştir
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Yapılandırması
  const config = new DocumentBuilder()
    .setTitle('Fidanx API')
    .setDescription('Fidanx Üretim ve Takip Sistemi API Dokümantasyonu')
    .setVersion('1.0')
    .addTag('production', 'Üretim Süreçleri')
    .addTag('recipes', 'Bakım Reçeteleri')
    .addTag('plants', 'Bitki ve Ana Ağaç Yönetimi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3201; // Vercel için dinamik, local için 3201
  console.log(`\n\n[FIDANX] Server starting on port ${port}...`);
  if (!process.env.PORT) {
    console.log(`[FIDANX] Swagger Docs: http://localhost:${port}/api\n\n`);
  }

  await app.listen(port, '0.0.0.0');
}
bootstrap();
