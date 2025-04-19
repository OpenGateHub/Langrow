import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "../supabaseClient";
import { SupabasePayment } from "@/types/supabase";

export const storePayment = async (payment: SupabasePayment) => {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PAYMENTS)
      .insert([
        {
          payment_id: payment.payment_id,
          external_reference: payment.external_reference,
          payment_details: payment.payment_details,
        },
      ]);

    if (error) {
      console.error("Error storing payment:", error);
    }

    return data;
  } catch (error) {
    console.error("Error storing payment:", error);
    return null;
  }
};
