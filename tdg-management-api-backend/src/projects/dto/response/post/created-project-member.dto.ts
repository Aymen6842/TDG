import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

interface UserWithMember {
  id: string;
  userId: string;
  projectId: string;
  memberName?: string;
  user?: { name: string };
  isManager: boolean;
  createdAt: Date | string;
}

export class CreatedProjectMemberDto {
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
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Member name',
    example: 'John Doe',
  })
  @Transform(
    ({ obj }: { obj: UserWithMember }) =>
      obj.memberName ?? obj.user?.name ?? '',
    { toClassOnly: true },
  )
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
}
