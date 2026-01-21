export type PaymentStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED';

export interface InitPaymentMessage {
  type: 'INIT_PAYMENT';
  orderId: string;
  amount: number;
  currency: string;
}

export interface PaymentStatusMessage {
  type: 'PAYMENT_STATUS';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference?: string;
  reason?: string;
}

export type WebSocketMessage = InitPaymentMessage | PaymentStatusMessage;

