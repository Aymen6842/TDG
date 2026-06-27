import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberDto } from './team-member.dto';
import { Type } from 'class-transformer';

export class TeamSummaryDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the user.',
    type: 'string',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'the members of the team.',
    type: TeamMemberDto,
    isArray: true,
  })
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];
}
