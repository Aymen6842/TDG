import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { UserTaskStatus, UserTaskPriority } from '@prisma/client';
import { plainToInstance, Transform } from 'class-transformer';
import { CreatePersonalTaskContentDto } from './create-personal-task-content.dto';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

export class CreatePersonalTaskDto {
  @ApiProperty({
    description: 'Whether the task is archived',
    example: false,
    default: false,
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
    description: 'The ID of the parent task',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @ApiProperty({
    description: 'Whether the task is marked as favorite',
    example: false,
    default: false,
    required: false,
  })
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({
    description: 'The status of the task',
    enum: UserTaskStatus,
    example: UserTaskStatus.Pending,
    default: UserTaskStatus.Pending,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserTaskStatus)
  status?: UserTaskStatus;

  @ApiProperty({
    description: 'The priority of the task',
    enum: UserTaskPriority,
    example: UserTaskPriority.Medium,
    default: UserTaskPriority.Medium,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserTaskPriority)
  priority?: UserTaskPriority;

  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.000Z',
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsISO8601()
  dueDate: Date;

  @ApiProperty({
    description: 'The reminder date for the task',
    example: '2025-12-30T10:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  reminderDate?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'The content of the personal task',
    type: CreatePersonalTaskContentDto,
    required: true,
  })
  @Transform(
    ({ value }) => {
      try {
        return typeof value === 'string' && value !== '{}'
          ? plainToInstance(CreatePersonalTaskContentDto, JSON.parse(value))
          : undefined;
      } catch {
        throw new BadRequestCustomException(
          'Invalid Data!',
          ErrorCode.INVALID_DATA,
        );
      }
    },
    { toClassOnly: true },
  )
  @ValidateNested()
  content: CreatePersonalTaskContentDto;

  @ApiProperty({
    description: 'The images of the product item.',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @ApiProperty({
    description: 'The order of the task in the list.',
    required: false,
  })
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? parseInt(value, 10) : (value as number),
    { toClassOnly: true },
  )
  @IsInt()
  @Min(1)
  displayOrder: number;
}
