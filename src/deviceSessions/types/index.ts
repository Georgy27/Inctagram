import { ApiProperty } from '@nestjs/swagger';

export class DeviceViewModel {
  @ApiProperty()
  ip: string;
  @ApiProperty()
  deviceName: string;
  @ApiProperty()
  lastActiveDate: Date;
  @ApiProperty()
  deviceId: string;
  @ApiProperty()
  isCurrent: boolean;
}
