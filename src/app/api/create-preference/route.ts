import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentItem } from '@/types/payment';

// Validar variables de entorno
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const PAYMENT_SUCCESS_URL = process.env.NEXT_PUBLIC_PAYMENT_SUCCESS_URL;
const PAYMENT_FAILURE_URL = process.env.NEXT_PUBLIC_PAYMENT_FAILURE_URL;

if (!MERCADO_PAGO_ACCESS_TOKEN) {
  console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado');
}

if (!PAYMENT_SUCCESS_URL || !PAYMENT_FAILURE_URL) {
  console.error('ERROR: URLs de success/failure no están configuradas');
}

const client = new MercadoPagoConfig({ 
  accessToken: MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    // Validar variables de entorno antes de proceder
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Error de configuración: Token de MercadoPago no configurado. Contacte al administrador.' },
        { status: 500 }
      );
    }

    if (!PAYMENT_SUCCESS_URL || !PAYMENT_FAILURE_URL) {
      return NextResponse.json(
        { error: 'Error de configuración: URLs de respuesta de pago no configuradas. Contacte al administrador.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    // Validar que items exista y no esté vacío
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Error de datos: No se encontraron productos para procesar el pago.' },
        { status: 400 }
      );
    }

    const items: PaymentItem[] = body.items;

    // Validar cada item
    for (const item of items) {
      if (!item.title || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number') {
        return NextResponse.json(
          { error: 'Error de datos: Información de productos inválida. Verifique el precio y cantidad.' },
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
        unit_price: item.unit_price,
        quantity: item.quantity,
      })),
      // Agregamos los campos personalizados si vienen en el body
      external_reference: body.external_reference,
      metadata: body.metadata,
      back_urls: {
        success: PAYMENT_SUCCESS_URL,
        failure: PAYMENT_FAILURE_URL,        
      },
      auto_return: 'approved' as const,
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }
        ]
      }
    };

    console.log('Preference data:', preferenceData);

    const response = await preference.create({ body: preferenceData });
    console.log('MercadoPago response:', response);

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    
    // Proporcionar detalles más específicos del error en español
    let errorMessage = 'Error al crear la preferencia de pago';
    let statusCode = 500;

    // Verificar si es un error de autenticación de MercadoPago
    if (error.status === 401 || (error.message && error.message.includes('401'))) {
      errorMessage = 'Error de autenticación: Token de MercadoPago inválido o expirado. Contacte al administrador.';
      statusCode = 401;
    } else if (error.status === 400 || (error.message && error.message.includes('400'))) {
      errorMessage = 'Error en los datos enviados: Verifique que el precio y cantidad sean válidos.';
      statusCode = 400;
    } else if (error.message && error.message.includes('network')) {
      errorMessage = 'Error de conexión: No se pudo conectar con MercadoPago. Intente nuevamente.';
    } else if (error.message) {
      errorMessage = `Error del servicio de pagos: ${error.message}`;
    }

    // Si es un error de MercadoPago, incluir más detalles
    if (error.cause || error.response) {
      console.error('MercadoPago error details:', {
        cause: error.cause,
        response: error.response?.data || error.response,
        status: error.status
      });
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message || 'Error desconocido del servidor de pagos',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
