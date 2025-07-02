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


export const getUserConfiguration = async (userId: number, category?: number) => {
    // Construir la consulta base
    let query = supabaseClient
        .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false }) // Ordenar por fecha de creación, más reciente primero
        .limit(1); // Tomar solo la más reciente

    // Si se especifica categoría, filtrar por ella
    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error al obtener la configuración del usuario:', error);
    }
    return data?.[0] || null; // Retornar la primera (más reciente) o null
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

/**
 * Limpia configuraciones duplicadas, manteniendo solo la más reciente por usuario y categoría
 */
export const cleanDuplicateConfigurations = async (userId: number, category?: number) => {
    try {
        // Construir la consulta base
        let query = supabaseClient
            .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
            .select('*')
            .eq('userId', userId)
            .order('created_at', { ascending: false });

        // Si se especifica categoría, filtrar por ella
        if (category) {
            query = query.eq('category', category);
        }

        const { data: configs, error } = await query;

        if (error) {
            console.error('Error al obtener configuraciones para limpieza:', error);
            return;
        }

        // Si hay más de una configuración, eliminar las más antiguas
        if (configs && configs.length > 1) {
            const configsToDelete = configs.slice(1); // Todas excepto la primera (más reciente)
            const idsToDelete = configsToDelete.map(config => config.id);

            const { error: deleteError } = await supabaseClient
                .from(SUPABASE_TABLES.MENTORSHIP_CONFIGURATION)
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error('Error al eliminar configuraciones duplicadas:', deleteError);
            } else {
                console.log(`Eliminadas ${configsToDelete.length} configuraciones duplicadas para userId ${userId}${category ? ` y categoría ${category}` : ''}`);
            }
        }
    } catch (error) {
        console.error('Error en cleanDuplicateConfigurations:', error);
    }
}