import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateTeamMemberDto } from './update-team-member.dto';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the user' })
  name?: string;

  @ApiHideProperty()
  unaccentedName?: string;

  @ApiProperty({
    description: 'The ids of the user teams',
    type: UpdateTeamMemberDto,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  members?: UpdateTeamMemberDto[];
}
