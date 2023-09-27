import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { keyBy, uniq } from 'lodash';
import { FilterQuery, Model } from 'mongoose';
import { PermissionProfileGetDto } from 'src/permission-profiles/dtos/permission-profiles.dto';
import { EditOptions } from 'src/utils/mongoose.config';
import { generateTimestampId } from 'src/utils/util-functions';
import { PermissionProfileRepository } from '../repositories/permission-profile.repository';
import { UserRepository } from '../repositories/user.repository';
import { PermissionProfile, PermissionProfileDocument } from '../schemas/permission-profile.schema';

@Injectable()
export class MongoDBPermissionProfileRepository implements PermissionProfileRepository {
  constructor(
    @InjectModel(PermissionProfile.name) private readonly model: Model<PermissionProfile>,
    private readonly userRepo: UserRepository,
  ) {}

  instance(data?: Partial<PermissionProfile>): PermissionProfile {
    const profile = new PermissionProfile();
    if (data) Object.assign(profile, data);
    if (!profile.id) profile.id = generateTimestampId();

    return profile;
  }

  async create(profile: PermissionProfile, options?: EditOptions): Promise<PermissionProfile> {
    if (!profile.id) profile.id = generateTimestampId();

    if (options?.updatedById) profile.updatedById = options.updatedById;

    const record = await new this.model(profile).save();
    return this.convert(record);
  }

  async save(profile: PermissionProfile, options?: EditOptions): Promise<PermissionProfile> {
    if (!profile.id) return this.create(profile, options);

    const previous = await this.model.findOne({ id: profile.id }).exec();
    if (!previous) return this.create(profile, options);

    Object.assign(previous, profile);
    if (options?.updatedById) profile.updatedById = options.updatedById;

    const record = await previous.save();
    return this.convert(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findByName(props: { name: string; excludedId?: string }): Promise<PermissionProfile> {
    const record = await this.model
      .findOne({ name: props.name, ...(props.excludedId ? { id: { $ne: props.excludedId } } : {}) })
      .exec();
    return this.convert(record);
  }

  async findById(id: string): Promise<PermissionProfile> {
    const record = await this.model.findOne({ id }).exec();
    return this.convert(record);
  }

  async find(
    query: PermissionProfileGetDto,
  ): Promise<{ count: number; permissionProfiles: PermissionProfile[] }> {
    const filters: FilterQuery<PermissionProfileDocument> = {
      ...(query.search ? { name: { $regex: query.search, $options: 'i' } } : {}),
      ...(query.id ? { id: query.id } : {}),
    };

    const [recordCount, records] = await Promise.all([
      query.limit || query.page ? this.model.countDocuments(filters).exec() : 0,
      this.model.find(filters).sort({ name: 1 }).exec(),
    ]);

    const count = recordCount || records.length;
    const permissionProfiles = this.convert(records);

    if (!query.isSearch) {
      const userIds = permissionProfiles
        .map((p) => [p.createdById, p.updatedById])
        .flat()
        .filter(Boolean);
      const users = await this.userRepo.findByIds(uniq(userIds));
      const userMap = keyBy(users, (v) => v.id);

      permissionProfiles.forEach((p) => {
        p.createdBy = userMap[p.createdById];
        p.updatedBy = userMap[p.updatedById];
      });
    }

    return {
      count: count,
      permissionProfiles: permissionProfiles,
    };
  }

  private convert(value: PermissionProfileDocument): PermissionProfile;
  private convert(value: PermissionProfileDocument[]): PermissionProfile[];
  private convert(
    value: PermissionProfileDocument | PermissionProfileDocument[],
  ): PermissionProfile | PermissionProfile[] {
    if (!value) return;
    if (Array.isArray(value)) return value.map((v) => this.convert(v));

    const profile = new PermissionProfile();
    Object.assign(profile, value.toJSON());

    delete profile['_id'];
    delete profile['__v'];
    return profile;
  }
}
