import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { PermissionProfileGetDto, PermissionProfilePostDto } from '../dtos/permission-profiles.dto';
import { PermissionProfilesService } from '../services/permission-profiles.service';

@JwtAuthGuard()
@Controller('permission-profiles')
export class PermissionProfilesController {
  constructor(private readonly service: PermissionProfilesService) {}

  @Post()
  createPermissionProfile(@Body() reqBody: PermissionProfilePostDto) {
    return this.service.createPermissionProfile(reqBody);
  }

  @Put(':id')
  updatePermissionProfile(@Body() reqBody: PermissionProfilePostDto, @Param('id') id: string) {
    return this.service.updatePermissionProfile(id, reqBody);
  }

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
