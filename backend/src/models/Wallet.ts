export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  cashback: number;
  referralBonus: number;
  lastUpdated: Date;
}
