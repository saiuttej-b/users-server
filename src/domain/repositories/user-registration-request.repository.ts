import { UserRegistrationRequest } from '../schemas/user-registration-requests.schema';

export abstract class UserRegistrationRequestRepository {
  abstract instance(data?: Partial<UserRegistrationRequest>): UserRegistrationRequest;

  abstract create(user: UserRegistrationRequest): Promise<UserRegistrationRequest>;

  abstract save(user: UserRegistrationRequest): Promise<UserRegistrationRequest>;

  abstract deleteByEmailId(email: string): Promise<void>;

  abstract findById(id: string): Promise<UserRegistrationRequest>;
}
