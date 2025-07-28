// /lib/services/logService.ts
import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "@/app/api/supabaseClient";

export interface BankLogInput {
  profile_id: number;
  bank_code: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "MASKED_VIEW";
  performed_by: string; // userId de Clerk
  metadata?: Record<string, any>; // opcional
}

export const logBankAction = async (log: BankLogInput) => {
  const { error } = await supabaseClient
    .from(SUPABASE_TABLES.BANK_LOGS)
    .insert(log);

  if (error) {
    console.error("Error al guardar log bancario:", error);
  }
};
