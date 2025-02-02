// HomeTemplate.tsx
import React from 'react';
import Image from 'next/image';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export interface HomeTemplateProps {
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaLink: string;
    ctaLines: string[];
    logoImage: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    personaImage: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  sectionTwo: {
    backgroundImage: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    title: string;
    ctaLink: string;
    ctaText: string;
    description: string;
    cards: Array<{
      image: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
      title: string;
      description: string;
    }>;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
}

const HomeTemplate: React.FC<HomeTemplateProps> = ({ hero, sectionTwo }) => {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-secondary min-h-[calc(100vh-4rem)] rounded-b-[120px] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-50">
          {/* Hero Content */}
          <div>
            {/* Hero Title */}
            <h1 className="font-poppins text-[40px] md:text-[64px] font-bold leading-[1.1] w-full md:w-[700px] opacity-0 animate-fade-in z-500">
              <span className="text-orange z-5">{hero.titleLine1}</span>
              <br />
              <span className="text-white">{hero.titleLine2}</span>
            </h1>
            {/* Subtitle */}
            <p className="font-poppins text-[18px] md:text-[24px] text-white mt-6 leading-tight w-full md:w-[700px] opacity-0 animate-fade-in delay-200">
              {hero.subtitle}
            </p>
            {/* CTA Button */}
            <a
              href={hero.ctaLink}
              className="inline-block mt-8 bg-orange hover:bg-orange/90 text-white font-poppins font-black px-6 md:px-8 py-3 md:py-4 rounded-[20px] opacity-0 animate-fade-in delay-400"
            >
              {hero.ctaLines.map((line, index) => (
                <span key={index} className="block text-base md:text-lg leading-tight">
                  {line}
                </span>
              ))}
            </a>
          </div>
        </div>
        {/* Centered logo at bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full md:w-[80%]">
          <Image
            src={hero.logoImage.src}
            alt={hero.logoImage.alt}
            width={hero.logoImage.width}
            height={hero.logoImage.height}
            className="w-full h-auto"
            priority
          />
        </div>
        {/* Persona image at bottom right */}
        <div className="absolute bottom-0 right-0 w-[90%] md:w-[70%] opacity-0 animate-slide-in z-0">
          <Image
            src={hero.personaImage.src}
            alt={hero.personaImage.alt}
            width={hero.personaImage.width}
            height={hero.personaImage.height}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Second Section */}
      <section className="min-h-screen relative overflow-hidden">
        <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-[94%] -z-10">
          <Image
            src={sectionTwo.backgroundImage.src}
            alt={sectionTwo.backgroundImage.alt}
            width={sectionTwo.backgroundImage.width}
            height={sectionTwo.backgroundImage.height}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <AnimateOnScroll>
            <h2 className="text-center font-poppins text-[24px] md:text-[32px] font-bold text-white">
              {sectionTwo.title}
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="flex justify-center mt-6 md:mt-8">
              <a
                href={sectionTwo.ctaLink}
                className="border border-white text-white font-poppins font-bold px-4 md:px-6 py-2 rounded-full bg-transparent hover:bg-white/10 transition-colors text-sm"
              >
                {sectionTwo.ctaText}
              </a>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={400}>
            <p className="text-center font-poppins text-white text-base md:text-lg mt-6 md:mt-8 mx-auto max-w-2xl">
              {sectionTwo.description}
            </p>
          </AnimateOnScroll>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            {sectionTwo.cards.map((card, index) => (
              <AnimateOnScroll key={index} delay={600 + index * 200}>
                <div className="rounded-[30px] bg-white/[0.05] p-6 flex flex-col items-center h-full">
                  <div className="w-24 md:w-32">
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      width={card.image.width}
                      height={card.image.height}
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="text-white font-poppins font-bold text-base mt-4">{card.title}</h3>
                  <p className="text-white/80 font-poppins text-sm mt-2 text-center">
                    {card.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Full Width Card with Stats */}
          <AnimateOnScroll delay={1200}>
            <div className="mt-12 md:mt-16 rounded-[30px] bg-white/[0.05] p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {sectionTwo.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <h4 className="text-white font-poppins font-bold text-2xl md:text-3xl">{stat.value}</h4>
                    <p className="text-white/80 font-poppins text-xs md:text-sm mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
};

export default HomeTemplate;
