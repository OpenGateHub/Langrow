import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/supabaseClient';
import { getProfileByUserId } from '@/app/api/profile/profile';
import { SUPABASE_TABLES } from '@/app/config';

/**
 * GET /api/profile/me
 * Obtiene el perfil del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación usando Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' }, 
        { status: 401 }
      );
    }
    
    // Obtener el perfil del usuario desde la base de datos
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Perfil no encontrado. Completa tu perfil primero.' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Perfil obtenido exitosamente',
      data: profile
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/me
 * Actualiza el perfil del usuario autenticado
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' }, 
        { status: 401 }
      );
    }
    
    // Obtener datos del cuerpo de la petición
    const body = await req.json();
    const { name, description, location, price, profileImg } = body;
    
    // Validar que el perfil existe
    const existingProfile = await getProfileByUserId(userId);
    if (!existingProfile) {
      return NextResponse.json(
        { message: 'Perfil no encontrado' }, 
        { status: 404 }
      );
    }
    
    // Preparar datos para actualizar
    const updateData = {
      updatedAt: new Date(),
      ...(name && { name }),
      ...(description && { description }),
      ...(location && { location }),
      ...(price && { price }),
      ...(profileImg && { profileImg })
    };
    
    // Actualizar el perfil en la base de datos
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .update(updateData)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error al actualizar el perfil:', error);
      return NextResponse.json(
        { message: 'Error al actualizar el perfil' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      data
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/me
 * Desactiva el perfil del usuario autenticado
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' }, 
        { status: 401 }
      );
    }
    
    // Obtener información completa del usuario de Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }
    
    // Desactivar el perfil en lugar de eliminarlo
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .update({ 
        isActive: false,
        updatedAt: new Date()
      })
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error al desactivar el perfil:', error);
      return NextResponse.json(
        { message: 'Error al desactivar el perfil' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Perfil desactivado exitosamente',
      data
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al desactivar el perfil:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
} 