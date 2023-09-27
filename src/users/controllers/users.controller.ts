import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/decorators/user-auth.decorators';
import { UserProfilePictureUploadDto } from '../dtos/users-post.dto';
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
}
