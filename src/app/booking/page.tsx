"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import dynamic from "next/dynamic";

// Dynamically import the CalendarEmbed component to avoid SSR issues
const CalendarEmbed = dynamic(
  () => import("@/components/CalendarEmbed"),
  { ssr: false }
);

export default function BookingPage() {
  return (
    <main>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Reserva tu clase</h1>
        <div className="max-w-3xl mx-auto">
          <CalendarEmbed 
            calLink="esteban-bisocoli-contrera-cgw2ug"
            config={{
              theme: "light",
              hideEventTypeDetails: "false",
              layout: "month_view"
            }}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
} 