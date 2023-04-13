import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { ApiTags } from '@nestjs/swagger';
import { TestingRemoveAllDataDecorator } from '../../common/decorators/swagger/testing.decorator';

@ApiTags('Testing')
@Controller('/api/testing/remove-all-data')
export class TestingController {
  constructor(private readonly userRepository: UserRepository) {}
  @Delete()
  @HttpCode(204)
  @TestingRemoveAllDataDecorator()
  async deleteAllData() {
    return this.userRepository.deleteAll();
  }
}
