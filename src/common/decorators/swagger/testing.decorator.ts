import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function TestingRemoveAllDataDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Clear database: delete all data from all tables',
    }),
    ApiResponse({
      status: 204,
      description: 'All data is deleted',
    }),
  );
}
