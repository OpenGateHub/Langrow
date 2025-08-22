"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentsSection } from "./components/payments";
import { ProfesorInfo } from "./components/profesor-info";

export type ProfesorProfile = {
    id: number;
    name: string;
    location: string;
    description: string;
    isActive: boolean;
    isZoomEnabled: boolean;
    price: number;
    profileImg: string;
    rating: string;
    reviews: number;
    role: number;
};

export const ProfesorDetailPage = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [profesor, setProfesor] = useState<ProfesorProfile>();

    const getProfiles = () => {
        setIsLoading(true);
        fetch(`/api/profile/${params.id}`)
            .then((response) => response.json())
            .then((data) => {
                setProfesor(data.data[0] || {});
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        getProfiles();
    }, []);


    return (
        <div className="min-h-screen bg-gray-100 p-8 space-y-4">
            {isLoading && <p>Cargando...</p>}
            { profesor &&    <>
                <ProfesorInfo {...profesor} />
                <PaymentsSection/>
            </>}
        </div>
    );
};

export default ProfesorDetailPage;
