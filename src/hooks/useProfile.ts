import { useState, useEffect } from "react";

export interface Achievement {
  id: number;
  title: string;
  description: string;
  iconImg: string;
  isActive: boolean;
}

export interface Profile {
  id: number;
  userId: string;
  name: string;
  title: string;
  description: string;
  reviews: number;
  price?: number;
  rating: number;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImg: string;
  achievements?: Achievement[];
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updatedData: Partial<Profile>) => Promise<any>;
  refetch: () => void;
}

export function useProfile(profileId: number | string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${profileId}`);
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
        updatedAt: data.updatedAt,
        profileImg: data.profileImg,
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
    fetchProfile();
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

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}

