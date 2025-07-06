import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/app/api/supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { ClassRoomStatus } from "@/types/classRoom";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { message: 'classId es requerido' },
        { status: 400 }
      );
    }

    // Simular que una clase ha terminado cambiando su fecha de finalización al pasado
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1); // 1 hora en el pasado

    // Primero verificar si la clase existe
    const { data: existingClass, error: fetchError } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .select('id, title, status')
      .eq('id', classId)
      .single();

    if (fetchError) {
      console.error('Error al buscar la clase:', fetchError);
      return NextResponse.json(
        { message: 'Clase no encontrada', error: fetchError.message },
        { status: 404 }
      );
    }

    if (!existingClass) {
      return NextResponse.json(
        { message: 'Clase no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la clase
    const { data: updatedClass, error } = await supabaseClient
      .from(SUPABASE_TABLES.MENTORSHIP)
      .update({ 
        endsAt: pastDate.toISOString(),
        status: ClassRoomStatus.NEXT // Asegurar que esté en estado NEXT
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar la clase:', error);
      return NextResponse.json(
        { message: 'Error al actualizar la clase', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Clase actualizada para simular transición automática',
        data: updatedClass
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