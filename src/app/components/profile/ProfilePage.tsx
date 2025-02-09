"use client";
import React from "react";
import AchievementCard from "./AchievementCard";
import ReviewCard from "./ReviewCard";
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import { useUser } from "@clerk/nextjs";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { link } from "fs";
import Link from "next/link";

interface Achievement {
  icon: string;
  title: string;
  description: string;
}

interface Review {
  reviewerName: string;
  reviewText: string;
  stars: number;
  profilePicture: string;
}

interface ProfilePageProps {
  profileId: number; // id del usuario dueño del perfil
  profileImage?: string;
  name?: string;
  title?: string;
  location?: string;
  description?: string;
  achievements?: Achievement[];
  reviews?: Review[];
  isTutor?: boolean;
  // Puedes seguir recibiendo un canEdit opcional para forzar o sobreescribir el valor,
  // pero en este ejemplo lo calculamos directamente.
  canEdit?: boolean;
}

const ProfilePage = ({
  profileId,
  profileImage = "/logo-green-orange.png",
  name = "Nombre no disponible",
  title = "Título no disponible",
  location = "Ubicación no disponible",
  description = "Descripción no disponible.",
  achievements = [],
  reviews = [],
  isTutor = false,
  canEdit, // opcional, si se pasa se respeta; si no, se calcula
}: ProfilePageProps) => {
  const { isLoaded, user } = useUser();
  if (!isLoaded) return null;

  // Calcular canEdit comparando el id del perfil con el id del usuario logueado.
  const computedCanEdit = canEdit ?? (user?.id === profileId.toString());

  // Obtener el rol del usuario logueado para condicionar el botón "Reservar"
  const loggedUserRole = user?.unsafeMetadata?.role;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header con banner */}
        <AnimateOnScroll>
  <div
    className="relative bg-cover rounded-xl opacity-0 animate-fade-in"
    style={{ backgroundImage: `url('/profile-banner.png')` }}
  >
    <div className="flex flex-col md:flex-row items-center p-6 relative space-y-6 md:space-y-0 md:space-x-6 text-white rounded-lg">
      {/* Foto de perfil con botón de edición */}
      <AnimateOnScroll delay={100}>
        <div className="relative flex justify-center md:justify-start">
          <Image
            width={150}
            height={150}
            src={profileImage}
            alt={name}
            className="rounded-full relative mt-3 md:absolute md:mt-[-20px] md:z-500 w-[150px] max-w-[150px] h-[150px] border-4 border-white"
          />
          {computedCanEdit && (
            <button className="absolute bottom-0 right-0 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
              Editar Foto
            </button>
          )}
        </div>
      </AnimateOnScroll>
      {/* Datos del perfil */}
      <AnimateOnScroll delay={200}>
        <div className="pl-0 md:pl-[140px] text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start">
            <h1 className="text-2xl font-bold opacity-0 animate-fade-in">
              {name}
            </h1>
            {computedCanEdit && (
              <button className="ml-2 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow opacity-0 animate-fade-in delay-200">
                Editar Nombre
              </button>
            )}
          </div>
          <p className="text-sm opacity-0 animate-fade-in delay-300">
            {title}
          </p>
          <p className="flex items-center justify-center md:justify-start opacity-0 animate-fade-in delay-400">
            <CiLocationOn className="mr-1" />{" "}
            <span className="text-sm">{location}</span>
          </p>
        </div>
      </AnimateOnScroll>
      {/* Botón de Editar Perfil o Reservar */}
      <AnimateOnScroll delay={500}>
        <div className="mt-4 md:mt-0 md:ml-auto">
          {computedCanEdit ? (
            <button className="bg-white text-secondary px-4 py-2 rounded-full shadow hover:shadow-lg opacity-0 animate-fade-in delay-600">
              Editar Perfil
            </button>
          ) : (
            loggedUserRole === "org:alumno" &&
            isTutor && (
              <Link href={`/reserva/${profileId}`} passHref>
                <button className="md:absolute md:mt-[40px] bg-white text-secondary focus:bg-secondary focus:text-white hover:bg-gray-200 group font-semibold px-4 py-2 rounded-full shadow hover:shadow-lg opacity-0 animate-fade-in delay-60 border-2 border-gray-300 transition-all duration-200 ease-in-out">
                  Reservar
                </button>
              </Link>
            )
          )}
        </div>
      </AnimateOnScroll>
    </div>
  </div>
</AnimateOnScroll>


        <div className="pl-6">
          {/* Sección Descripción con opción de editar */}
          <AnimateOnScroll delay={700}>
            <div className="relative opacity-0 animate-fade-in">
              <h2 className="text-xl font-bold text-secondary mb-2 mt-[80px]">
                Descripción
              </h2>
              {computedCanEdit && (
                <button className="absolute right-0 top-0 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                  Editar
                </button>
              )}
              <p className="text-gray-700">{description}</p>
            </div>
          </AnimateOnScroll>

          {/* Logros (solo para tutores) – sin opción de editar */}
          {isTutor && achievements.length > 0 && (
            <AnimateOnScroll delay={800}>
              <div className="opacity-0 animate-fade-in">
                <h2 className="text-xl font-bold text-secondary mb-2 mt-6">
                  Logros
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <AnimateOnScroll key={index} delay={900 + index * 100}>
                      <AchievementCard
                        icon={achievement.icon}
                        title={achievement.title}
                        description={achievement.description}
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          )}

          {/* Reseñas – sin opción de editar */}
          {reviews.length > 0 && (
            <AnimateOnScroll delay={1000}>
              <div className="opacity-0 animate-fade-in">
                <h2 className="text-xl font-bold text-secondary mb-2 mt-6">
                  Testimonios
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review, index) => (
                    <AnimateOnScroll key={index} delay={1100 + index * 150}>
                      <ReviewCard
                        reviewerName={review.reviewerName}
                        reviewText={review.reviewText}
                        stars={review.stars}
                        profilePicture={review.profilePicture}
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
