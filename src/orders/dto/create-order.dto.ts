import { IsString, IsArray, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED'
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  courseIds: string[];

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paymentAmount?: number; // Số tiền khách thanh toán cho lần sinh QR này

  @IsString()
  @IsOptional()
  primaryCourseId?: string; // Khóa học đại diện để đưa mã vào Memo QR
}
