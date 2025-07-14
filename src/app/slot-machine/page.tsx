'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/container';
import Image from 'next/image';
import SlotReel from '@/components/slot-reel';
import { AMOUNTS } from '@/constants/constant';
import {
  addCouponAndReduceChance,
  getRemainingChances,
  checkAndResetDaily,
} from '@/utils/coupon.utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SlotMachine() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(1000);
  const [remainingChances, setRemainingChances] = useState(5);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const gameKeyRef = useRef(0);
  const hasProcessedWinRef = useRef(false);

  // 페이지 로드 시 localStorage 체크 및 초기화
  useEffect(() => {
    // 자정 체크 및 데이터 초기화
    checkAndResetDaily();

    // 남은 기회 수 가져오기
    const chances = getRemainingChances();
    setRemainingChances(chances);

    // 남은 기회가 있으면 1초 후 자동 시작
    if (chances > 0) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [router]);

  const handleSpin = () => {
    if (isSpinning || remainingChances <= 0) return;

    // 게임 키 증가로 릴 컴포넌트 리렌더링
    gameKeyRef.current += 1;
    hasProcessedWinRef.current = false;

    // 무조건 당첨이므로 랜덤하게 금액 선택
    const selectedAmount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
    setWinAmount(selectedAmount);
    setStoppedReels([false, false, false]);

    setIsSpinning(true);
  };

  const handleReelStop = useCallback(
    (reelIndex: number) => {
      console.log(`릴 ${reelIndex} 정지 처리 시작`);

      setStoppedReels((prev) => {
        const newStoppedReels = [...prev];
        newStoppedReels[reelIndex] = true;

        console.log(`새로운 정지 상태:`, newStoppedReels);

        // 모든 릴이 멈췄는지 확인
        const allStopped = newStoppedReels.every((stopped) => stopped);

        if (allStopped && !hasProcessedWinRef.current) {
          console.log('모든 릴이 정지됨 - 당첨 처리 시작');
          hasProcessedWinRef.current = true;

          // 마지막 릴이 멈춘 후 2초 뒤에 결과 처리
          setTimeout(() => {
            setIsSpinning(false);

            // localStorage에 쿠폰 저장 및 기회 차감
            const savedCoupon = addCouponAndReduceChance(winAmount);

            if (savedCoupon) {
              console.log('쿠폰 발급 완료:', savedCoupon);
              // 남은 기회 수 업데이트
              setRemainingChances(getRemainingChances());
              // 결과 페이지로 이동 (일련번호 포함)
              router.push(
                `/slot-machine/result?won=${winAmount}&serial=${savedCoupon.serialNumber}`
              );
            } else {
              console.error('쿠폰 저장 실패');
              router.push('/');
            }
          }, 2000);
        }

        return newStoppedReels;
      });
    },
    [winAmount, router]
  );

  // 기회가 없는 경우 표시
  if (remainingChances <= 0) {
    return (
      <Container>
        <div className="text-center">
          <h1 className="text-black text-3xl font-bold font-gmarket mb-8">
            오늘의 기회를 <br /> 모두 사용했습니다
          </h1>
          <p className="text-gray-600 text-lg font-medium font-gmarket mb-8">
            내일 자정 이후에 다시 발급 받으세요!
          </p>
          <Link href="/">
            <Button variant="black">메인으로 돌아가기</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-black text-3xl font-bold font-gmarket mb-12">
        쿠폰 발급 중
        <span className="inline-block ml-1">
          <span
            className="animate-loading-dot"
            style={{ animationDelay: '0s' }}
          >
            .
          </span>
          <span
            className="animate-loading-dot"
            style={{ animationDelay: '0.3s' }}
          >
            .
          </span>
          <span
            className="animate-loading-dot"
            style={{ animationDelay: '0.6s' }}
          >
            .
          </span>
        </span>
      </h1>
      <div className="px-8 py-2 bg-main rounded-[40px] flex items-center justify-center">
        <span className="text-navy text-xl font-bold font-gmarket">
          {remainingChances}/5
        </span>
      </div>

      {/* 슬롯머신 이미지와 릴 컨테이너 */}
      <div className="relative w-96 h-96 mb-6 ml-10 mt-[-1rem]">
        {/* 배경 이미지 */}
        <Image
          src="/asset/slot-machine-ver2.png"
          alt="슬롯머신"
          width={400}
          height={400}
          className="w-full h-full object-contain"
        />

        {/* 슬롯 릴들을 이미지 위에 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center right-[13%] bottom-[16%]">
          <div className="flex">
            <SlotReel
              key={`reel-0-${gameKeyRef.current}`}
              finalAmount={winAmount}
              shouldStart={isSpinning}
              reelIndex={0}
              onReelStop={handleReelStop}
            />
            <SlotReel
              key={`reel-1-${gameKeyRef.current}`}
              finalAmount={winAmount}
              shouldStart={isSpinning}
              reelIndex={1}
              onReelStop={handleReelStop}
            />
            <SlotReel
              key={`reel-2-${gameKeyRef.current}`}
              finalAmount={winAmount}
              shouldStart={isSpinning}
              reelIndex={2}
              onReelStop={handleReelStop}
            />
          </div>
        </div>
      </div>

      <style
        jsx
        global
      >{`
        @keyframes spin-vertical {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-32px);
          }
        }

        @keyframes loading-dot {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-spin-vertical {
          animation: spin-vertical 0.08s linear infinite;
        }

        .animate-loading-dot {
          animation: loading-dot 1.2s infinite ease-in-out;
          display: inline-block;
        }
      `}</style>
    </Container>
  );
}
