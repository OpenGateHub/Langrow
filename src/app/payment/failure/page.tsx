"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUpdatePaymentStatus } from "@/hooks/useUpdatePaymentStatus";

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePayment, error: updateError } = useUpdatePaymentStatus();

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Otros parámetros necesarios para el backend
  const collection_id = searchParams.get("collection_id") ?? "";
  const collection_status = searchParams.get("collection_status") ?? "";
  const external_reference = searchParams.get("external_reference") ?? "";
  const payment_type = searchParams.get("payment_type") ?? "";
  const merchant_order_id = searchParams.get("merchant_order_id") ?? "";
  const preference_id = searchParams.get("preference_id") ?? "";
  const site_id = searchParams.get("site_id") ?? "";
  const processing_mode = searchParams.get("processing_mode") ?? "";
  const merchant_account_id_raw = searchParams.get("merchant_account_id");
  const merchant_account_id: string | undefined =
    !merchant_account_id_raw || merchant_account_id_raw === "null"
      ? undefined
      : merchant_account_id_raw;

  useEffect(() => {
    const pid = searchParams.get("payment_id");
    const stat = searchParams.get("status");
    setPaymentId(pid);
    setStatus(stat);
    setIsReady(true);
  }, [searchParams]);

  useEffect(() => {
    async function markPaymentAsRejected() {
      if (!paymentId || !external_reference) {
        console.warn("[PaymentFailure] Faltan datos clave para registrar pago rechazado");
        return;
      }

      try {
        await updatePayment({
          collection_id,
          collection_status,
          external_reference,
          payment_id: paymentId,
          status: "rejected",
          merchant_order_id,
          payment_type,
          preference_id,
          site_id,
          processing_mode,
          merchant_account_id,
        });

        console.info("[PaymentFailure] Pago marcado como rechazado");
      } catch (error) {
        console.error("[PaymentFailure] Error marcando pago como rechazado", error);
      }
    }

    if (isReady) {
      markPaymentAsRejected();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-lg">Procesando información del pago...</p>
      </main>
    );
  }

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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-red-800">
          Pago No Completado
        </h2>

        <p className="text-gray-600 mb-6">
          Tu pago no pudo ser procesado. No te preocupes, no se realizó ningún cargo a tu cuenta.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm font-medium">Posibles causas:</p>
          <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
            <li>Fondos insuficientes</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Pago cancelado por el usuario</li>
            <li>Problemas técnicos temporales</li>
          </ul>
        </div>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">ID de transacción:</p>
            <p className="font-mono text-sm">{paymentId}</p>
            {status && (
              <p className="text-sm text-gray-500 mt-1">Estado: {status}</p>
            )}
          </div>
        )}

        {updateError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{updateError}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Intentar nuevamente
          </button>

          <button
            onClick={() => router.push("/home")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Volver al inicio
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si el problema persiste, contacta a nuestro soporte técnico.
        </p>
      </div>
    </main>
  );
}
