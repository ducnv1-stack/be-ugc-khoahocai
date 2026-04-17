import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  cccd?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  assignedSaleId?: string;
}
