export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SVDpJ3NWMUpuY7rP0ZHPLxY',
    name: 'démonstration',
    description: 'une marque unique',
    mode: 'subscription',
  },
];