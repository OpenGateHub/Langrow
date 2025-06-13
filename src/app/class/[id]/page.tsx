"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClassDetails {
  id: number;
  title: string;
  status: string;
  beginsAt: string;
  endsAt: string;
  classRoomUrl: string;
  studentName: string;
  professorName: string;
  duration: number;
  confirmed: boolean;
}

const ClassDetailsPage = () => {
  const params = useParams();
  const classId = params.id as string;
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/class?id=${classId}`);
        
        if (!response.ok) {
          throw new Error('No se pudo obtener la información de la clase');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Error al cargar los detalles de la clase');
        }
        
        setClassDetails(data.data);
      } catch (err: any) {
        console.error('Error al cargar la clase:', err);
        setError(err.message || 'Ocurrió un error al cargar los detalles de la clase');
      } finally {
        setLoading(false);
      }
    };
    
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: es });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error || 'No se encontró la clase solicitada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-secondary text-white py-6 px-6">
          <h1 className="text-2xl font-bold">{classDetails.title}</h1>
          <div className="flex items-center mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(classDetails.status)}`}>
              {getStatusText(classDetails.status)}
            </span>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="p-6">
          {/* Detalles de la clase */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Detalles de la clase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{formatDate(classDetails.beginsAt)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Horario</p>
                <p className="font-medium">{formatTime(classDetails.beginsAt)} - {formatTime(classDetails.endsAt)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Profesor</p>
                <p className="font-medium">{classDetails.professorName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Estudiante</p>
                <p className="font-medium">{classDetails.studentName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Duración</p>
                <p className="font-medium">{classDetails.duration} minutos</p>
              </div>
            </div>
          </div>
          
          {/* Enlace de la reunión */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Enlace de la clase</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                Tu clase está confirmada. Utiliza el siguiente enlace para unirte a la reunión.
              </p>
              
              <div className="bg-white border border-green-300 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Image 
                      src="/google-meet-icon.png" 
                      alt="Google Meet" 
                      width={24} 
                      height={24} 
                    />
                  </div>
                  <span className="font-medium">Google Meet</span>
                </div>
                
                <a 
                  href={classDetails.classRoomUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Unirse ahora
                </a>
              </div>
              
              <p className="text-sm text-green-700 mt-3">
                Recuerda que puedes acceder a este enlace en cualquier momento desde esta página o desde tus notificaciones.
              </p>
            </div>
          </div>
          
          {/* Instrucciones */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Conéctate 5 minutos antes para asegurarte de que tu audio y video funcionan correctamente.</li>
                <li>Ten a mano cualquier material que necesites para la clase.</li>
                <li>Si tienes problemas para conectarte, contacta a soporte.</li>
                <li>Al finalizar la clase, no olvides completar la evaluación del profesor.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPage; 