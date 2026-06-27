import { ApiProperty } from '@nestjs/swagger';

export class CreatedTeamDto {
  @ApiProperty({
    description: 'The unique identifier of the team.',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the team.',
    type: 'string',
    example: 'Development Team',
  })
  name: string;

  @ApiProperty({
    description: 'The members of the team.',
    type: 'array',
    example: [
      {
        userId: 'user-id-1',
        isManager: true,
      },
    ],
  })
  members: { userId: string; isManager: boolean }[];
}
