import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from 'src/utils/util-functions';
import { UserRegistrationRequestRepository } from '../repositories/user-registration-request.repository';
import {
  UserRegistrationRequest,
  UserRegistrationRequestDocument,
} from '../schemas/user-registration-requests.schema';

@Injectable()
export class MongoDBUserRegistrationRequestRepository implements UserRegistrationRequestRepository {
  constructor(
    @InjectModel(UserRegistrationRequest.name)
    private readonly requestModel: Model<UserRegistrationRequest>,
  ) {}

  instance(data?: Partial<UserRegistrationRequest>): UserRegistrationRequest {
    const request = new this.requestModel();
    if (data) Object.assign(request, data);
    if (!request.id) request.id = generateId();

    return request;
  }

  async create(user: UserRegistrationRequest): Promise<UserRegistrationRequest> {
    if (!user.id) user.id = generateId();

    const userDoc = new this.requestModel(user);
    const record = await userDoc.save();
    return this.convert(record);
  }

  async save(request: UserRegistrationRequest): Promise<UserRegistrationRequest> {
    if (!request.id) return this.create(request);

    const previous = await this.requestModel.findOne({ id: request.id }).exec();
    if (!previous) return this.create(request);

    Object.assign(previous, request);
    if (!previous.isNew && !previous.isModified()) return this.convert(previous);

    const record = await previous.save();
    return this.convert(record);
  }

  async deleteByEmailId(email: string) {
    email = email.toLowerCase();
    await this.requestModel.deleteMany({ email }).exec();
  }

  async findById(id: string) {
    const record = await this.requestModel.findOne({ id }).exec();
    return this.convert(record);
  }

  convert(value: UserRegistrationRequestDocument): UserRegistrationRequest;
  convert(value: UserRegistrationRequestDocument[]): UserRegistrationRequest[];
  convert(value: UserRegistrationRequestDocument | UserRegistrationRequestDocument[]) {
    if (!value) return null;
    if (Array.isArray(value)) return value.map((v) => this.convert(v));

    const request = new UserRegistrationRequest();
    Object.assign(request, value.toObject());

    delete request['_id'];
    delete request['__v'];
    return request;
  }
}
