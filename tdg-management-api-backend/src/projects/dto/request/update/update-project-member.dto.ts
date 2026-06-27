import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProjectMemberDto {
  @ApiProperty({
    description: 'Whether the member is a project manager',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isManager: boolean;
}
