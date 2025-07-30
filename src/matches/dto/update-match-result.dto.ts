import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatchResultDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  scoreA: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  scoreB: number;

  @ApiProperty({ example: 'Great match with excellent goals', required: false })
  @IsOptional()
  @IsString()
  notes: string;
}