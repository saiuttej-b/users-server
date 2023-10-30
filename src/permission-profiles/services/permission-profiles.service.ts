import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { keyBy, uniqBy } from 'lodash';
import { PermissionProfileRepository } from 'src/domain/repositories/permission-profile.repository';
import { AppPermissions } from 'src/utils/permissions.config';
import { getUser } from 'src/utils/request-store/request-store';
import {
  PermissionPostDto,
  PermissionProfileGetDto,
  PermissionProfilePostDto,
} from '../dtos/permission-profiles.dto';

@Injectable()
export class PermissionProfilesService {
  constructor(private readonly permissionProfileRepo: PermissionProfileRepository) {}

  async createPermissionProfile(reqBody: PermissionProfilePostDto) {
    reqBody.permissions = this.formatPermissions(reqBody.permissions);

    const name = await this.permissionProfileRepo.findByName({ name: reqBody.name });
    if (name) {
      throw new BadRequestException(
        `There is already a permission profile with the name ${reqBody.name}`,
      );
    }

    const profile = this.permissionProfileRepo.instance(reqBody);
    profile.createdById = getUser().id;
    profile.updatedById = getUser().id;
    return this.permissionProfileRepo.create(profile);
  }

  async updatePermissionProfile(id: string, reqBody: PermissionProfilePostDto) {
    const profile = await this.permissionProfileRepo.findById(id);
    if (!profile) {
      throw new NotFoundException('Permission profile not found');
    }

    reqBody.permissions = this.formatPermissions(reqBody.permissions);

    const name = await this.permissionProfileRepo.findByName({
      name: reqBody.name,
      excludedId: id,
    });
    if (name) {
      throw new BadRequestException(
        `There is already a permission profile with the name ${reqBody.name}`,
      );
    }

    Object.assign(profile, reqBody);
    return this.permissionProfileRepo.save(profile, { updatedById: getUser().id });
  }

  async deletePermissionProfile(id: string) {
    const profile = await this.permissionProfileRepo.findById(id);
    if (!profile) {
      throw new NotFoundException('Permission profile not found');
    }

    await this.permissionProfileRepo.deleteById(id);
    return {
      success: true,
      message: 'Permission profile deleted successfully',
    };
  }

  private formatPermissions(permissions: PermissionPostDto[]) {
    const uniqueValues = uniqBy(permissions, (v) => v.name);

    const permissionObject = AppPermissions.object;

    for (const v of uniqueValues) {
      v.name = v.name.trim().toUpperCase();
      v.actions = uniqBy(v.actions, (a) => a.trim().toUpperCase()).sort();

      const p = permissionObject[v.name];
      if (!p) {
        throw new BadRequestException(`Permission ${v.name} not found`);
      }

      for (const action of v.actions) {
        if (!p.actions[action]) {
          throw new BadRequestException(`Action ${action} not found for permission ${v.name}`);
        }
      }
    }
    return uniqueValues;
  }

  async getPermissionProfiles(query: PermissionProfileGetDto) {
    return this.permissionProfileRepo.find(query);
  }

  async getPermissionProfile(id: string) {
    const profileRes = await this.permissionProfileRepo.find({ id });
    if (!profileRes.count) {
      throw new NotFoundException('Permission profile not found');
    }
    const profile = profileRes.permissionProfiles[0];

    const profilePermissionMap = keyBy(profile.permissions, (p) => p.name);

    return {
      profile: profile,
      appPermissions: AppPermissions.list.map((p) => {
        return {
          ...p,
          permissions: p.permissions.map((pp) => {
            const userPermission = profilePermissionMap[pp.key];
            return {
              ...pp,
              hasPermission: !!userPermission,
              assignedActions: userPermission?.actions || [],
            };
          }),
        };
      }),
    };
  }
}
