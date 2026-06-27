import { Test, TestingModule } from '@nestjs/testing';
import { AccountRegistrationService } from './account-registration.service';

describe('AccountRegistrationService', () => {
  let service: AccountRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRegistrationService],
    }).compile();

    service = module.get<AccountRegistrationService>(
      AccountRegistrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
