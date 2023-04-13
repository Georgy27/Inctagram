import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatarCommand } from '../use-cases/upload-avatar.use-case';
import {
  CreateProfileApiDecorator,
  GetProfileApiDecorator,
  UpdateProfileApiDecorator,
  UploadUserAvatarApiDecorator,
} from 'src/common/decorators/swagger/users.decorator';
import { JwtAtGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { CreateProfileCommand } from '../use-cases/create-profile.use-case';
import { ProfileMapper } from '../utils/ProfileMappter';

import { UpdateProfileCommand } from '../use-cases/update-profile.use-case';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ProfileQueryRepositoryAdapter } from '../repositories/adapters/profile-query-repository.adapter';
import { UserEmailConfirmationGuard } from '../../common/guards/user-confirmation.guard';
import {
  MIN_AVATAR_WIDTH,
  API,
  FILE_FIELD,
  MIN_AVATAR_HEIGHT,
} from '../../common/constants';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ImageValidationPipe } from '../../common/pipes/image-validation.pipe';
import { MinimizeImagePipe } from '../../common/pipes/minimize-image.pipe';

@ApiTags('Users')
@UseGuards(JwtAtGuard, UserEmailConfirmationGuard)
@Controller(API.USERS)
export class UsersController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepositoryAdapter,
  ) {}

  @Post('self/images/avatar')
  @UploadUserAvatarApiDecorator()
  @UseInterceptors(FileInterceptor(FILE_FIELD))
  public async uploadAvatar(
    @ActiveUser('userId') userId: string,
    @UploadedFile(
      ImageValidationPipe({
        fileType: '.(png|jpeg|jpg)',
        minHeight: MIN_AVATAR_HEIGHT,
        minWidth: MIN_AVATAR_WIDTH,
      }),
      MinimizeImagePipe,
    )
    file: Express.Multer.File,
  ) {
    const { url, previewUrl } = await this.commandBus.execute(
      new UploadAvatarCommand(userId, file),
    );

    return { url, previewUrl };
  }

  @Get('self/profile')
  @GetProfileApiDecorator()
  public async getProfile(@ActiveUser('userId') id: string) {
    const profile =
      await this.profileQueryRepository.findProfileAndAvatarByUserId(id);

    if (!profile) throw new NotFoundException();

    return ProfileMapper.toViewModel(profile);
  }

  @Post('self/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CreateProfileApiDecorator()
  async createProfile(
    @Body() createUserProfileDto: CreateUserProfileDto,
    @ActiveUser('userId') id: string,
  ) {
    return this.commandBus.execute(
      new CreateProfileCommand(id, createUserProfileDto),
    );
  }

  @Put('self/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdateProfileApiDecorator()
  public async updateProfile(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @ActiveUser('userId') userId: string,
  ) {
    return this.commandBus.execute(
      new UpdateProfileCommand(userId, updateUserProfileDto),
    );
  }
}
