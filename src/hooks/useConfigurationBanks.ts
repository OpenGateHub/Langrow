import { useState, useEffect } from "react";

interface Bank {
  id: number;
  created_at: string;
  name: string;
  updated_at?: string;
}

export function useConfigurationBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * GET - Obtiene la lista completa de cuentas bancarias desde el backend (modo admin).
   */
  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bank");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al obtener datos bancarios");
      setBanks(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return {
    banks,                   // Lista de cuentas disponibles configuradas
    loading,                 // Estado de carga general
    error,                   // Último error registrado
  };
}
