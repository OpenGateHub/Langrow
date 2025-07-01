"use client";
import React, { useEffect, useState } from "react";
import HomeTemplate, { HomeTemplateProps } from "../components/homePage/HomePage";
import { useProfileContext } from "@/context/ProfileContext";
import { useOauthToken } from "@/hooks/useOauthToken";
import MessageModal from "../components/Modal";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

export default function HomePage() {
  const { role, profile, loading, error } = useProfileContext();
  const { stateToken, fetchOauthToken, loading: tokenLoading } = useOauthToken();
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);

  const userRole = role || "guest";

  // Si perfil requiere videollamada y no tiene integración, pedimos el token
  useEffect(() => {
    if (profile && !profile.isZoomEnabled) {
      if (profile.userId) {
        console.log("Perfil encontrado, userId:", profile.userId);
        fetchOauthToken(profile.userId); // Guardamos el userId en el hook
      }
      // TODO:: Si falla la busqueda del perfil, manejar el error adecuadamente, mostrar un mensaje al usuario o redirigir a una página de error.
    }
  }, [profile, fetchOauthToken]);

  // Mostrar modal cuando el token esté disponible en lugar de redirigir directamente
  useEffect(() => {
    if (stateToken && !tokenLoading) {
      setShowGoogleAuthModal(true);
    }
  }, [stateToken, tokenLoading]);

  // Función para manejar la confirmación del modal y redirigir a Google
  const handleGoogleAuthConfirm = () => {
    setShowGoogleAuthModal(false);
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
      access_type: "offline",
      prompt: "consent",
      state: stateToken || "",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  if (loading || tokenLoading) return <p>Cargando perfil...</p>;
  if (error) return <p>Error: {error}</p>;

  // Si aún no hay redirección pero tampoco debe redirigir
  if (profile && !profile.isZoomEnabled && !stateToken) {
    return <p>Preparando redirección a Google...</p>;
  }

  const commonProps = {
    logoImage: { src: "/logo-cut.png", alt: "Logo Cut", width: 1200, height: 480 },
    backgroundImage: { src: "/fondo-cut.png", alt: "Fondo Cut", width: 1200, height: 480 },
  };

  const tutorProps: HomeTemplateProps = {
    hero: {
      logoImage: commonProps.logoImage,
      titleLine1: "Recompensamos",
      titleLine2: "tu pasión por enseñar",
      subtitle: "Ofrece clases personalizadas, gana recompensas y crece profesionalmente con Langrow.",
      ctaLink: "/booking",
      ctaLines: ["MIS CLASES"],
      personaImage: { src: "/persona-tutor.png", alt: "Persona", width: 1200, height: 480 },
    },
    sectionTwo: {
      ...commonProps,
      title: "Enseña con flexibilidad y a tu propio ritmo",
      ctaLink: "/calendario",
      ctaText: "MIS CLASES",
      description: "Comparte tus conocimientos y ayuda a estudiantes de todo el mundo a alcanzar sus metas",
      cards: [
        {
          image: { src: "/premio-trofeo.png", alt: "Art", width: 200, height: 200 },
          title: "Logros y Recompensas",
          description: "Alcanza metas y desbloquea beneficios exclusivos mientras enseñas y creces como tutor.",
        },
        {
          image: { src: "/estrellas.png", alt: "Content Creator", width: 200, height: 200 },
          title: "Plan de Beneficios",
          description: "Descubre cómo tus clases y esfuerzos se transforman en recompensas: desde comisiones hasta bonos especiales.",
        },
        {
          image: { src: "/numero1.png", alt: "School Lesson", width: 200, height: 200 },
          title: "Impacta como Tutor",
          description: "Inspira a estudiantes de todo el mundo y se parte de una comunidad educativa global.",
        },
      ],
      stats: [
        { value: "53M", label: "Students" },
        { value: "75+", label: "Language" },
        { value: "773M", label: "Enrollments" },
        { value: "180+", label: "Countries" },
      ],
    },
  };

  const studentProps: HomeTemplateProps = {
    hero: {
      logoImage: commonProps.logoImage,
      titleLine1: "Tus objetivos son",
      titleLine2: "nuestra prioridad",
      subtitle: "Alcanza tus metas profesionales con nuestras clases online 100% personalizadas.",
      ctaLink: "/booking",
      ctaLines: ["MIS CLASES"],
      personaImage: { src: "/persona.png", alt: "Persona", width: 1200, height: 480 },
    },
    sectionTwo: {
      ...commonProps,
      title: "Clases flexibles pensadas a tu medida",
      ctaLink: "/booking",
      ctaText: "MIS CLASES",
      description: "Aprende, practica y perfecciona tu inglés, con el apoyo de profesores especializados",
      cards: [
        {
          image: { src: "/Art.png", alt: "Art", width: 200, height: 200 },
          title: "Conecta y crece",
          description: "Encuentra a los profesores que se alinean con tus necesidades y reserva clases con facilidad.",
        },
        {
          image: { src: "/home-content-creator.png", alt: "Content Creator", width: 200, height: 200 },
          title: "Mejora cada día",
          description: "Reserva tus clases y avanza en tu camino hacia la fluidez en inglés",
        },
        {
          image: { src: "/School Lesson.png", alt: "School Lesson", width: 200, height: 200 },
          title: "Clases personalizadas",
          description: "Mejora tu pronunciación, fortalece la conversación o prepárate para exámenes, con clases a medida.",
        },
      ],
      stats: [
        { value: "53M", label: "Students" },
        { value: "75+", label: "Language" },
        { value: "773M", label: "Enrollments" },
        { value: "180+", label: "Countries" },
      ],
    },
  };

  return (
    <>
      <HomeTemplate {...(userRole === "org:profesor" ? tutorProps : studentProps)} />
      
      <MessageModal
        isOpen={showGoogleAuthModal}
        onClose={handleGoogleAuthConfirm}
        type="success"
        message="Para que funcione la app necesitamos acceder a tu cuenta de Google para crear las reuniones de Google Meet. ¿Quieres continuar?"
      />
    </>
  );
}
