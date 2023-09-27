import { User } from '../schemas/user.schema';

export abstract class UserRepository {
  abstract instance(data?: Partial<User>): User;

  abstract create(user: User): Promise<User>;

  abstract save(user: User): Promise<User>;

  abstract findUserIdByCredentials(email: string): Promise<{ id: string; password: string }>;

  abstract findByEmail(email: string): Promise<User>;

  abstract findByUsername(username: string): Promise<User>;

  abstract findById(id: string): Promise<User>;

  abstract findByIds(ids: string[]): Promise<User[]>;
}
