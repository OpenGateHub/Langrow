import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";

// TODO: include authentication
export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabaseClient
            .from('UserProfile')
            .select(`
                    userId,
                    fullName,
                    title,
                    description,
                    location,
                    isStaff,
                    isActive,
                    createdAt,
                    updatedAt
                `)
            .eq('isActive', true);

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
    try {
        const profileSchema = zod.object({
           code: zod.string(),
           fullName: zod.string(),
           title: zod.string(),
           description: zod.string(),
           location: zod.string(),
           isStaff: zod.boolean(),
        });
        const reqBody = await req.json();
        const body = profileSchema.safeParse(reqBody);
        if (!body.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: body.error.errors },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseClient
            .from('UserProfile')
            .insert([
                {
                    userId: body.code,
                    fullName: body.fullName,
                    title: body.title,
                    description: body.description,
                    location: body.location,
                    isStaff: body.isStaff
                }
            ])
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: "Perfil creado correctamente", data },
            { status: 201 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: 'Ha ocurrido un error al crear el perfil', error: err },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request) {
    return NextResponse.json(
        { message: "This is a put request." },
        { status: 200 }
    );
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { data, error } = await supabaseClient.from('UserProfile')
            .update({'isActive': false})
            .eq('userId', body.code)
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al borrar un registro en la base de datos', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: 'Registro eliminado correctamente', count: data?.length, data  },
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
