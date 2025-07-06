import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from "../../../supabaseClient";

export async function GET(
    req: NextRequest,
    { params }: { params: { clerkId: string } }
) {
    const { clerkId } = await params;

    if (!clerkId) {
        return NextResponse.json(
            { message: 'Clerk ID requerido' },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabaseClient
            .from('UserProfile')
            .select('id, userId, name, title, description, reviews, price, rating, location, isActive, createdAt, updatedAt, profileImg, role, isZoomEnabled')
            .eq('userId', clerkId)
            .eq('isActive', true)
            .single();

        if (error) {
            console.error('Supabase error:', error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { message: 'No se encontró el perfil de usuario' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Consulta exitosa', profile: data },
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