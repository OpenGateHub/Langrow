"use client";

import { useState } from "react";

interface TestTransitionButtonProps {
  classId: number;
  className?: string;
}

export const TestTransitionButton: React.FC<TestTransitionButtonProps> = ({ 
  classId, 
  className = "bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm" 
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const simulateTransition = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(`/api/mentoring/test-transition?classId=${classId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al simular transición');
      }

      setMessage('Clase actualizada para simulación. Ejecuta las transiciones automáticas.');
      
      // Ejecutar transiciones automáticas después de simular
      setTimeout(async () => {
        try {
          const transitionResponse = await fetch('/api/mentoring/auto-transition', {
            method: 'POST',
          });
          
          const transitionData = await transitionResponse.json();
          
          if (transitionResponse.ok) {
            setMessage(`Transición ejecutada: ${transitionData.processed} clases procesadas, ${transitionData.notificationsSent} notificaciones enviadas`);
          } else {
            setMessage('Error al ejecutar transiciones automáticas');
          }
        } catch (error) {
          setMessage('Error al ejecutar transiciones automáticas');
        }
      }, 1000);

    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={simulateTransition}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Simulando...' : 'Simular Transición'}
      </button>
      {message && (
        <p className="text-xs text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}; 