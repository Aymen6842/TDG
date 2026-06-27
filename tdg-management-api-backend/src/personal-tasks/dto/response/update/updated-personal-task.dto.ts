import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  UserTaskContent,
  UserTaskPriority,
  UserTaskStatus,
} from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UpdatedPersonalTaskDto {
  @ApiProperty({
    description: 'Unique identifier of the personal task.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  content: UserTaskContent[];

  @ApiProperty({
    description: 'Title of the task content.',
    example: 'Design homepage',
  })
  @Expose()
  @Transform(
    ({ obj }) => (obj as UpdatedPersonalTaskDto)?.content?.[0]?.title ?? null,
    {
      toClassOnly: true,
    },
  )
  title: string;

  @ApiProperty({
    description: 'Short description of the task content.',
    example: 'Create a responsive design for the homepage',
    nullable: true,
  })
  @Expose()
  @Transform(
    ({ obj }) =>
      (obj as UpdatedPersonalTaskDto)?.content?.[0]?.description ?? null,
    {
      toClassOnly: true,
    },
  )
  description: string | null;

  @ApiProperty({
    description: 'Additional details of the task content.',
    example: 'This includes wireframes and high-fidelity mockups.',
    nullable: true,
  })
  @Expose()
  @Transform(
    ({ obj }) => (obj as UpdatedPersonalTaskDto)?.content?.[0]?.details ?? null,
    {
      toClassOnly: true,
    },
  )
  details: string | null;

  @ApiProperty({
    description: 'Whether the task is archived.',
    example: false,
    default: false,
  })
  archived: boolean;

  @ApiProperty({
    description: 'Identifier of the parent task if this is a sub-task.',
    example: 'parent-task-uuid',
    nullable: true,
  })
  parentTaskId: string | null;

  @ApiProperty({
    description: 'Whether the task is marked as favorite.',
    example: true,
    default: false,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Current status of the task.',
    enum: UserTaskStatus,
    example: UserTaskStatus.Pending,
  })
  status: UserTaskStatus;

  @ApiProperty({
    description: 'Priority level of the task.',
    enum: UserTaskPriority,
    example: UserTaskPriority.Medium,
  })
  priority: UserTaskPriority;

  @ApiProperty({
    description: 'attachments of the task.',
    example: ['file1.png', 'file2.docx'],
    isArray: true,
  })
  @Transform(
    ({ value }) => (value as { file: string }[])?.map((att) => att.file) ?? [],
    { toClassOnly: true },
  )
  attachments: string[];

  @ApiProperty({
    description: 'Due date of the task.',
    example: '2025-12-31T23:59:59.000Z',
    type: String,
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Reminder date of the task, if set.',
    example: '2025-12-30T10:00:00.000Z',
    type: String,
    nullable: true,
  })
  reminderDate: Date | null;

  @ApiProperty({
    description: 'The display order',
    type: 'number',
    example: 1000,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-12-21T12:00:00.000Z',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-12-22T12:00:00.000Z',
    type: String,
  })
  updatedAt: Date;
}
