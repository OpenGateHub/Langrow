// /hooks/useReviews.ts
import { useState, useEffect } from "react";

export interface Review {
  id: number;
  reviewerName: string;
  reviewText: string;
  stars: number;
  profilePicture: string;
  createdAt: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  submitReview: (
    reviewText: string,
    rating: number,
    reviewerId: number
  ) => Promise<any>;
}

export function useReviews(
  targetId: number | string,
  reviewType: "professor" | "student"
): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      // La URL se construye usando targetId y reviewType 
      const res = await fetch(
        `/api/profile/reviews/${targetId}?reviewType=${reviewType}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al obtener las reseñas");
      }
      // Mapeamos la respuesta para obtener la forma que espera el frontend:
      const mappedReviews = json.data.map((rev: any) => ({
        id: rev.id,
        reviewerName: rev.StudentProfile?.fullName || "Desconocido",
        reviewText: rev.notes,
        stars: rev.qualification,
        profilePicture: rev.StudentProfile?.profileImg || "",
        createdAt: rev.createdAt,
      }));
      setReviews(mappedReviews);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [targetId, reviewType]);

  const submitReview = async (
    reviewText: string,
    rating: number,
    reviewerId: number
  ) => {
    const payload = {
      rating,
      note: reviewText,
      ...(reviewType === "professor"
        ? { professor: Number(targetId), student: reviewerId }
        : { professor: reviewerId, student: Number(targetId) }),
    };

    try {
      const res = await fetch("/api/profile/review/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al enviar la reseña");
      }
      await fetchReviews();
      return json;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  return { reviews, loading, error, refetch: fetchReviews, submitReview };
}
