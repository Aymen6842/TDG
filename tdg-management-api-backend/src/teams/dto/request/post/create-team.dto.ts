import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateTeamMemberDto } from './create-team-member.dto';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the user',
    example: 'Team A',
    required: true,
  })
  name: string;

  @ApiHideProperty()
  unaccentedName?: string;

  @ApiProperty({
    description: 'The ids of the user teams',
    type: CreateTeamMemberDto,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  members?: CreateTeamMemberDto[];
}
