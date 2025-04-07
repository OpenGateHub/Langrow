import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Leer y mostrar el evento recibido
    const event = await request.json();
    console.log("Evento recibido:", JSON.stringify(event, null, 2));

    // Extraer el payment_id del evento
    const paymentId = event?.data?.id;
    if (!paymentId) {
      return NextResponse.json({ message: "No se encontró payment_id" });
    }

    // Construir la URL para obtener los detalles del pago
    const paymentUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
    const paymentRes = await fetch(paymentUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!paymentRes.ok) {
      throw new Error(`Error fetching payment details: ${paymentRes.statusText}`);
    }
    const paymentDetails = await paymentRes.json();
    console.log("Detalles completos del pago:", JSON.stringify(paymentDetails, null, 2));

    // Intentar obtener el external_reference desde el pago
    let externalReference = paymentDetails.external_reference;

    // Si no está presente y se tiene un preference_id, consultamos la preferencia
    if (!externalReference && paymentDetails.preference_id) {
      const preferenceUrl = `https://api.mercadopago.com/checkout/preferences/${paymentDetails.preference_id}`;
      const prefRes = await fetch(preferenceUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (prefRes.ok) {
        const preferenceDetails = await prefRes.json();
        externalReference = preferenceDetails.external_reference;
        console.log("Detalles de la preferencia:", JSON.stringify(preferenceDetails, null, 2));
      } else {
        console.warn("No se pudieron obtener los detalles de la preferencia:", prefRes.statusText);
      }
    }

    // Aquí podrías guardar paymentDetails y externalReference en tu base de datos

    return NextResponse.json({
      message: "Evento recibido y detalles consultados",
      payment: paymentDetails,
      external_reference: externalReference,
    });
  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
}