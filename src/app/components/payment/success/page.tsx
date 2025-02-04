'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessComponent() {
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
        <h1 className="text-3xl font-bold text-primary mb-4">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. Pronto recibirás un correo con los detalles.
        </p>
        <Link 
          href="/"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessComponent />
    </Suspense>
  );
}