import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { ClassRoom, ClassRoomStatus } from "@/types/classRoom";
import {
    createClassRoom,
    getClassRoomByStudent,
    getClassRoomByProfessor,
    getClassRoomById,
    confirmClassRoom,
    cancelClassRoom,
    updateClassRoomStatus,
    createClassRoomMeeting,
    updateClassRoomById
} from "./classRoom";
import {
    getStudentProfileByUserId,
    getProfileByUserId ,
    getStudentProfileById
} from "../profile/profile";

const createMentoringSchema = zod.object({
    studentId: zod.string(),
    professorId: zod.number().positive(),
    category: zod.number().positive(),
    date: zod.string(),
    time: zod.string(),
    duration: zod.string(),
    cost: zod.string(),
    title: zod.string(),
    requestDescription: zod.string()        
}); 
/**
 * This endpoint is deprecated and will be removed in future versions.
 * Use the new endpoint for creating mentoring sessions.
 * @param req 
 * @returns 
 * @deprecated
 */
export async function POST_DEPRECATED(req: NextRequest) {
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
        console.log("Student Profile: ", studentProfile);
        if (!studentProfile) {
            return NextResponse.json(
                { result: false, message: "Perfil de estudiante no encontrado" },
                { status: 404 }
            );
        }
        
        const mentoring = {
            ...data,
            studentId: studentProfile.id,
            status: ClassRoomStatus.CREATED
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
    page: zod.number().positive()
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
        let metorins;
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


const putMentoringSchema = zod.object({
    id: zod.number().positive(),
    status: zod.string()
});
export type PutMentoringPayload = zod.infer<typeof putMentoringSchema>; 

const VALID_STATE_TRANSITIONS: Record<ClassRoomStatus, ClassRoomStatus[]> = {
    [ClassRoomStatus.CREATED]: [
        ClassRoomStatus.REQUESTED,
        ClassRoomStatus.CANCELLED
    ], // Solo puede ir a REQUESTED
    [ClassRoomStatus.REQUESTED]: [ClassRoomStatus.NEXT, ClassRoomStatus.CANCELLED], // Solo puede ir a NEXT
    [ClassRoomStatus.NEXT]: [
        ClassRoomStatus.CONFIRMED,
        ClassRoomStatus.REJECTED,
        ClassRoomStatus.NOTCONFIRMED
    ], // Puede ir a cualquiera de estos
    [ClassRoomStatus.CONFIRMED]: [], // No puede cambiar
    [ClassRoomStatus.REJECTED]: [], // No puede cambiar
    [ClassRoomStatus.NOTCONFIRMED]: [], // No puede cambiar
    [ClassRoomStatus.CANCELLED]: [] // No puede cambiar
};

export async function PUT(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const validation = putMentoringSchema.safeParse(reqBody);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Error en la validación', error: validation.error.errors },
                { status: 400 }
            );
        }
        const { id, status } = validation.data;
        const mentoring: ClassRoom | null = await getClassRoomById(id);

        if (!mentoring) {
            return NextResponse.json(
                { message: 'Mentoría no encontrada' },
                { status: 404 }
            );
        }

        const currentStatus = mentoring.status as ClassRoomStatus;
        const allowedTransitions = VALID_STATE_TRANSITIONS[currentStatus];

        // 🚀 Validar si el cambio de estado es permitido
        if (!allowedTransitions || !allowedTransitions.includes(status as ClassRoomStatus)) {
            return NextResponse.json(
                { message: `Transición no permitida: ${currentStatus} → ${status}` },
                { status: 400 }
            );
        }

        let result: boolean;
        let meeting = null;

        switch (status) {
            case ClassRoomStatus.CONFIRMED:
                const confirmResult = await confirmClassRoom(id);
                result = confirmResult.success;
                break;
            case ClassRoomStatus.REJECTED:
                const cancelResult = await cancelClassRoom(id);
                result = cancelResult.success;
                break;
            case ClassRoomStatus.NOTCONFIRMED:
            case ClassRoomStatus.NEXT:
                if (status === ClassRoomStatus.NEXT) {
                    // create meet process 
                    meeting = await createClassRoomMeeting(mentoring)
                }
                if (!meeting) {
                    return NextResponse.json(
                        { message: 'Error al crear la reunión', success: false },
                        { status: 500 }
                    );
                }
                // Update the class room status
                const updateResult = await updateClassRoomById(id, { 
                    status,
                    classRoomUrl: meeting.meetingUrl,
                    meetingExternalId: meeting.meetingExternalId
                });
                result = updateResult.success;
                break;
            default:
                return NextResponse.json(
                    { message: 'Estado no permitido' },
                    { status: 400 }
                );
        }

        return NextResponse.json(
            { message: 'Estado actualizado correctamente', success: result },
            { status: result ? 200 : 500 }
        );

    } catch (error) {
        console.error('Error en el servidor:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor', success: false },
            { status: 500 }
        );
    }
}
