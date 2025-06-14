'use client';

import { useEffect, useState } from 'react';
import { useProfileContext } from "@/context/ProfileContext";
import LoadingScreen from '../../components/LoadingScreen';

export default function ZoomCallbackPage() {
  const [result, setResult] = useState<null | { success: boolean; message: string }>({
    success: false,
    message: 'Procesando...',
  });
  const { profile, loading, error } = useProfileContext();

  useEffect(() => {
    const sendCodeToBackend = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) {
        setResult({ success: false, message: 'Código de autorización no encontrado.' });
        return;
      }

      if (!profile?.id) return;

      try {
        const response = await fetch('/api/zoom-meetings/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, userId: profile.id }),
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || 'Error inesperado del servidor');
        }

        setResult({ success: true, message: 'Integración con Zoom completada exitosamente.' });
      } catch (err: any) {
        setResult({ success: false, message: `Error: ${err.message}` });
      }
    };

    if (!loading && !error && profile?.id) {
      sendCodeToBackend();
    }
  }, [loading, error, profile]);

  if (loading) return <LoadingScreen message="Conectando con Zoom..." />;
  if (error) return <p>Error cargando perfil: {error}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-4">Resultado de autenticación con Zoom</h2>
        <p className={`text-lg ${result?.success ? 'text-green-600' : 'text-red-600'}`}>
          {result?.message}
        </p>
      </div>
    </div>
  );
}
