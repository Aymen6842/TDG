import { Test, TestingModule } from '@nestjs/testing';
import { TokensController } from './tokens.controller';
import { TokensService } from '../service/tokens.service';
import { TokenDto } from '../dto/request/token.dto';

describe('TokensController', () => {
  let controller: TokensController;
  let tokensService: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [
        {
          provide: TokensService,
          useValue: {
            verifyToken: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TokensController>(TokensController);
    tokensService = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify token', () => {
    const dto: TokenDto = { token: 'token' };

    (tokensService.verifyToken as jest.Mock).mockResolvedValue(undefined);

    controller.verify(dto);

    expect(tokensService.verifyToken).toHaveBeenCalledWith(dto);
  });

  it('should refresh the access token', async () => {
    const dto: TokenDto = { token: 'token' };
    const mockedAccessToken = { access: 'access-token' };

    (tokensService.refreshAccessToken as jest.Mock).mockResolvedValue(
      mockedAccessToken,
    );

    const response = await controller.refresh(dto);

    expect(tokensService.refreshAccessToken).toHaveBeenCalledWith(dto);
    expect(response).toEqual(mockedAccessToken);
  });
});
