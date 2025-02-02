import React from 'react';
import HomeTemplate, { HomeTemplateProps } from './../components/homePage/HomePage';

export default function HomePage() {
  const props: HomeTemplateProps = {
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

  return <HomeTemplate {...props} />;
}
