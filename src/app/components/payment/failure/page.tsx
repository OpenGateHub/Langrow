'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailureComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const payment_id = searchParams?.get('payment_id');
    const status = searchParams?.get('status');
    
    if (!payment_id || !status) {
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="bg-white rounded-[30px] p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Error en el pago</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
        </p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full w-full"
          >
            Volver al inicio
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-block border-2 border-primary text-primary hover:bg-primary/5 font-semibold px-6 py-3 rounded-full w-full"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
} 
export default function PaymentFailure() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailureComponent />
    </Suspense>
  );
}