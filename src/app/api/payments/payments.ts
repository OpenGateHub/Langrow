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
      ])
      .select();

    if (error) {
      console.error("Error storing payment:", error);
    }

    return data;
  } catch (error) {
    console.error("Error storing payment:", error);
    return null;
  }
};

export const updatePaymentStatus = async (
  preference_id: string,
  status: string,
  details?: any
) => {
  try {
    // Construir el payload de actualización
    const updateData: Record<string, any> = { status };

    if (details !== undefined && details !== null) {
      updateData.payment_details = details;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PAYMENTS)
      .update(updateData)
      .eq("preference_id", preference_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment status:", error);
    }

    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return null;
  }
};

export const getPaymentByProfessorId = async (
  professorId: number,
  page: number = 1,
  limit: number = 10,
  from?: string,
  to?: string
): Promise<{
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} | null> => {
  try {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = supabaseClient
      .from(SUPABASE_TABLES.PAYMENTS_VIEW)
      .select("*", { count: "exact" })
      .eq("receipt", professorId)
      .order("id", { ascending: false })
      .range(fromIndex, toIndex);

    if (from) {
      query = query.gte("created_at", from);
    }

    if (to) {
      query = query.lte("created_at", to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching payments by professor ID:", error);
      return null;
    }

    return {
      data: data || [],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching payments by professor ID:", error);
    return null;
  }
};
