// HomePage.tsx
import React from 'react';
import HomeTemplate, { HomeTemplateProps } from './components/homePage/HomePage';

export default function HomePage() {
  const props: HomeTemplateProps = {
    hero: {
      titleLine1: 'Tus objetivos son',
      titleLine2: 'nuestra prioridad',
      subtitle:
        'Alcanza tus metas profesionales con nuestras clases online 100% personalizadas.',
      ctaLink: '/booking',
      ctaLines: ['RESERVA TU', 'CLASE AHORA'],
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
      ctaText: 'RESERVAR',
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

  return <HomeTemplate {...props} />;
}
