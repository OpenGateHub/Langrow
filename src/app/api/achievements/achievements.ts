import { SUPABASE_TABLES } from "@/app/config";
import { supabaseClient } from "../supabaseClient";
import { getScheduledHours } from "../mentoring/classRoom";

export const getAchivementConditions = async (code: string) => {
    const { data, error } = await supabaseClient.from(SUPABASE_TABLES.ACHIEVEMENT)
        .select("id, code, condition")
        .eq("isActive", true)
        .eq("code", code)
        .single();
    if (error) {
        throw error;
    }
    return data;
}

function calculateBonus(hoursPerWeek, hoursPerMonth, period) {
    const WEEKLY_THRESHOLD = 50;
    const MONTHLY_THRESHOLD = 200;
    let bonus = 0;
    
    const meetsWeekly = hoursPerWeek >= WEEKLY_THRESHOLD;
    const meetsMonthly = hoursPerMonth >= MONTHLY_THRESHOLD;
    
    if (meetsWeekly && meetsMonthly) {
        switch (period) {
            case 'quarter': // Trimestre
                bonus = 0.10;
                break;
            case 'semester': // Semestre
                bonus = 0.20;
                break;
            case 'year': // Anual
                bonus = 0.30;
                break;
            default:
                bonus = 0.02; // Mensual
        }
    } else if (meetsWeekly) {
        bonus = 0.01; // Semanal
    }
    
    return bonus;
}

function parseCondition(condition: string, hoursPerWeek: number, hoursPerMonth: number): boolean {
    const regex = /(\d+)h\*(\d+)([Md])/g;
    let totalRequiredHours = 0;

    let match;
    while ((match = regex.exec(condition)) !== null) {
        const hours = parseInt(match[1], 10);
        const multiplier = parseInt(match[2], 10);
        const unit = match[3];

        if (unit === 'M') {
            totalRequiredHours += hours * multiplier; // Multiplicar por cantidad de meses
        } else if (unit === 'd') {
            totalRequiredHours += hours; // Ya que se asume total de horas en esos días
        }
    }

    // Si la condición usa días (d), usamos las horas semanales.
    const totalUserHours = hoursPerWeek; 

    return totalUserHours >= totalRequiredHours;
}


export const calculateAchievement = async (achievementCode: string, profileId: number) => {
    try {
        // Obtener las condiciones del logro
        const achievement = await getAchivementConditions(achievementCode);
        if (!achievement) {
            console.warn(`Logro con código ${achievementCode} no encontrado o inactivo.`);
            return;
        }

        const { id, condition } = achievement;

        const currentWeekRange = getCurrentWeekRange();
        // Obtener las horas programadas del usuario
        const scheduledHoursWeek = await getScheduledHours(profileId, currentWeekRange.startOfWeek, currentWeekRange.endOfWeek);
        const scheduledHoursMonth = await getScheduledHours(profileId, currentWeekRange.startOfMonth, currentWeekRange.endOfMonth);
        if (!scheduledHoursWeek || scheduledHoursWeek.success === false) {
            console.error(`Error al obtener las horas programadas para el perfil ${profileId}.`);
            console.error(scheduledHoursWeek.error);
            return;
        }
        console.log("Week: ",scheduledHoursWeek);
        console.log("Month: ",scheduledHoursMonth);
        console.log(condition);
        // Validar si se cumplen las condiciones del logro
        const meetsConditions = condition ? parseCondition(condition, scheduledHoursWeek.totalHours, scheduledHoursMonth.totalHours) : false;
        if (!meetsConditions) {
            console.info(`El perfil ${profileId} no cumple las condiciones para el logro ${achievementCode}.`);
            return;
        }

        return meetsConditions;

        // Insertar el logro en la tabla de logros del usuario
        // const { error } = await supabaseClient.from("SUPABASE_TABLES").insert({
        //     profile_id: profileId,
        //     achievement_id: id,
        //     obtained_at: new Date().toISOString(),
        // });

        // if (error) {
        //     console.error(`Error al insertar el logro ${achievementCode} para el perfil ${profileId}:`, error);
        // } else {
        //     console.info(`Logro ${achievementCode} otorgado al perfil ${profileId}.`);
        // }
    } catch (error) {
        console.error(`Error en calculateAchievement para el logro ${achievementCode} y perfil ${profileId}:`, error);
    }
};



function getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Ajustamos para que la semana comience en lunes
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Formateamos las fechas en YYYY-MM-DD
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    
    // Mes actual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Último trimestre
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
    const endOfQuarter = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
    
    // Último semestre
    const currentSemester = Math.floor(today.getMonth() / 6);
    const startOfSemester = new Date(today.getFullYear(), currentSemester * 6, 1);
    const endOfSemester = new Date(today.getFullYear(), (currentSemester + 1) * 6, 0);
    
    return {
        startOfWeek: formatDate(monday),
        endOfWeek: formatDate(sunday),
        startOfMonth: formatDate(startOfMonth),
        endOfMonth: formatDate(endOfMonth),
        startOfQuarter: formatDate(startOfQuarter),
        endOfQuarter: formatDate(endOfQuarter),
        startOfSemester: formatDate(startOfSemester),
        endOfSemester: formatDate(endOfSemester)
    };
}