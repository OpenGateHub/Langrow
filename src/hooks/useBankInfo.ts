import { useState, useEffect } from "react";

/**
 * Representa una cuenta bancaria registrada por un usuario o admin.
 */
interface BankInfo {
  bank_id: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  dni_number: string;
  dni_type: string;
  alias: string;
  profile_id: number;
  isPrimary: boolean;
  code?: string; // identificador único usado para actualizaciones
}

/**
 * Payload que se espera al actualizar una cuenta bancaria.
 * Solo debe incluir campos que hayan cambiado.
 */
interface UpdateBankPayload {
  bankCode: string;
  bankData: Partial<BankInfo>;
}

/**
 * Hook personalizado para gestionar operaciones relacionadas con la información bancaria.
 * Expone métodos para listar, crear, actualizar y consultar cuentas bancarias,
 * tanto para vistas de administrador como para usuarios finales.
 */
export function useBankInfo() {
  const [banks, setBanks] = useState<BankInfo[]>([]);
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

  /**
   * POST - Crea una nueva cuenta bancaria en el sistema (modo admin).
   * @param payload Objeto con los datos completos de la cuenta a registrar.
   * @returns La respuesta del backend o null si hay error.
   */
  const createBank = async (payload: BankInfo) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al crear cuenta bancaria");
      await fetchBanks(); // Actualiza la lista luego de crear
      return json;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * PATCH - Actualiza los datos de una cuenta bancaria específica (modo admin).
   * @param payload Contiene el código único de la cuenta y los campos a modificar.
   * @returns La respuesta del backend o null si hay error.
   */
  const updateBank = async (payload: UpdateBankPayload) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al actualizar cuenta bancaria");
      await fetchBanks(); // Actualiza la lista luego de modificar
      return json;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * GET - Obtiene las cuentas bancarias del usuario autenticado con los datos enmascarados.
   * Usado en vistas donde el usuario final ve sus propias cuentas.
   */
  const getMaskedBankInfo = async (): Promise<BankInfo[] | null> => {
    try {
      setLoading(true);
      const res = await fetch("/api/bank-info");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al obtener información enmascarada");
      return json.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * POST - Consulta detallada y desencriptada de una cuenta bancaria mediante su código único (modo admin).
   * Se utiliza para inspección de datos completos desde el panel de administración.
   * @param bankCode Código único (uuid) de la cuenta bancaria.
   * @returns Datos desencriptados de la cuenta o null si falla.
   */
  const getPlainBankInfoByCode = async (bankCode: string): Promise<Partial<BankInfo> | null> => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bank-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al obtener datos desencriptados");
      return json.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto inicial: carga automática de datos bancarios (modo admin) al montar el componente.
   */
  useEffect(() => {
    fetchBanks();
  }, []);

  return {
    banks,                   // Lista de cuentas disponibles (admin)
    loading,                 // Estado de carga general
    error,                   // Último error registrado
    fetchBanks,              // Refresca la lista de cuentas
    createBank,              // Crea una nueva cuenta
    updateBank,              // Modifica una cuenta existente
    getMaskedBankInfo,       // Obtiene las cuentas del usuario autenticado (enmascaradas)
    getPlainBankInfoByCode,  // Consulta detallada por código único (admin)
  };
}
