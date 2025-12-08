export interface Payment {
  id: string;
  userId: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  method: 'razorpay' | 'wallet' | 'upi' | 'card';
  description: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  amount: number;
  method: 'razorpay' | 'wallet' | 'upi' | 'card';
  description: string;
  bookingId?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount: number;
  message: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, unknown>;
  created_at: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  paymentId?: string;
  bookingId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: Transaction[];
  updatedAt: Date;
}
