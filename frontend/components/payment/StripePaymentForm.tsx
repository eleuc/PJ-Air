import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  onSuccess: () => void;
  locale: string;
}

export default function StripePaymentForm({ clientSecret, orderId, onSuccess, locale }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lbl = (es: string, en: string) => locale === 'en' ? en : es;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setErrorMessage(error.message || lbl('Ocurrió un error inesperado.', 'An unexpected error occurred.'));
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setErrorMessage(lbl('El pago no pudo procesarse por completo.', 'Payment could not be fully processed.'));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-3xl border border-border/80 shadow-inner">
      <div className="p-4 bg-muted/40 rounded-2xl border border-border/60">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#111827',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#dc2626',
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest shadow-md"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            {lbl('Procesando pago...', 'Processing payment...')}
          </>
        ) : (
          lbl('Pagar con Tarjeta', 'Pay with Card')
        )}
      </button>
    </form>
  );
}
