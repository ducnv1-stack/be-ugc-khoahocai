export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare class CreateOrderDto {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    customerCccd?: string;
    customerAddress?: string;
    courseIds: string[];
    discountType?: DiscountType;
    discountValue?: number;
    paymentAmount?: number;
    primaryCourseId?: string;
    customerNotes?: string;
}
