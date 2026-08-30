import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import { api } from '@/lib/api';
import { CreditCard, Loader2 } from 'lucide-react';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  locale: string;
}

export default function PaymentGateway({ orderId, amount, onSuccess, locale }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);

  const lbl = (es: string, en: string) => locale === 'en' ? en : es;

  useEffect(() => {
    if (paymentMethod !== 'stripe') return;

    const fetchClientSecret = async () => {
      setIsLoadingSecret(true);
      try {
        const res = await api.post('/payments/stripe/create-intent', { orderId }) as any;
        if (res?.clientSecret) {
          setClientSecret(res.clientSecret);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
      } finally {
        setIsLoadingSecret(false);
      }
    };

    fetchClientSecret();
  }, [paymentMethod, orderId]);

  return (
    <div className="bg-card rounded-[32px] border border-border p-8 shadow-xl space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
          <CreditCard className="text-primary" />
          {lbl('Pagar Pedido', 'Pay Order')}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {lbl('Selecciona un método de pago seguro para completar tu pedido.', 'Select a secure payment method to complete your order.')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-muted rounded-2xl">
        <button
          onClick={() => setPaymentMethod('stripe')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            paymentMethod === 'stripe'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Stripe (Tarjeta)
        </button>
        <button
          onClick={() => setPaymentMethod('paypal')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            paymentMethod === 'paypal'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          PayPal
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {paymentMethod === 'stripe' ? (
          isLoadingSecret ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">{lbl('Iniciando pasarela...', 'Initializing gateway...')}</span>
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                orderId={orderId}
                onSuccess={onSuccess}
                locale={locale}
              />
            </Elements>
          ) : (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-semibold text-center">
              {lbl('No se pudo iniciar la pasarela de Stripe.', 'Could not initialize Stripe gateway.')}
            </div>
          )
        ) : (
          <PayPalCheckoutButton
            orderId={orderId}
            amount={amount}
            onSuccess={onSuccess}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

