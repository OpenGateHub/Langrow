"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface PaymentPreference {
  id: string;
  init_point: string;
}

function PaymentPageComponent() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId") || "";
  const eventTypeId = searchParams?.get("eventTypeId") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!bookingId || !eventTypeId) {
      setError("Missing booking information");
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [bookingId, eventTypeId]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: "English Class",
              quantity: 1,
              unit_price: 29.99,
              bookingId,
              eventTypeId
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment preference");
      }

      const preference: PaymentPreference = await response.json();
      
      // Redirect to MercadoPago checkout
      window.location.href = preference.init_point;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Complete Your Payment</h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
              <p className="text-gray-600">Booking ID: {bookingId}</p>
              <p className="text-gray-600">Event Type ID: {eventTypeId}</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">English Class</span>
                  <span className="text-gray-900 font-medium">$29.99 USD</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-gray-900 font-bold">$29.99 USD</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                "Pay Now"
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageComponent />
    </Suspense>
  );
}