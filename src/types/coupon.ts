export interface Coupon {
  id: string;
  amount: number;
  serialNumber: string;
  wonAt: Date;
}

// 게임 상태 타입
export interface GameState {
  remainingChances: number;
  wonCoupons: Coupon[];
  isSpinning: boolean;
  showWinModal: boolean;
  currentWin?: Coupon;
}
