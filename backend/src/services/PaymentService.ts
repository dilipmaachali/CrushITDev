import Razorpay from 'razorpay';
import type { Payment, PaymentRequest, PaymentResponse, Transaction, Wallet } from '@/models/Payment';

export class PaymentService {
  private razorpayClient: Razorpay;

  constructor() {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1gg7DFR3EqDTab',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'w6pHP0kstUHkVlG9M4h8I9Oj',
    });
  }

  /**
   * Create a Razorpay order
   */
  async createRazorpayOrder(amount: number, currency: string = 'INR'): Promise<any> {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };
      return await this.razorpayClient.orders.create(options);
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): boolean {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'w6pHP0kstUHkVlG9M4h8I9Oj')
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }

  /**
   * Process payment
   */
  async processPayment(userId: string, paymentReq: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (paymentReq.method === 'razorpay') {
        const order = await this.createRazorpayOrder(paymentReq.amount);
        return {
          success: true,
          orderId: order.id,
          amount: paymentReq.amount,
          message: 'Razorpay order created successfully',
        };
      } else if (paymentReq.method === 'wallet') {
        // Wallet payment would be processed separately
        return {
          success: true,
          amount: paymentReq.amount,
          message: 'Wallet payment processed',
        };
      }
      return {
        success: false,
        amount: paymentReq.amount,
        message: 'Unsupported payment method',
      };
    } catch (error) {
      throw new Error(`Payment processing failed: ${error}`);
    }
  }

  /**
   * Create transaction
   */
  createTransaction(
    userId: string,
    type: 'credit' | 'debit',
    amount: number,
    description: string,
    balanceBefore: number,
    paymentId?: string,
    bookingId?: string,
  ): Transaction {
    const balanceAfter = type === 'credit' ? balanceBefore + amount : balanceBefore - amount;

    return {
      id: `txn_${Date.now()}`,
      userId,
      type,
      amount,
      description,
      paymentId,
      bookingId,
      balanceBefore,
      balanceAfter,
      createdAt: new Date(),
    };
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(transactions: Transaction[], limit: number = 10): Transaction[] {
    return transactions.slice(-limit).reverse();
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string): Promise<any> {
    try {
      return await this.razorpayClient.payments.refund(paymentId, {});
    } catch (error) {
      throw new Error(`Refund processing failed: ${error}`);
    }
  }
}

export default new PaymentService();
