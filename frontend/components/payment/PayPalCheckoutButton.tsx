import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  locale: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalCheckoutButton({ orderId, amount, onSuccess, locale }: PayPalCheckoutButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  const lbl = (es: string, en: string) => locale === 'en' ? en : es;

  useEffect(() => {
    // Check if script is already loaded
    if (window.paypal) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // Using a sandbox client ID for testing mode. This can be configured dynamically.
    script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=NZD`;
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      setError(lbl('Error al cargar PayPal SDK.', 'Failed to load PayPal SDK.'));
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in document to avoid reloading on multiple mounts
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.paypal || !paypalContainerRef.current) return;

    // Clear previous button render
    paypalContainerRef.current.innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toFixed(2),
              currency_code: 'NZD',
            },
            description: `Pedido #${orderId.slice(0, 8)}`,
          }],
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          const transactionId = details.id;

          // Call backend to capture/register PayPal payment
          await api.post('/payments/paypal/capture', {
            orderId,
            transactionId,
          });

          onSuccess();
        } catch (err: any) {
          setError(lbl('Error al capturar el pago con PayPal.', 'Error capturing PayPal payment.'));
        }
      },
      onError: (err: any) => {
        setError(lbl('Ocurrió un error con el botón de PayPal.', 'An error occurred with the PayPal button.'));
      },
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'paypal',
        height: 48,
      }
    }).render(paypalContainerRef.current);
  }, [isLoaded, amount, orderId]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold">
          {error}
        </div>
      )}

      {!isLoaded && (
        <div className="py-4 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">{lbl('Cargando PayPal...', 'Loading PayPal...')}</span>
        </div>
      )}

      <div ref={paypalContainerRef} className="w-full min-h-[48px]" />
    </div>
  );
}
