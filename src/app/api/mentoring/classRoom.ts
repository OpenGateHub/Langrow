import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { parse } from "path";

export interface CreateClassRoomParams {
    studentId: number;
    professorId: number;
    category: number;
    date: string;
    time: string;
    duration: string;
    cost: string;
    status: string;
    title: string;
    requestDescription: string;
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
        const [startTime, endTime] = params.time.split(' - ');
        const beginsAt = mergeDateTime(params.date, startTime);
        const endsAt = mergeDateTime(params.date, endTime);
        console.log(beginsAt);

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.MENTORSHIP)
            .insert(
                { 
                    userId: params.professorId,
                    studentId: params.studentId,
                    category: params.category,
                    requestDescription: params.requestDescription,
                    status: params.status,
                    title: params.title,
                    duration: parseInt(params.duration, 10),
                    beginsAt: beginsAt,
                    endsAt: endsAt,
                    confirmed: false
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


const mergeDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr); // Convierte la fecha a un objeto Date
    const [time, period] = timeStr.split(" "); // Separa la hora del periodo AM/PM
    let [hours, minutes] = time.split(":").map(Number);

    // Convierte la hora a formato 24h
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    date.setUTCHours(hours, minutes, 0, 0); // Establece la hora en UTC

    return date.toISOString(); // Devuelve la fecha combinada en formato ISO
}
