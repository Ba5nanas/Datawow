import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto, UserRole } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'register' | 'login'>>;

  const mockRegisteredUser = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockRegisteredUser),
      login: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register a user and return user data without password', async () => {
      const registerDto: RegisterDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should login and return access_token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ access_token: 'mock-token' });
    });
  });
});
