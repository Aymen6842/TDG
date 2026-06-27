import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class RolesDto {
  @ApiProperty({
    description: 'List of available roles',
    isArray: true,
    example: [UserType.CEO, UserType.CTO, UserType.CMO],
  })
  roles: UserType[];
}
