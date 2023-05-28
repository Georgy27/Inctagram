import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProviderType } from '../dto/checkout.dto';
import { PaymentType } from '@prisma/client';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getSubscriptionPriceById(id: string) {
    return this.prisma.price.findUnique({ where: { id } });
  }

  public getPricingTarrif(
    priceId: string,
    provider: PaymentProviderType,
    paymentType: 'ONETIME' | 'RECCURING',
  ) {
    return this.prisma.pricingTarrifs.findFirst({
      where: {
        priceId,
        provider,
        paymentType,
      },
    });
  }
}
