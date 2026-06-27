import { ApiProperty } from '@nestjs/swagger';

export class WorkDayOwnerDto {
  @ApiProperty({
    description: 'The id of the user who owns the work session',
    example: 'id',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the user who owns the work session',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email of the user who owns the work session',
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone of the user who owns the work session',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'The image URL of the user who owns the work session',
    example: 'https://example.com/image.jpg',
  })
  image: string;
}
