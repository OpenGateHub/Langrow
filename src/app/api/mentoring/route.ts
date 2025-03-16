import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { createClassRoom } from "./classRoom";

const createMentoringSchema = zod.object({
    studentId: zod.number().positive(),
    professorId: zod.number().positive(),
    category: zod.number().positive(),
    date: zod.string(),
    time: zod.string(),
    duration: zod.string(),
    cost: zod.string(),
    status: zod.string(),
    title: zod.string(),
    requestDescription: zod.string()        
}); 

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const validation = createMentoringSchema.safeParse(reqBody);
        if (!validation.success) {
            return NextResponse.json(
                { message: "Error en la validación", error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data: mentoring } = validation;
        const result = await createClassRoom(mentoring);
        if (!result) {
            return NextResponse.json(
                { message: 'Error al crear el registro...' },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { message: "Mentoría creada correctamente!" },
            { status: 201 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json(
        { message: 'Mentoría obtenida correctamente!' },
        { status: 200 }
    );
}
