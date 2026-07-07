import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' } as any);

// Simple in-server plan catalogue. In production, map these to Stripe product/price IDs.
const PLANS = [
  { id: 'basic', name: 'Basic', price: 0, currency: 'INR', stripePriceId: null },
  { id: 'pro', name: 'Pro', price: 29900, currency: 'INR', stripePriceId: process.env.STRIPE_PRICE_PRO || null },
  { id: 'premium', name: 'Premium', price: 49900, currency: 'INR', stripePriceId: process.env.STRIPE_PRICE_PREMIUM || null },
];

export const listPlans = async (_req: Request, res: Response) => {
  return res.json({ plans: PLANS.map((p) => ({ id: p.id, name: p.name, price: p.price, currency: p.currency })) });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body as { planId: string; successUrl?: string; cancelUrl?: string };
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return res.status(400).json({ error: 'Unknown plan' });

    // For free plan, simply return success
    if (plan.price === 0) {
      return res.json({ url: successUrl || 'about:blank', sessionId: null });
    }

    if (!stripeSecret) {
      return res.status(500).json({ error: 'Stripe not configured on server' });
    }

    // If stripePriceId is provided via env, use Checkout. Otherwise create PaymentIntent for one-time token.
    if (plan.stripePriceId) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: successUrl || 'https://example.com/success',
        cancel_url: cancelUrl || 'https://example.com/cancel',
      });
      return res.json({ url: session.url, sessionId: session.id });
    }

    // Fallback: create a PaymentIntent (one-off) and return client_secret so client can handle payment.
    const paymentIntent = await stripe.paymentIntents.create({ amount: plan.price, currency: plan.currency.toLowerCase(), automatic_payment_methods: { enabled: true } });
    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create checkout session' });
  }
};
