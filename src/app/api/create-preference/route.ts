import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentItem } from '@/types/payment';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: PaymentItem[] = body.items;

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
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/components/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/components/payment/failure`,
      },
      auto_return: 'approved' as const,
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }
        ]
      }
    };

    const response = await preference.create({ body: preferenceData });

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: 'Error creating payment preference' },
      { status: 500 }
    );
  }
}
