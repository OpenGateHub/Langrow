const mockTutors = [
  {
    id: 1,
    name: "John Doe",
    longDescription:
      "Especialista en inglés para negocios. Ayuda a profesionales a mejorar su inglés en contextos laborales y empresariales.",
    shortDescription: "Especialista en inglés para negocios.",
    location: "New York, USA",
    price: 20,
    reviewsSum: 95, // Suma total de reviews
    reviews: [
      {
        name: "Mariana López",
        profilePicture: "/reviewers/reviewer1.png",
        rating: 5,
        review: "John es un excelente tutor. Sus clases son dinámicas y muy útiles.",
      },
      {
        name: "Carlos Pérez",
        profilePicture: "/reviewers/reviewer2.png",
        rating: 4,
        review:
          "Aprendí mucho con John, aunque me gustaría más flexibilidad en horarios.",
      },
    ],
    rating: 4.8,
    availability: "2025-01-29", // Fecha de la próxima clase disponible
    profileImage: "/profile-pictures/john-doe.png",
    achievements: [
      {
        icon: "/icons/master-teacher.svg",
        title: "Master Teacher",
        description: "+100 clases en este mes",
      },
      {
        icon: "/icons/first-class.svg",
        title: "Primeras Clases",
        description: "5 Clases Completadas",
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    profileImage: "/logo-green-orange.png",
    longDescription:
      "Experta en preparación de exámenes IELTS y TOEFL, con estrategias personalizadas para aprobar con confianza.",
    shortDescription: "Experta en preparación de exámenes IELTS y TOEFL.",
    location: "London, UK",
    price: 25,
    reviewsSum: 120,
    reviews: [
      {
        name: "Laura Martínez",
        profilePicture: "/logo-green-orange.png",
        rating: 5,
        review: "Con Jane logré un puntaje de 8.0 en el IELTS. ¡Excelente!",
      },
      {
        name: "Pedro Sánchez",
        profilePicture: "/logo-green-orange.png",
        rating: 5,
        review: "Sus métodos me dieron confianza durante mi preparación.",
      },
    ],
    rating: 5.0,
    availability: "2025-01-28",
    achievements: [
      {
        icon: "/icons/satisfied-students.svg",
        title: "Estudiantes Satisfechos",
        description: "Promedio de 4.7 estrellas",
      },
      {
        icon: "/icons/consecutive-days.svg",
        title: "Consecutivas",
        description: "30 días de clases diarias",
      },
    ],
  },
];

export default mockTutors;
