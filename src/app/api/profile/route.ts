import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export async function GET(req: NextRequest) {
    try {
        const code = req.nextUrl.searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { message: 'Código de usuario requerido' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('user_profile')
            .select(`
                userId,
                fullName,
                title,
                description,
                location,
                isStaff,
                isActive,
                createdAt,
                updatedAt,
                user_achievements!inner (
                    title,
                    description,
                    iconImg,
                    isActive,
                    createdAt
                )
            `)
            .eq('userId', code)
            .eq('isActive', true) // Filtra `isActive` en `user_profile`
            .eq('user_achievements.isActive', true) // Filtra `isActive` en `user_achievements`

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Consulta exitosa', count: data?.length, data  },
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


export async function POST(req: Request) {
    return NextResponse.json(
        { message: "This is a post request" },
        { status: 200 }
    );
}

export async function PUT(req: Request) {
    return NextResponse.json(
        { message: "This is a put request." },
        { status: 200 }
    );
}
// you can also handle PATCH, DELETE, PUT