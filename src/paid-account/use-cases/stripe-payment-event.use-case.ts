import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import StripeService from '../services/stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionQueryRepository } from '../repositories/subscription.query.repository';
import { StripeCheckoutSessionObject } from '../interfaces/events.interface';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import {
  SubscriptionStatus,
  SubscriptionType,
  PaymentStatus,
  Subscription,
  PaymentProvider,
  PaymentReference,
} from '@prisma/client';
import Stripe from 'stripe';
import { NotFoundException } from '@nestjs/common';
import { addDays, addSeconds } from 'date-fns';
export class HandleStripePaymentEventsCommand {
  public constructor(public signature: string, public payload: Buffer) {}
}
@CommandHandler(HandleStripePaymentEventsCommand)
export class HandleStripePaymentEventsUseCase
  implements ICommandHandler<HandleStripePaymentEventsCommand>
{
  // private paymentServices: PaymentServices = {};

  public constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly subscriptionQueryRepository: SubscriptionQueryRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  public async execute(command: HandleStripePaymentEventsCommand) {
    const event: any = await this.stripeService.constructEventFromPayload(
      command.signature,
      command.payload,
    );

    // single payment
    if (event.type === 'checkout.session.completed') {
      console.log('inside checkout session');
      if (!event.data.object.subscription) {
        console.log('inside checkout session completed');

        const data = event.data.object as Stripe.Checkout.Session;

        const customerId: string = data.customer as string;
        const client_reference_id = data.client_reference_id as string;
        const { paymentId, userId, period, subscriptionId } =
          event.data.object.metadata;

        const subscriptionTransaction =
          await this.handleSubscriptionTransaction(
            subscriptionId,
            period,
            customerId,
            paymentId,
            SubscriptionType.ONETIME,
          );
      }
    }

    // first subscription payment/ subscription cancelled
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.deleted'
    ) {
      console.log('inside subscription payment event');
      const subscriptionData = event.data.object as Stripe.Subscription;

      const customerId: string = subscriptionData.customer as string;
      const { paymentId, userId, priceId, period, subscriptionId } =
        event.data.object.metadata;
      const subscriptionStatus = subscriptionData.status;
      const { current_period_end } = subscriptionData;
      const nextPaymentDate = new Date(current_period_end * 1000);

      if (subscriptionStatus === 'active') {
        console.log('inside subscription status active');
        console.log(subscriptionData);
        const subscriptionTransaction =
          await this.handleSubscriptionTransaction(
            subscriptionId,
            period,
            customerId,
            paymentId,
            SubscriptionType.RECCURING,
            nextPaymentDate,
          );
      }

      if (subscriptionStatus === 'canceled') {
        await this.subscriptionRepository.cancelSubscription(subscriptionId);
        console.log('Your subscription has been cancelled');
      }
    }

    // reccuring subscription payments
    if (event.type === 'invoice.paid') {
      console.log('INSIDE INVOICE PAID EVENT');
      const data = event.data.object as Stripe.Invoice;
      console.log(data);
      const customerId = data.customer;

      const subscriptionInvoice = data.subscription;

      if (subscriptionInvoice && data.billing_reason === 'subscription_cycle') {
        console.log('SUBSCRIPTION INVOICE');

        const retrievedSubscription =
          await this.stripeService.retrieveSubscription(
            subscriptionInvoice as string,
          );
        console.log('STRIPE INVOICE');
        console.log(data);
        // console.log(retrievedSubscription);
        const { paymentId, userId, priceId, period, subscriptionId } =
          retrievedSubscription.metadata;
      }
    }
  }

  async handleSubscriptionTransaction(
    subscriptionId: string,
    period: number,
    customerId: string,
    paymentId: string,
    subscriptionType: SubscriptionType,
    nextPaymentDate?: Date,
    subscriptionData?: any,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const currentSubscription = await tx.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!currentSubscription)
        throw new NotFoundException('Something went wrong');

      const endDate = this.calculateSubscriptionDates(
        currentSubscription,
        period,
      );

      const updateSubscriptionInfo =
        await this.subscriptionRepository.updateSubscription(
          tx,
          currentSubscription.userId,
          subscriptionId,
          endDate,
          subscriptionType,
          customerId,
          nextPaymentDate,
        );

      const updatePaymentStatus =
        await this.subscriptionRepository.updatePaymentStatusAndAccountTypeTransaction(
          tx,
          paymentId,
          currentSubscription.userId,
          subscriptionData,
        );
    });
  }

  async handleReccuringSubscriptionPaymentTransaction(
    subscriptionId: string,
    period: number,
    customerId: string,
    paymentId: string,
    subscriptionType: SubscriptionType,
    nextPaymentDate?: Date,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const currentSubscription = await tx.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!currentSubscription)
        throw new NotFoundException('Something went wrong');

      const endDate = this.calculateSubscriptionDates(
        currentSubscription,
        period,
      );

      const updateSubscriptionInfo =
        await this.subscriptionRepository.updateSubscription(
          tx,
          currentSubscription.userId,
          subscriptionId,
          endDate,
          subscriptionType,
          customerId,
          nextPaymentDate,
        );

      const createPayment = await tx.payment.create({
        data: {
          userId: currentSubscription.userId,
          priceId: currentSubscription.priceId,
          status: PaymentStatus.CONFIRMED,
          provider: PaymentProvider.STRIPE,
          reference: PaymentReference.RECCURING,
          pricingTarrifId: '123',
          subscriptionId: currentSubscription.id,
        },
      });
    });
  }

  calculateSubscriptionDates(
    currentSubscription: Subscription,
    period: number,
  ) {
    const currentEndDate = currentSubscription.endDate;

    const endDate =
      currentEndDate && currentEndDate > new Date(Date.now())
        ? addDays(currentEndDate, period)
        : addDays(Date.now(), period);
    return endDate;
  }
}
