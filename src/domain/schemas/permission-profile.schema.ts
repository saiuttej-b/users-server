import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getSetDefaultFn } from 'src/utils/util-functions';
import { User } from './user.schema';

@Schema({ _id: false })
export class Permission {
  @Prop({ required: true, uppercase: true, trim: true })
  name: string;

  @Prop({ default: [], set: getSetDefaultFn([]) })
  actions: string[];
}
const PermissionSchema = SchemaFactory.createForClass(Permission);

export const PermissionProfileCName = 'permission_profiles';
export type PermissionProfileDocument = HydratedDocument<PermissionProfile>;

@Schema({ collection: PermissionProfileCName })
export class PermissionProfile {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, uppercase: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: [PermissionSchema], default: [], set: getSetDefaultFn([]) })
  permissions: Permission[];

  @Prop()
  createdById: string;

  @Prop()
  updatedById: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  createdBy?: User;

  updatedBy?: User;
}

export const PermissionProfileSchema = SchemaFactory.createForClass(PermissionProfile);
PermissionProfileSchema.index({ id: -1 }, { unique: true });
PermissionProfileSchema.index({ name: 1 }, { unique: true });

export const PermissionProfileSubSchema = SchemaFactory.createForClass(PermissionProfile);
PermissionProfileSubSchema.index({ id: 1 });
