import { ApiProperty } from '@nestjs/swagger';

export class ProjectCapacityMemberDto {
  @ApiProperty({
    description: 'Project member user id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Project member name',
    example: 'Ahmed',
  })
  name!: string;

  @ApiProperty({
    description: 'Committed story points assigned to this member',
    example: 12,
  })
  committedPoints!: number;

  @ApiProperty({
    description: 'Allocated capacity points for this member',
    example: 15,
  })
  capacityPoints!: number;

  @ApiProperty({
    description: 'Remaining capacity points (capacity - committed)',
    example: 3,
  })
  remainingPoints!: number;

  @ApiProperty({
    description: 'Utilization percentage for this member',
    example: 80,
  })
  utilizationPercent!: number;
}

export class ProjectCapacityDto {
  @ApiProperty({
    description: 'Project id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Number of active sprints considered for capacity',
    example: 2,
  })
  activeSprints!: number;

  @ApiProperty({
    description: 'Total team capacity points across active sprints',
    example: 40,
  })
  totalCapacityPoints!: number;

  @ApiProperty({
    description: 'Total committed story points across active sprints',
    example: 31,
  })
  totalCommittedPoints!: number;

  @ApiProperty({
    description: 'Total remaining points (capacity - committed)',
    example: 9,
  })
  totalRemainingPoints!: number;

  @ApiProperty({
    description: 'Committed points not assigned to a member',
    example: 5,
  })
  unassignedCommittedPoints!: number;

  @ApiProperty({
    description: 'Member-level capacity breakdown',
    type: [ProjectCapacityMemberDto],
  })
  members!: ProjectCapacityMemberDto[];
}
