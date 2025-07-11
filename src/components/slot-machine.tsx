'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Coupon, GameState } from '@/types/coupon';
import { generateCouponNumber } from '@/utils/coupon.utils';
import { AMOUNTS } from '@/constants/constant';
import WinModal from '@/components/win_modal';
import CouponList from '@/components/coupon-list';
import SlotReel from '@/components/slot-reel';

export default function SlotMachine() {
  // 중복 처리 방지
  const [gameState, setGameState] = useState<GameState>({
    remainingChances: 5,
    wonCoupons: [],
    isSpinning: false,
    showWinModal: false,
    currentWin: undefined,
  });

  const [winAmount, setWinAmount] = useState(1000);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const gameKeyRef = useRef(0);
  const hasProcessedWinRef = useRef(false);
  const handleSpin = () => {
    if (gameState.isSpinning || gameState.remainingChances <= 0) return;

    // 게임 키 증가로 릴 컴포넌트 리렌더링
    gameKeyRef.current += 1;
    hasProcessedWinRef.current = false; // 새 게임 시작 시 리셋

    // 무조건 당첨이므로 랜덤하게 금액 선택
    const selectedAmount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
    setWinAmount(selectedAmount);
    setStoppedReels([false, false, false]);

    setGameState((prev) => ({
      ...prev,
      isSpinning: true,
    }));
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
          hasProcessedWinRef.current = true; // 중복 처리 방지

          // 마지막 릴이 멈춘 후 1초 뒤에 결과 표시
          setTimeout(() => {
            console.log('당첨 쿠폰 생성 중...');

            const newCoupon: Coupon = {
              id: `${Date.now()}-${Math.random()}`,
              amount: winAmount,
              serialNumber: generateCouponNumber(),
              wonAt: new Date(),
            };

            setGameState((prevState) => ({
              ...prevState,
              isSpinning: false,
              remainingChances: prevState.remainingChances - 1,
              wonCoupons: [...prevState.wonCoupons, newCoupon],
              showWinModal: true,
              currentWin: newCoupon,
            }));

            console.log('쿠폰 생성 완료:', newCoupon);
          }, 1000);
        }

        return newStoppedReels;
      });
    },
    [winAmount]
  );

  const closeModal = () => {
    setGameState((prev) => ({
      ...prev,
      showWinModal: false,
      currentWin: undefined,
    }));
  };

  const resetGame = () => {
    gameKeyRef.current += 1;
    hasProcessedWinRef.current = false; // 리셋 시 플래그도 리셋
    setGameState({
      remainingChances: 5,
      wonCoupons: [],
      isSpinning: false,
      showWinModal: false,
      currentWin: undefined,
    });
    setStoppedReels([false, false, false]);
  };

  return (
    <div className=" flex flex-col items-center justify-start p-4 font-[family-name:var(--font-noto-sans)]">
      <style
        jsx
        global
      >{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
        :root {
          --font-noto-sans: 'Noto Sans KR', sans-serif;
        }

        @keyframes spin-vertical {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-40px);
          }
        }

        .animate-spin-vertical {
          animation: spin-vertical 0.08s linear infinite;
        }
      `}</style>

      {/* 남은 기회 표시 */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 mb-6 shadow-lg">
        <div className="text-center">
          <div className="text-sm text-white/70 mb-1">남은 기회</div>
          <div className="text-2xl font-bold text-yellow-300">
            {gameState.remainingChances}/5
          </div>
        </div>
      </div>

      {/* 슬롯머신 */}
      <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-2xl mb-6">
        <div className="flex gap-4 justify-center mb-6">
          <SlotReel
            key={`reel-0-${gameKeyRef.current}`}
            finalAmount={winAmount}
            shouldStart={gameState.isSpinning}
            reelIndex={0}
            onReelStop={handleReelStop}
          />
          <SlotReel
            key={`reel-1-${gameKeyRef.current}`}
            finalAmount={winAmount}
            shouldStart={gameState.isSpinning}
            reelIndex={1}
            onReelStop={handleReelStop}
          />
          <SlotReel
            key={`reel-2-${gameKeyRef.current}`}
            finalAmount={winAmount}
            shouldStart={gameState.isSpinning}
            reelIndex={2}
            onReelStop={handleReelStop}
          />
        </div>

        {/* 스핀 버튼 */}
        <button
          onClick={handleSpin}
          disabled={gameState.isSpinning || gameState.remainingChances <= 0}
          className={`w-full py-4 px-6 rounded-xl text-xl font-bold transition-all duration-200 ${
            gameState.isSpinning || gameState.remainingChances <= 0
              ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900 active:scale-95 shadow-lg hover:shadow-xl'
          }`}
        >
          {gameState.isSpinning
            ? '돌리는 중...'
            : gameState.remainingChances <= 0
            ? '게임 종료'
            : '쿠폰받기'}
        </button>
      </div>

      {/* 게임 종료 시 리셋 버튼 */}
      {gameState.remainingChances <= 0 && (
        <button
          onClick={resetGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors mb-4"
        >
          🔄 새 게임 시작
        </button>
      )}

      {/* 획득한 쿠폰 리스트 */}
      <CouponList coupons={gameState.wonCoupons} />

      {/* 당첨 모달 */}
      <WinModal
        coupon={gameState.currentWin}
        isOpen={gameState.showWinModal}
        onClose={closeModal}
        hasMoreChances={gameState.remainingChances > 0}
      />
    </div>
  );
}
