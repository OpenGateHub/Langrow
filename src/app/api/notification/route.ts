import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { supabaseClient } from "@/app/api/supabaseClient";

const createNotification = zod.object({
    profileId: zod.number().positive(),
    message: zod.string(),
    isStaff: zod.boolean(),
    url: zod.string()
});

const createNotificationOptionalValues = createNotification.partial({
    url: true
})

type CreateNotification = zod.infer<typeof createNotificationOptionalValues>;
export async function POST (req: NextRequest) {
    try {
        const reqBody: CreateNotification = await req.json();
        const validation =  createNotificationOptionalValues.safeParse(reqBody);
        if (!validation.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data: notification } = validation;
        console.log("Datos validados:", notification);

        const { data, error } = await supabaseClient
            .from('Notifications')
            .insert([
                {
                    profileId: notification.profileId,
                    message: notification.message,
                    isStaff: notification.isStaff,
                    isActive: true,
                    ...(notification.url && { url: notification.url })
                }
            ]).select();
        if (error) {
            console.error("Error al insertar en Supabase:", error.message);
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al crear el registro...', error: error.message },
                { status: 500 }
            );
        }
        console.log("Notificación creada con éxito:", data);

        return NextResponse.json(
            { message: "Notificación creada correctamente!", data },
            { status: 201 }
        );
    } catch (err) {
        console.error('Error en el servidor:', err);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

const markAsReadSchema = zod.object({
    notificationId: zod.number()
});
type ReadNotification = zod.infer<typeof markAsReadSchema>;
export async function PUT (req: NextRequest) {
    try {
        const reqBody: ReadNotification = await req.json();
        console.log("Datos recibidos en API:", reqBody);

        const validation =  markAsReadSchema.safeParse(reqBody);
        if (!validation.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data, error } = await supabaseClient
            .from('Notifications')
            .update({ isActive: false})
            .eq('id', validation.data.notificationId)
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al eliminar el registro...', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: "Notificación marcada como leida!", data },
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


const getNotificationSchema = zod.object({
    profileId: zod.coerce.number().positive(),
    isStaff: zod.coerce.boolean()
});

type GetNotification = zod.infer<typeof getNotificationSchema>;
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Extraer parámetros
        const profileId = searchParams.get("profileId");
        const isStaff = searchParams.get("isStaff");
        if (!profileId || !isStaff) {
            return NextResponse.json(
                { message: "Faltan parámetros requeridos." },
                { status: 400 }
            );
        }
        // Validar con Zod
        const validation = getNotificationSchema.safeParse({ profileId, isStaff });
        if (!validation.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data: payload } = validation;
        const { data, error } = await supabaseClient
            .from('Notifications')
            .select()
            .eq('profileId', payload.profileId)
            .eq('isStaff', payload.isStaff)
            .eq('isActive', true)
            .limit(10);

        if (error) {
            console.error(error.message);
            return NextResponse.json(
                { message: 'Error al buscar las notificaciones del usuario...', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: 'Consulta exitosa', count: data?.length, data  },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error en el servidor:", err);

        if (err instanceof zod.ZodError) {
            return NextResponse.json(
                { message: "Error de validación", errors: err.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
