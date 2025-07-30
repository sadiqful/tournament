import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerPosition } from '../../entities/player.entity';

class BulkPlayerDto {
  @ApiProperty({ example: 'Lionel Messi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 36 })
  age: number;

  @ApiProperty({ example: PlayerPosition.FORWARD })
  position: PlayerPosition;

  @ApiProperty({ example: 10 })
  jerseyNumber: number;

  @IsOptional()
  photo?: string;
}

export class CreateBulkPlayersDto {
  @ApiProperty({ example: 'uuid-of-team' })
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ type: [BulkPlayerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPlayerDto)
  players: BulkPlayerDto[];
}