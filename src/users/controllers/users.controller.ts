import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { UserProfilePictureUploadDto, UserUpdateDto, UsersGetDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';

@JwtAuthGuard()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Body() reqBody: UserProfilePictureUploadDto,
  ) {
    return this.service.uploadProfilePicture(file, reqBody);
  }

  @Put(':id')
  updateUser(@Body() reqBody: UserUpdateDto, @Param('id') id: string) {
    return this.service.updateUser(id, reqBody);
  }

  @Get()
  findUsers(@Query() query: UsersGetDto) {
    return this.service.findUsers(query);
  }
}
