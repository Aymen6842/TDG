import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServersService } from '../services/servers.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateServerDto } from '../dto/request/post/create-server';
import { CreatedServerDto } from '../dto/response/post/created-server.dto';
import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  ServerNotFoundApiResponse,
  ServiceNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { CustomRequest } from 'src/common/types/request.type';
import { CreateServiceDto } from '../dto/request/post/create-service.dto';
import { CreatedServiceDto } from '../dto/response/post/created-service.dto';
import { UpdateServerDto } from '../dto/request/update/update-server.dto';
import { UpdatedServerDto } from '../dto/response/update/updated-server.dto';
import { UpdateServiceDto } from '../dto/request/update/update-service.dto';
import { UpdatedServiceDto } from '../dto/response/update/updated-service.dto';
import { PaginateServersDto } from '../dto/response/fetch/paginate-servers.dto';
import { PaginationParametersRequestDto } from '../dto/request/fetch/pagination-parameters.dto';
import { ServerDetailsDto } from '../dto/response/fetch/server-details.dto';
import { ServiceDetailsDto } from '../dto/response/fetch/service-details.dto';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { PaginateServicesDto } from '../dto/response/fetch/paginate-services.dto';
import { FilterServicesParamsDto } from '../dto/request/fetch/filter-services-params.dto';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  @Permissions([PERMISSIONS.INFRA.SERVER_CREATE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Create a new server' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: CreateServerDto,
    description: 'Contains the server data to create a new server.',
  })
  @ApiCreatedResponse({
    description: 'Server created successfully',
    type: CreatedServerDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedServerDto })
  createServer(@Body() data: CreateServerDto) {
    return this.serversService.createServer(data);
  }

  @Post('services')
  @Permissions([PERMISSIONS.INFRA.SERVICE_CREATE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: CreateServiceDto,
    description: 'Contains the service data to create a new service.',
  })
  @ApiCreatedResponse({
    description: 'Service created successfully',
    type: CreatedServiceDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ServerNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedServiceDto })
  createService(@Req() req: CustomRequest, @Body() data: CreateServiceDto) {
    return this.serversService.createService(req, data);
  }

  @Patch(':id')
  @Permissions([PERMISSIONS.INFRA.SERVER_UPDATE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Update an existing Server' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: UpdateServerDto,
    description: 'Contains the server data to update an existing server.',
  })
  @ApiOkResponse({
    description: 'Server updated successfully',
    type: UpdatedServerDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ServerNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedServerDto })
  updateServer(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() data: UpdateServerDto,
  ) {
    return this.serversService.updateServer(req, id, data);
  }

  @Patch('services/:id')
  @Permissions([PERMISSIONS.INFRA.SERVICE_UPDATE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Update an existing Server' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: UpdateServiceDto,
    description: 'Contains the service data to update an existing service.',
  })
  @ApiOkResponse({
    description: 'Service updated successfully',
    type: UpdatedServiceDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ServiceNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedServiceDto })
  updateService(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
  ) {
    return this.serversService.updateService(req, id, data);
  }

  @Delete(':id')
  @Permissions([PERMISSIONS.INFRA.SERVER_DELETE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Delete an existing Server' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiNoContentResponse({ description: 'Server deleted successfully' })
  @ApiResponse(ServerNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedServerDto })
  deleteServer(@Req() req: CustomRequest, @Param('id') id: string) {
    return this.serversService.deleteServer(req, id);
  }

  @Delete('services/:id')
  @Permissions([PERMISSIONS.INFRA.SERVICE_DELETE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Delete an existing Service' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiNoContentResponse({ description: 'Service deleted successfully' })
  @ApiResponse(ServiceNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedServiceDto })
  deleteService(@Req() req: CustomRequest, @Param('id') id: string) {
    return this.serversService.deleteService(req, id);
  }

  @Get()
  @Permissions([PERMISSIONS.INFRA.SERVER_READ_MANY])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Fetching all server' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the servers',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the servers returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'name',
    description: 'The name of the server to filter by',
    required: false,
    example: 'Production Server',
  })
  @ApiOkResponse({
    description: 'Servers fetched successfully',
    type: PaginateServersDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateServersDto })
  filterServers(
    @Req() req: CustomRequest,
    @Query() query: PaginationParametersRequestDto,
  ) {
    return this.serversService.filterServers(req, query);
  }

  @Get('services')
  @Permissions([PERMISSIONS.INFRA.SERVICE_READ_MANY])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Fetching all services by server id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the services',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the services returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'serversIds',
    description: 'The ids of the servers to filter services by',
    required: true,
    example: 'server-123,server-456',
  })
  @ApiOkResponse({
    description: 'Services fetched successfully',
    type: PaginateServicesDto,
    isArray: true,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateServicesDto })
  filterServices(
    @Req() req: CustomRequest,
    @Query() query: FilterServicesParamsDto,
  ) {
    return this.serversService.filterServices(req, query);
  }

  @Get(':id')
  @Permissions([PERMISSIONS.INFRA.SERVER_READ_BY_ID])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Retrieving a server by id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Server fetched successfully',
    type: ServerDetailsDto,
  })
  @ApiResponse(ServerNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ServerDetailsDto })
  getServerById(@Req() req: CustomRequest, @Param('id') id: string) {
    return this.serversService.getServerById(req, id);
  }

  @Get('services/:id')
  @Permissions([PERMISSIONS.INFRA.SERVICE_READ_BY_ID])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Retrieving a service by id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Server fetched successfully',
    type: ServiceDetailsDto,
  })
  @ApiResponse(ServerNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ServiceDetailsDto })
  getServiceById(@Req() req: CustomRequest, @Param('id') id: string) {
    return this.serversService.getServiceById(req, id);
  }
}
