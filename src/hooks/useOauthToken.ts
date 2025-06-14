import { useCallback, useState } from 'react';

export function useOauthToken() {
  // const [userId, setUserId] = useState<string | undefined>(undefined);
  const [stateToken, setStateToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOauthToken = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/oauth-state-token?userId=' + encodeURIComponent(userId));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error fetching OAuth state token');
      }

      setStateToken(data.state);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

/*    const setUser = useCallback((id: string) => {
    setUserId(id);  
   }, []); */

  return { stateToken, fetchOauthToken, loading, error };
}
