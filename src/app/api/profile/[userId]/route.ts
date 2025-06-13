import { NextResponse } from 'next/server';
import { supabaseClient } from '../../supabaseClient';
import { SUPABASE_TABLES } from '@/app/config';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener el perfil del usuario desde Supabase
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.USER_PROFILES)
      .select('*')
      .eq('userId', id)
      .single();

    if (error) {
      console.error('Error al obtener el perfil:', error);
      return NextResponse.json(
        { error: 'Error al obtener el perfil del usuario' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error en la API de perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 