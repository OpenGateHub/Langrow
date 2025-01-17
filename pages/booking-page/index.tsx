import Image from 'next/image';

const BookingPage = () => {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo-cut.png')" }} // Imagen de fondo desde public
    >
      <div className="bg-white/70 backdrop-blur-lg p-8 md:p-12 rounded-lg shadow-xl max-w-5xl flex flex-col md:flex-row items-center gap-8">
        {/* Sección izquierda: Imagen */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative p-4 rounded-lg border border-black">
            <div className="absolute top-0 left-0 right-0 bottom-0 m-1 rounded-lg border border-black"></div>
            <Image
              src="/content-creator.png" // Imagen principal desde public
              alt="Content Creator"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Sección derecha: Texto */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          {/* Pseudo-botón de texto */}
          <div className="inline-block px-4 py-1 text-gray-700 border border-gray-400 rounded-full mb-4 text-sm">
            2. RESERVAR TURNO
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">Reserva tu clase</h1>

          {/* Descripción */}
          <p className="text-gray-700 text-lg mb-6">
            Elige el horario que más se ajuste a tu rutina y reserva tu clase en un instante.
            Nuestro sistema te permite asegurar tu turno de forma rápida y sencilla para que puedas
            centrarte en lo importante: aprender.
          </p>

          {/* Botón */}
          <button
            className="flex items-center justify-center gap-2 bg-white border border-black shadow-lg shadow-gray-300/50 px-6 py-3 rounded-full text-lg font-medium text-black hover:shadow-md hover:shadow-gray-400 transition"
          >
            Reserva <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
