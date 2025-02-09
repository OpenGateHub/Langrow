"use client";
import React from 'react';
import HomeTemplate, { HomeTemplateProps } from './../components/homePage/HomePage';
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { user } = useUser();
  const role = user?.unsafeMetadata?.role || "guest";

  const tutorProps: HomeTemplateProps = {
    hero: {
      titleLine1: 'Recompensamos',
      titleLine2: 'tu pasión por enseñar',
      subtitle:
        'Ofrece clses personalizadas, gana recompensas y crece profesionalmente con Langrow.',
      ctaLink: '/booking',
      ctaLines: ['MIS CLASES'],
      logoImage: {
        src: '/logo-cut.png',
        alt: 'Logo Cut',
        width: 1200,
        height: 480,
      },
      personaImage: {
        src: '/persona-tutor.png',
        alt: 'Persona',
        width: 1200,
        height: 480,
      },
    },
    sectionTwo: {
      backgroundImage: {
        src: '/fondo-cut.png',
        alt: 'Fondo Cut',
        width: 1200,
        height: 480,
      },
      title: 'Enseña con flexibilidad y a tu propio ritmo',
      ctaLink: '/calendario',
      ctaText: 'MIS CLASES',
      description:
        'Comparte tus conocimientos y ayuda a estudiantes de todo el mundo a alcanzar sus metas',
      cards: [
        {
          image: {
            src: '/premio-trofeo.png',
            alt: 'Art',
            width: 200,
            height: 200,
          },
          title: 'Logros y Recompensas',
          description:
            'Alcanza metas y desbloquea beneficios exclusivos mientras enseñas y creces como tutor.',
        },
        {
          image: {
            src: '/estrellas.png',
            alt: 'Content Creator',
            width: 200,
            height: 200,
          },
          title: 'Plan de Beneficios',
          description:
            'Descubre cómo tus clases y esfuerzos se transforman en recompensas: desde comisiones hasta bonos especiales.',
        },
        {
          image: {
            src: '/numero1.png',
            alt: 'School Lesson',
            width: 200,
            height: 200,
          },
          title: 'Impacta como Tutor',
          description:
            'Inspira a estudiantes de todo el mundo y se parte de una comunidad educativa global.',
        },
      ],
      stats: [
        { value: '53M', label: 'Students' },
        { value: '75+', label: 'Language' },
        { value: '773M', label: 'Enrollments' },
        { value: '180+', label: 'Countries' },
      ],
    },
  };

  const studentProps: HomeTemplateProps = {
    hero: {
      titleLine1: 'Tus objetivos son',
      titleLine2: 'nuestra prioridad',
      subtitle:
        'Alcanza tus metas profesionales con nuestras clases online 100% personalizadas.',
      ctaLink: '/booking',
      ctaLines: ['MIS CLASES'],
      logoImage: {
        src: '/logo-cut.png',
        alt: 'Logo Cut',
        width: 1200,
        height: 480,
      },
      personaImage: {
        src: '/persona.png',
        alt: 'Persona',
        width: 1200,
        height: 480,
      },
    },
    sectionTwo: {
      backgroundImage: {
        src: '/fondo-cut.png',
        alt: 'Fondo Cut',
        width: 1200,
        height: 480,
      },
      title: 'Clases flexibles pensadas a tu medida',
      ctaLink: '/booking',
      ctaText: 'MIS CLASES',
      description:
        'Aprende, practica y perfecciona tu inglés, con el apoyo de profesores especializados',
      cards: [
        {
          image: {
            src: '/Art.png',
            alt: 'Art',
            width: 200,
            height: 200,
          },
          title: 'Conecta y crece',
          description:
            'Encuentra a los profesores que se alinean con tus necesidades y reserva clases con facilidad.',
        },
        {
          image: {
            src: '/home-content-creator.png',
            alt: 'Content Creator',
            width: 200,
            height: 200,
          },
          title: 'Mejora cada día',
          description:
            'Reserva tus clases y avanza en tu camino hacia la fluidez en inglés',
        },
        {
          image: {
            src: '/School Lesson.png',
            alt: 'School Lesson',
            width: 200,
            height: 200,
          },
          title: 'Clases personalizadas',
          description:
            'Mejora tu pronunciación, fortalece la conversación o prepárate para exámenes, con clases a medida.',
        },
      ],
      stats: [
        { value: '53M', label: 'Students' },
        { value: '75+', label: 'Language' },
        { value: '773M', label: 'Enrollments' },
        { value: '180+', label: 'Countries' },
      ],
    },
  };

  return <HomeTemplate {...(role === "org:profesor" ? tutorProps : studentProps)} />;
}
