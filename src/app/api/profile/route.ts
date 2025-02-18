import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";

// TODO: include authentication
export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabaseClient
            .from('UserProfile')
            .select(`
                    id,
                    userId,
                    name,
                    description,
                    reviews,
                    price,
                    rating,
                    location,
                    isActive,
                    createdAt,
                    updatedAt,
                    profileImg
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
                    userId: body.data.code,
                    fullName: body.data.fullName,
                    title: body.data.title,
                    description: body.data.description,
                    location: body.data.location,
                    isStaff: body.data.isStaff
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

// Define the schema with required fields
const updateSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
    location: zod.string(),
    code: zod.string(), // Assuming `code` is required
    fullName: zod.string(),
    price: zod.number(),
    isStaff: zod.boolean(),
    profileImg: zod.string(),
});

// Make certain fields optional
const optionalFields = updateSchema.partial({
    title: true,
    description: true,
    location: true,
    fullName: true,
    price: true,
    profileImg: true,
});

// Infer the TypeScript type from the schema
type UpdateFields = zod.infer<typeof optionalFields>;

export async function PUT(req: Request) {
    try {
        const reqBody: UpdateFields = await req.json();
        const validation = optionalFields.safeParse(reqBody);
        // Handle validation errors
        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Error en la validación",
                    error: validation.error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        const { data: profile } = validation;
        const updateData =  {
            isStaff: profile.isStaff,
            updatedAt: new Date(),
            ...(profile.title != null && { title: profile.title }),
            ...(profile.description != null && { description: profile.description }),
            ...(profile.location != null && { location: profile.location }),
            ...(profile.fullName != null && { name: profile.fullName }),
            ...(profile.price != null && { price: profile.price }),
            ...(profile.profileImg != null && { profileImg: profile.profileImg })
        };
        const { data, error } = await supabaseClient.from('UserProfile')
            .update(updateData)
            .eq('userId', profile.code)
            .select();
        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al consultar la base de datos', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: "Perfil actualizado correctamente", data },
            { status: 200 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: 'Ha ocurrido un error al actualizar el perfil', error: err },
            { status: 500 }
        );
    }
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
