"use client";
import React, { useState, useEffect } from "react";
import AchievementCard from "./AchievementCard";
import ReviewCard from "./ReviewCard";
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import { useUser } from "@clerk/nextjs";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useReviews } from "@/hooks/useReview";

interface ProfilePageProps {
  profileId: number | string;
  isTutor?: boolean;
  editEnabled?: boolean;
}

const ProfilePage = ({ profileId, isTutor = false }: ProfilePageProps) => {
  const { isLoaded, user } = useUser();
  const { profile, loading, error, updateProfile, refetch } = useProfile(profileId);
  const reviewType = isTutor ? "professor" : "student";
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(profile?.id as number, reviewType);

  // Calculamos canEdit comparando el id del usuario logueado con el profileId
  const computedCanEdit = user?.id === String(profileId);

  // Estados locales para manejar la edición de los campos
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [newProfileImage, setNewProfileImage] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Cuando se carga el perfil, inicializamos los estados con los valores actuales
  useEffect(() => {
    if (profile) {
      setNewProfileImage(profile.profileImg);
      setNewName(profile.name);
      setNewDescription(profile.description);
      setNewTitle(profile.title);
      setNewLocation(profile.location);
    }
  }, [profile]);

  if (!isLoaded || loading) return <p>Cargando...</p>;
  if (error || !profile) return <p>Error: {error || "Perfil no encontrado"}</p>;

  // Funciones de envío de formularios usando el hook updateProfile
  const handlePhotoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ profileImg: newProfileImage });
      setIsEditingPhoto(false);
      refetch();
    } catch (err) {
      console.error("Error actualizando la foto", err);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ name: newName });
      setIsEditingName(false);
      refetch();
    } catch (err) {
      console.error("Error actualizando el nombre", err);
    }
  };

  const handleTitleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ title: newTitle });
      setIsEditingTitle(false);
      refetch();
    } catch (err) {
      console.error("Error actualizando el título", err);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ location: newLocation });
      setIsEditingLocation(false);
      refetch();
    } catch (err) {
      console.error("Error actualizando la ubicación", err);
    }
  };

  const handleDescriptionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ description: newDescription });
      setIsEditingDescription(false);
      refetch();
    } catch (err) {
      console.error("Error actualizando la descripción", err);
    }
  };

  // Rol del usuario logueado, para condicionar el botón "Reservar"
  const loggedUserRole = user?.unsafeMetadata?.role;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Banner y sección de encabezado */}
        <AnimateOnScroll>
          <div
            className="relative bg-cover rounded-xl opacity-0 animate-fade-in"
            style={{ backgroundImage: `url('/profile-banner.png')` }}
          >
            <div className="flex flex-col md:flex-row items-center p-6 relative space-y-6 md:space-y-0 md:space-x-6 text-white rounded-lg">
              {/* Foto de perfil y edición */}
              <AnimateOnScroll delay={100}>
                <div className="relative flex justify-center md:justify-start">
                  <Image
                    width={150}
                    height={150}
                    src={newProfileImage}
                    alt={newName}
                    className="rounded-full relative mt-3 md:absolute md:mt-[-20px] md:z-500 w-[150px] max-w-[150px] h-[150px] border-4 border-white"
                  />
                  {computedCanEdit && (
                    <div className="absolute bottom-0 right-0">
                      {isEditingPhoto ? (
                        <form onSubmit={handlePhotoSubmit} className="flex space-x-2">
                          <input
                            type="text"
                            value={newProfileImage}
                            onChange={(e) => setNewProfileImage(e.target.value)}
                            placeholder="URL de la nueva foto"
                            className="text-secondary px-2 py-1 rounded-full text-xs shadow border"
                          />
                          <button type="submit" className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingPhoto(false)}
                            className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsEditingPhoto(true)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                        >
                          Editar Foto
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
              {/* Datos del perfil */}
              <AnimateOnScroll delay={200}>
                <div className="pl-0 md:pl-[140px] text-center md:text-left">
                  {/* Nombre */}
                  <div className="flex items-center justify-center md:justify-start">
                    {isEditingName ? (
                      <form onSubmit={handleNameSubmit} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="text-2xl font-bold bg-white border p-1 rounded"
                        />
                        <button type="submit" className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold opacity-0 animate-fade-in">{newName}</h1>
                        {computedCanEdit && (
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="ml-2 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow opacity-0 animate-fade-in delay-200"
                          >
                            Editar Nombre
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {/* Título */}
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    {isEditingTitle ? (
                      <form onSubmit={handleTitleSubmit} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="text-sm bg-white border p-1 rounded"
                        />
                        <button type="submit" className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingTitle(false)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm opacity-0 animate-fade-in delay-300">{newTitle}</p>
                        {computedCanEdit && (
                          <button
                            onClick={() => setIsEditingTitle(true)}
                            className="ml-2 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow opacity-0 animate-fade-in delay-200"
                          >
                            Editar Título
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {/* Ubicación */}
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    {isEditingLocation ? (
                      <form onSubmit={handleLocationSubmit} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="text-sm bg-white border p-1 rounded"
                        />
                        <button type="submit" className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingLocation(false)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="flex items-center justify-center md:justify-start opacity-0 animate-fade-in delay-400">
                          <CiLocationOn className="mr-1" />
                          <span className="text-sm">{newLocation}</span>
                        </p>
                        {computedCanEdit && (
                          <button
                            onClick={() => setIsEditingLocation(true)}
                            className="ml-2 bg-white text-secondary px-2 py-1 rounded-full text-xs shadow opacity-0 animate-fade-in delay-200"
                          >
                            Editar Ubicación
                          </button>
                        )}
                      </>
                    )}
                  </div>
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
          {/* Sección de Descripción con opción de editar */}
          <AnimateOnScroll delay={700}>
            <div className="relative opacity-0 animate-fade-in">
              <h2 className="text-xl font-bold text-secondary mb-2 mt-[80px]">Descripción</h2>
              {computedCanEdit && (
                <div className="absolute right-0 top-0">
                  {isEditingDescription ? (
                    <form onSubmit={handleDescriptionSubmit} className="flex flex-col space-y-2">
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingDescription(false)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow"
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
              <p className="text-gray-700">{newDescription}</p>
            </div>
          </AnimateOnScroll>

          {/* Sección de Logros (solo para tutores) */}
          {isTutor && profile.achievements && profile.achievements.length > 0 && (
            <AnimateOnScroll delay={800}>
              <div className="opacity-0 animate-fade-in">
                <h2 className="text-xl font-bold text-secondary mb-2 mt-6">Logros</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.achievements.map((achievement, index) => (
                    <AnimateOnScroll key={index} delay={900 + index * 100}>
                      <AchievementCard
                        icon={achievement.iconImg}
                        title={achievement.title}
                        description={achievement.description}
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          )}

          {/* Sección de Reseñas (solo lectura) */}
          <AnimateOnScroll delay={1000}>
            <div className="opacity-0 animate-fade-in">
              <h2 className="text-xl font-bold text-secondary mb-2 mt-6">Testimonios</h2>
              {reviewsLoading && <p>Cargando reseñas...</p>}
              {reviewsError && <p>Error al cargar reseñas: {reviewsError}</p>}
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
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
