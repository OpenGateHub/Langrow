import Image from "next/image";
import Head from "next/head";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Sobre Nosotros | Langrow</title>
        <meta
          name="description"
          content="En Langrow transformamos la forma en que las personas aprenden idiomas con clases personalizadas y flexibles. Aprende a tu ritmo y logra tus metas."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="relative min-h-screen">
        {/* Fondo */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bg-about-us.png" 
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-80"
          />
        </div>

        {/* Contenido */}
        <section className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white/90 backdrop-blur-md p-8 my-4 md:p-12 rounded-lg shadow-lg max-w-6xl">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              En nuestra plataforma, transformamos la forma en que las personas
              aprenden idiomas. Nos especializamos en ofrecer clases
              personalizadas y flexibles, diseñadas para adaptarse a las
              necesidades únicas de cada estudiante. Sabemos que tu tiempo es
              valioso, por eso nuestras clases online se ajustan a tu ritmo y
              objetivos, permitiéndote aprender desde la comodidad de tu hogar o
              donde quieras.
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-4">
              Nuestra misión es impulsar tu crecimiento profesional a través del
              desarrollo de habilidades lingüísticas que abren puertas a nuevas
              oportunidades. Aspiramos a ser un referente en la formación de
              idiomas, ayudándote a avanzar en tu carrera, conectar con el mundo
              y alcanzar tus metas personales.
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-4">
              Nos dirigimos a profesionales ocupados que valoran la calidad
              premium y buscan soluciones efectivas para aprender inglés y
              portugués. Nuestros clientes encuentran en nosotros una
              experiencia única, donde los profesores están 100% alineados con
              sus objetivos, ofreciendo un nivel de atención y personalización
              que marca la diferencia.
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-4">
              ¿Listo para dar el próximo paso en tu carrera? Con nosotros,
              dominar un nuevo idioma es más accesible, práctico y alineado a
              tus necesidades.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
