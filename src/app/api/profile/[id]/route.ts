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
            .from('UserProfile')
            .select(`
                id,
                userId,
                name,
                title,
                description,
                reviews,
                price,
                rating,
                location,
                isActive,
                createdAt,
                updatedAt,
                profileImg,
                role,
                isZoomEnabled,
                UserAchievements (
                    id,
                    Achievements (
                        title,
                        description,
                        iconImg,
                        isActive
                    )
                )
            `)
            .eq('userId', id)
            .eq('isActive', true) // Filtra `isActive` en `UserProfile`
            .eq('UserAchievements.isActive', true); // Filtra `isActive` en `UserAchievements`

        if (error) {
            console.error('Supabase error:', error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'No se encontró el perfil de usuario' },
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