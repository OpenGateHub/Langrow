"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    // Aquí puedes hacer llamadas a tu API para actualizar el estado del pago
    console.log('Pago exitoso:', { paymentId, status, externalReference });
  }, [paymentId, status, externalReference]);

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
        />
      </div>

      <div className="bg-white bg-opacity-90 shadow-lg rounded-3xl flex flex-col w-4/5 max-w-md overflow-hidden p-8 sm:p-12 my-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-2xl">✅</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-green-800">
          ¡Pago Exitoso!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. Recibirás un email de confirmación con los detalles de tu clase.
        </p>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">ID de transacción:</p>
            <p className="font-mono text-sm">{paymentId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/mis-clases')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Ver mis clases
          </button>
          
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
} 