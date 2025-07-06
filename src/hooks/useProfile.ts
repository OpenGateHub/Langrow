import React, { useState, useEffect } from "react";
import { Profile as BaseProfile } from "@/types/profile";
import { UserProfile as Profile } from "@/types/userProfile";

interface CreateProfilePayload extends BaseProfile {
  role: string | undefined;  // Cambiado de number a string
  code: string | null;
};

interface CreateProfileResponse {
  result: boolean;
  message: string;
  data: Profile;
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  createProfile: (createData: CreateProfilePayload) => Promise<any>;
  updateProfile: (updatedData: Partial<Profile>) => Promise<CreateProfileResponse>;
  refetch: () => void;
}

export function useProfile(profileId?: number | string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${profileId}`);

      if (res.status === 404) {
        // Perfil no encontrado - esto es normal para usuarios nuevos
        setProfile(null);
        setError(null);
        return;
      }

      const json = await res.json();
      if (
        !res.ok ||
        json.message !== "Consulta exitosa" ||
        !json.data?.length
      ) {
        throw new Error(json.message || "Error al obtener el perfil");
      }
      const data = json.data[0];
      const mappedProfile: Profile = {
        id: data.id,
        userId: data.userId,
        name: data.name,
        title: data.title,
        description: data.description,
        reviews: data.reviews,
        price: data.price,
        rating: data.rating,
        location: data.location,
        isActive: data.isActive,
        createdAt: data.createdAt,
        role: data.role === 1 ? "org:profesor" : data.role === 2 ? "org:alumno" : "",
        updatedAt: data.updatedAt,
        profileImg: data.profileImg,
        isZoomEnabled: data.isZoomEnabled,
        achievements: data.UserAchievements
          ? data.UserAchievements.map((ua: any) => ({
            id: ua.id,
            title: ua.Achievements.title,
            description: ua.Achievements.description,
            iconImg: ua.Achievements.iconImg,
            isActive: ua.Achievements.isActive,
          }))
          : [],
      };
      setProfile(mappedProfile);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const updateProfile = async (updatedData: Partial<Profile>) => {
    if (!profile) {
      throw new Error("Perfil no cargado");
    }
    try {
      const { name, ...rest } = updatedData;
      const payload = {
        code: profile.userId,
        isStaff: false,
        ...(name ? { fullName: name } : {}),
        ...rest,
      };
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al actualizar el perfil");
      }
      setProfile((prev) => (prev ? { ...prev, ...updatedData } : prev));
      return json;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createProfile = async (newProfileData: Partial<Profile>) => {
    try {
      const res = await fetch(`/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProfileData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al crear el perfil");
      } if (json.data && json.data.length > 0) {
        setProfile(json.data[0]);
      }
      return json;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refetch = React.useCallback(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  return { profile, loading, error, createProfile, updateProfile, refetch };
}

