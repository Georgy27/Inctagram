import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { User } from '@prisma/client';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export default class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_SECRET_KEY') as string,
      {
        apiVersion: '2022-11-15',
      },
    );
  }

  async stripeCheckout(
    subscriptionId: string,
    priceId: string,
    period: number,
    providerPriceId: string,
    userId: string,
    paymentId: string,
    customerId: string | null,
    mode: 'payment' | 'subscription',
  ) {
    try {
      const { email, username } = <User>(
        await this.userRepository.findUserById(userId)
      );

      let customer;

      if (!customerId) {
        console.log('new stripe customer created');
        customer = await this.stripe.customers.create({
          name: username,
          email,
        });
      } else {
        customer = await this.stripe.customers.retrieve(customerId);
      }

      const subscriptionMetaData =
        mode === 'subscription'
          ? {
              subscription_data: {
                metadata: {
                  paymentId,
                  userId,
                  period,
                  priceId,
                  subscriptionId,
                },
              },
            }
          : {};

      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: providerPriceId,
            quantity: 1,
          },
        ],
        metadata: {
          paymentId,
          userId,
          period,
          subscriptionId,
          priceId,
        },
        // payment_intent_data: {
        //   setup_future_usage: 'off_session',
        // },
        payment_method_types: ['card'],
        client_reference_id: priceId,
        customer: customer.id,
        expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
        mode: mode,
        success_url: 'https://example.com?success=true',
        cancel_url: 'https://example.com?success=true',
        ...subscriptionMetaData,
      });

      return session;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  public async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
  //
  // public async setDefaultCreditCard(
  //   paymentMethodId: string,
  //   customerId: string,
  // ) {
  //   try {
  //     return await this.stripe.customers.update(customerId, {
  //       invoice_settings: {
  //         default_payment_method: paymentMethodId,
  //       },
  //     });
  //   } catch (error: any) {
  //     if (error?.type === StripeError.InvalidRequest) {
  //       throw new BadRequestException('Wrong credit card chosen');
  //     }
  //     throw new InternalServerErrorException();
  //   }
  // }
  // public async createSubscription(priceId: string, customerId: string) {
  //   console.log(customerId);
  //   try {
  //     return await this.stripe.subscriptions.create({
  //       customer: customerId,
  //       items: [
  //         {
  //           price: priceId,
  //         },
  //       ],
  //     });
  //   } catch (error: any) {
  //     console.log(error);
  //     if (error?.code === StripeError.ResourceMissing) {
  //       throw new BadRequestException('Credit card not set up');
  //     }
  //     throw new InternalServerErrorException();
  //   }
  // }
}
