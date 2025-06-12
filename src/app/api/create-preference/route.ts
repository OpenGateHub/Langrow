import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentItem } from '@/types/payment';

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

// URLs hardcodeadas para pruebas
const SUCCESS_URL = 'https://langrowdev.loca.lt/payment/success';
const FAILURE_URL = 'https://langrowdev.loca.lt/payment/failure';

export async function POST(request: Request) {
  try {
    // Verificar que tenemos el token de acceso
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Error en la configuración del servidor' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    // Validar que items exista y no esté vacío
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.error('Error: No se encontraron productos en el body:', body);
      return NextResponse.json(
        { error: 'Error de datos: No se encontraron productos para procesar el pago.' },
        { status: 400 }
      );
    }

    const items: PaymentItem[] = body.items;

    // Validar cada item
    for (const item of items) {
      if (!item.title || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number' || isNaN(item.unit_price) || isNaN(item.quantity) || item.unit_price <= 0 || item.quantity <= 0) {
        console.error('Datos de item inválidos:', item);
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
        name: "Alumno",
        surname: "Langrow",
        email: "alumno@test.com",
      },
      back_urls: {
        success: SUCCESS_URL,
        failure: FAILURE_URL,
        pending: SUCCESS_URL,
      },
      auto_return: "approved",
      external_reference: body.external_reference || `reserva-${Date.now()}`,
      metadata: body.metadata || {},
      notification_url: "https://langrow.vercel.app/api/webhook",
      binary_mode: true,
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ],
        installments: 1
      }
    };

    console.log('Preference data completa:', JSON.stringify(preferenceData, null, 2));
    
    console.log('Intentando crear preferencia con MercadoPago...');
    const response = await preference.create({ body: preferenceData });
    console.log('Respuesta de MercadoPago exitosa:', response);
    
    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (mpError: any) {
    console.error('Error en la API de MercadoPago:', mpError);
    
    // Intentar extraer detalles específicos del error de MercadoPago
    let mpErrorDetails = 'Error desconocido';
    if (mpError.response && mpError.response.data) {
      console.error('Detalles del error de MercadoPago:', mpError.response.data);
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
