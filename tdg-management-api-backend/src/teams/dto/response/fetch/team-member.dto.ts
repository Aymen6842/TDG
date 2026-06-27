import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import { UserDataInDb } from 'src/users/types/user.type';

export class TeamMemberDto {
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  user: UserDataInDb;

  @ApiProperty({
    description: 'The unique identifier of the user.',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @Transform(({ obj }) => (obj as TeamMemberDto)?.user?.id, {
    toClassOnly: true,
  })
  id: string;

  @ApiProperty({
    description: 'Is it manager of the team.',
    type: 'boolean',
    example: true,
  })
  isManager: boolean;

  @ApiProperty({
    description: 'The image of the user.',
    type: 'string',
    example: 'https://example.com/image.jpg',
  })
  @Expose()
  @Transform(({ obj }) => (obj as TeamMemberDto)?.user?.image, {
    toClassOnly: true,
  })
  image: string;

  @ApiProperty({
    description: 'The name of the user.',
    type: 'string',
    example: 'John Doe',
  })
  @Expose()
  @Transform(({ obj }) => (obj as TeamMemberDto)?.user?.name, {
    toClassOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'The email of the user.',
    type: 'string',
    example: 'example@gmail.com',
  })
  @Expose()
  @Transform(({ obj }) => (obj as TeamMemberDto)?.user?.email, {
    toClassOnly: true,
  })
  email: string;

  @ApiProperty({
    description: 'The phone of the user.',
    type: 'string',
    example: '+1234567890',
  })
  @Expose()
  @Transform(({ obj }) => (obj as TeamMemberDto)?.user?.phone, {
    toClassOnly: true,
  })
  phone: string;

  @ApiProperty({
    description: 'The role of the user.',
    type: 'string',
    example: 'Manager',
  })
  @Expose()
  @Transform(
    ({ obj }) => (obj as TeamMemberDto)?.user?.roles?.map((role) => role.type),
    {
      toClassOnly: true,
    },
  )
  roles: UserType[];
}
