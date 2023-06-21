import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SubscriptionStatus,
  SubscriptionType,
  PaymentStatus,
} from '@prisma/client';
import Stripe from 'stripe';
@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async updateSubscription(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    userId: string,
    subscriptionId: string,
    endDate: Date,
    type: SubscriptionType,
    customerId: string,
    nextPaymentDate?: Date,
  ) {
    try {
      return tx.subscription.update({
        data: {
          endDate,
          nextPaymentDate,
          type,
          customerId,
          status: SubscriptionStatus.ACTIVE,
        },
        where: {
          id: subscriptionId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async cancelSubscription(id: string) {
    try {
      return this.prisma.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async updateSubscriptionEndDate(
    userId: string,
    customerId: string,
    endDate: Date,
  ) {
    try {
      return this.prisma.subscription.update({
        where: {},
        data: {
          status: SubscriptionStatus.ACTIVE,
          type: SubscriptionType.RECCURING,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  public async updatePaymentStatusAndAccountTypeTransaction(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    paymentId: string,
    userId: string,
    info: Stripe.Checkout.Session | Stripe.Subscription,
  ) {
    // const json = info as Prisma.InputJsonObject;
    try {
      const updatePayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'CONFIRMED',
          // info: json,
        },
      });

      const updateAccount = await tx.account.update({
        where: { userId },
        data: { accountType: 'BUSINESS' },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
