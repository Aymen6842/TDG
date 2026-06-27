import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class ServerManagerDto {
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  manager: User;

  @ApiProperty({
    description: 'The id of the user who owns the work session',
    example: 'id',
  })
  @Expose()
  @Transform(({ obj }) => (obj as ServerManagerDto)?.manager?.id ?? null, {
    toClassOnly: true,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the user who owns the work session',
    example: 'John Doe',
  })
  @Expose()
  @Transform(({ obj }) => (obj as ServerManagerDto)?.manager?.name ?? null, {
    toClassOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'The email of the user who owns the work session',
    example: 'example@gmail.com',
  })
  @Expose()
  @Transform(({ obj }) => (obj as ServerManagerDto)?.manager?.email ?? null, {
    toClassOnly: true,
  })
  email: string;

  @ApiProperty({
    description: 'The phone of the user who owns the work session',
    example: '+1234567890',
  })
  @Expose()
  @Transform(({ obj }) => (obj as ServerManagerDto)?.manager?.phone ?? null, {
    toClassOnly: true,
  })
  phone: string;

  @ApiProperty({
    description: 'The image URL of the user who owns the work session',
    example: 'https://example.com/image.jpg',
  })
  @Expose()
  @Transform(({ obj }) => (obj as ServerManagerDto)?.manager?.image ?? null, {
    toClassOnly: true,
  })
  image: string;
}
