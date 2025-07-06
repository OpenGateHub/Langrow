import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { ClassRoom, ClassRoomStatus, ClassRoomUpdate } from "@/types/classRoom";
import { getUserProvider } from "@/lib/providers";
import { MeetingEventDetails } from "@/interfaces/MeetingProvider";
import { NotificationService } from "@/services/notificationService";
import {
  getStudentProfileByUserId,
  getStudentProfileById,
  getEmailbyUserProfileId
} from "../profile/profile";
import { GetMentoringFilter } from "./route";
import { da } from "date-fns/locale";

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
  requestDescription: string | undefined;
  payment_id?: string | number | undefined; // Optional, used for payment tracking
}

export const getClassRoomByStudent = async (filter: GetMentoringFilter) => {
    const student = await getStudentProfileByUserId(filter.userId);
    if (!student) {
        console.error('Estudiante no encontrado');
        return [];
    }
    let query = supabaseClient.from(SUPABASE_TABLES.MENTORSHIP_VIEW).select().eq("studentId", student.id);
    if (filter.id) {
        query = query.eq('id', filter.id);
    } else {
        
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
        query = query.eq('id', filter.id);
    } else {
        
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
 * @deprecated
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
    const studentUserProfile = await getStudentProfileById(params.studentId);
    const proffesorEmail = await getEmailbyUserProfileId(params.professorId);
    if (!studentUserProfile || !proffesorEmail) {
      console.error("Perfil de estudiante o email del profesor no encontrado.");
      throw new Error("Perfil de estudiante o email del profesor no encontrado.");
    }

    const provider = await getUserProvider(studentUserProfile.id);
    if (!provider) {
      console.error("Proveedor de usuario no encontrado.");
      throw new Error("Proveedor de usuario no encontrado.");
    }

    const details: MeetingEventDetails = {
      summary: "Langrow Class",
      description: params.requestDescription,
      startDateTime: beginsAt,
      endDateTime: endsAt,
      timeZone: "GMT-3", // Asegúrate de que el proveedor soporte este timezone
      attendees: [proffesorEmail, studentUserProfile.email],
    }

    const meeting = await provider.createMeeting(details);
    if (!meeting || !meeting.joinUrl) {
      console.error("Error al crear la reunión con el proveedor.");
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
        classRoomUrl: meeting.joinUrl, // URL de la reunión creada
        meetingExternalId: meeting.id
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

export const createClassRoomMeeting = async (mentoring: ClassRoom) => {
  try {
    if (mentoring.studentId === null || mentoring.studentId === undefined) {
      throw new Error("El ID del estudiante es inválido.");
    }
    if (mentoring.userId === null || mentoring.userId === undefined) {
      throw new Error("El ID del profesor es inválido.");
    }
    
    const studentUserProfile = await getStudentProfileById(mentoring.studentId);
    const proffesorEmail = await getEmailbyUserProfileId(mentoring.userId);
    if (!studentUserProfile || !proffesorEmail) {
      console.error("Perfil de estudiante o email del profesor no encontrado.");
      return { success: false, error: "Perfil de estudiante o email del profesor no encontrado." };
    }
        const provider = await getUserProvider(mentoring.userId);
    if (!provider) {
      console.error("Proveedor de usuario no encontrado.");
      throw new Error("Proveedor de usuario no encontrado.");
    }

    const details: MeetingEventDetails = {
      summary: "Langrow Class",
      description: mentoring.requestDescription || "Clase de mentoría programada",
      startDateTime: mentoring.beginsAt ?? "",
      endDateTime: mentoring.endsAt ?? "",
      timeZone: "GMT-3", // Asegúrate de que el proveedor soporte este timezone
      attendees: [proffesorEmail, studentUserProfile.email],
    }

    const meeting = await provider.createMeeting(details);
    if (!meeting || !meeting.joinUrl) {
      console.error("Error al crear la reunión con el proveedor.");
    }
    return {
      success: true,
      meetingUrl: meeting.joinUrl,
      meetingExternalId: meeting.id
    };

  } catch (error) {
    console.error("Error al obtener el perfil del estudiante o el email del profesor:", error);
    return { success: false, error: "Error al obtener el perfil del estudiante o el email del profesor." };
  }
}

export const cancelClassRoom = async (id: number) => {
  if (!id || typeof id !== "number") {
    return { success: false, error: "ID inválido" };
  }

  try {
      const { data: mentoringData, error } = await supabaseClient
          .from(SUPABASE_TABLES.MENTORSHIP)
          .update({ status: ClassRoomStatus.REJECTED })
          .eq("id", id)
          .select()
          .single(); // Retorna los datos actualizados

      if (error) {
          console.error("Error al cancelar la clase:", error);
          return { success: false, error: error.message };
      }

      // TODO:: Cancelar la meeting en el proveedor si es necesario
      const studentId: number | null = mentoringData.studentId;
      if (studentId === null || studentId === undefined) {
          console.error("El ID del estudiante resulto NulL en la mentoring");
          return { success: false, error: "Student ID is invalid." };
      }
      const studentProfile = await getStudentProfileById(studentId);

      if (studentProfile === null || studentProfile === undefined || mentoringData.meetingExternalId === null) {
          console.error("Perfil de estudiante no encontrado. La videollamada no se pudo cancelar.");
          return { success: false, error: "Ha ocurrido un error, la videollamada no se pudo cancelar." };
      }
      const provider = await getUserProvider(studentProfile.id)
      await provider.cancelMeeting(mentoringData.meetingExternalId);

      if (!mentoringData) {
          return {
              success: false,
              error: "Clase no encontrada o no pudo ser cancelada.",
          };
      }
    if (mentoringData) {
      const studentProfile = await getStudentProfileById(mentoringData.studentId as number);
      if (studentProfile){
        await NotificationService.create(
          studentProfile.id,
          `Tu clase con el profesor ha sido cancelada para el día ${new Date(mentoringData.beginsAt ?? "").toLocaleDateString()} a las ${new Date(mentoringData.beginsAt ?? "").toLocaleTimeString()}.`,
          `/mentoring/classRoom/${mentoringData.id}`,
          false
        );
      }
    }

      return { success: true, mentoringData };
  } catch (error: any) {
      console.error("Error en el servidor:", error);
      return { success: false, error: error.message || "Error interno del servidor" };
  }
};

export const confirmClassRoom = async (id: number) => {
  if (!id || typeof id !== "number") {
    return { success: false, error: "ID inválido" };
  }

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .update({ confirmed: true, status: ClassRoomStatus.CONFIRMED })
    .eq("id", id)
    .select().single(); // Retorna los datos actualizados

  if (error) {
    console.error("Error al confirmar la clase:", error);
    return { success: false, error: error.message };
  }

  if (!data) {
    return {
      success: false,
      error: "Clase no encontrada o no pudo ser confirmada.",
    };
  }
  if (data) {
    const studentProfile = await getStudentProfileById(data.studentId as number);
    if (studentProfile){
      await NotificationService.create(
        studentProfile.id,
        `Tu clase con el profesor ha sido confirmada para el día ${new Date(data.beginsAt ?? "").toLocaleDateString()} a las ${new Date(data.beginsAt ?? "").toLocaleTimeString()}.`,
        `/mentoring/classRoom/${data.id}`,
        false
      );
    }
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
        .select().single(); // Retorna los datos actualizados
    
      if (error) {
        console.error("Error al actualizar la clase:", error);
        return { success: false, error: error.message };
      }
    
      if (!data) {
        return {
          success: false,
          error: "Clase no encontrada o no pudo ser actualizada.",
        };
      }

      if (data) {
        const studentProfile = await getStudentProfileById(data.studentId as number);
        if (studentProfile){
          await NotificationService.create(
            studentProfile.id,
            `Tu clase con el profesor ha sido actualizada a ${status} para el día ${new Date(data.beginsAt ?? "").toLocaleDateString()} a las ${new Date(data.beginsAt ?? "").toLocaleTimeString()}.`,
            `/mentoring/classRoom/${data.id}`,
            false
          );
        }
      }

    
      return { success: true, data };
};

export const createMultipleClassRooms = async (classRooms: CreateClassRoomParams[]) => {
  if (!Array.isArray(classRooms) || classRooms.length === 0) {
    throw new Error("Debe proporcionar un array de clases.");
  } 

  // Map input to match DB schema: convert duration to number, merge date/time, remove/rename fields as needed
  const mappedClassRooms = classRooms.map((params) => {
    if (!params.time.includes(" - ")) {
      throw new Error(`Formato de tiempo inválido: ${params.time}, expected : 'HH:mm - HH:mm'`);
    }
    const [startTime, endTime] = params.time.split(" - ");
    const beginsAt = mergeDateTime(params.date, startTime);
    const endsAt = mergeDateTime(params.date, endTime);

    return {
      userId: params.professorId,
      studentId: params.studentId,
      category: params.category,
      requestDescription: params.requestDescription,
      status: params.status,
      title: params.title,
      duration: parseInt(params.duration, 10),
      beginsAt,
      endsAt,
      confirmed: false,
      classRoomUrl: null,
      meetingExternalId: null,
      paymentId: params.payment_id as string
    };
  });

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .insert(mappedClassRooms)
    .select(); // Retorna los datos insertados  

  if (error) {
    console.error("Error al crear las clases:", error);
    throw error;
  }

  return data;
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


export const updateClassRoomByPaymentId = async (
  paymentId: string | undefined,
  status: ClassRoomStatus
) => {
  if (!paymentId || (typeof paymentId !== "string" && typeof paymentId !== "number")) {
    return { success: false, error: "ID de pago inválido" };
  }

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .update({ status: status, updatedAt: new Date().toISOString() })
    .eq("paymentId", paymentId)
    .select();

  if (error) {
    console.error("Error al actualizar la clase por ID de pago:", error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Clase no encontrada o no pudo ser actualizada.",
    };
  }

  return { success: true, data };
}

export const updateClassRoomById = async (
  id: number,
  fieldsToUpdate: Partial<ClassRoomUpdate>
) => {
  if (!id || typeof id !== "number") {
    return { success: false, error: "ID inválido" };
  }

  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLES.MENTORSHIP)
    .update(fieldsToUpdate)
    .eq("id", id)
    .select();

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
}
