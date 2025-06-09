"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useProfileContext } from "@/context/ProfileContext";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { profile, loading: profileLoading } = useProfileContext();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/complete-profile'
  ];

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoaded || profileLoading) return; // Esperar a que Clerk y el perfil carguen

    // Si el usuario no está autenticado y no está en una ruta pública
    if (!isSignedIn && !isPublicRoute) {
      router.push('/auth/login');
      return;
    }

    // Si el usuario está autenticado, verificar si tiene perfil/rol
    if (isSignedIn && user) {
      // Verificar primero desde nuestra base de datos (profile context)
      const hasProfileInDB = profile && profile.role;
      
      // Si no tiene perfil en la DB, redirigir a completar perfil
      if (!hasProfileInDB && pathname !== '/auth/complete-profile') {
        router.push('/auth/complete-profile');
        return;
      }

      // Si tiene perfil pero está en complete-profile, redirigir al home
      if (hasProfileInDB && pathname === '/auth/complete-profile') {
        router.push('/home');
        return;
      }
    }

  }, [isLoaded, isSignedIn, user, profile, profileLoading, pathname, router, isPublicRoute]);

  if (!isLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
