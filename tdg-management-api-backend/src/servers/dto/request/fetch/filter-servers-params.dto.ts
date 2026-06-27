import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationParametersRequestDto } from './pagination-parameters.dto';

export class FilterServersParamsDto extends PaginationParametersRequestDto {
  @ApiProperty({
    description: 'The name of the server',
    example: 'Production Server',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiHideProperty()
  managedById?: string;
}
