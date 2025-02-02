import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { config as configVars } from 'src/config';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from 'src/shared-kernel/exceptions/api-response.exception.filter';
import { MicroserviceOptions } from '@nestjs/microservices';
import { irysKafkaConfig } from './kafka/irys/irys.kafka-config';
import { fastPostKafkaConfig } from './kafka/fast-post/fast-post.kafka-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** Global Exception Handler */
  app.useGlobalFilters(new GlobalExceptionFilter());

  /** Data size limits */
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
          frameAncestors: ["'none'"], // alternate to x-frame-options
        },
      },
    }),
  );

  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true, // Apply HSTS to all subdomains
      preload: true, // Enable preload
    }),
  );

  /** BACKEND CONFIGS */
  // For handling validation of input datas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(configVars.APP_BACKEND_PREFIX);

  app.connectMicroservice<MicroserviceOptions>(irysKafkaConfig());
  app.connectMicroservice<MicroserviceOptions>(fastPostKafkaConfig());

  await app.listen(configVars.PORT);
}
bootstrap();
