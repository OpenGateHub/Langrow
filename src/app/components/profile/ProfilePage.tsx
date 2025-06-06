"use client";
import React, { useState, useEffect } from "react";
import AchievementCard from "./AchievementCard";
import ReviewCard from "./ReviewCard";
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import { RiPencilLine } from "react-icons/ri";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import Link from "next/link";
import { useReviews } from "@/hooks/useReview";
import { useProfileContext } from "@/context/ProfileContext";
import { useProfile } from "@/hooks/useProfile";

interface ProfilePageProps {
  profileId?: string; // Si se pasa, se carga ese perfil; sino se usa el del contexto
  isTutor?: boolean;
  editEnabled?: boolean;
}

const ProfilePage = ({ profileId, isTutor = false, editEnabled = false }: ProfilePageProps) => {
  // Llamamos a ambos hooks siempre, en el mismo orden.
  const profileDataFromHook = useProfile(profileId);
  const profileDataFromContext = useProfileContext();
  const profileData = profileId ? profileDataFromHook : profileDataFromContext;
  const { profile, loading, error, updateProfile, refetch } = profileData;

  // Para las reseñas, usamos el id del perfil cargado. Si no se ha cargado, evitamos errores usando 0.
  const { reviews = [], loading: reviewsLoading, error: reviewsError } = useReviews(
    profile?.id ? (profile.id as number) : 0,
    isTutor ? "professor" : "student"
  );

  // Permitir edición si editEnabled es true
  const computedCanEdit = editEnabled;

  // Estados locales para la edición de cada campo
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [newProfileImage, setNewProfileImage] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    if (profile) {
      setNewProfileImage(profile.profileImg || "/default-profile.png");
      setNewName(profile.name || "");
      setNewDescription(profile.description || "");
      setNewTitle(profile.title || "");
      setNewLocation(profile.location || "");
    }
  }, [profile]);

  if (loading) return <p>Cargando...</p>;
  if (error || !profile) return <p>Error: {error || "Perfil no encontrado"}</p>;

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

  return (
    <main className="p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Banner y sección de encabezado */}
        <AnimateOnScroll>
          <div
            className="relative bg-cover rounded-xl opacity-0 animate-fade-in"
            style={{ backgroundImage: `url('/profile-banner.png')` }}
          >
            <div className="flex flex-col md:flex-row items-center px-6 pt-5 mb-[-50px] md:mb-0 sm:pt-10 sm:pb-3 relative space-y-6 md:space-y-0 md:space-x-6 text-white rounded-lg">
              {/* Foto de perfil */}
              <AnimateOnScroll delay={100}>
                <div className="relative flex justify-center md:justify-start">
                  <Image
                    width={150}
                    height={150}
                    src={newProfileImage || "/profile-default.png"}
                    alt={newName}
                    className="rounded-full relative mt-3 md:absolute md:mt-[-40px] md:z-50 w-[150px] max-w-[150px] h-[150px] border-4 border-white"
                    onError={(e) => {
                      e.currentTarget.src = "/profile-default.png";
                    }}
                  />
                  {computedCanEdit && (
                    <div className="absolute top-0 left-0 z-50">
                      {isEditingPhoto ? (
                        <form onSubmit={handlePhotoSubmit} className="flex space-x-2">
                          <input
                            type="text"
                            value={newProfileImage}
                            onChange={(e) => setNewProfileImage(e.target.value)}
                            placeholder="URL de la nueva foto"
                            className="text-secondary px-2 py-1 rounded-full text-xs shadow border"
                          />
                          <button
                            type="submit"
                            className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow transition-all duration-300 ease-in-out animate-slideInLeft delay-100"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingPhoto(false)}
                            className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow transition-all duration-300 ease-in-out animate-slideInLeft delay-150"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsEditingPhoto(true)}
                          className="bg-white text-secondary px-2 py-1 rounded-full text-xs shadow hover:bg-secondary hover:text-white transition-all duration-200 ease-in-out"
                        >
                          <RiPencilLine />
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
                          className="text-2xl font-bold bg-transparent border-b border-transparent focus:border-secondary outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-white text-secondary hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out px-2 py-1 rounded-full text-xs shadow animate-slideInLeft delay-100"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          className="bg-white text-secondary px-2 py-1 hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out rounded-full text-xs shadow animate-slideInLeft delay-150"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold opacity-0 animate-fade-in">
                          {newName}
                        </h1>
                        {computedCanEdit && (
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="ml-2 text-white p-1 rounded-full text-l shadow opacity-0 animate-fade-in delay-200 hover:bg-white hover:text-secondary transition-all duration-200 ease-in-out"
                          >
                            <RiPencilLine />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {/* Ubicación */}
                  <div className="flex items-center justify-center md:justify-start">
                    {isEditingLocation ? (
                      <form onSubmit={handleLocationSubmit} className="flex items-center space-x-2">
                        <input
                          placeholder="Ubicación"
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="text-sm bg-transparent border-b border-transparent focus:border-secondary outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-white text-secondary px-2 py-1 hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out rounded-full text-xs shadow animate-slideInLeft delay-100"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingLocation(false)}
                          className="bg-white text-secondary px-2 py-1 hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out rounded-full text-xs shadow animate-slideInLeft delay-150"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="flex items-center justify-center md:justify-start opacity-0 animate-fade-in delay-400">
                          <CiLocationOn className="mr-1" />
                          {newLocation ? (<span className="text-sm">{newLocation}</span>) : (<span className="text-sm">Ubicación</span>)}
                        </p>
                        {computedCanEdit && (
                          <button
                            onClick={() => setIsEditingLocation(true)}
                            className="ml-2 text-white p-1 rounded-full text-l shadow opacity-0 animate-fade-in delay-200 hover:bg-white hover:text-secondary transition-all duration-200 ease-in-out"
                          >
                            <RiPencilLine />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
              {/* Botón de Reservar (solo si no se está editando) */}
              <AnimateOnScroll delay={500}>
                <div className="md:mt-0 ">
                  {!computedCanEdit && isTutor && (
                    <Link href={`/reserva/${profile.userId}`}>
                      <button className="mb-3 md:absolute md:mt-[20px] md:left-0 bg-white text-secondary focus:bg-secondary focus:text-white hover:bg-gray-200 group font-semibold px-4 py-2 rounded-full shadow hover:shadow-lg opacity-0 animate-fade-in delay-60 border-2 border-gray-300 transition-all duration-200 ease-in-out xs:ml-0 md:ml-[150px] md-lg:ml-[250px] lg:ml-[300px] ">
                        Reservar
                      </button>
                    </Link>
                  )}
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </AnimateOnScroll>
        {/* Sección de Descripción y Edición */}
        <div className="px-3">
          <AnimateOnScroll delay={700}>
            <div className="relative opacity-0 animate-fade-in mt-[80px]">
              <div className="flex items-center justify-center md:justify-start mt-2">
                {isEditingTitle ? (
                  <form onSubmit={handleTitleSubmit} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título"
                      className="text-sm bg-transparent border-b border-transparent focus:border-secondary outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-white hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out text-secondary px-2 py-1 rounded-full text-xs shadow animate-slideInLeft delay-100"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="bg-white text-secondary hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out px-2 py-1 rounded-full text-xs shadow animate-slideInLeft delay-150"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    {newTitle ? (<p className="text-xl font-bold text-secondary ml-[28px] md:ml-0 opacity-0 animate-fade-in delay-300">
                      {newTitle}
                    </p>) : (<p className="text-xl font-bold text-secondary ml-[28px] md:ml-0 opacity-0 animate-fade-in delay-300">
                      Título
                    </p>)}
                    <p className="text-xl font-bold text-secondary ml-[28px] md:ml-0 opacity-0 animate-fade-in delay-300">
                      {newTitle}
                    </p>
                    {computedCanEdit && (
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="ml-2 bg-white text-secondary p-1 rounded-full text-l hover:bg-secondary hover:text-white transition-all duration-200 ease-in-out shadow opacity-0 animate-fade-in delay-200"
                      >
                        <RiPencilLine />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2">
                {isEditingDescription ? (
                  <form onSubmit={handleDescriptionSubmit} className="flex w-full">
                    <input
                      type="text"
                      value={newDescription}
                      placeholder="Descripción"
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="text-sm bg-transparent min-w-30 w-full border-b border-transparent focus:border-secondary outline-none flex-1"
                    />
                    <div className="self-end mr-4">
                      <button
                        type="submit"
                        className="bg-white text-secondary hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out px-2 py-1 rounded-full text-xs shadow animate-slideInLeft delay-100"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingDescription(false)}
                        className="bg-white text-secondary px-2 py-1 hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out rounded-full text-xs shadow animate-slideInLeft delay-150"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>{newDescription ? (<p className="text-l ml-[28px] md:ml-0 text-center md:text-left text-black opacity-0 animate-fade-in delay-300">
                    {newDescription}
                  </p>) : (<p className="text-l ml-[28px] md:ml-0 text-center md:text-left text-black opacity-0 animate-fade-in delay-300">
                    Descripción
                  </p>)}

                    {computedCanEdit && (
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        className="ml-2 bg-white text-secondary p-1 rounded-full text-l hover:bg-secondary hover:text-white transition-all duration-200 ease-in-out shadow opacity-0 animate-fade-in delay-200"
                      >
                        <RiPencilLine />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </AnimateOnScroll>
          {/* Sección de Logros (solo para tutores) */}
          {isTutor && profile.achievements && profile.achievements.length > 0 && (
            <AnimateOnScroll delay={800}>
              <div className="opacity-0 animate-fade-in mt-6">
                <h2 className="text-xl font-bold text-secondary md:text-left text-center mb-2">
                  Logros
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          {/* Sección de Reseñas */}
          <AnimateOnScroll delay={1000}>
            <div className="opacity-0 animate-fade-in mt-6">
              <h2 className="text-xl font-bold text-secondary text-center md:text-left mb-2">
                Testimonios
              </h2>
              {reviewsLoading && <p>Cargando reseñas...</p>}
              {reviewsError && <p>Error al cargar reseñas: {reviewsError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                  <AnimateOnScroll key={index} delay={1100 + index * 150}>
                    <ReviewCard
                      reviewerName={review.reviewer?.fullName || "Anónimo"}
                      reviewText={review.notes}
                      stars={review.qualification}
                      profilePicture={review.reviewer?.profileImg || "/default-profile.png"}
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
