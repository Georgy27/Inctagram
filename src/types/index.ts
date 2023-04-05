import { ApiProperty } from '@nestjs/swagger';
export class FieldError {
  @ApiProperty()
  statusCode: string;
  @ApiProperty()
  message: string[];
  @ApiProperty()
  path: string;
}
// export class APIErrorResult {
//   @ApiProperty({
//     type: FieldError,
//   })
//   statusCode: string;
//   message: string;
//   path: string;
// }

export class LogginSuccessViewModel {
  @ApiProperty()
  accessToken: string;
}
