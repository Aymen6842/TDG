import { Module } from '@nestjs/common';
import { TeamsService } from './services/teams.service';
import { TeamsController } from './controllers/teams.controller';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { CreateTeamRepository } from './repositories/create-team-repository';
import { UpdateTeamRepository } from './repositories/update-team-repository';
import { DeleteTeamRepository } from './repositories/delete-team.repository';
import { FetchTeamRepository } from './repositories/fetch-team.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { BcryptModule } from 'src/common/bcrypt/bcrypt.module';

@Module({
  imports: [PrismaModule, BcryptModule, AuthsModule, TokensModule],
  controllers: [TeamsController],
  providers: [
    TeamsService,
    CreateTeamRepository,
    UpdateTeamRepository,
    DeleteTeamRepository,
    FetchTeamRepository,
  ],
  exports: [TeamsService],
})
export class TeamsModule {}
