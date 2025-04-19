'use client';

import { useEffect, useState } from 'react';
import ZoomIntegration from '@/lib/ZoomIntegration';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export default function ZoomCallbackPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) return;

      const zoom = new ZoomIntegration();
      try {
        const data = await zoom.getAccessToken(code);
        setTokenData(data);
      } catch (error) {
        console.error('Error al obtener token:', error);
      }
    };

    getToken();
  }, []);

  return (
    <div>
      <h2>Resultado de autenticación con Zoom</h2>
      {tokenData ? (
        <pre>{JSON.stringify(tokenData, null, 2)}</pre>
      ) : (
        <p>Procesando token...</p>
      )}
    </div>
  );
}
