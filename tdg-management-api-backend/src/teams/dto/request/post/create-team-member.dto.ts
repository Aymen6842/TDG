import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  @ApiProperty({
    description: 'The id of the user',
    example: 'userId1',
    required: true,
  })
  userId: string;

  @ApiProperty({
    description: 'is it manager of the team',
    example: false,
    required: false,
  })
  @IsOptional()
  isManager?: boolean;
}
