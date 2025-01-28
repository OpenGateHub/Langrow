"use client";
import React from "react";
import AchievementCard from "./AchievementCard";
import ReviewCard from "./ReviewCard";
import Image from "next/image";

const ProfilePage = ({
  profileImage = "/logo-green-orange.png",
  name = "Nombre no disponible",
  title = "Título no disponible",
  location = "Ubicación no disponible",
  description = "Descripción no disponible.",
  achievements = [], // achievements ahora viene del mock
  reviews = [],
  isTutor = false,
  canEdit = false,
}: {
  profileImage: string;
  name: string;
  title: string;
  location: string;
  description: string;
  achievements?: { icon: string; title: string; description: string }[];
  reviews?: { reviewerName: string; reviewText: string; stars: number; profilePicture: string }[];
  isTutor?: boolean;
  canEdit?: boolean;
}) => {
  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div
          className="relative bg-cover bg-center rounded-lg overflow-hidden"
          style={{ backgroundImage: `url('/profile-banner.png')` }}
        >
          <div className="flex items-center p-6 relative space-x-6 text-white bg-black/50 rounded-lg">
            <Image
              width={24}
              height={24}
              src={profileImage}
              alt={name}
              className="rounded-full absolute mt-[120px] z-500 w-24 h-24 border-4 border-white"
            />
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-sm">{title}</p>
              <p className="text-sm">{location}</p>
            </div>
            {canEdit ? (
              <button className="ml-auto bg-white text-secondary px-4 py-2 rounded-full shadow hover:shadow-lg">
                Editar Perfil
              </button>
            ) : (
              isTutor && (
                <button className="ml-auto bg-white text-secondary px-4 py-2 rounded-full shadow hover:shadow-lg">
                  Reservar
                </button>
              )
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h2 className="text-xl font-bold text-secondary mb-2">Descripción</h2>
          <p className="text-gray-700">{description}</p>
        </div>

        {/* Logros (solo para tutores) */}
        {isTutor && achievements.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-secondary mb-2">Logros</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <AchievementCard
                  key={index}
                  icon={achievement.icon}
                  title={achievement.title}
                  description={achievement.description}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-secondary mb-2">Testimonios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, index) => (
                <ReviewCard
                  key={index}
                  reviewerName={review.reviewerName}
                  reviewText={review.reviewText}
                  stars={review.stars}
                  profilePicture={review.profilePicture} // Incluyendo foto de perfil
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
