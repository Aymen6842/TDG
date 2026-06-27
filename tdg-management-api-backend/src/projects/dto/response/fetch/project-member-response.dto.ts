import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';

interface UserWithMember {
  id: string;
  userId: string;
  user?: {
    name: string;
    roles?: { type: UserType }[];
  };
  isManager: boolean;
  createdAt: Date | string;
}

export class ProjectMemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Member name',
    example: 'John Doe',
  })
  @Transform(({ obj }: { obj: UserWithMember }) => obj.user?.name ?? '')
  memberName: string;

  @ApiProperty({
    description: 'Is manager',
    example: true,
  })
  isManager: boolean;

  @ApiProperty({
    description: 'Created at',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date | string;

  @ApiProperty({
    description: 'User roles in the system',
    enum: UserType,
    isArray: true,
    example: ['ScrumMaster', 'SoftwareEngineer'],
  })
  @Transform(
    ({ obj }: { obj: UserWithMember }) =>
      obj.user?.roles?.map((role) => role.type) ?? [],
    { toClassOnly: true },
  )
  userRoles: UserType[];
}
