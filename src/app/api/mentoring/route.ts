import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { createClassRoom } from "./classRoom";
import { getStudentProfileByUserId } from "../profile/profile";

const createMentoringSchema = zod.object({
    studentId: zod.string(),
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
                { result: false, message: "Error en la validación", error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data } = validation;
        const studentProfile = await getStudentProfileByUserId(data.studentId);
        if (!studentProfile) {
            return NextResponse.json(
                { result: false, message: "Perfil de estudiante no encontrado" },
                { status: 404 }
            );
        }
        
        const mentoring = {
            ...data,
            studentId: studentProfile.id,
        };
        const result = await createClassRoom(mentoring);
        if (!result) {
            return NextResponse.json(
                { result: false, message: 'Error al crear el registro en la base de datos.' },
                { status: 500 }
            );
        }
        return NextResponse.json( 
            { result: true, message: "Mentoría creada correctamente!" },
            { status: 201 }
        );
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json(
            { result: false, message: errorMessage },
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
