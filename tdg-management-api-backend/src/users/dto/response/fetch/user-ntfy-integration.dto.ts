import { ApiProperty } from '@nestjs/swagger';

export class UserNtfyIntegrationDto {
  @ApiProperty({
    description: 'The unique identifier of the Ntfy integration.',
    type: 'string',
    example: 'ntfy-123456',
  })
  topic: string;
}
