import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES, PROFILE_ROLE_STRING, PROFILE_ROLE } from "@/app/config";



export async function GET(request: NextRequest) {
    try {
        // 1. Verificar autenticación
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { result: false, message: "No autorizado. Debes iniciar sesión." },
                { status: 401 }
            );
        }

        // 2. Verificar que sea admin
        const user = await currentUser();
        const userRole = user?.unsafeMetadata?.formRole ?? null;

        if (userRole !== PROFILE_ROLE_STRING.ADMIN) {
            return NextResponse.json(
                { result: false, message: "Acceso denegado. Solo administradores." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '30');
        const profesorName = searchParams.get('profesor_name');

        let query = supabaseClient
            .from(SUPABASE_TABLES.PAYMENTS)
            .select(`*`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (profesorName) {
            // Buscar el profile del profesor por nombre (búsqueda parcial, insensible a mayúsculas)
            const { data: profiles, error: profileError } = await supabaseClient
                .from(SUPABASE_TABLES.PROFILES)
                .select('id')
                .ilike('name', `%${profesorName}%`)
                .eq('role', 1)
                .limit(1);
            if (profileError) {
                return NextResponse.json({ result: false, message: "Error buscando el profesor", error: profileError.message }, { status: 500 });
            }
            if (!profiles || profiles.length === 0) {
                return NextResponse.json({ result: false, message: "No se encontró profesor con ese nombre" }, { status: 404 });
            }
            const profileId = profiles[0].id;
            query = supabaseClient
                .from(SUPABASE_TABLES.PAYMENTS)
                .select(`*`)
                .filter('payment_details->metadata->>profesor_id', 'eq', String(profileId))
                .order('created_at', { ascending: false })
                .limit(limit);
        }

        const { data: payments_list, error: paymentsError } = await query;

        return NextResponse.json({
            data: payments_list
        })


    } catch (error) {
        console.error("Error en endpoint de pagos admin:", error);
        return NextResponse.json(
            {
                result: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido"
            },
            { status: 500 }
        );
    }
}