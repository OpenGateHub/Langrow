import Image from 'next/image';
import Link from "next/link";


const BookingPage = () => {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
    >
      <img
        src="/booking-bg.jpeg"
        alt="Background"
        className="absolute h-full w-full object-fill z-0"
        />
       <div className=" backdrop-blur-lg p-8 md:p-12 rounded-lg shadow-xl max-w-5xl flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative p-4 rounded-3xl border border-black">
            <div className="absolute top-0 left-0 right-0 bottom-0 m-1 "></div>
            <Image
              src="/content-creator.png"
              alt="Content Creator"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left">
          <div className="inline-block px-6 py-3 text-black-700 border border-black rounded-full mb-4 text-m">
            2. RESERVAR TURNO
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">Reserva tu clase</h1>

          <p className="text-gray-700 text-lg mb-6">
            Elige el horario que más se ajuste a tu rutina y reserva tu clase en un instante.
            Nuestro sistema te permite asegurar tu turno de forma rápida y sencilla para que puedas
            centrarte en lo importante: aprender.
          </p>
          <Link href="/booking/calendar">
            <button
              className="flex items-center justify-center gap-2 bg-white border border-black shadow-lg shadow-gray-500/50 px-6 py-3 rounded-full text-lg font-medium text-black hover:shadow-md hover:shadow-gray-800 transition-shadow duration-300"
            >
              Reserva <span className="text-xl">→</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
