'use client';

import { useEffect, useState } from 'react';
import ZoomIntegration from '@/lib/ZoomIntegration';
import { useProfileContext } from "@/context/ProfileContext";

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export default function ZoomCallbackPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const { role, clerkUser, profile, loading, error } = useProfileContext();

  useEffect(() => {
    const getToken = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code || !profile?.id) return;

      const zoom = new ZoomIntegration();
      try {
        const data = await zoom.getAccessToken(code);
        setTokenData(data);
        await createSecret(profile.id, data);
      } catch (error) {
        console.error('Error al obtener token:', error);
      }
    };

    if (!loading && !error && profile?.id) {
      getToken();
    }
  }, [loading, error, profile]);

  const createSecret = async (userId: number, tokenData: TokenData) => {
    const { access_token, refresh_token, expires_in, scope } = tokenData;

    const secret = {
      userId: userId,
      token: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      scope: scope,
    };

    const response = await fetch('/api/zoom-meetings/secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secret),
    });

    if (!response.ok) {
      throw new Error('Error al guardar el secreto de Zoom');
    }

    return response.json();
  }

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p>Error: {error}</p>;

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
