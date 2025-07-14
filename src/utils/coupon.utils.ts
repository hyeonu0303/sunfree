export function generateCouponNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// 새로운 localStorage 관리 함수들
export interface StoredCoupon {
  id: string;
  amount: number;
  serialNumber: string;
  wonAt: string; // ISO string
  expiresAt: string; // ISO string
}

export interface DailyData {
  date: string; // YYYY-MM-DD 형식
  remainingChances: number;
  coupons: StoredCoupon[];
  lastResetDate: string;
}

// SF- 뒤에 8자리 고유 일련번호 생성
export function generateSerialNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SF-';

  // 현재 시간을 밀리초로 변환하여 고유성 보장
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Array.from({ length: 8 - timestamp.length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');

  result += (timestamp + random).substring(0, 8);
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
export function addCouponAndReduceChance(amount: number): StoredCoupon | null {
  const data = getTodayData();

  if (data.remainingChances <= 0) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

  const newCoupon: StoredCoupon = {
    id: `coupon-${Date.now()}-${Math.random()}`,
    amount,
    serialNumber: generateSerialNumber(),
    wonAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  data.coupons.push(newCoupon);
  data.remainingChances -= 1;

  localStorage.setItem('dailyCouponData', JSON.stringify(data));
  return newCoupon;
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
