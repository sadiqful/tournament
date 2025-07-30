import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is not defined in the environment variables');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata?: any;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new InternalServerErrorException('STRIPE_WEBHOOK_SECRET is not defined in the environment variables');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }
}
