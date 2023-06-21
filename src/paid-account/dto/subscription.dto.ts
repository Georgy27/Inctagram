import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentProviderType } from './checkout.dto';

export class SubscriptionDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;
  @IsEnum(PaymentProviderType)
  @IsNotEmpty()
  paymentProvider: PaymentProviderType;
}
