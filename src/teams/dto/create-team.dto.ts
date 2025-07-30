import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Manchester United' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Sir Alex Ferguson' })
  @IsString()
  @IsNotEmpty()
  coach: string;

  @ApiProperty({ example: 'Best football team in the world', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'contact@manutd.com' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({ example: '+234-801-234-5678' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
