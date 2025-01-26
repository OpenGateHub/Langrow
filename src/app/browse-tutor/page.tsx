"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt } from "react-icons/fa";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { FaStar } from "react-icons/fa";


const mockTeachers = [
  {
    id: 1,
    name: "John Doe",
    description: "Especialista en inglés para negocios.",
    price: 20,
    reviews: 50,
    rating: 4.8,
    availability: "Alta",
    profileImage: "/logo-green-orange.png",
  },
  {
    id: 2,
    name: "Jane Smith",
    description: "Experta en preparación de exámenes IELTS y TOEFL.",
    price: 25,
    reviews: 120,
    rating: 5.0,
    availability: "Media",
    profileImage: "/logo-green-orange.png",
  },
  {
    id: 3,
    name: "Mike Johnson",
    description: "Clases personalizadas para principiantes.",
    price: 18,
    reviews: 30,
    rating: 4.5,
    availability: "Baja",
    profileImage: "/logo-green-orange.png",
  },
];

export default function TeachersList() {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [sortBy, setSortBy] = useState("availability");

  // Filter and sort logic
  useEffect(() => {
    let filteredTeachers = mockTeachers;

    if (searchTerm) {
      filteredTeachers = filteredTeachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "availability") {
      filteredTeachers.sort((a, b) => (a.availability > b.availability ? -1 : 1));
    } else if (sortBy === "reviews") {
      filteredTeachers.sort((a, b) => b.reviews - a.reviews);
    } else if (sortBy === "rating") {
      filteredTeachers.sort((a, b) => b.rating - a.rating);
    }

    filteredTeachers = filteredTeachers.filter(
      (teacher) => teacher.price >= priceRange[0] && teacher.price <= priceRange[1]
    );

    setTeachers(filteredTeachers);
  }, [searchTerm, sortBy, priceRange]);

  return (
    <main className="bg-white min-h-screen p-8">
      <AnimateOnScroll>
        <h1 className="text-4xl md:text-5xl text-secondary font-bold text-center mb-8 tracking-tight ">
          <span className="mb-3 ">
            Elige Tu Experto <br /> en
          </span>
          <span className="text-orange"> Inglés</span>
        </h1>
      </AnimateOnScroll>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col space-y-4">
          <AnimateOnScroll>
            <input
              type="text"
              placeholder="Busca por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border w-full border-gray-300 rounded-2xl shadow-sm focus:ring-secondary focus:border-secondary"
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={200} className="flex justify-center">
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="text-secondary font-semibold"
            >
              {filtersVisible ? "Ocultar Filtros" : "+ Filtros"}
            </button>
          </AnimateOnScroll>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${filtersVisible ? "max-h-screen" : "max-h-0"
              }`}
          >
            <AnimateOnScroll>
              <div className="bg-gray-100 p-4 rounded-2xl shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de precio: {priceRange[0]} - {priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-gray-300 rounded-2xl w-full"
                  >
                    <option value="availability">Disponibilidad</option>
                    <option value="reviews">Cantidad de reviews</option>
                    <option value="rating">Mejor calificación</option>
                  </select>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        {/* Teachers List */}
        <div className="space-y-4">
          {teachers.map((teacher, index) => (
            <AnimateOnScroll key={teacher.id} delay={index * 100}>
              <div className="flex items-center bg-white border border-gray-200 rounded-2xl py-4 pr-4 shadow-md hover:shadow-lg transition-shadow">
                <Link
                  href="/"
                  className="flex items-center space-x-4 flex-1 group transition-transform duration-200 rounded-lg p-2 relative"
                >
                  {/* Tooltip */}
                  <div className="absolute top-[-30px] left-1/2 transform bg-orange text-white text-xs rounded-lg px-3 ml-[-15px] py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Ver perfil
                  </div>
                  <Image
                    src={teacher.profileImage || "/placeholder.png"}
                    alt={teacher.name}
                    width={64}
                    height={64}
                    className="rounded-full border border-gray-300 group-hover:scale-110 transition-all duration-200"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-secondary group-hover:underline transition-all duration-200">
                      {teacher.name}
                    </h2>
                    <p className="text-sm text-gray-600">{teacher.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {teacher.rating} ★ ({teacher.reviews} reviews) - ${teacher.price}/hora
                    </p>
                  </div>
                </Link>


                <div className="relative group">
                  <button className="bg-secondary text-white p-3 rounded-full hover:bg-secondary-hover">
                    <FaCalendarAlt size={20} />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs rounded-lg px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-[140px]">
                    <div className="flex items-center space-x-3 whitespace-nowrap justify-center">
                      <span>Agendar Clase</span>
                    </div>
                    <div className="absolute bottom-[-6pFx] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </main>
  );
}
