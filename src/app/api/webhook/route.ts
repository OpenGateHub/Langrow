import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const event = await request.json();
    console.log("Evento recibido:", event);
    // Para depuración, simplemente retornamos el payload recibido
    return NextResponse.json({ message: "Evento recibido", event });
  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}





















// import { NextResponse } from 'next/server';
// import { savePaymentToDB } from '@/lib/db';

// export async function POST(request: Request) {
//   try {
//     const event = await request.json();
//     console.log("Evento recibido:", event);


//     // Opcional: valida la autenticidad de la notificación aquí (firmas, etc.)

//     // Extrae los datos relevantes, por ejemplo:
//     const { external_reference, metadata, status, transaction_amount, payment_id } = event;

//     // Solo procesamos si el pago fue aprobado
//     if (status === 'approved') {
//       // Guarda o actualiza el pago en tu base de datos.
//       // La función savePaymentToDB debería implementar la lógica para guardar la info.
//       await savePaymentToDB({
//         externalReference: external_reference,
//         alumnoId: metadata.alumnoId,
//         profesorId: metadata.profesorId,
//         purchaseId: metadata.purchaseId, // o el campo que hayas definido
//         paymentId,
//         amount: transaction_amount,
//         status,
//         // Otros datos que consideres relevantes...
//       });
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
//   }
// }
