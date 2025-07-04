export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { storePayment } from '../payments/payments';
import { supabaseClient } from '../supabaseClient';
import { SUPABASE_TABLES } from '@/app/config';
import { createClassRoom } from '@/app/api/mentoring/classRoom';

export async function POST(request: Request) {
  try {
    console.log('[WEBHOOK] Recibido evento de MercadoPago');
    const event = await request.json();
    console.log('[WEBHOOK] Evento recibido:', JSON.stringify(event, null, 2));

    // Extraer el payment_id del evento
    const paymentId = event?.data?.id;
    if (!paymentId) {
      console.error('[WEBHOOK] No se encontró payment_id en el evento');
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
      console.error('[WEBHOOK] Error al obtener detalles del pago:', paymentRes.statusText);
      throw new Error(`Error fetching payment details: ${paymentRes.statusText}`);
    }
    const paymentDetails = await paymentRes.json();
    console.log('[WEBHOOK] Detalles completos del pago:', JSON.stringify(paymentDetails, null, 2));

    // Verificar que el pago fue exitoso
    if (paymentDetails.status !== 'approved') {
      console.warn('[WEBHOOK] Pago no aprobado:', paymentDetails.status);
      return NextResponse.json({ message: "Pago no aprobado" });
    }

    // Intentar obtener el external_reference y metadata desde el pago
    let externalReference = paymentDetails.external_reference;
    let metadata = paymentDetails.metadata || {};

    // Si no está presente y se tiene un preference_id, consultamos la preferencia
    if ((!externalReference || !metadata) && paymentDetails.preference_id) {
      const preferenceUrl = `https://api.mercadopago.com/checkout/preferences/${paymentDetails.preference_id}`;
      const prefRes = await fetch(preferenceUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (prefRes.ok) {
        const preferenceDetails = await prefRes.json();
        console.log('[WEBHOOK] Detalles de la preferencia:', JSON.stringify(preferenceDetails, null, 2));
        externalReference = preferenceDetails.external_reference;
        metadata = preferenceDetails.metadata || {};
      } else {
        console.warn('[WEBHOOK] No se pudieron obtener los detalles de la preferencia:', prefRes.statusText);
      }
    }

    // Guardar el pago en la base de datos
    await storePayment({
      payment_id: paymentId,
      external_reference: externalReference,
      payment_details: paymentDetails,
    });
    console.log('[WEBHOOK] Pago guardado en la base de datos');

    // Extraer datos necesarios del metadata
    const alumnoId = metadata.alumnoId || '';
    const profesorId = metadata.profesorId || '';
    const purchaseId = metadata.purchaseId || '';

    if (!alumnoId || !profesorId || !purchaseId) {
      console.error('[WEBHOOK] Faltan datos en metadata para crear la clase', { alumnoId, profesorId, purchaseId, metadata });
      throw new Error('Faltan datos en metadata para crear la clase');
    }

    // Obtener el perfil del alumno
    const { data: studentProfile, error: studentError } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .select('*')
      .eq('userId', alumnoId)
      .single();
    if (studentError || !studentProfile) {
      console.error('[WEBHOOK] No se pudo obtener el perfil del alumno', { alumnoId, studentError });
      throw new Error('No se pudo obtener el perfil del alumno');
    }

    // Obtener el perfil del profesor
    const { data: professorProfile, error: professorError } = await supabaseClient
      .from(SUPABASE_TABLES.PROFILES)
      .select('*')
      .eq('userId', profesorId)
      .single();
    if (professorError || !professorProfile) {
      console.error('[WEBHOOK] No se pudo obtener el perfil del profesor', { profesorId, professorError });
      throw new Error('No se pudo obtener el perfil del profesor');
    }

    // Crear la clase usando createClassRoom
    const now = new Date();
    const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const startHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const endHour = end.getHours().toString().padStart(2, '0') + ':' + end.getMinutes().toString().padStart(2, '0');
    const time = `${startHour} - ${endHour}`;

    try {
      const result = await createClassRoom({
        studentId: studentProfile.id,
        professorId: professorProfile.id,
        category: 1, // Puedes ajustar esto si tienes categorías dinámicas
        date,
        time,
        duration: '60',
        cost: '1000',
        title: 'Clase de Inglés',
        requestDescription: 'Clase creada después de pago en MercadoPago',
        status: 'CONFIRMED',
      });
      console.log('[WEBHOOK] Resultado de createClassRoom:', result);
      if (!result) {
        console.error('[WEBHOOK] No se pudo crear la clase (createClassRoom retornó false)');
        throw new Error('No se pudo crear la clase (createClassRoom retornó false)');
      }
    } catch (err) {
      console.error('[WEBHOOK] Error al crear la clase con createClassRoom:', err);
      throw err;
    }

    return NextResponse.json({
      message: "Pago procesado y clase creada exitosamente",
      payment: paymentDetails
    });
  } catch (error) {
    console.error('[WEBHOOK] Error en webhook:', error);
    return NextResponse.json({ error: "Error processing webhook", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}