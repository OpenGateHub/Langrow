import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { parse } from "path";
import { format } from "date-fns";

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

export const getClassRoomByStudentId = async (studentIdStr: number) => {};

export const getClassRoomByProfessorId = async (professorId: number) => {};

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
    .update({ status: "cancelled" })
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
    .update({ confirmed: true, status: "completed" })
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

const mergeDateTime = (dateStr: string, timeStr: string) => {
  const date = new Date(dateStr); // Convierte la fecha a un objeto Date
  const [time, period] = timeStr.split(" "); // Separa la hora del periodo AM/PM
  let [hours, minutes] = time.split(":").map(Number);

  // Convierte la hora a formato 24h
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  date.setUTCHours(hours, minutes, 0, 0); // Establece la hora en UTC

  return date.toISOString(); // Devuelve la fecha combinada en formato ISO
};
