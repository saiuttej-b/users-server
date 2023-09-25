import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateTimestampId } from 'src/utils/util-functions';
import { UserRepository } from '../repositories/user.repository';
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
    const record = await userDoc.save();
    return this.convert(record);
  }

  async save(user: User): Promise<User> {
    if (!user.id) return this.create(user);

    const previous = await this.userModel.findOne({ id: user.id }).exec();
    if (!previous) return this.create(user);

    Object.assign(previous, user);
    if (!previous.isNew && !previous.isModified()) return this.convert(previous);

    const record = await previous.save();
    return this.convert(record);
  }

  async findById(id: string): Promise<User> {
    const record = await this.userModel.findOne({ id }).exec();
    return this.convert(record);
  }

  async findUserIdByCredentials(email: string): Promise<{ id: string; password: string }> {
    const record = await this.userModel
      .findOne({ email: email.toLowerCase() }, { id: 1, password: 1, _id: 0 })
      .exec();
    if (!record) return null;

    return {
      id: record.id,
      password: record.password,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const record = await this.userModel.findOne({ email: email }).exec();
    return this.convert(record);
  }

  async findByUsername(username: string): Promise<User> {
    const record = await this.userModel.findOne({ username: username }).exec();
    return this.convert(record);
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
