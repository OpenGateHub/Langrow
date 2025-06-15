import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentItem } from '@/types/payment';
import {
  getStudentProfileByUserId,
  getStudentProfileById
} from '../profile/profile';
import { z as zod } from "zod";

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

// URLs para desarrollo local
const SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL ? process.env.PAYMENT_SUCCESS_URL : 'https://langrow.vercel.app/payment/success';
const FAILURE_URL = process.env.PAYMENT_FAILURE_URL ? process.env.PAYMENT_FAILURE_URL : 'https://langrow.vercel.app/payment/failure';


const createPaymentPreferenceSchema = zod.object({
  items: zod.array(
    zod.object({
      title: zod.string().min(1, 'El título del producto es requerido'),
      unit_price: zod.number().positive('El precio unitario debe ser un número positivo'),
      quantity: zod.number().int().positive('La cantidad debe ser un número entero positivo'),
    })
  ),
  external_reference: zod.string(),
  metadata: zod.object({
    alumnoId: zod.string(),
    profesorId: zod.string(),
    purchaseId: zod.string(),
  }),
});

export async function POST(request: Request) {
  try {
    console.log('[API] POST /api/create-preference llamado');
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('[API] MERCADO_PAGO_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Error en la configuración del servidor' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('[API] Body recibido:', body);

    const validatedData = createPaymentPreferenceSchema.safeParse(body);
    if (!validatedData.success) {
      console.error('[API] Error en la validación del body', validatedData.error.errors);
      return NextResponse.json(
        { result: false, message: "Error en la validación", error: validatedData.error.errors },
        { status: 400 }
      );
    }

    const { data } = validatedData;
    const { alumnoId, profesorId, purchaseId } = data.metadata;
    console.log('[API] Metadata:', { alumnoId, profesorId, purchaseId });

    const studentProfile = await getStudentProfileByUserId(alumnoId);
    if (!studentProfile) {
      console.error('[API] Perfil de estudiante no encontrado:', alumnoId);
      return NextResponse.json(
        { error: 'Perfil de estudiante no encontrado' },
        { status: 404 }
      );
    }

    const studentUserProfile = await getStudentProfileById(studentProfile.id);
    if (!studentUserProfile) { 
      console.error('[API] Perfil de usuario del estudiante no encontrado:', studentProfile.id);
      return NextResponse.json(
        { error: 'Perfil de usuario del estudiante no encontrado' },
        { status: 404 }
      );
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      console.error('[API] No se encontraron productos en el body:', data);
      return NextResponse.json(
        { error: 'Error de datos: No se encontraron productos para procesar el pago.' },
        { status: 400 }
      );
    }

    const items: PaymentItem[] = data.items;
    for (const item of items) {
      if (!item.title || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number' || isNaN(item.unit_price) || isNaN(item.quantity) || item.unit_price <= 0 || item.quantity <= 0) {
        console.error('[API] Datos de item inválidos:', item);
        return NextResponse.json(
          { error: 'Error de datos: Información de productos inválida. Verifique el precio y cantidad.', details: JSON.stringify(item) },
          { status: 400 }
        );
      }
    }

    const preference = new Preference(client);
    const preferenceData = {
      items: items.map((item, index) => ({
        id: `item-${index}`,
        title: item.title,
        currency_id: 'ARS',
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        description: `Reserva de ${item.quantity} clase(s) de inglés`,
      })),
      payer: {
        name: studentUserProfile.name,
        email: studentUserProfile.email,
      },
      back_urls: {
        success: SUCCESS_URL,
        failure: FAILURE_URL,
        pending: SUCCESS_URL,
      },
      auto_return: "approved",
      external_reference: body.external_reference || `reserva-${Date.now()}`,
      metadata: body.metadata || {},
      notification_url: process.env.MERCADO_PAGO_REDIRECT_WEBHOOK || "https://langrow.vercel.app/api/webhook",
      binary_mode: true,
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ],
        installments: 1
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('[API] Preference data completa:', JSON.stringify(preferenceData, null, 2));
    console.log('[API] Intentando crear preferencia con MercadoPago...');
    const response = await preference.create({ body: preferenceData });
    console.log('[API] Respuesta de MercadoPago exitosa:', response);

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (mpError: any) {
    console.error('[API] Error en la API de MercadoPago:', mpError);
    let mpErrorDetails = 'Error desconocido';
    if (mpError.response && mpError.response.data) {
      console.error('[API] Detalles del error de MercadoPago:', mpError.response.data);
      mpErrorDetails = JSON.stringify(mpError.response.data);
    } else if (mpError.message) {
      mpErrorDetails = mpError.message;
    }
    return NextResponse.json(
      {
        error: 'Error en la API de MercadoPago',
        details: mpErrorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
