import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative w-full">
      <div className="w-full">
        <Image
          src="/footer-image.png"
          alt="Footer"
          width={1920}
          height={400}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-[30px] bg-white/[0.05] px-8 py-6 backdrop-blur-sm w-full">
          <p className="text-white font-poppins text-sm text-left">
            Copyright ©2024 Langrow
          </p>
        </div>
      </div>
    </footer>
  )
} 