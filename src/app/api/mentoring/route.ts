import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { createClassRoom,
    getClassRoomByStudent,
    getClassRoomByProfessor 
} from "./classRoom";
import { getStudentProfileByUserId } from "../profile/profile";
import { ClassRoomStatus } from "@/types/classRoom";
import { getProfileByUserId } from "../profile/profile";
import { count } from "console";

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
            status: ClassRoomStatus.REQUESTED
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

const getMentoringSchema = zod.object({
    id: zod.number().positive(),
    userId: zod.string(),
    status: zod.string(),
    dateFrom: zod.string(),
    dateTo: zod.string(),
    page: zod.number()
});
const getMentoringSchemaOptionalValues = getMentoringSchema.partial({
    id: true,
    status: true,
    dateFrom: true,
    dateTo: true,
    page: true
});
export type GetMentoringFilter = zod.infer<typeof getMentoringSchemaOptionalValues>;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const payload: GetMentoringFilter = {
            id: searchParams.get('id') ? parseInt(searchParams.get('id') as string) : undefined,
            userId: searchParams.get('userId') ?? '',
            status: searchParams.get('status') ?? undefined,
            dateFrom: searchParams.get('dateFrom') ?? undefined,
            dateTo: searchParams.get('dateTo') ?? undefined,
            page: parseInt(searchParams.get('page') as string) ?? 10
        };
        const validation = getMentoringSchemaOptionalValues.safeParse(payload);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Error en la validación', error: validation.error.errors },
                { status: 400 }
            );
        }
        const { data } = validation;

        const profile = await getProfileByUserId(data.userId);
        if (!profile) {
            return NextResponse.json(
                { message: 'Perfil no encontrado' },
                { status: 404 }
            );
        }
        let metorins: { beginsAt: string | null; category: number | null; confirmed: boolean | null; createdAt: string; duration: number | null; endsAt: string | null; id: number; professorRate: number | null; studentId: number | null; title: string | null; userId: number | null; }[] | undefined;
        switch (profile.role) {
            case 2:
                metorins = await getClassRoomByStudent(data);
                break;
            case 1:
                metorins = await getClassRoomByProfessor(profile.id, data);
                break;
            default:
                return NextResponse.json(
                    { message: 'Rol no permitido' },
                    { status: 403 }
                );
        }
        return NextResponse.json(
            { message: 'Mentoría obtenida correctamente!', data: metorins, count: metorins ? metorins.length : 0 },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error en el servidor:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
