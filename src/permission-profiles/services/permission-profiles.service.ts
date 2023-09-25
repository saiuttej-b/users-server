import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { uniqBy } from 'lodash';
import { PermissionProfileRepository } from 'src/domain/repositories/permission-profile.repository';
import { AppPermissions } from 'src/domain/schemas/permission-profile.schema';
import { getUser } from 'src/utils/request-store/request-store';
import { PermissionPostDto, PermissionProfilePostDto } from '../dtos/permission-profiles.dto';

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

  async getPermissionProfile(id: string) {
    const profile = await this.permissionProfileRepo.findById(id);
    if (!profile) {
      throw new NotFoundException('Permission profile not found');
    }
    return profile;
  }

  async getPermissionProfiles() {
    return this.permissionProfileRepo.find();
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
          throw new BadRequestException(`Action ${action} not found in permission ${v.name}`);
        }
      }
    }
    return uniqueValues;
  }
}
