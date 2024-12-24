import Header from "./components/Header";
import Image from 'next/image'
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

export default function Home() {
  return (
    <main>
      <Header />
      {/* Hero Section */}
      <section className="bg-secondary min-h-[calc(100vh-4rem)] rounded-b-[120px] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Hero Content */}
          <div>
            {/* Hero Title */}
            <h1 className="font-poppins text-[40px] md:text-[64px] font-bold leading-[1.1] w-full md:w-[700px] opacity-0 animate-fade-in">
              <span className="text-orange">Tus objetivos son</span><br />
              <span className="text-white">nuestra prioridad</span>
            </h1>
            {/* Subtitle */}
            <p className="font-poppins text-[18px] md:text-[24px] text-primary mt-6 leading-tight w-full md:w-[700px] opacity-0 animate-fade-in delay-200">
              Alcanza tus metas profesionales con nuestras clases online 100% personalizadas.
            </p>
            {/* CTA Button */}
            <button className="mt-8 bg-orange hover:bg-orange/90 text-white font-poppins font-black px-6 md:px-8 py-3 md:py-4 rounded-[20px] opacity-0 animate-fade-in delay-400">
              <span className="block text-base md:text-lg leading-tight">RESERVA TU</span>
              <span className="block text-base md:text-lg leading-tight">CLASE AHORA</span>
            </button>
          </div>
        </div>
        {/* Centered logo at bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full md:w-[80%]">
          <Image
            src="/logo-cut.png"
            alt="Logo Cut"
            width={1200}
            height={480}
            className="w-full h-auto"
            priority
          />
        </div>
        {/* Persona image at bottom right */}
        <div className="absolute bottom-0 right-0 w-[90%] md:w-[70%] opacity-0 animate-slide-in">
          <Image
            src="/persona.png"
            alt="Persona"
            width={1200}
            height={480}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Second Section */}
      <section className="min-h-screen relative overflow-hidden">
        <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-[94%] -z-10">
          <Image
            src="/fondo-cut.png"
            alt="Fondo Cut"
            width={1200}
            height={480}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <AnimateOnScroll>
            <h2 className="text-center font-poppins text-[24px] md:text-[32px] font-bold text-white">
              Clases flexibles pensadas a tu medida
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="flex justify-center mt-6 md:mt-8">
              <button className="border border-white text-white font-poppins font-bold px-4 md:px-6 py-2 rounded-full bg-transparent hover:bg-white/10 transition-colors text-sm">
                RESERVAR
              </button>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={400}>
            <p className="text-center font-poppins text-white text-base md:text-lg mt-6 md:mt-8 mx-auto max-w-2xl">
              Aprende, practica y perfecciona tu inglés, con el apoyo de profesores especializados
            </p>
          </AnimateOnScroll>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            {/* Art Card */}
            <AnimateOnScroll delay={600}>
              <div className="rounded-[30px] bg-white/[0.05] p-6 flex flex-col items-center h-full">
                <div className="w-24 md:w-32">
                  <Image
                    src="/Art.png"
                    alt="Art"
                    width={200}
                    height={200}
                    className="w-full h-auto"
                  />
                </div>
                <h3 className="text-white font-poppins font-bold text-base mt-4">Conecta y crece</h3>
                <p className="text-white/80 font-poppins text-sm mt-2 text-center">
                  Encuentra a los profesores que se alinean con tus necesidades y reserva clases con facilidad.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Content Creator Card */}
            <AnimateOnScroll delay={800}>
              <div className="rounded-[30px] bg-white/[0.05] p-6 flex flex-col items-center h-full">
                <div className="w-24 md:w-32">
                  <Image
                    src="/Content Creator.png"
                    alt="Content Creator"
                    width={200}
                    height={200}
                    className="w-full h-auto"
                  />
                </div>
                <h3 className="text-white font-poppins font-bold text-base mt-4">Mejora cada día</h3>
                <p className="text-white/80 font-poppins text-sm mt-2 text-center">
                  Reserva tus clases y avanza en tu camino hacia la fluidez en inglés
                </p>
              </div>
            </AnimateOnScroll>

            {/* School Lesson Card */}
            <AnimateOnScroll delay={1000}>
              <div className="rounded-[30px] bg-white/[0.05] p-6 flex flex-col items-center h-full">
                <div className="w-24 md:w-32">
                  <Image
                    src="/School Lesson.png"
                    alt="School Lesson"
                    width={200}
                    height={200}
                    className="w-full h-auto"
                  />
                </div>
                <h3 className="text-white font-poppins font-bold text-base mt-4">Clases personalizadas</h3>
                <p className="text-white/80 font-poppins text-sm mt-2 text-center">
                  Mejora tu pronunciación, fortalece la conversación o prepárate para exámenes, con clases a medida.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Full Width Card */}
          <AnimateOnScroll delay={1200}>
            <div className="mt-12 md:mt-16 rounded-[30px] bg-white/[0.05] p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {/* Students */}
                <div className="text-center">
                  <h4 className="text-white font-poppins font-bold text-2xl md:text-3xl">53M</h4>
                  <p className="text-white/80 font-poppins text-xs md:text-sm mt-2">
                    Students
                  </p>
                </div>

                {/* Languages */}
                <div className="text-center">
                  <h4 className="text-white font-poppins font-bold text-2xl md:text-3xl">75+</h4>
                  <p className="text-white/80 font-poppins text-xs md:text-sm mt-2">
                    Language
                  </p>
                </div>

                {/* Enrollments */}
                <div className="text-center">
                  <h4 className="text-white font-poppins font-bold text-2xl md:text-3xl">773M</h4>
                  <p className="text-white/80 font-poppins text-xs md:text-sm mt-2">
                    Enrollments
                  </p>
                </div>

                {/* Countries */}
                <div className="text-center">
                  <h4 className="text-white font-poppins font-bold text-2xl md:text-3xl">180+</h4>
                  <p className="text-white/80 font-poppins text-xs md:text-sm mt-2">
                    Countries
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}

