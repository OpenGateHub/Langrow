import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { ClassRoomStatus } from "@/types/classRoom";
import { NotificationService } from "@/lib/services/notificationService";
import { getStudentProfileById, getEmailbyUserProfileId } from "../../profile/profile";

export async function POST(req: NextRequest) {
  try {
    // Obtener todas las clases que están en estado NEXT y ya han terminado
    const now = new Date().toISOString();
    
    const { data: expiredClasses, error: fetchError } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .select(`
        id,
        userId,
        studentId,
        beginsAt,
        endsAt,
        title,
        status
      `)
      .eq('status', ClassRoomStatus.NEXT)
      .lt('endsAt', now);

    if (fetchError) {
      console.error('Error al obtener clases expiradas:', fetchError);
      return NextResponse.json(
        { message: 'Error al obtener clases expiradas', error: fetchError.message },
        { status: 500 }
      );
    }

    if (!expiredClasses || expiredClasses.length === 0) {
      return NextResponse.json(
        { message: 'No hay clases que necesiten transición automática', processed: 0 },
        { status: 200 }
      );
    }

    const processedClasses = [];
    const notificationsSent = [];

    // Procesar cada clase expirada
    for (const classItem of expiredClasses) {
      try {
        // Actualizar el estado de la clase a NOTCONFIRMED
        const { data: updatedClass, error: updateError } = await supabaseClient
          .from(SUPABASE_TABLES.MENTORSHIP)
          .update({ 
            status: ClassRoomStatus.NOTCONFIRMED,
            updatedAt: new Date().toISOString()
          })
          .eq('id', classItem.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Error al actualizar clase ${classItem.id}:`, updateError);
          continue;
        }

        processedClasses.push(updatedClass);

        // Obtener perfiles del estudiante y profesor para enviar notificaciones
        const studentProfile = await getStudentProfileById(classItem.studentId as number);
        
        // Obtener perfil del profesor directamente de la base de datos
        const { data: professorProfile, error: professorError } = await supabaseClient
          .from(SUPABASE_TABLES.PROFILES)
          .select('id, name, userId')
          .eq('userId', classItem.userId?.toString() || '')
          .single();

        if (professorError) {
          console.error(`Error al obtener perfil del profesor ${classItem.userId}:`, professorError);
        }

        // Crear notificación para el estudiante
        if (studentProfile) {
          const studentNotification = await NotificationService.create(
            studentProfile.id,
            `¡Tu clase "${classItem.title}" ha terminado! Por favor, califica tu experiencia con el profesor.`,
            `/mis-clases?tab=Revisar`,
            false
          );
          if (studentNotification) {
            notificationsSent.push({
              type: 'student',
              profileId: studentProfile.id,
              classId: classItem.id
            });
          }
        }

        // Crear notificación para el profesor
        if (professorProfile) {
          const professorNotification = await NotificationService.create(
            professorProfile.id,
            `¡Tu clase "${classItem.title}" ha terminado! Por favor, califica tu experiencia con el estudiante.`,
            `/mis-clases?tab=Revisar`,
            false
          );
          if (professorNotification) {
            notificationsSent.push({
              type: 'professor',
              profileId: professorProfile.id,
              classId: classItem.id
            });
          }
        }

      } catch (classError) {
        console.error(`Error procesando clase ${classItem.id}:`, classError);
      }
    }

    return NextResponse.json(
      { 
        message: 'Transiciones automáticas procesadas correctamente',
        processed: processedClasses.length,
        notificationsSent: notificationsSent.length,
        details: {
          classesProcessed: processedClasses.map(c => c.id),
          notificationsSent
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener clases que necesitan calificación
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'test') {
      return NextResponse.json(
        { message: 'userId válido es requerido' },
        { status: 400 }
      );
    }

    // Obtener clases en estado NOTCONFIRMED para el usuario
    const { data: classesToReview, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .select(`
        id,
        userId,
        studentId,
        beginsAt,
        endsAt,
        title,
        status,
        requestDescription
      `)
      .eq('status', ClassRoomStatus.NOTCONFIRMED)
      .or(`userId.eq.${userId},studentId.eq.${userId}`)
      .order('endsAt', { ascending: false });

    if (error) {
      console.error('Error al obtener clases para revisar:', error);
      return NextResponse.json(
        { message: 'Error al obtener clases para revisar', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Clases para revisar obtenidas correctamente',
        data: classesToReview || [],
        count: classesToReview?.length || 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 