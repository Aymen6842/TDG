import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  UseGuards,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
  Post,
  Param,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import { CustomRequest } from 'src/common/types/request.type';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ForbiddenApiResponse,
  InternalServerErrorApiResponse,
  TeamAlreadyExistsOrInvalidDataBadRequestApiResponse,
  TeamNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { CreateTeamDto } from '../dto/request/post/create-team.dto';
import { CreatedTeamDto } from '../dto/response/post/created-team.dto';
import { UpdatedTeamDto } from '../dto/response/update/updated-team.dto';
import { UpdateTeamDto } from '../dto/request/update/update-team.dto';
import { PaginateTeamsDto } from '../dto/response/fetch/paginate-teams.dto';
import { FilterTeamsParametersDto } from '../dto/request/fetch/filter-teams-parameters.dto';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Permissions([PERMISSIONS.TEAMS.TEAM_CREATE])
  @UseGuards(HasPermissionGuard)
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({
    description: 'Success Registration!',
    type: CreatedTeamDto,
  })
  @ApiResponse(TeamAlreadyExistsOrInvalidDataBadRequestApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedTeamDto })
  createTeam(@Request() req: CustomRequest, @Body() data: CreateTeamDto) {
    return this.teamsService.createTeam(req, data);
  }

  @Get()
  @Permissions([PERMISSIONS.TEAMS.TEAM_READ_MANY])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'List of available teams',
    type: PaginateTeamsDto,
  })
  @ApiQuery({})
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateTeamsDto })
  filterTeams(
    @Request() req: CustomRequest,
    @Query() query: FilterTeamsParametersDto,
  ) {
    return this.teamsService.filterTeams(req, query);
  }

  @Patch(':id')
  @Permissions([PERMISSIONS.TEAMS.TEAM_UPDATE])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiProperty({
    name: 'id',
    description: 'The id of the team to be updated',
    example: 'teamId123',
  })
  @ApiBody({ type: UpdateTeamDto })
  @ApiOkResponse({
    description: 'Team updated successfully',
    type: UpdatedTeamDto,
  })
  @ApiResponse(TeamAlreadyExistsOrInvalidDataBadRequestApiResponse)
  @ApiResponse(TeamNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedTeamDto })
  updateTeam(
    @Request() req: CustomRequest,
    @Body() data: UpdateTeamDto,
    @Param('id') id: string,
  ) {
    return this.teamsService.updateTeam(req, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions([PERMISSIONS.TEAMS.TEAM_DELETE])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiNoContentResponse()
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(TeamNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async deleteTeamById(@Request() req: CustomRequest, @Param('id') id: string) {
    return await this.teamsService.deleteTeamById(req, id);
  }
}
