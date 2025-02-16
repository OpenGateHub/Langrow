"use client";

import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useProfile, Profile } from "@/hooks/useProfile";

interface ProfileContextValue {
  clerkUser: ReturnType<typeof useUser>["user"] | null;
  role: "org:alumno" | "org:profesor" | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateProfile: (updatedData: Partial<Profile>) => Promise<any>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();

  // Determinamos el role (si es "org:alumno" o "org:profesor")
  const role =
    user?.unsafeMetadata?.role === "org:alumno" ||
    user?.unsafeMetadata?.role === "org:profesor"
      ? user.unsafeMetadata.role
      : null;

  // Una vez que Clerk esté cargado y tengamos el usuario, usamos su id para traer el perfil.
  const profileId = isLoaded && user ? user.id : "";
  const { profile, loading, error, refetch, updateProfile } = useProfile(profileId);

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
