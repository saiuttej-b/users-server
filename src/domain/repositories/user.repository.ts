import { UsersGetDto } from 'src/users/dtos/users.dto';
import { MediaResource } from '../schemas/media-resource.schema';
import { PermissionProfile } from '../schemas/permission-profile.schema';
import { User } from '../schemas/user.schema';

export abstract class UserRepository {
  abstract instance(data?: Partial<User>): User;

  abstract create(user: User): Promise<User>;

  abstract save(user: User): Promise<User>;

  abstract updateProfilePicture(props: { id: string; picture: MediaResource }): Promise<void>;

  abstract updateProfile(profile: PermissionProfile): Promise<void>;

  abstract removeProfile(profileId: string): Promise<void>;

  abstract findUserIdByCredentials(loginId: string): Promise<{ id: string; password: string }>;

  abstract findByEmail(email: string, excludedId?: string): Promise<User>;

  abstract findByUsername(username: string, excludedId?: string): Promise<User>;

  abstract findById(id: string): Promise<User>;

  abstract findByIds(ids: string[]): Promise<User[]>;

  abstract find(query: UsersGetDto): Promise<{ count: number; users: User[] }>;
}
