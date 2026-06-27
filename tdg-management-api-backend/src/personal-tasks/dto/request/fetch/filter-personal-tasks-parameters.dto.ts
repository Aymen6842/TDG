import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserTaskStatus, UserTaskPriority } from '@prisma/client';
import { PersonalTasksSortByOptions } from 'src/personal-tasks/types/request.type';

export class FilterPersonalTasksParametersDto {
  @ApiProperty({
    description: 'Filter by archived status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : undefined,
    { toClassOnly: true },
  )
  archived?: boolean;

  @ApiProperty({
    description: 'Filter by favorite status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : undefined,
    { toClassOnly: true },
  )
  isFavorite?: boolean;

  @ApiProperty({
    description: 'Filter by task status (comma-separated)',
    example: 'Pending,InProgress',
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return (value as string)?.split(',')?.map((s: string) => s.trim());
    },
    { toClassOnly: true },
  )
  @IsEnum(UserTaskStatus, { each: true })
  statuses?: UserTaskStatus[];

  @ApiProperty({
    description: 'Filter by task priority (comma-separated)',
    example: 'High,Medium',
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return (value as string)?.split(',')?.map((s: string) => s.trim());
    },
    { toClassOnly: true },
  )
  @IsEnum(UserTaskPriority, { each: true })
  priorities?: UserTaskPriority[];

  @ApiProperty({
    description: 'Sort results by status or priority (comma-separated)',
    example: 'statusAsc,priorityDesc',
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return (value as string)?.split(',')?.map((s: string) => s.trim());
    },
    { toClassOnly: true },
  )
  @IsEnum(PersonalTasksSortByOptions, { each: true })
  sortBy?: PersonalTasksSortByOptions[];
}
