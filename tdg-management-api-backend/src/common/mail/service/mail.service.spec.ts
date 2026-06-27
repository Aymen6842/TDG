import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(), // Mock the sendMail method
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig = {
                FRONTEND_ADDRESS: 'http://localhost:3000',
                COMPANY_NAME: 'E-commerce',
                COMPANY_LOGO: '/path/to/logo.webp',
              };
              return mockConfig[key] as string;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendUserConfirmation', () => {
    it('should send a confirmation email', async () => {
      const sendMailMock = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce(undefined);

      const email = 'test@example.com';
      const name = 'Test User';
      const token = '12345';

      await service.sendUserConfirmation(email, name, token);

      const expectedUrl =
        'http://localhost:3000/auth/activation-link?token=12345';
      expect(sendMailMock).toHaveBeenCalledWith({
        to: email,
        subject: 'Activate Your E-commerce Account',
        text: `Dear Test User,\nWelcome to E-commerce! Click the link below to activate your account:\n${expectedUrl}\nThank you for joining us!\nBest regards, E-commerce Team`,
      });
    });
  });

  describe('notifyUserRegistrationSuccess', () => {
    it('should send a registration success email', async () => {
      const sendMailMock = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce(undefined);

      const email = 'test@example.com';
      const name = 'Test User';

      await service.notifyUserRegistrationSuccess(email, name);

      expect(sendMailMock).toHaveBeenCalledWith({
        to: email,
        subject: 'Bienvenue sur notre plateforme !',
        attachments: [
          {
            filename: 'parastore.webp',
            path: '/path/to/logo.webp',
            cid: 'parastore-logo',
          },
        ],
        html: expect.stringContaining(
          '<strong>Bonjour Test User,</strong>',
        ) as string,
      });
    });
  });

  describe('sendResetPasswordCode', () => {
    it('should send a reset password email', async () => {
      const sendMailMock = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce(undefined);

      const email = 'test@example.com';
      const name = 'Test User';
      const code = '12345';

      await service.sendResetPasswordCode(email, name, code);

      expect(sendMailMock).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Password - Verification Code',
        text: `Dear Test User\nWe received a request to reset the password for your E-commerce account. To complete the process, please use the following 5-digit verification code:\nYour Verification Code: 12345\nPlease enter this code in the password reset page to proceed. For your security, this code will expire in 10 minutes.\nIf you did not request a password reset, please ignore this email. Your account is safe, and no changes have been made.\nBest regards,\nE-commerce Support Team`,
      });
    });
  });
});
