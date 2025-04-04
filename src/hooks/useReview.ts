// /hooks/useReviews.ts
import { useState, useEffect } from "react";
import {StudentProfile} from "@/types/studentProfile";

export interface Review {
  id: number;
  userId: number;
  studentId: number;
  notes: string;
  qualification: number;
  createdAt: string;
  isActive: boolean;
  reviewer: StudentProfile | null;
}

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  submitReview: (reviewText: string, rating: number, reviewerId: number) => Promise<any>;
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
      // Se construye la URL con el query string basado en reviewType
      const res = await fetch(`/api/profile/reviews/${targetId}?${reviewType}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al obtener las reseñas");
      }
      setReviews(json.data);
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

  const submitReview = async (reviewText: string, rating: number, reviewerId: number) => {
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