export interface Coupon {
  id: string;
  amount: number;
  serialNumber: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed?: boolean; // 쿠폰 사용 완료 상태
}

// 게임 상태 타입
export interface GameState {
  remainingChances: number;
  wonCoupons: Coupon[];
  isSpinning: boolean;
  showWinModal: boolean;
  currentWin?: Coupon;
}
