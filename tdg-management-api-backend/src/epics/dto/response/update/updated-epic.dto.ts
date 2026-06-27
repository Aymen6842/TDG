import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';



export class UpdatedEpicDto {

  @ApiProperty({

    description: 'Epic ID',

    example: '550e8400-e29b-41d4-a716-446655440000',

  })

  id: string;



  @ApiProperty({

    description: 'Project ID',

    example: '550e8400-e29b-41d4-a716-446655440000',

  })

  projectId: string;



  @ApiProperty({

    description: 'Epic name',

    example: 'User Authentication System',

  })

  name: string;



  @ApiPropertyOptional({

    description: 'Epic description',

    example: 'Complete user authentication system with JWT',

    nullable: true,

  })

  description?: string | null;



  @ApiPropertyOptional({

    description: 'Hex color for UI',

    example: '#FF5733',

    nullable: true,

  })

  color?: string | null;



  @ApiPropertyOptional({

    description: 'Epic start date',

    example: '2026-03-01T00:00:00.000Z',

    nullable: true,

  })

  @ToIsoDateString()

  startDate?: string | null;



  @ApiPropertyOptional({

    description: 'Epic end date',

    example: '2026-06-30T00:00:00.000Z',

    nullable: true,

  })

  @ToIsoDateString()

  endDate?: string | null;



  @ApiProperty({

    description: 'Creation timestamp',

    example: '2026-01-01T00:00:00.000Z',

  })

  @ToIsoDateString()

  createdAt: Date | string;



  @ApiProperty({

    description: 'Last update timestamp',

    example: '2026-01-01T00:00:00.000Z',

  })

  @ToIsoDateString()

  updatedAt: Date | string;

}

