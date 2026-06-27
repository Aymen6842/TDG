import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserType } from '@prisma/client';

describe('TokensService', () => {
  let service: TokensService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: RefreshTokenRepository,
          useValue: {
            countRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig = {
                ACCESS_TOKEN_EXPIRATION: '4min',
                REFRESH_TOKEN_EXPIRATION: '1200d',
              };
              return mockConfig[key] as string;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a token for authentication', () => {
    const id = 'id1';
    const roles = [UserType.CEO];
    const type = 'access';
    const expiresIn = '4m';

    (jwtService.sign as jest.Mock).mockReturnValue('token');
    service.generateAuthenticationToken(id, roles, type, expiresIn);

    expect(jwtService.sign).toHaveBeenCalledWith(
      { id, roles, type },
      { expiresIn },
    );
  });
});
