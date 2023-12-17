import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { ENV, Environments } from './utils/config.constants';
import { storeMiddleWare } from './utils/request-store/request-store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors((req, callback) => {
    callback(null, {
      origin: req.header('origin'),
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });
  });

  app.use(storeMiddleWare);

  app.use(json({ limit: '100mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  if (configService.get(ENV.PROJECT_ENV) === Environments.DEVELOPMENT) {
    mongoose.set('debug', { color: true, shell: true });
  }

  mongoose.set('toJSON', { virtuals: true, getters: true, versionKey: false });
  mongoose.set('toObject', {
    virtuals: true,
    getters: true,
    versionKey: false,
  });

  const port = parseInt(configService.get(ENV.PORT), 10) || 8001;
  await app.listen(port).then(() => {
    console.log(`NestJs Project is running on port ${port}`);
  });
}
bootstrap();
