"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCreateMentoring } from "@/hooks/useMentoring";
import { useProfileContext } from "@/context/ProfileContext";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);
  const { create, loading: createLoading, error: createError } = useCreateMentoring();
  const { clerkUser } = useProfileContext();
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    console.log('[PaymentSuccess] useEffect triggered', { paymentId, status, externalReference, clerkUser });
    if (!paymentId || !externalReference || !clerkUser?.id) {
      console.error('[PaymentSuccess] Faltan datos requeridos', { paymentId, externalReference, clerkUser });
      setIsLoading(false);
      return;
    }

    // Extraer información del externalReference
    // Formato: 'reserva-{purchaseId}-{alumnoId}'
    const parts = externalReference.split('-');
    if (parts.length < 3) {
      console.error('[PaymentSuccess] Formato de external_reference inválido', externalReference);
      setIsLoading(false);
      return;
    }
    
    const purchaseId = parts[1];
    const alumnoId = parts[2];
    
    async function processSuccessfulPayment() {
      try {
        console.log('[PaymentSuccess] Registrando pago exitoso', { paymentId, status, purchaseId, alumnoId });
        
        // 1.5 Obtener el profileId desde el alumnoId (Clerk ID)
        const profileResponse = await fetch(`/api/profile/${alumnoId}`);
        if (!profileResponse.ok) {
          console.error('[PaymentSuccess] Error al obtener el perfil del usuario');
          setIsLoading(false);
          return;
        }
        
        const profileData = await profileResponse.json();
        const profileId = profileData.data?.id;
        
        if (!profileId) {
          console.error('[PaymentSuccess] No se pudo obtener el ID del perfil');
          setIsLoading(false);
          return;
        }

        // 2. Crear la clase usando el hook useCreateMentoring
        const classData = {
          studentId: profileId.toString(), // Convertir a string para el hook
          professorId: parseInt(parts[3] || '1'), // Usar el profesorId si está disponible, o default a 1
          category: 1, // Categoría por defecto
          date: new Date().toISOString().split('T')[0], // Fecha actual
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + 
                " - " + 
                new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), // Hora actual + 1 hora
          duration: "60", // Duración por defecto en minutos
          cost: "0", // El costo ya fue pagado
          title: `Clase reservada - ${purchaseId}`,
          requestDescription: `Clase reservada mediante pago ${paymentId}`
        };

        console.log('[PaymentSuccess] Creando clase con datos', classData);
        const result = await create(classData);
        
        if (result && result.result) {
          console.log('[PaymentSuccess] Clase creada con éxito', result);
          // La clase se creó exitosamente, pero necesitamos obtener su ID
          // Hacemos una consulta para obtener la clase recién creada
          const classResponse = await fetch(`/api/mentoring?userId=${clerkUser?.id}&status=REQUESTED`);
          if (classResponse.ok) {
            const classData = await classResponse.json();
            if (classData.data && classData.data.length > 0) {
              // Tomamos la clase más reciente
              const latestClass = classData.data[0];
              setClassId(latestClass.id.toString());
              console.log('[PaymentSuccess] Clase encontrada y seteada', latestClass);
            }
          }
        } else {
          console.error('[PaymentSuccess] Error al crear la clase', createError);
        }

        setIsLoading(false);
        
        // 3. Redirección automática a la página de la clase específica
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              if (classId) {
                router.push(`/class/${classId}`);
              } else {
                router.push('/mis-clases');
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } catch (error) {
        console.error('[PaymentSuccess] Error procesando el pago exitoso', error);
        setIsLoading(false);
      }
    }
    
    processSuccessfulPayment();
  }, [paymentId, status, externalReference, router, create, clerkUser?.id, classId]);

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

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">ID de transacción:</p>
            <p className="font-mono text-sm">{paymentId}</p>
          </div>
        )}

        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{createError}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => classId ? router.push(`/class/${classId}`) : router.push('/mis-clases')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            disabled={isLoading || createLoading}
          >
            {isLoading || createLoading ? 'Procesando...' : 'Ver mi clase'}
          </button>
          
          <button
            onClick={() => router.push('/mis-clases')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
            disabled={isLoading || createLoading}
          >
            Ver todas mis clases
          </button>

          {!isLoading && !createLoading && (
            <p className="text-sm text-gray-500 mt-4">
              Redireccionando automáticamente en {countdown} segundos...
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 