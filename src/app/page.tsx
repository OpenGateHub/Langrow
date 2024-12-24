import Header from "./components/Header";
import Image from 'next/image'

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
            <h1 className="font-poppins text-[64px] font-bold leading-[1.1] w-[700px]">
              <span className="text-orange">Tus objetivos son</span><br />
              <span className="text-white">nuestra prioridad</span>
            </h1>
            {/* Subtitle */}
            <p className="font-poppins text-[24px] text-primary mt-6 leading-tight w-[700px]">
              Alcanza tus metas profesionales con nuestras clases online 100% personalizadas.
            </p>
            {/* CTA Button */}
            <button className="mt-8 bg-orange hover:bg-orange/90 text-white font-poppins font-black px-8 py-4 rounded-[20px]">
              <span className="block text-lg leading-tight">RESERVA TU</span>
              <span className="block text-lg leading-tight">CLASE AHORA</span>
            </button>
          </div>
        </div>
        {/* Centered logo at bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80%]">
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
        <div className="absolute bottom-0 right-0 w-[70%]">
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
    </main>
  );
}

