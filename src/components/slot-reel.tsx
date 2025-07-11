'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AMOUNTS } from '@/constants/constant';

const SlotReel = ({
  finalAmount,
  shouldStart,
  reelIndex,
  onReelStop,
}: {
  finalAmount: number;
  shouldStart: boolean;
  reelIndex: number;
  onReelStop: (reelIndex: number) => void;
}) => {
  const [displayAmounts, setDisplayAmounts] = useState([1000, 2000, 3000]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // 스핀 시작 함수
  const startSpin = useCallback(() => {
    if (isRunningRef.current) {
      console.log(`릴 ${reelIndex}: 이미 실행중이므로 건너뜀`);
      return;
    }

    isRunningRef.current = true;
    console.log(`릴 ${reelIndex}: 스핀 시작 준비`);

    // 릴별 시작 지연 시간
    const startDelay = reelIndex * 400; // 0ms, 400ms, 800ms

    // 릴별 스핀 지속 시간
    const spinDuration = 1500 + reelIndex * 500; // 1.5초, 2초, 2.5초

    console.log(
      `릴 ${reelIndex}: startDelay=${startDelay}ms, spinDuration=${spinDuration}ms`
    );

    startTimeoutRef.current = setTimeout(() => {
      console.log(`릴 ${reelIndex}: 스핀 시작!`);
      setIsSpinning(true);

      // 스핀 애니메이션
      intervalRef.current = setInterval(() => {
        const shuffledAmounts = [...AMOUNTS].sort(() => Math.random() - 0.5);
        setDisplayAmounts([
          shuffledAmounts[0],
          shuffledAmounts[1],
          shuffledAmounts[2],
        ]);
      }, 120);

      // 릴 정지
      stopTimeoutRef.current = setTimeout(() => {
        console.log(`릴 ${reelIndex}: 정지 시작!`);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setIsSpinning(false);
        setIsStopped(true);

        // 최종 결과 설정
        setDisplayAmounts([
          AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
          finalAmount, // 가운데가 당첨 금액
          AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
        ]);

        console.log(`릴 ${reelIndex}: 정지 완료! 최종 금액=${finalAmount}`);

        // 상위 컴포넌트에 정지 알림
        onReelStop(reelIndex);
      }, spinDuration);
    }, startDelay);
  }, [reelIndex, finalAmount, onReelStop]);

  // 스핀 정지 및 리셋 함수
  const resetReel = useCallback(() => {
    console.log(`릴 ${reelIndex}: 리셋`);

    isRunningRef.current = false;
    setIsSpinning(false);
    setIsStopped(false);
    setDisplayAmounts([1000, 2000, 3000]);

    // 모든 타이머 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  }, [reelIndex]);

  // shouldStart 변화 감지
  useEffect(() => {
    console.log(
      `릴 ${reelIndex}: shouldStart=${shouldStart}, isRunning=${isRunningRef.current}`
    );

    if (!shouldStart) {
      resetReel();
    } else if (shouldStart && !isRunningRef.current) {
      startSpin();
    }
  }, [shouldStart, startSpin, resetReel, reelIndex]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      resetReel();
    };
  }, [resetReel]);

  return (
    <div className="bg-white border-4 border-yellow-400 rounded-xl w-24 h-32 flex flex-col items-center justify-center shadow-lg overflow-hidden relative">
      {/* 디버깅 정보 */}
      <div className="absolute -top-6 left-0 text-xs text-white">
        {isSpinning ? '🔄' : isStopped ? '⏹️' : '⏸️'}
      </div>

      {/* 세로로 3개 숫자 표시 */}
      <div
        className={`flex flex-col items-center transition-transform duration-100 ${
          isSpinning ? 'animate-spin-vertical' : ''
        }`}
      >
        {displayAmounts.map((amount, index) => (
          <div
            key={`${reelIndex}-${index}-${amount}`}
            className={`text-lg font-bold h-10 flex items-center transition-all duration-200 ${
              index === 1
                ? isStopped
                  ? 'text-blue-600 scale-125'
                  : 'text-slate-800'
                : 'text-slate-400 text-sm'
            }`}
          >
            {amount.toLocaleString()}원
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotReel;
