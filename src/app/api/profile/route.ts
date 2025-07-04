import { NextRequest, NextResponse } from "next/server";
import { PROFILE_ROLE_STRING, PROFILE_ROLE, ROLE_MAP } from "@/app/config";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";
import { NotificationService } from "@/services/notificationService";

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
            .eq('isActive', true)
            .eq('role', PROFILE_ROLE["org:profesor"]);

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

const profileSchema = zod.object({
    code: zod.string(),
    fullName: zod.string(),
    title: zod.string(),
    description: zod.string(),
    location: zod.string(),
    isStaff: zod.boolean(),
    role: zod.string(),
    email: zod.string()
});
const optionalValues = profileSchema.partial({
    title: true,
    description: true,
    location: true,
    isStaff: true,
    email: true,
});
type CreateFields = zod.infer<typeof optionalValues>;

export async function POST(req: Request) {
    try {
        const reqBody: CreateFields = await req.json();
        const body = optionalValues.safeParse(reqBody);
        if (!body.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: body.error.errors },
                { status: 400 }
            );
        }
        const roleValue = ROLE_MAP[body.data.role as PROFILE_ROLE_STRING];
        if (!roleValue) {
            return NextResponse.json(
                { message: "Role not enabled", result: false },
                { status: 400 }
            );
        }
        const minCreateData = {
            name: body.data.fullName,
            userId: body.data.code,
            email: body.data.email,
            role: roleValue,
        };

        let result;
        console.log(`Registering new user - ${body.data.role}:: ${body.data.code}`);
        result = await createProfile(minCreateData, body.data);

        const newProfile = result && result.length > 0 ? result[0] : null;

        if (newProfile) {
            await NotificationService.create(
                newProfile.id,
                "Te damos la bienvenida! Clickea aquí para completar tu perfil",
                `/perfil/${newProfile.userId}?edit=true`,
                newProfile.isStaff ?? false
            );
        }

        if (body.data.role === PROFILE_ROLE_STRING.ALUMNO) {
            console.log('Creating student profile');
            result = await createStudentProfile(minCreateData, body.data);
        }

        return NextResponse.json(
            { message: "Perfil creado correctamente", result: true, data: result },
            { status: 201 }
        );

    } catch (err) {
        console.error(`An unexpected error occurred creating a new user`);
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
        const updateData = {
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
        await NotificationService.create(
            data[0].id,
            "Tu perfil ha sido actualizado correctamente",
            `/perfil/${data[0].userId}?edit=true`,
            data[0].isStaff ?? false
        );
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
            .update({ 'isActive': false })
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
            { message: 'Registro eliminado correctamente', count: data?.length, data },
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


const createProfile = async (min: { name: string; userId: string }, payload: CreateFields) => {
    // Construir el objeto de perfil combinando `min` y `payload`
    const profileData = {
        ...min,
        title: payload.title || null,
        description: payload.description || null,
        location: payload.location || null,
        isStaff: payload.isStaff || false,
    };
    console.log(profileData);
    const { data, error } = await supabaseClient
        .from('UserProfile')
        .insert([profileData])
        .select();

    if (error) {
        console.error("Error al crear el perfil:", error);
        throw new Error(error.message);
    }
    return data;
};

const createStudentProfile = async (min: { name: string; userId: string }, payload: CreateFields) => {
    const profileData = {
        userId: min.userId,
    };
    const { data, error } = await supabaseClient
        .from('StudentProfile')
        .insert([profileData])
        .select();

    if (error) {
        console.error("Error al crear el perfil:", error);
        throw new Error(error.message);
    }

    return data;
};