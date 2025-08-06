import { supabaseClient } from '@/app/api/supabaseClient';
import { SUPABASE_TABLES } from '@/app/config';
import { ClassRoomStatus } from '@/types/classRoom';

interface CreateClassData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: ClassRoomStatus;
  paymentId: string;
  externalReference: string;
  createdAt: string;
}

export async function createClass(data: CreateClassData) {
  try {
    // Generar un enlace temporal de Google Meet
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

    // Calcular la fecha y hora de la clase (1 hora después de la creación)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora después

    // Insertar la clase en la base de datos
    const { data: classData, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .insert([
        {
          studentId: data.studentId,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          status: data.status,
          paymentId: data.paymentId,
          externalReference: data.externalReference,
          createdAt: data.createdAt,
          meetLink: meetLink,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          title: 'Clase de Inglés',
          category: 'Inglés',
          duration: 60, // 60 minutos
          cost: 1000, // Costo en pesos
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al crear la clase:', error);
      throw error;
    }

    return classData;
  } catch (error) {
    console.error('Error en createClass:', error);
    throw error;
  }
} 