// CouponService import 제거 - API 라우트를 통해 쿠폰 생성

// API 응답 타입 정의
export interface CouponResponse {
  success: boolean;
  data: StoredCoupon | null;
}

export function generateCouponNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

export interface CouponResponse {
  success: boolean;
  data: StoredCoupon | null;
}

// 새로운 localStorage 관리 함수들
export interface StoredCoupon {
  id: string;
  amount: number;
  serialNumber: string;
  createdAt: string;
  expiresAt: string;
}

export interface DailyData {
  date: string;
  remainingChances: number;
  coupons: StoredCoupon[];
  lastResetDate: string;
}

// SF- 뒤에 8자리 고유 일련번호 생성
export function generateSerialNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SF-';

  // 완전히 랜덤한 8자리 대문자+숫자 조합 생성
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// 오늘 날짜 문자열 반환 (YYYY-MM-DD)
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 자정 체크 및 localStorage 초기화
export function checkAndResetDaily(): void {
  const today = getTodayString();
  const stored = localStorage.getItem('dailyCouponData');

  if (!stored) {
    const initialData: DailyData = {
      date: today,
      remainingChances: 5,
      coupons: [],
      lastResetDate: today,
    };

    localStorage.setItem('dailyCouponData', JSON.stringify(initialData));
    return;
  }

  const data: DailyData = JSON.parse(stored);

  // 날짜가 바뀌었으면 초기화
  if (data.lastResetDate !== today) {
    const resetData: DailyData = {
      date: today,
      remainingChances: 5,
      coupons: [],
      lastResetDate: today,
    };
    localStorage.setItem('dailyCouponData', JSON.stringify(resetData));
  }
}

// 오늘의 데이터 가져오기
export function getTodayData(): DailyData {
  checkAndResetDaily(); // 먼저 자정 체크

  const stored = localStorage.getItem('dailyCouponData');
  if (!stored) {
    const initialData: DailyData = {
      date: getTodayString(),
      remainingChances: 5,
      coupons: [],
      lastResetDate: getTodayString(),
    };
    return initialData;
  }

  return JSON.parse(stored);
}

// 쿠폰 추가 및 기회 차감
export async function addCouponAndReduceChance(
  amount: number
): Promise<CouponResponse> {
  const data = getTodayData();

  if (data.remainingChances <= 0) {
    return {
      success: false,
      data: null,
    };
  }

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

  const newCoupon: StoredCoupon = {
    id: `coupon-${Date.now()}-${Math.random()}`,
    amount,
    serialNumber: generateSerialNumber(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // 먼저 localStorage에 저장 (사용자 경험 우선)
  data.coupons.push(newCoupon);
  data.remainingChances -= 1;
  localStorage.setItem('dailyCouponData', JSON.stringify(data));

  // API를 통해 MongoDB에 쿠폰 저장 (백그라운드)
  try {
    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: newCoupon.amount,
        serialNumber: newCoupon.serialNumber,
        createdAt: newCoupon.createdAt,
        expiresAt: newCoupon.expiresAt,
      }),
    });

    if (!response.ok) {
      console.warn('쿠폰 DB 저장 실패, localStorage만 저장됨');
    }
  } catch (error) {
    console.warn('쿠폰 DB 저장 실패, localStorage만 저장됨:', error);
  }

  // 사용자에게는 항상 성공 반환 (localStorage 저장 성공했으므로)
  return {
    success: true,
    data: newCoupon,
  };
}

// 남은 기회 수 가져오기
export function getRemainingChances(): number {
  const data = getTodayData();
  return data.remainingChances;
}

// 오늘 획득한 쿠폰 목록 가져오기
export function getTodayCoupons(): StoredCoupon[] {
  const data = getTodayData();
  return data.coupons;
}

// 유효기간 포맷팅 함수 (발급일부터 30일)
export function formatCouponValidityPeriod(): string {
  const today = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return `${formatDate(today)} ~ ${formatDate(expiryDate)}`;
}

// 오늘 첫 번째 당첨인지 확인하는 함수
export function isFirstWinToday(): boolean {
  const data = getTodayData();
  return data.coupons.length === 1; // 쿠폰이 1개면 첫 번째 당첨
}
