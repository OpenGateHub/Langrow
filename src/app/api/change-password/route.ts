import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Change password API called');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.log('UserId found:', userId);

    const { currentPassword, newPassword } = await request.json();
    console.log('Request body:', { currentPassword: !!currentPassword, newPassword: !!newPassword });

    if (!newPassword) {
      return NextResponse.json(
        { message: 'Nueva contraseña es requerida' },
        { status: 400 }
      );
    }

    console.log('About to call Clerk API...');
    
    // Use Clerk's server-side API to change password
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPassword
      })
    });

    if (!response.ok) {
      console.log('Clerk API response status:', response.status);
      console.log('Clerk API response headers:', Object.fromEntries(response.headers.entries()));
      
      let errorMessage = 'Error al cambiar la contraseña';
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Clerk API error data:', errorData);
        errorMessage = errorData.errors?.[0]?.message || errorMessage;
      } catch (parseError) {
        console.log('Failed to parse Clerk API response as JSON:', parseError);
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { message: `Error interno del servidor: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 