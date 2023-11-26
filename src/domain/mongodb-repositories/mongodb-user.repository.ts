import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UsersGetDto } from 'src/users/dtos/users.dto';
import { generateTimestampId } from 'src/utils/util-functions';
import { UserRepository } from '../repositories/user.repository';
import { MediaResource } from '../schemas/media-resource.schema';
import { PermissionProfile } from '../schemas/permission-profile.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class MongoDBUserRepository implements UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  instance(data?: Partial<User>): User {
    const user = new User();
    if (data) Object.assign(user, data);
    if (!user.id) user.id = generateTimestampId();

    return user;
  }

  async create(user: User): Promise<User> {
    if (!user.id) user.id = generateTimestampId();

    const userDoc = new this.userModel(user);
    if (!userDoc.createdAt) userDoc.createdAt = new Date();
    if (!userDoc.updatedAt) userDoc.updatedAt = new Date();
    const record = await userDoc.save();
    return this.convert(record);
  }

  async save(user: User): Promise<User> {
    if (!user.id) return this.create(user);

    const previous = await this.userModel.findOne({ id: user.id }).exec();
    if (!previous) return this.create(user);

    Object.assign(previous, user);
    if (!previous.isNew && !previous.isModified()) return this.convert(previous);
    previous.updatedAt = new Date();

    const record = await previous.save();
    return this.convert(record);
  }

  async updateProfilePicture(props: { id: string; picture: MediaResource }): Promise<void> {
    await this.userModel
      .updateOne({ id: props.id }, { $set: { profilePicture: props.picture } })
      .exec();
  }

  async updateProfile(profile: PermissionProfile): Promise<void> {
    await this.userModel
      .updateMany({ 'profiles.id': profile.id }, { $set: { 'profiles.$': profile } })
      .exec();
  }

  async removeProfile(profileId: string): Promise<void> {
    await this.userModel
      .updateMany({ 'profiles.id': profileId }, { $pull: { profiles: { id: profileId } } })
      .exec();
  }

  async findById(id: string): Promise<User> {
    const record = await this.userModel.findOne({ id }).exec();
    return this.convert(record);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    const records = await this.userModel.find({ id: { $in: ids } }).exec();
    return this.convert(records);
  }

  async findUserIdByCredentials(loginId: string): Promise<{ id: string; password: string }> {
    const record = await this.userModel
      .findOne(
        { $or: [{ email: loginId.toLowerCase() }, { username: loginId.toLowerCase() }] },
        { id: 1, password: 1, _id: 0 },
      )
      .exec();
    if (!record) return null;

    return {
      id: record.id,
      password: record.password,
    };
  }

  async findByCredentials(loginId: string): Promise<User> {
    const record = await this.userModel
      .findOne(
        { $or: [{ email: loginId.toLowerCase() }, { username: loginId.toLowerCase() }] },
        { _id: 0 },
      )
      .exec();
    return this.convert(record);
  }

  async findByEmail(email: string, excludedId?: string): Promise<User> {
    const record = await this.userModel
      .findOne({ email: email.toLowerCase(), ...(excludedId ? { id: { $ne: excludedId } } : {}) })
      .exec();
    return this.convert(record);
  }

  async findByUsername(username: string, excludedId?: string): Promise<User> {
    const record = await this.userModel
      .findOne({
        username: username.toLowerCase(),
        ...(excludedId ? { id: { $ne: excludedId } } : {}),
      })
      .exec();
    return this.convert(record);
  }

  async find(query: UsersGetDto): Promise<{ count: number; users: User[] }> {
    const filter: FilterQuery<User> = {
      $and: [
        { id: { $exists: true } },
        ...(query.search
          ? [
              {
                $text: { $search: query.search, $caseSensitive: false },
              },
            ]
          : []),
      ],
    };

    const [recordCount, records] = await Promise.all([
      query.limit || query.page ? this.userModel.countDocuments(filter).exec() : 0,
      this.userModel.find(filter).sort({ firstName: 1, lastName: 1 }).exec(),
    ]);

    const count = recordCount || records.length;
    const users = this.convert(records);

    return {
      count: count,
      users: users,
    };
  }

  private convert(value: UserDocument): User;
  private convert(value: UserDocument[]): User[];
  private convert(value: UserDocument | UserDocument[]): User | User[] {
    if (!value) return null;
    if (Array.isArray(value)) return value.map((v) => this.convert(v));

    const user = new User();
    Object.assign(user, value.toJSON());

    delete user['_id'];
    return user;
  }
}
