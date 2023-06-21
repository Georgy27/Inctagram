export interface StripeEvent<T> {
  id: string;
  object: 'event';
  api_version: string | null;
  created: number;
  data: {
    object: T;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
  type: string;
}

export interface StripeCheckoutSessionObject {
  id: string;
  object: 'checkout.session';
  metadata: { customerId: string; paymentId: string };
  mode: 'payment' | 'subscription';
  invoice: string;
  payment_status: 'paid';
  payment_intent: string;
  status: 'complete';
  subscription: string | null;
}
