import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "@/app/api/supabaseClient";

export class NotificationService {
    static async create(profileId: number, body: string, url?: string, isStaff?: boolean): Promise<boolean> {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.NOTIFICATIONS)
            .insert([
                {
                    profileId,
                    message: body,
                    isStaff: isStaff ?? false,
                    isActive: true,
                    ...(url && { url })
                }
            ]).select().single();
        if (error) {
            console.error("Error al insertar en Supabase:", error.message);
            return false;
        }
        console.log("Notificación creada con éxito:", data);
        return true;
    }
}