"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useProfileContext } from "@/context/ProfileContext";
import LoadingScreen from './LoadingScreen';
import BlockUi from './BlockUi';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { profile, loading: profileLoading, error } = useProfileContext();
  const router = useRouter();
  const pathname = usePathname();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [redirectionInProgress, setRedirectionInProgress] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Almacenamos en localStorage si ya se ha completado el perfil
  useEffect(() => {
    if (profile && !hasCheckedProfile) {
      localStorage.setItem('hasProfile', 'true');
      setHasCheckedProfile(true);
    }
  }, [profile, hasCheckedProfile]);

  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/complete-profile',
    '/terms-of-service',
    '/privacy-policy',
    '/contact-us',
    '/home',
  ];

  // Rutas específicas donde no deberíamos redirigir a complete-profile
  const skipProfileCheckRoutes = [
    '/payment/success',
    '/payment/failure',
    '/api/auth/callback/google',
    '/class',
    '/google/auth',
    '/auth/register',
    '/home',
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const shouldSkipProfileCheck = skipProfileCheckRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Si ya estamos en medio de una redirección o la verificación inicial ya se completó, no hacer nada
    if (redirectionInProgress || !isLoaded) return;

    // Si el usuario no está autenticado y no está en una ruta pública, redirigir a login
    if (!isSignedIn && !isPublicRoute && !initialCheckDone) {
      setRedirectionInProgress(true);
      router.push('/auth/login');
      setInitialCheckDone(true);
      return;
    }

    // Si el usuario está autenticado y la carga del perfil ha finalizado (éxito o error)
    if (isSignedIn && user && !profileLoading && !shouldSkipProfileCheck && !initialCheckDone) {
      // Verificar si el usuario ya tenía un perfil antes (usando localStorage)
      const hasStoredProfile = localStorage.getItem('hasProfile') === 'true';
      
      // Si hay un error al cargar el perfil o no hay perfil y no hay registro en localStorage
      if ((error || !profile) && !hasStoredProfile && pathname !== '/auth/complete-profile') {
        // Solo redirigir si no estamos en el proceso de registro o en home
        if (pathname !== '/auth/register' && pathname !== '/home') {
          setRedirectionInProgress(true);
          router.push('/auth/complete-profile');
          setInitialCheckDone(true);
          return;
        }
      }

      // Si tiene perfil pero está en complete-profile, redirigir al home
      if ((profile || hasStoredProfile) && pathname === '/auth/complete-profile') {
        setRedirectionInProgress(true);
        router.push('/home');
        setInitialCheckDone(true);
        return;
      }

      setInitialCheckDone(true);
    }

    // Si todas las condiciones anteriores no aplican y la carga ha finalizado, marcar la verificación como completada
    if (!profileLoading && !initialCheckDone) {
      setInitialCheckDone(true);
    }
  }, [isLoaded, isSignedIn, user, profile, profileLoading, error, pathname, router, isPublicRoute, shouldSkipProfileCheck, initialCheckDone, redirectionInProgress]);

  // Después de completar una redirección, resetear el estado
  useEffect(() => {
    if (redirectionInProgress && initialCheckDone) {
      setRedirectionInProgress(false);
    }
  }, [redirectionInProgress, initialCheckDone]);

  // Permitir acceso al home para usuarios recién registrados
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BlockUi isActive={true} />
      </div>
    );
  }
  
  // Solo mostrar loading si no estamos en home y el perfil está cargando
  if (isSignedIn && profileLoading && !initialCheckDone && pathname !== '/home') {
    return (
      <div className="min-h-screen bg-gray-100">
        <BlockUi isActive={true} />
      </div>
    );
  }

  return <>{children}</>;
}
