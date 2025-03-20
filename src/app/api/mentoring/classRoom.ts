import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { GetMentoringFilter } from "./route";
import { getStudentProfileByUserId } from "../profile/profile";
import { ClassRoomStatus } from "@/types/classRoom";

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

export const getClassRoomByStudent = async (filter: GetMentoringFilter) => {
    const student = await getStudentProfileByUserId(filter.userId);
    if (!student) {
        console.error('Estudiante no encontrado');
        return [];
    }
    let query = supabaseClient.from(SUPABASE_TABLES.MENTORSHIP_VIEW).select().eq("studentId", student.id);
    if (filter.id) {
        console.log("Filter by ID")
        query = query.eq('id', filter.id);
    } else {
        console.log("Filter by status among others");
        
        if (filter.status) {
            query = query.eq('status', filter.status);
        }
        if (filter.dateFrom) {
            const dateFrom = mergeDateTime(filter.dateFrom, "00:00 AM");
            query = query.gte('beginsAt', dateFrom);
        }
        if (filter.dateTo) {
            const dateTo = mergeDateTime(filter.dateTo, "11:59 PM");
            query = query.lte('beginsAt', dateTo);
        }
    }

    const { data: result, error } = await query;

    if (error) {
        console.error('Error en la consulta:', error);
    }
    return result || [];
}

export const getClassRoomByProfessor = async (professorId: number, filter: GetMentoringFilter) => {
    let query = supabaseClient.from(SUPABASE_TABLES.MENTORSHIP_VIEW).select().eq("userId", professorId);
    if (filter.id) {
        console.log("Filter by ID")
        query = query.eq('id', filter.id);
    } else {
        console.log("Filter by status among others");
        
        if (filter.status) {
            query = query.eq('status', filter.status);
        }
        if (filter.dateFrom) {
            const dateFrom = mergeDateTime(filter.dateFrom, "00:00 AM");
            query = query.gte('beginsAt', dateFrom);
        }
        if (filter.dateTo) {
            const dateTo = mergeDateTime(filter.dateTo, "11:59 PM");
            query = query.lte('beginsAt', dateTo);
        }
    }

    const { data: result, error } = await query;

    if (error) {
        console.error('Error en la consulta:', error);
    }
    return result || [];
};

/**
 * Async function Creates a classroom for a mentorship session
 * @param params CreateClassRoomParams
 * @returns boolean
 */
export const createClassRoom = async (
  params: CreateClassRoomParams
): Promise<boolean> => {
  if (!params.time.includes(" - ")) {
    throw new Error(`Formato de tiempo inválido: ${params.time}, expected : 'HH:mm - HH:mm'`);
  }

  const [startTime, endTime] = params.time.split(" - ");
  const beginsAt = mergeDateTime(params.date, startTime);
  const endsAt = mergeDateTime(params.date, endTime);

  const classes = await getClassRoomByProfessorIdAndDate(
    params.professorId,
    beginsAt
  );
  if (classes.length === 0) {
    const duration = parseInt(params.duration, 10);
    if (isNaN(duration)) {
      console.error(`Duración inválida ${params.duration}, expected: number`);
      throw new Error(`Duración inválida ${params.duration}, expected: number`);
    }

    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .insert({
        userId: params.professorId,
        studentId: params.studentId,
        category: params.category,
        requestDescription: params.requestDescription,
        status: params.status,
        title: params.title,
        duration,
        beginsAt,
        endsAt,
        confirmed: false,
      })
      .select();

    if (error) {
      console.error("Error al crear la clase:", error);
      return false;
    }

    return data.length > 0; // Retorna `true` solo si la inserción fue exitosa.
  } else {
    throw new Error("El profesor ya tiene clases registradas ese horario.");
  }
};

export const cancelClassRoom = async (id: number) => {
  if (!id || typeof id !== "number") {
    return { success: false, error: "ID inválido" };
  }

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .update({ status: ClassRoomStatus.CANCELLED })
    .eq("id", id)
    .select(); // Retorna los datos actualizados

  if (error) {
    console.error("Error al cancelar la clase:", error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Clase no encontrada o no pudo ser cancelada.",
    };
  }

  return { success: true, data };
};

export const confirmClassRoom = async (id: number) => {
  if (!id || typeof id !== "number") {
    return { success: false, error: "ID inválido" };
  }

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .update({ confirmed: true, status: ClassRoomStatus.CONFIRMED })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al confirmar la clase:", error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Clase no encontrada o no pudo ser confirmada.",
    };
  }

  return { success: true, data };
};

/**
 * Function to find the classes that a professor has in a day 
 * @param professorId number
 * @param rawDate string
 * @returns Promise
 */
export const getClassRoomByProfessorIdAndDate = async (
  professorId: number,
  rawDate: string
) => {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .select()
    .eq("userId", professorId)
    .eq("beginsAt", rawDate);

  if (error) {
    console.error("Error al obtener clases:", error);
    return [];
  }

  return data;
};

export const getClassRoomById = async (id: number) => {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP_VIEW)  // Usar la vista en vez de la tabla
      .select()
      .eq("id", id)
      .single();  // `.single()` para obtener un solo objeto en lugar de un array
  
    if (error) {
      console.error("Error al obtener la clase:", error);
      return null;  // Retornar `null` en lugar de `[]` si hay error o no hay datos
    }
  
    return data;
};

export const updateClassRoomStatus = async (id: number, status: string) => {
    if (!id || typeof id !== "number") {
        return { success: false, error: "ID inválido" };
      }
    
      const { data, error } = await supabaseClient
        .from(SUPABASE_TABLES.MENTORSHIP)
        .update({ status: status })
        .eq("id", id)
        .select(); // Retorna los datos actualizados
    
      if (error) {
        console.error("Error al actualizar la clase:", error);
        return { success: false, error: error.message };
      }
    
      if (!data || data.length === 0) {
        return {
          success: false,
          error: "Clase no encontrada o no pudo ser actualizada.",
        };
      }
    
      return { success: true, data };
};

const mergeDateTime = (dateStr: string, timeStr: string) => {
  const date = new Date(dateStr); // Convierte la fecha a un objeto Date
  const [time, period] = timeStr.split(" "); // Separa la hora del periodo AM/PM
  const splitTime= time.split(":").map(Number);
  const minutes = splitTime[1];
  let hours = splitTime[0];

  // Convierte la hora a formato 24h
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  date.setUTCHours(hours, minutes, 0, 0); // Establece la hora en UTC

  return date.toISOString(); // Devuelve la fecha combinada en formato ISO
};
