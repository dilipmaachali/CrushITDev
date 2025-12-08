import type { Payment, Transaction, Wallet } from '@/models/Payment';

export const paymentsData: Map<string, Payment> = new Map([
  [
    'payment_1',
    {
      id: 'payment_1',
      userId: 'user_1',
      orderId: 'order_1001',
      paymentId: 'pay_1001',
      amount: 500,
      currency: 'INR',
      status: 'success',
      method: 'razorpay',
      description: 'Arena booking for Cricket match',
      razorpaySignature: 'sig_1001',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    },
  ],
  [
    'payment_2',
    {
      id: 'payment_2',
      userId: 'user_2',
      amount: 800,
      currency: 'INR',
      status: 'success',
      method: 'wallet',
      description: 'Football ground booking',
      createdAt: new Date('2025-01-11'),
      updatedAt: new Date('2025-01-11'),
    },
  ],
]);

export const walletsData: Map<string, Wallet> = new Map([
  [
    'user_1',
    {
      userId: 'user_1',
      balance: 5000,
      transactions: [
        {
          id: 'txn_1',
          userId: 'user_1',
          type: 'credit',
          amount: 5000,
          description: 'Initial wallet credit',
          balanceBefore: 0,
          balanceAfter: 5000,
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'txn_2',
          userId: 'user_1',
          type: 'debit',
          amount: 500,
          description: 'Cricket ground booking payment',
          paymentId: 'payment_1',
          bookingId: 'booking_1',
          balanceBefore: 5000,
          balanceAfter: 4500,
          createdAt: new Date('2025-01-10'),
        },
      ],
      updatedAt: new Date('2025-01-10'),
    },
  ],
  [
    'user_2',
    {
      userId: 'user_2',
      balance: 3500,
      transactions: [
        {
          id: 'txn_3',
          userId: 'user_2',
          type: 'credit',
          amount: 4000,
          description: 'Wallet recharge',
          balanceBefore: 0,
          balanceAfter: 4000,
          createdAt: new Date('2025-01-05'),
        },
        {
          id: 'txn_4',
          userId: 'user_2',
          type: 'debit',
          amount: 500,
          description: 'Promotional discount applied',
          balanceBefore: 4000,
          balanceAfter: 3500,
          createdAt: new Date('2025-01-08'),
        },
      ],
      updatedAt: new Date('2025-01-08'),
    },
  ],
]);
