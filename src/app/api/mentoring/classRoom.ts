import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";

export interface CreateClassRoomParams {
    studentId: number;
    professorId: number;
    categoryId: number;
    date: Date;
    time: string;
    duration: string;
    cost: string;
    status: string;
    title: string;
    description: string;
}

export const getClassRoomByStudentId = async (studentIdStr: number) => {}

export const getClassRoomByProfessorId = async (professorId: number) => {}

/**
 * Async function Creates a classroom for a mentorship session
 * @param params CreateClassRoomParams
 * @returns boolean
 */
export const createClassRoom = async (params: CreateClassRoomParams): Promise<boolean> => {
    try {
        const [hours, minutes] = params.time.split(':').map(Number);
        const beginsAt = new Date(params.date);
        beginsAt.setHours(hours, minutes, 0, 0);

        const durationParts = params.duration.split(':').map(Number);
        const endsAt = new Date(beginsAt);
        endsAt.setHours(beginsAt.getHours() + durationParts[0], beginsAt.getMinutes() + durationParts[1]);

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.MENTORSHIP)
            .insert(
                { 
                    userId: params.professorId,
                    studentId: params.studentId,
                    category: params.categoryId,
                    requestDescription: params.description,
                    status: params.status,
                    title: params.title,
                    duration: parseInt(params.duration),
                    beginsAt: beginsAt.toISOString(),
                    endsAt: endsAt.toISOString()
                }
            )
            .select();
            if (error) {
                console.error(error);
                return false;
            }    
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
