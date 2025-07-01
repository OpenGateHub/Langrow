import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import {
    createConfiguration,
    getUserConfiguration,
    updateConfiguration
} from "./configurations";
import { getProfileByUserId } from "../../profile/profile";


const createMentoringConfigurationSchema = zod.object({
    userId: zod.number().positive(),
    category: zod.number().positive(),
    data: zod.any(),
});

type CreateMentoringConfiguration = zod.infer<typeof createMentoringConfigurationSchema>;

export async function POST(req: NextRequest) {
    try { 
        const body = await req.json();
        const payload: CreateMentoringConfiguration = {
            userId: body.userId,
            category: body.category,
            data: body.data,
        };
        const validation = createMentoringConfigurationSchema.safeParse(payload);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Error en la validación', error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data } = validation;

        const configuration = await createConfiguration(
            data.userId,
            data.data,
            data.category
        );
        if (configuration) {
            return NextResponse.json(
                { message: 'Configuración creada', configuration },
                { status: 201 }
            );
        }

    } catch (error) {
        console.error('Error en la creación de la configuración', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
};


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json(
                { message: 'Error en la validación', error: 'userId es requerido' },
                { status: 400 }
            );
        }
        const profile = await getProfileByUserId(userId);
        if (!profile) {
            return NextResponse.json(
                { message: 'Perfil no encontrado' },
                { status: 404 }
            );
        }
        const configuration = await getUserConfiguration(profile.id);
        if (configuration) {
            return NextResponse.json(
                { message: 'Configuración obtenida', configuration },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { message: 'No se encontró la configuración' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error al obtener la configuración', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
};


export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const payload: CreateMentoringConfiguration = {
            userId: body.userId,
            category: body.category,
            data: body.data,
        };
        const validation = createMentoringConfigurationSchema.safeParse(payload);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Error en la validación', error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data } = validation;

        const configuration = await updateConfiguration(
            data.userId,
            data.data,
            data.category
        );
        if (configuration) {
            return NextResponse.json(
                { message: 'Configuración actualizada', configuration },
                { status: 200 }
            );
        }

    } catch (error) {
        console.error('Error al actualizar la configuración', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
};
