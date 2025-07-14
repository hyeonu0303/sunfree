'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import Image from 'next/image';
import Link from 'next/link';
import {
  getRemainingChances,
  formatCouponValidityPeriod,
  isFirstWinToday,
} from '@/utils/coupon.utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { PhoneCall } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const wonAmount = searchParams.get('won') || '1000';
  const serialNumber = searchParams.get('serial') || 'SF-XXXXXXXX';
  const [remainingChances, setRemainingChances] = useState<number | null>(null);

  // 컨페티 효과 함수
  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // 왼쪽에서 터뜨리기
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // 오른쪽에서 터뜨리기
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  useEffect(() => {
    // 남은 기회 수 가져오기
    const chances = getRemainingChances();
    setRemainingChances(chances);

    // 오늘 첫 번째 당첨일 때만 컨페티 효과 실행
    if (isFirstWinToday()) {
      const timer = setTimeout(() => {
        fireConfetti();
      }, 500); // 0.5초 후 실행

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Container>
      <div className="text-center">
        {/* <h1 className="text-black text-4xl font-bold font-gmarket mb-6">
          🎉 축하합니다! 🎉
        </h1> */}

        <div className="mb-4">
          <span className="text-black text-3xl font-bold font-gmarket">
            {parseInt(wonAmount).toLocaleString()}원 쿠폰 당첨!
          </span>
        </div>

        {/* 쿠폰 이미지 */}
        <div className="flex items-center justify-center w-full h-auto mb-4">
          <Image
            src={`/asset/${wonAmount}won.png`}
            alt={`${wonAmount}원 쿠폰`}
            width={250}
            height={200}
            priority
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="flex flex-col gap-1 text-center">
            <p className="text-gray-400 text-sm font-pretendard">유효기간</p>
            <p className="text-black text-base font-pretendard">
              {formatCouponValidityPeriod()} 까지
            </p>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <p className="text-gray-400 text-sm font-pretendard">쿠폰번호</p>
            <p className="text-black text-base font-pretendard">
              {serialNumber}
            </p>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <p className="text-gray-400 text-sm font-pretendard">사용방법</p>
            <p className="text-black text-base font-pretendard">
              1. 이 화면을 캡처해서 저장하세요 <br />
              2. 아래 "쿠폰사용하기" 버튼을 눌러주세요 <br />
              3. 담당자에게 전화를 걸어 쿠폰 번호를 알려주세요
            </p>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex flex-col gap-1">
          <a href="tel:114">
            <Button variant="yellow">
              <PhoneCall className="w-4 h-4" />
              쿠폰 사용하기
            </Button>
          </a>

          {/* <Link href="/">
            <Button variant="black">메인으로 돌아가기</Button>
          </Link> */}

          <Link href="/coupon-list">
            <Button variant="black">오늘 뽑은 쿠폰 확인하기</Button>
          </Link>

          {remainingChances === null && (
            <Button
              variant="disabled"
              disabled
              className="w-full"
            >
              로딩중...
            </Button>
          )}

          {remainingChances !== null && remainingChances > 0 && (
            <Link href="/slot-machine">
              <Button variant="black">
                다시 도전하기 ({remainingChances}번)
              </Button>
            </Link>
          )}

          {remainingChances === 0 && (
            <Button
              variant="disabled"
              disabled
            >
              내일 다시 참여 해보세요!
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <div className="text-center">
            <p className="text-gray-600 text-lg font-medium font-gmarket">
              결과를 불러오는 중...
            </p>
          </div>
        </Container>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
