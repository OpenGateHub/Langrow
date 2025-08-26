import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";


// POST /api/payments/change-status/[id]
export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        const paymentId = id;
        if (!paymentId) {
            return NextResponse.json({ result: false, message: "payment id es requerido" }, { status: 400 });
        }
        const body = await req.json();
        const { is_paid } = body;
        if (typeof is_paid === 'undefined') {
            return NextResponse.json({ result: false, message: "is_paid es requerido en el body" }, { status: 400 });
        }
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.PAYMENTS)
            .update({
                is_paid: is_paid,
                paid_at: is_paid ? new Date().toISOString() : null
            })
            .eq("payment_id", paymentId)
            .select();

        if (error) {
            return NextResponse.json({ result: false, message: "No se pudo actualizar el status del pago" }, { status: 500 });
        }
        return NextResponse.json({ result: true, data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ result: false, message: "Error interno del servidor", error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
    }
}
