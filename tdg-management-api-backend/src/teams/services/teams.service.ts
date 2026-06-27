import { Injectable } from '@nestjs/common';
import { NotFoundCustomException } from '../../common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from '../../common/exceptions/error-codes/error.code';
import { BadRequestCustomException } from '../../common/exceptions/custom-exceptions/bad-request.exception';
import { FetchTeamRepository } from '../repositories/fetch-team.repository';
import { UpdateTeamRepository } from '../repositories/update-team-repository';
import { DeleteTeamRepository } from '../repositories/delete-team.repository';
import { Prisma } from '@prisma/client';
import { CustomRequest } from 'src/common/types/request.type';
import { PaginationParametersRequestDto } from '../dto/request/fetch/pagination-parameters.dto';
import { CreateTeamRepository } from '../repositories/create-team-repository';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { CreateTeamDto } from '../dto/request/post/create-team.dto';
import { UpdateTeamDto } from '../dto/request/update/update-team.dto';
import { SlugifyService } from 'src/common/slugify/service/slugify.service';
import { PermissionsService } from 'src/auths/services/permissions/permissions.service';
import { FilterTeamsParametersDto } from '../dto/request/fetch/filter-teams-parameters.dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly createTeamRepository: CreateTeamRepository,
    private readonly fetchTeamRepository: FetchTeamRepository,
    private readonly updateTeamRepository: UpdateTeamRepository,
    private readonly deleteTeamRepository: DeleteTeamRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createTeam(req: CustomRequest, data: CreateTeamDto) {
    try {
      const permission = await this.permissionsService.canUserManageUsers(
        req?.user?.id as string,
        data.members?.map((member) => member.userId) || [],
      );
      if (!permission) throw new ForbiddenCustomException();

      data.unaccentedName = SlugifyService.toUnaccented(data.name);

      const team = await this.createTeamRepository.createTeam(data);

      return team;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new BadRequestCustomException(
          'This team name already exists!',
          ErrorCode.TEAM_ALREADY_EXISTS,
        );

      throw error;
    }
  }

  async filterTeams(req: CustomRequest, query: FilterTeamsParametersDto) {
    const { page, limit } = this.retrievePaginationParameters(query);

    // retrieving the users using pagination
    const countedTeams =
      await this.fetchTeamRepository.countFiltredTeams(query);
    const skip = (page - 1) * limit;
    const teams = await this.fetchTeamRepository.filterTeams(
      query,
      skip,
      limit,
    );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedTeams,
      page,
      limit,
    );

    return { data: teams, pagination: paginationParameters };
  }

  async updateTeam(req: CustomRequest, id: string, data: UpdateTeamDto) {
    try {
      const permission = await this.permissionsService.canUserManageUsers(
        req?.user?.id as string,
        data.members?.map((member) => member.userId) || [],
      );
      if (!permission) throw new ForbiddenCustomException();

      if (data.name)
        data.unaccentedName = SlugifyService.toUnaccented(data.name);

      const team = await this.updateTeamRepository.updateTeam(id, data);

      return team;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This team is not found!',
          ErrorCode.TEAM_NOT_FOUND,
        );
      else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new BadRequestCustomException(
          'This team name already exists!',
          ErrorCode.TEAM_ALREADY_EXISTS,
        );

      throw error;
    }
  }

  async deleteTeamById(req: CustomRequest, teamId: string) {
    try {
      const permission = await this.permissionsService.canUserManageTeams(
        req.user?.id as string,
        [teamId],
      );
      if (!permission) throw new ForbiddenCustomException();

      await this.deleteTeamRepository.deleteTeamById(teamId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This team is not found!',
          ErrorCode.TEAM_NOT_FOUND,
        );

      throw error;
    }
  }

  setPaginationParametersInResponse(
    totalUsers: number,
    page: number,
    limit: number,
  ) {
    const totalPagesFloat = totalUsers / limit;
    const totalPages =
      totalPagesFloat - Math.trunc(totalPagesFloat) > 0
        ? Math.trunc(totalPagesFloat) + 1
        : totalPagesFloat;

    return {
      records: totalUsers,
      currentPage: page,
      totalPages: totalPages,
    };
  }

  retrievePaginationParameters(query: PaginationParametersRequestDto): {
    page: number;
    limit: number;
  } {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 500, 500);

    return { page, limit };
  }
}
