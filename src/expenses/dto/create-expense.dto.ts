import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsEnum(['ADVERTISING', 'OPERATIONS', 'EQUIPMENT'])
  type: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
