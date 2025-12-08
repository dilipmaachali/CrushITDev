export interface Transaction {
  id: string;
  userId: string;
  type: 'booking' | 'cashback' | 'referral' | 'recharge' | 'withdrawal';
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}
