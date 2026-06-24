import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long.' })
  password: string;

  @IsString()
  @IsEnum(UserRole, { message: 'Invalid role. Must be either admin or user.' })
  role: UserRole;
}
