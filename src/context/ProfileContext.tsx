"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import { UserProfile as Profile } from "@/types/userProfile";

interface ProfileContextValue {
  clerkUser: ReturnType<typeof useUser>["user"] | null;
  role: "org:alumno" | "org:profesor" | "org:admin" | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateProfile: (updatedData: Partial<Profile>) => Promise<any>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();

  // Determinamos el role (si es "org:alumno", "org:profesor" o "org:admin")
  const role =
    user?.unsafeMetadata?.formRole === "org:alumno" ||
    user?.unsafeMetadata?.formRole === "org:profesor" ||
    user?.unsafeMetadata?.formRole === "org:admin"
      ? user.unsafeMetadata.formRole
      : null;

  // Usamos el id del usuario una vez que Clerk esté cargado
  const profileId = isLoaded && user ? user.id : "";
  const { profile, loading, error, refetch, updateProfile } = useProfile(profileId);

  // Este useEffect se ejecuta cuando el usuario se carga y así refresca el perfil
  useEffect(() => {
    if (isLoaded && user) {
      console.log('ProfileContext: Recargando perfil para usuario:', user.id);
      refetch();
    }
  }, [isLoaded, user?.id]); // Solo depende del ID del usuario, no de todo el objeto user

  const value: ProfileContextValue = {
    clerkUser: user || null,
    role,
    profile,
    loading,
    error,
    refetch,
    updateProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext debe usarse dentro de un ProfileProvider");
  }
  return context;
};