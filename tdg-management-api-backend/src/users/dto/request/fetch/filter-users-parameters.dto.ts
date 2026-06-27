import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GlobalRegex } from 'src/common/constants/regex-sql-constant';
import { SortUserBy } from '../../../types/request.type';
import { UserType } from '@prisma/client';
import { SlugifyService } from 'src/common/slugify/service/slugify.service';
import { PaginationParametersRequestDto } from './pagination-parameters.dto';

export class FilterUsersDto extends PaginationParametersRequestDto {
  // 👤 User creation date
  @ApiProperty({ description: 'User created from (date)' })
  @IsOptional()
  @IsString()
  @Matches(GlobalRegex.SQL_INJECTION_REGEX)
  userCreatedAtFrom?: string;

  @ApiProperty({ description: 'User created to (date)' })
  @IsOptional()
  @IsString()
  @Matches(GlobalRegex.SQL_INJECTION_REGEX)
  userCreatedAtTo?: string;

  @ApiProperty({ description: 'Filter by email' })
  @IsOptional()
  @IsString()
  @Matches(GlobalRegex.SQL_INJECTION_REGEX)
  @Transform(({ value }: { value?: string }): string | null => {
    if (typeof value !== 'string') return null;
    return SlugifyService.toUnaccented(value.replace(/'/g, "''"));
  })
  email?: string;

  @ApiProperty({ description: 'Filter by phone number' })
  @IsOptional()
  @IsString()
  @Matches(GlobalRegex.SQL_INJECTION_REGEX)
  @Transform(({ value }: { value?: string }): string | null => {
    if (typeof value !== 'string') return null;
    return SlugifyService.toUnaccented(value.replace(/'/g, "''"));
  })
  phone?: string;

  @ApiProperty({ description: 'Filter by name' })
  @IsOptional()
  @IsString()
  @Matches(GlobalRegex.SQL_INJECTION_REGEX)
  @Transform(({ value }: { value?: string }): string | null => {
    if (typeof value !== 'string') return null;
    return SlugifyService.toUnaccented(value.replace(/'/g, "''"));
  })
  name?: string;

  @ApiProperty({ enum: UserType, description: 'User role filter' })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(',') ?? [], {
    toClassOnly: true,
  })
  @IsArray()
  @IsEnum(UserType, { each: true })
  roles?: UserType[];

  @ApiProperty({ type: String, description: 'the teams ids' })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(',') ?? [], {
    toClassOnly: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  teamsIds?: string[];

  @ApiProperty({ type: String, description: 'the users ids' })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(',') ?? [], {
    toClassOnly: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  usersIds?: string[];

  @ApiProperty({ enum: SortUserBy, description: 'Sort criteria' })
  @IsOptional()
  @IsEnum(SortUserBy)
  sortBy?: SortUserBy;
}
