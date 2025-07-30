import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlayerPosition } from '../../entities/player.entity';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Cristiano Ronaldo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 38 })
  @IsNumber()
  @Min(16)
  @Max(45)
  age: number;

  @ApiProperty({ example: PlayerPosition.FORWARD, enum: PlayerPosition })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(1)
  @Max(99)
  jerseyNumber: number;

  @ApiProperty({ example: 'uuid-of-team' })
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsOptional()
  @IsString()
  photo?: string;
}