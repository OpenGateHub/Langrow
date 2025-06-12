"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (!paymentId || !externalReference) return;

    // Extraer información del externalReference
    // Formato: 'reserva-{purchaseId}-{alumnoId}'
    const parts = externalReference.split('-');
    if (parts.length < 3) return;
    
    const purchaseId = parts[1];
    const alumnoId = parts[2];
    
    async function processSuccessfulPayment() {
      try {
        // 1. Registrar el pago exitoso
        console.log('Registrando pago exitoso:', { paymentId, status, purchaseId, alumnoId });
        
        // 1.5 Obtener el profileId desde el alumnoId (Clerk ID)
        const profileResponse = await fetch(`/api/profile/${alumnoId}`);
        if (!profileResponse.ok) {
          console.error('Error al obtener el perfil del usuario');
          setIsLoading(false);
          return;
        }
        
        const profileData = await profileResponse.json();
        const profileId = profileData.data?.id;
        
        if (!profileId) {
          console.error('No se pudo obtener el ID del perfil');
          setIsLoading(false);
          return;
        }
        
        // 2. Crear el enlace de Google Meet
        const meetingLink = `https://meet.google.com/random-meeting-${Math.floor(Math.random() * 1000)}`;
        
        // 3. Crear la clase en la base de datos
        const classData = {
          alumnoId: profileId,
          profesorId: parseInt(parts[3] || '1'), // Usar el profesorId si está disponible, o default a 1
          purchaseId: purchaseId,
          paymentId: paymentId,
          status: 'confirmed',
          meetingLink: meetingLink,
          meetingDate: new Date().toISOString(),
        };
        
        const classResponse = await fetch('/api/class', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classData),
        });
        
        if (classResponse.ok) {
          const classResult = await classResponse.json();
          setClassId(classResult.data?.id);
          console.log('Clase creada con éxito:', classResult);
        } else {
          console.error('Error al crear la clase');
        }
        
        // 4. Crear notificación con la URL de la reunión
        const notificationResponse = await fetch('/api/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: profileId,
            message: `¡Tu clase ha sido confirmada! Haz clic aquí para acceder al enlace de la reunión: ${meetingLink}`,
            url: meetingLink,
            isStaff: false
          }),
        });
        
        if (notificationResponse.ok) {
          console.log('Notificación creada con éxito');
        } else {
          console.error('Error al crear la notificación');
        }

        setIsLoading(false);
        
        // 5. Redirección automática a la página de la clase específica
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              if (classResult?.data?.id) {
                router.push(`/class/${classResult.data.id}`);
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
        console.error('Error procesando el pago exitoso:', error);
        setIsLoading(false);
      }
    }
    
    processSuccessfulPayment();
  }, [paymentId, status, externalReference, router]);

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
          Tu pago ha sido procesado correctamente. Se ha creado tu clase con el enlace de la reunión.
        </p>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">ID de transacción:</p>
            <p className="font-mono text-sm">{paymentId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => classId ? router.push(`/class/${classId}`) : router.push('/mis-clases')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Ver mi clase
          </button>
          
          <button
            onClick={() => router.push('/mis-clases')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Ver todas mis clases
          </button>

          {!isLoading && (
            <p className="text-sm text-gray-500 mt-4">
              Redireccionando automáticamente en {countdown} segundos...
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 