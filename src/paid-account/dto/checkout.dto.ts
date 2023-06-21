import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PaymentProviderType {
  Paypal = 'PAYPAL',
  Stripe = 'STRIPE',
}
export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;
  @IsEnum(PaymentProviderType)
  @IsNotEmpty()
  paymentProvider: PaymentProviderType;

  @IsBoolean()
  @IsOptional()
  renew: boolean;
}
