import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-1">
              <div className="w-5 h-5 relative flex items-start translate-y-[1px]">
                <Image
                  src="/logo-primary.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="translate-y-[3px]">
                <Image
                  src="/logo-text-primary.png"
                  alt="Logo Text"
                  width={140}
                  height={28}
                  className="h-7 w-auto"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-8">
          <Link href="/contact-us">
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
                Contacto
              </button>
            </Link>
            <Link href="/about-us">
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
                Sobre Nosotros
              </button>
            </Link>
          </div>

          {/* Sign Up Button */}
          <div>
            <button className="bg-primary hover:bg-primary-hover transition duration-200 text-white px-6 py-2 rounded-full text-sm font-semibold font-archivo">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header