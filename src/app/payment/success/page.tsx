"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCreateMentoring } from "@/hooks/useMentoring";
import { useUpdatePaymentStatus } from "@/hooks/useUpdatePaymentStatus";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false); // 👈 para evitar re-ejecución en dev

  const { updatePayment, loading: updateLoading, error: updateError } = useUpdatePaymentStatus();

  // Extraer parámetros desde URL
  const collection_id = searchParams.get("collection_id") ?? "";
  const collection_status = searchParams.get("collection_status") ?? "";
  const payment_id = searchParams.get("payment_id") ?? "";
  const status = searchParams.get("status") ?? "";
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
    if (hasProcessed) return;

    let timer: NodeJS.Timeout;

    async function processSuccessfulPayment() {
      setHasProcessed(true);

      if (!payment_id || !external_reference) {
        console.error("[PaymentSuccess] Faltan datos requeridos", {
          payment_id,
          external_reference,
        });
        setIsLoading(false);
        return;
      }

      if (status !== "approved") {
        console.warn("[PaymentSuccess] El pago no fue aprobado", { status });
        setIsLoading(false);
        return;
      }

      const parts = external_reference.split("-");
      if (parts.length < 3) {
        console.error("[PaymentSuccess] Formato inválido en external_reference", external_reference);
        setIsLoading(false);
        return;
      }

      try {
        await updatePayment({
          collection_id,
          collection_status,
          external_reference,
          payment_id,
          status,
          merchant_order_id,
          payment_type,
          preference_id,
          site_id,
          processing_mode,
          merchant_account_id,
        });

        if (updateError) {
          console.error("[PaymentSuccess] Error actualizando el pago", updateError);
          setIsLoading(false);
          return;
        }

        // Temporizador
        timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              router.push(classId ? `/class/${classId}` : "/mis-clases");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        console.error("[PaymentSuccess] Error general", error);
      } finally {
        setIsLoading(false);
      }
    }

    processSuccessfulPayment();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    hasProcessed,
    collection_id,
    collection_status,
    external_reference,
    payment_id,
    status,
    merchant_order_id,
    payment_type,
    preference_id,
    site_id,
    processing_mode,
    merchant_account_id,
    updateError,
    updatePayment,
    router,
    classId,
  ]);

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
          Tu pago ha sido procesado correctamente. Se ha creado tu clase.
        </p>

        {payment_id && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">ID de transacción:</p>
            <p className="font-mono text-sm">{payment_id}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push(classId ? `/class/${classId}` : "/mis-clases")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            disabled={isLoading || updateLoading}
          >
            {isLoading || updateLoading
              ? "Procesando..."
              : "Ver mi clase"}
          </button>

          <button
            onClick={() => router.push("/mis-clases")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
            disabled={isLoading || updateLoading}
          >
            Ver todas mis clases
          </button>

          {!isLoading && !updateLoading && (
            <p className="text-sm text-gray-500 mt-4">
              Redireccionando automáticamente en {countdown} segundos...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
