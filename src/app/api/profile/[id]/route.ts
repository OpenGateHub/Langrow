import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from "@/app/api/supabaseClient";

interface Context {
    params: { id: string };
}

export async function GET(req: NextRequest, context) {
    const { id } = await context.params;

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
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Consulta exitosa', count: data?.length, data },
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
