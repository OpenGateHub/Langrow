"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PagosAdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [profesors, setProfesors] = useState<{
        count: number;
        data: {
            id: number;
            name: string;
            location: string;
            userId: string
        }[];
    }>({
        count: 0,
        data: [],
    });
    const [filter, setFilter] = useState("");

    const getProfiles = () => {
        setIsLoading(true);
        fetch(`/api/profile?filter=${filter}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Profile data:", data);
                setProfesors(data || []);
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        getProfiles();
    };
    useEffect(() => {
        getProfiles();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            
        <div className="bg-white min-h-screen max-w-7xl mx-auto p-8 mt-8 ">
            <form
                className="flex flex-col sm:flex-row items-center justify-between mb-4"
                onSubmit={handleSearch}
            >
                <input
                    type="text"
                    placeholder="Buscar por nombre de profesor..."
                    className="w-full sm:w-1/2 border p-2 rounded mb-2 sm:mb-0"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Buscar
                </button>
            </form>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                         <th
                            className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                        </th>
                          <th
                            className="cursor-pointer px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <div>{isLoading ? <div>Cargando...</div> : null}</div>
                    {profesors?.data?.map((profesor) => (
                        <tr key={profesor.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 overflow-hidden text-ellipsi">{profesor.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 overflow-hidden text-ellipsi">{profesor.location}</td>
                            <td className="px-6 py-4 flex justify-center whitespace-nowrap text-sm text-gray-800 overflow-hidden text-ellipsi">
                                <Link href={`/admin/profesores/${profesor.userId}`}>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                        Ver más
                                    </button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
}
