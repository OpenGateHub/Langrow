import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({ message = "Cargando...", showLogo = true }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      {showLogo && (
        <div className="mb-8 animate-bounce">
          <Image
            src="/logo-primary.png"
            alt="Langrow Logo"
            width={60}
            height={60}
            className="opacity-80"
          />
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-secondary border-opacity-20 rounded-full"></div>
        </div>
        
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
} 