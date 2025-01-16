import PaymentButton from '@/components/PaymentButton';
import { PaymentItem } from '@/types/payment';

export default function PaymentPage() {
  const paymentItems: PaymentItem[] = [
    {
      title: 'Clase de Inglés',
      quantity: 1,
      unit_price: 29.99
    }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Completar Pago</h1>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span>Clase de Inglés</span>
            <span>$29.99 USD</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>$29.99 USD</span>
          </div>
        </div>

        <PaymentButton 
          items={paymentItems}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Proceder al pago
        </PaymentButton>
      </div>
    </main>
  );
}
