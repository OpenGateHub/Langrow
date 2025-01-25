import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative w-full bg-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h4 className="text-white font-poppins font-semibold mb-4">Para Estudiantes</h4>
            <ul className="text-white text-sm space-y-2">
              <li>
                <Link href="/how-it-works" className="hover:underline">
                  ¿Cómo Funciona?
                </Link>
              </li>
              <li>
                <Link href="/browse-tutor" className="hover:underline">
                  Encontrá un Profesor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-poppins font-semibold mb-4">Soporte</h4>
            <ul className="text-white text-sm space-y-2">
              <li>
                <Link href="/help-center" className="hover:underline">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:underline">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:underline">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-poppins font-semibold mb-4">Langrow</h4>
            <ul className="text-white text-sm space-y-2">
              <li>
                <Link href="/about-us" className="hover:underline">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:underline">
                  Contactanos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-poppins font-semibold mb-4">Redes Sociales</h4>
            <div className="flex space-x-3">
              <Link
                href="https://facebook.com"
                className="bg-white/[0.1] p-2 rounded-full text-white text-lg hover:bg-white/[0.2] transition-all duration-300 ease-in-out"
              >
                <FaFacebook />
              </Link>
              <Link
                href="https://twitter.com"
                className="bg-white/[0.1] p-2 rounded-full text-white text-lg hover:bg-white/[0.2] transition-all duration-300 ease-in-out"
              >
                <FaTwitter />
              </Link>
              <Link
                href="https://linkedin.com"
                className="bg-white/[0.1] p-2 rounded-full text-white text-lg hover:bg-white/[0.2] transition-all duration-300 ease-in-out"
              >
                <FaLinkedin />
              </Link>
              <Link
                href="https://instagram.com"
                className="bg-white/[0.1] p-2 rounded-full text-white text-lg hover:bg-white/[0.2] transition-all duration-300 ease-in-out"
              >
                <FaInstagram />
              </Link>
            </div>


          </div>
        </div>

        <div className="w-full flex justify-center mb-6">
          <Image
            src="/logo-white.png"
            alt="Footer"
            width={600}
            height={200}
            className='mt-10'
            priority
          />
        </div>

        <div className="rounded-[30px] bg-white/[0.05] px-8 py-6 backdrop-blur-sm">
          <p className="text-white font-poppins text-sm text-center">
            Copyright ©2024 Langrow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
