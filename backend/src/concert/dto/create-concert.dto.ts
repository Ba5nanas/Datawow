import { IsString, IsInt, IsPositive, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsInt()
  @IsPositive()
  totalSeats: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;
}
