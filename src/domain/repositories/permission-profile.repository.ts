import { PermissionProfileGetDto } from 'src/permission-profiles/dtos/permission-profiles.dto';
import { EditOptions } from 'src/utils/mongoose.config';
import { PermissionProfile } from '../schemas/permission-profile.schema';

export abstract class PermissionProfileRepository {
  abstract instance(data: Partial<PermissionProfile>): PermissionProfile;

  abstract create(profile: PermissionProfile, options?: EditOptions): Promise<PermissionProfile>;

  abstract save(profile: PermissionProfile, options?: EditOptions): Promise<PermissionProfile>;

  abstract deleteById(id: string): Promise<void>;

  abstract findByName(props: { name: string; excludedId?: string }): Promise<PermissionProfile>;

  abstract findById(id: string): Promise<PermissionProfile>;

  abstract findByIds(ids: string[]): Promise<PermissionProfile[]>;

  abstract find(
    query: PermissionProfileGetDto,
  ): Promise<{ count: number; permissionProfiles: PermissionProfile[] }>;
}
