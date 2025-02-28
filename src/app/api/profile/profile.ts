import { supabaseClient } from "@/app/api/supabaseClient";
import { SupabaseStudentProfile } from "@/types/supabase";
import { SUPABASE_FUNCTIONS } from "@/app/config";

export const getStudentProfileById = async (studentId: number) => {
    try {
        const { data, error } = await supabaseClient
            .rpc(SUPABASE_FUNCTIONS.GET_STUDENT_PROFILE_ID, { student_id: studentId })
        if (error) {
            throw new Error(`Error al obtener el perfil del estudiante: ${error.message}`);
        }

        return data;
    } catch (e) {
        console.error(e);
        throw new Error("Error buscando el perfil del estudiante en la base de datos");
    }
};
