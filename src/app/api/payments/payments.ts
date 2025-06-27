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
          external_ref: payment.external_reference,
          payment_details: payment.payment_details,
          preference_id: payment.preference_id,
          status: payment.status,
          payment_type: payment.payment_type,
        },
      ]).select();

    if (error) {
      console.error("Error storing payment:", error);
    }

    return data;
  } catch (error) {
    console.error("Error storing payment:", error);
    return null;
  }
};

export const updatepaymentStatus = async (preference_id: string, status: string) => {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PAYMENTS)
      .update({ status })
      .eq("preference_id", preference_id);

    if (error) {
      console.error("Error updating payment status:", error);
    }

    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return null;
  }
}
