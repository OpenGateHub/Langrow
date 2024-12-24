import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold font-archivo text-primary">
              Logo
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-8">
            <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
              Contacto
            </button>
            <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium font-archivo">
              Sobre Nosotros
            </button>
        
          </div>

          {/* Sign Up Button */}
          <div>
            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full text-sm font-semibold font-archivo">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header