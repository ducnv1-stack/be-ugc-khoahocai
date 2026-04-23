import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MARKETING', 'OPERATIONS', 'HR', 'FACILITIES', 'SOFTWARE', 'TEACHING', 'OTHER'])
  category?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MARKETING', 'SALES', 'OPERATIONS', 'TEACHING', 'GENERAL'])
  costCenter?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'CARD', 'EWALLET', 'OTHER'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @IsIn(['FIXED', 'VARIABLE'])
  nature?: string;

  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
