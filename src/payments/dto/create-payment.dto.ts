import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-team' })
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ example: 50000, description: 'Amount in main currency unit (not cents)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'ngn', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;
}