import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export class RegistrationRequestDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string;
}

export const UserRegistrationCName = 'user_registration_requests';
export type UserRegistrationRequestDocument = HydratedDocument<UserRegistrationRequest>;

@Schema({ collection: UserRegistrationCName, timestamps: true })
export class UserRegistrationRequest {
  @Prop({ required: true, trim: true })
  id: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  emailOtp: string;

  @Prop()
  emailOtpExpiresAt: Date;

  @Prop({ default: false })
  emailOtpVerified: boolean;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta: RegistrationRequestDto;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserRegistrationRequestSchema = SchemaFactory.createForClass(UserRegistrationRequest);
UserRegistrationRequestSchema.index({ id: 1 }, { unique: true });
UserRegistrationRequestSchema.index({ email: 1 });
