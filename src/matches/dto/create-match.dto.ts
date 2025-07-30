import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStage } from '../../entities/match.entity';

export class CreateMatchDto {
  @ApiProperty({ example: 'uuid-of-team-a' })
  @IsString()
  @IsNotEmpty()
  teamAId: string;

  @ApiProperty({ example: 'uuid-of-team-b' })
  @IsString()
  @IsNotEmpty()
  teamBId: string;

  @ApiProperty({ example: '2024-12-01T15:00:00Z' })
  @IsDateString()
  matchDate: Date;

  @ApiProperty({ example: 'National Stadium, Lagos' })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({ example: MatchStage.GROUP_STAGE, enum: MatchStage })
  @IsEnum(MatchStage)
  stage: MatchStage;

  @ApiProperty({ example: 'Match day 1 - Group A', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
