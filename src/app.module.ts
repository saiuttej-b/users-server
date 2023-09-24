import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV, Environments } from './utils/config.constants';
import { mongoConfig } from './utils/mongoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        [ENV.TZ]: Joi.string().default('UTC'),
        [ENV.PORT]: Joi.number().default(8000),
        [ENV.PROJECT_ENV]: Joi.string().default(Environments.DEVELOPMENT),

        [ENV.MONGO_DB_HOST]: Joi.string().required(),
        [ENV.MONGO_DB_USERNAME]: Joi.string().required(),
        [ENV.MONGO_DB_PASSWORD]: Joi.string().required(),
        [ENV.MONGO_DB_DATABASE]: Joi.string().required(),

        [ENV.AWS_S3_SECRET_ACCESS_KEY]: Joi.string().required(),
        [ENV.AWS_S3_ACCESS_KEY_ID]: Joi.string().required(),
        [ENV.AWS_S3_REGION]: Joi.string().required(),
        [ENV.AWS_S3_BUCKET_NAME]: Joi.string().required(),
        [ENV.AWS_S3_BUCKET_BASE_URL]: Joi.string().required(),
      }).unknown(true),
    }),
    MongooseModule.forRoot(mongoConfig().MONGO_URI, {
      autoIndex: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
