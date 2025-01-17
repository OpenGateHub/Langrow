export interface PaymentItem {
  title: string;
  unit_price: number;
  quantity: number;
}

export interface CreatePreferenceResponse {
  id: string;
  init_point: string;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  status?: string;
  message?: string;
} 