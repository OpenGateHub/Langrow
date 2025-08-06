import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentItem } from '@/types/payment';
import { z as zod } from 'zod';
import { getStudentProfileByUserId, getStudentProfileById } from '../../app/api/profile/profile';

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

interface PreferenceMPInput {
  items: PaymentItem[];
  external_reference: string;
  metadata: {
    alumnoId: string;
    profesorId: string;
    purchaseId: string;
  };
}

export class PreferenceMP {
  private client: MercadoPagoConfig;
  private successUrl: string;
  private failureUrl: string;
  private notificationUrl: string;

  constructor() {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN no está configurado');

    this.client = new MercadoPagoConfig({ accessToken: token });
    const successBase = process.env.PAYMENT_SUCCESS_URL || 'https://langrow.vercel.app/payment/success';
    this.successUrl = `${successBase}`; //?collection_id={collection_id}&preference_id={preference_id}`;
    this.failureUrl = process.env.PAYMENT_FAILURE_URL || 'https://langrow.vercel.app/payment/failure';
    this.notificationUrl = process.env.MERCADO_PAGO_REDIRECT_WEBHOOK || 'https://langrow.vercel.app/api/webhook';
  }

  async create(data: PreferenceMPInput) {
    const validation = createPaymentPreferenceSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(`Datos inválidos: ${JSON.stringify(validation.error.errors)}`);
    }

    const { alumnoId } = data.metadata;
    const studentProfile = await getStudentProfileByUserId(alumnoId);
    if (!studentProfile) throw new Error('Perfil de estudiante no encontrado');

    const studentUserProfile = await getStudentProfileById(studentProfile.id);
    if (!studentUserProfile) throw new Error('Perfil de usuario del estudiante no encontrado');

    const preference = new Preference(this.client);
    const preferenceData = {
      items: data.items.map((item, index) => ({
        id: `item-${index}`,
        title: item.title,
        currency_id: 'ARS',
        unit_price: item.unit_price,
        quantity: item.quantity,
        description: `Reserva de ${item.quantity} clase(s) de inglés`,
      })),
      payer: {
        name: studentUserProfile.name,
        email: studentUserProfile.email,
      },
      back_urls: {
        success: this.successUrl,
        failure: this.failureUrl,
        pending: this.successUrl,
      },
      auto_return: "approved",
      external_reference: data.external_reference || `reserva-${Date.now()}`,
      metadata: data.metadata,
      notification_url: this.notificationUrl,
      binary_mode: true,
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        installments: 1
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await preference.create({ body: preferenceData });
    
    return {
      id: response.id,
      init_point: response.init_point,
    };
  }
}
