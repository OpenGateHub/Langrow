'use client';

import { useState } from 'react';
import { PaymentItem } from '@/types/payment';

interface PaymentButtonProps {
  items: PaymentItem[];
  className?: string;
  children?: React.ReactNode;
}

export default function PaymentButton({ items, className = '', children }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No init_point received');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error al iniciar el pago. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`relative ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      ) : (
        children || 'Pagar'
      )}
    </button>
  );
} 