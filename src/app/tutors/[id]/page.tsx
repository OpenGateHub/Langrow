"use client";
import React from "react";
import { useParams, notFound } from "next/navigation";
import ProfilePage from "../../components/profile/ProfilePage";
import mockTutors from "../../data/mockTutors";

export default function TutorProfile() {
    const params  = useParams();

  // Buscamos el tutor basado en el ID de la URL

  if (!params?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-700">Tutor no encontrado.</h1>
      </div>
    );
  }

  const tutorId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id, 10);

  // Find the tutor by ID
  const tutor = mockTutors.find((t) => t.id === tutorId);

  if (!tutor) {
    notFound(); // Render the default 404 page if the tutor is not found
    return null;
  }

  return (
    <ProfilePage
      profileImage={tutor.profileImage}
      name={tutor.name}
      title={tutor.shortDescription}
      location={tutor.location}
      description={tutor.longDescription}
      achievements={tutor.achievements}
      reviews={tutor.reviews.map((r) => ({
        reviewerName: r.name,
        reviewText: r.review,
        stars: r.rating,
        profilePicture: r.profilePicture,
      }))}
      isTutor={true}
      canEdit={false} // Cambiar a true si el usuario actual puede editar
    />
  );
}
