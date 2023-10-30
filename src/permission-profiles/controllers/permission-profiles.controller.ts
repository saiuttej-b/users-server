import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CheckPermission, JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { PERMISSION } from 'src/utils/permissions.config';
import { PermissionProfileGetDto, PermissionProfilePostDto } from '../dtos/permission-profiles.dto';
import { PermissionProfilesService } from '../services/permission-profiles.service';

@JwtAuthGuard()
@CheckPermission(PERMISSION.PERMISSION_PROFILE.VIEW)
@Controller('permission-profiles')
export class PermissionProfilesController {
  constructor(private readonly service: PermissionProfilesService) {}

  @CheckPermission(PERMISSION.PERMISSION_PROFILE.CREATE)
  @Post()
  createPermissionProfile(@Body() reqBody: PermissionProfilePostDto) {
    return this.service.createPermissionProfile(reqBody);
  }

  @CheckPermission(PERMISSION.PERMISSION_PROFILE.EDIT)
  @Put(':id')
  updatePermissionProfile(@Body() reqBody: PermissionProfilePostDto, @Param('id') id: string) {
    return this.service.updatePermissionProfile(id, reqBody);
  }

  @CheckPermission(PERMISSION.PERMISSION_PROFILE.DELETE)
  @Delete(':id')
  deletePermissionProfile(@Param('id') id: string) {
    return this.service.deletePermissionProfile(id);
  }

  @Get()
  getAllPermissionProfiles(@Query() query: PermissionProfileGetDto) {
    return this.service.getPermissionProfiles(query);
  }

  @Get(':id')
  getPermissionProfileById(@Param('id') id: string) {
    return this.service.getPermissionProfile(id);
  }
}
