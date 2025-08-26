"use client";
import { useParams, useRouter } from "next/navigation";
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
    const router = useRouter();
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
            <button
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition"
                onClick={() => router.back()}
                type="button"
            >
                ← Volver
            </button>
            {isLoading && (
                <div className="space-y-4 max-w-6xl mx-auto">
                    <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-40 w-full bg-gray-200 rounded-xl animate-pulse mb-4"></div>
                    <div className="h-96 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
            )}
            { profesor &&    <>
                <ProfesorInfo {...profesor} />
                <PaymentsSection profesorId={profesor.id.toString()}/>
            </>}
        </div>
    );
};

export default ProfesorDetailPage;
