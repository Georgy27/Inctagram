import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProviderType } from '../dto/checkout.dto';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getSubscriptionPriceById(id: string) {
    return this.prisma.price.findUnique({ where: { id } });
  }

  public getPricingTarrif(
    priceId: string,
    provider: PaymentProviderType,
    subscriptionType: 'ONETIME' | 'RECCURING',
  ) {
    return this.prisma.pricingTarrifs.findFirst({
      where: {
        priceId,
        provider,
        subscriptionType,
      },
    });
  }

  // public async getSubscriptionByQuery(query: Partial<Subscription>) {
  //   try {
  //     return this.prisma.subscription.findFirst({
  //       where: query,
  //       include: {
  //         subscriptionPayment: {
  //           select: {
  //             id: true,
  //             paymentId: true,
  //           },
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //
  //     throw error;
  //   }
  // }

  public async getCurrentSubscription(userId: string) {
    return this.prisma.subscription.findFirst({ where: { userId } });
  }
}
