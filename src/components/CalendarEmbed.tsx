import Cal, { getCalApi } from "@calcom/embed-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CalendarEmbedProps {
  calLink: string;
  config?: {
    theme?: "light" | "dark";
    hideEventTypeDetails?: "true" | "false";
    layout?: "month_view" | "week_view" | "column_view";
  };
}

export default function CalendarEmbed({ calLink, config = {} }: CalendarEmbedProps) {
  const router = useRouter();

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      // @ts-expect-error - Cal.com's types are not fully compatible
      cal("on", {
        action: "bookingSuccessful",
        callback: (e: CustomEvent) => {
          console.log("Booking event:", e); // For debugging
          
          // Safely access the booking data
          const detail = e.detail as any;
          const booking = detail?.data?.booking;
          const eventType = detail?.data?.eventType;
          
          if (booking?.uid && eventType?.id) {
            // Redirect to payment page with booking details
            router.push(`/payment?bookingId=${booking.uid}&eventTypeId=${eventType.id}`);
          } else {
            console.error("Missing booking details:", e);
          }
        },
      });
    })();
  }, [router]);

  return (
    <Cal
      calLink={calLink}
      style={{ width: "100%", height: "100%", minHeight: "600px" }}
      config={{
        theme: "light",
        ...config,
      }}
    />
  );
} 