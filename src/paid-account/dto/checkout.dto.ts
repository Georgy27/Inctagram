import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PaymentSystemType {
  Paypal = 'paypal',
  Stripe = 'stripe',
}
export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsNotEmpty()
  priceId: string;
  @IsEnum(PaymentSystemType)
  @IsNotEmpty()
  paymentSystem: PaymentSystemType;
  @IsBoolean()
  @IsOptional()
  renew: boolean = false;
}
