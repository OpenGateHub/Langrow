import { supabaseClient } from "../../supabaseClient";
import { SUPABASE_TABLES } from "../../../config";

export const createConfiguration = async (userId: number, data: any, category?: number) => {
    const { data: result, error } = await supabaseClient
        .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
        .insert({
            userId,
            configuration: data,
            ...(category ? { category } : {}),
        })
        .select()
        .single();

    if (error) {
        console.error('Error en la creación de la configuración:', error);
        throw new Error('Error en la creación de la configuración:: ' + error.message);
    }
    return result || null;
};


export const getUserConfiguration = async (userId: number) => {
    const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
        .select('*')
        .eq('userId', userId)
        .single();

    if (error) {
        console.error('Error al obtener la configuración del usuario:', error);
    }
    return data || null;
}


export const updateConfiguration = async (userId: number, data: any, category?: number) => {
    const { data: result, error } = await supabaseClient
        .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
        .update({
            configuration: data,
            ...(category ? { category } : {}),
        })
        .eq('userId', userId)
        .select()
        .single();

    if (error) {
        console.error('Error al actualizar la configuración:', error);
        throw new Error('Error al actualizar la configuración:: ' + error.message);
    }
    return result || null;  

}