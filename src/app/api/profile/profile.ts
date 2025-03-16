import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_FUNCTIONS, SUPABASE_TABLES } from "@/app/config";

export const getStudentProfileById = async (studentId: number) => {
    try {
        const { data, error } = await supabaseClient
            .rpc(SUPABASE_FUNCTIONS.GET_STUDENT_PROFILE_ID, { student_id: studentId })
        if (error) {
            console.error(`Error al obtener el perfil del estudiante: ${error.message}`);
            return null;
        }
        return data[0];
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del estudiante en la base de datos");
    }
};

export const getStudentProfileByUserId = async (userId: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.STUDENT_PROFILES)
            .select()
            .eq("userId", userId);
        if (error) {
            console.error(`Error al obtener el perfil del estudiante: ${error.message}`);
            return null;
        }
        return data[0];
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del estudiante en la base de datos");
    }
}
