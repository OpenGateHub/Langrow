import { useCallback, useState } from 'react';

export function useOauthToken() {
  const [stateToken, setStateToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchOauthToken = useCallback(async (userId: string) => {
    // Evitar múltiples llamadas para el mismo userId
    if (hasFetched || loading) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setHasFetched(true);
    
    try {
      const res = await fetch('/api/auth/oauth-state-token?userId=' + encodeURIComponent(userId));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error fetching OAuth state token');
      }

      setStateToken(data.state);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setHasFetched(false); // Permitir reintentar en caso de error
    } finally {
      setLoading(false);
    }
  }, [hasFetched, loading]);

  // Función para resetear el estado del hook
  const resetState = useCallback(() => {
    setStateToken(null);
    setLoading(false);
    setError(null);
    setHasFetched(false);
  }, []);

  return { stateToken, fetchOauthToken, loading, error, resetState };

/*    const setUser = useCallback((id: string) => {
    setUserId(id);  
   }, []); */

  return { stateToken, fetchOauthToken, loading, error };
}
