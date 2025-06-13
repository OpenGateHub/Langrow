"use client";

import React, { useEffect } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import Image from "next/image";

export default function GoogleAuthPage() {
  const { profile, loading, error } = useProfileContext();

  const handleGoogleAuth = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      prompt: 'consent'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

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

      <div className="bg-white bg-opacity-70 shadow-lg rounded-3xl flex flex-col w-4/5 max-w-md overflow-hidden p-8 sm:p-12 my-4">
        <div className="flex justify-center mb-6">
          <Image src="/logo-primary.png" width={40} height={40} alt="logo" />
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Conectar Google Calendar
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          Para poder crear y gestionar tus clases online, necesitamos acceso a tu Google Calendar para crear reuniones de Google Meet automáticamente.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h3 className="font-medium text-blue-900 mb-2">¿Qué permisos necesitamos?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Crear eventos en tu calendario</li>
              <li>• Generar enlaces de Google Meet</li>
              <li>• Gestionar tus clases programadas</li>
            </ul>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-3 shadow-sm hover:bg-gray-50 transition duration-200"
          >
            <img src="/google.png" alt="Google" className="w-5 h-5 mr-3" />
            <span className="font-medium">Conectar con Google Calendar</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Tus datos están seguros. Solo usamos estos permisos para gestionar tus clases en Langrow.
        </p>
      </div>
    </main>
  );
} 