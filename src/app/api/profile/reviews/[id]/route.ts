import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from "@/app/api/supabaseClient";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } } // Correct signature for Next.js 13+
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { message: 'Código de usuario requerido' },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabaseClient
            .from('UserReviews')
            .select(`
                id,
                userId,
                studentId,
                qualification,
                notes,
                isActive,
                createdAt,
                StudentProfile (
                    id,
                    fullName,
                    profileImg,
                    isActive
                )
            `)
            .eq('userId', id)
            .eq('isActive', true)

        if (error) {
            console.error('Supabase error:', error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'No se encontraron reviews en el perfil de usuario' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Consulta exitosa', count: data.length, data },
            { status: 200 }
        );

    } catch (err) {
        console.error('Error en el servidor:', err);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}