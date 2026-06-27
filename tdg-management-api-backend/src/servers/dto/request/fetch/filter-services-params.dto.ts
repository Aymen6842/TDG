import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationParametersRequestDto } from './pagination-parameters.dto';
import { Transform } from 'class-transformer';

export class FilterServicesParamsDto extends PaginationParametersRequestDto {
  @ApiProperty({
    description: 'The name of the server',
    example: 'Production Server',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiHideProperty()
  managedById?: string;

  @ApiProperty({
    description: 'The ids of the servers',
    example: 'server-123,server-456',
  })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(','), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  serversIds?: string[];
}
