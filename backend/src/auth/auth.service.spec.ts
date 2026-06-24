import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;
  let jwtService: any;

  const mockUser = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegisteredUser = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    userService = {
      register: jest.fn(),
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register ADMIN successfully', async () => {
      const registerDto: RegisterDto = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: Role.ADMIN,
      };

      const registeredUser = {
        id: 'admin-user-id',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.register.mockResolvedValue(registeredUser);

      const result = await service.register(registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expect.objectContaining({ email: 'admin@example.com', role: Role.ADMIN }));
      expect(result).not.toHaveProperty('password');
    });

    it('should register USER successfully', async () => {
      const registerDto: RegisterDto = {
        fullName: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: Role.USER,
      };

      const registeredUser = {
        id: 'test-user-id-2',
        fullName: 'Regular User',
        email: 'user@example.com',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.register.mockResolvedValue(registeredUser);

      const result = await service.register(registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expect.objectContaining({ email: 'user@example.com', role: Role.USER }));
      expect(result).not.toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      const registerDto: RegisterDto = {
        fullName: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: Role.USER,
      };

      userService.register.mockRejectedValue(new Error('Email already registered'));

      await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login ADMIN successfully', async () => {
      const loginDto: LoginDto = {
        email: 'admin@example.com',
        password: 'password123',
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should login USER successfully', async () => {
      const user: any = { ...mockUser, email: 'user@example.com', role: Role.USER, password: 'hashedPassword123' };
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      userService.findByEmail.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result.access_token).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      jest.requireMock('bcrypt').compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('JWT payload must include sub, email, and role', async () => {
      jest.clearAllMocks();
      jest.requireMock('bcrypt').compare.mockResolvedValue(true);
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
      );
    });
  });
});
