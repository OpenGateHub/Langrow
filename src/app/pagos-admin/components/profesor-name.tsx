import { useEffect, useState } from "react";

export const RenderProfesorName = ({ profesorId, onReady }: { profesorId: number, onReady: (profile: any) => void }) => {
    const [profesorName, setProfesorName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getProfesorInfo = async (id: number) => {
        setIsLoading(true);
        // Lógica para obtener la información del profesor
        const response = await fetch(`/api/profesores/${id}`);
        const data = await response.json();
        setProfesorName(data.data.name);
        setIsLoading(false);
        onReady(data.data);
    };

    useEffect(() => {
        if(profesorId){
            getProfesorInfo(profesorId)
        }
    }, [profesorId]);

    return (
        <span>{isLoading ? 'Cargando...' : profesorName}</span>
    )
}