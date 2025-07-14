import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

export default function Coupon() {
  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 w-full">
      {/* 상단 배지 */}
      <div className="w-48 sm:w-52 h-13 sm:h-14 md:h-14 bg-main rounded-[40px] flex items-center justify-center mb-6 sm:mb-4 md:mb-6">
        <span className="text-white text-xl sm:text-xl md:text-2xl font-bold font-gmarket">
          썬프리 고객 혜택
        </span>
      </div>

      {/* 메인 제목 */}
      <div className="text-center mb-0 sm:mb-1.5 md:mb-2">
        <h1 className="text-zinc-800 text-4xl sm:text-4xl md:text-4xl font-bold font-gmarket tracking-[-0.02em]">
          축산물 할인 쿠폰
        </h1>
      </div>

      {/* 서브 제목 */}
      <div className="text-center mb-4 sm:mb-2.5 md:mb-3">
        <h2 className="text-main text-4xl sm:text-4xl md:text-4xl font-bold font-gmarket tracking-[-0.02em]">
          매일 당첨!
        </h2>
      </div>

      <div className="text-center mb-3 sm:mb-4 md:mb-5 px-2">
        <h3 className="text-black text-base font-medium font-gmarket">
          매일 할인도 받고~ 맛있는 고기도 먹고~
        </h3>
      </div>

      {/* 쿠폰 이미지 */}
      <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
        <Image
          src="/asset/mainpage-ticket.png"
          alt="쿠폰 이미지"
          width={322}
          height={322}
          className="w-64 h-64 max-w-full object-contain"
        />
      </div>
      <Link href="/slot-machine">
        <Button
          variant={'black'}
          className="text-white text-lg font-medium font-gmarket"
        >
          쿠폰 받으러 가기
        </Button>
      </Link>

      <p className="text-gray-300 text-xs sm:text-sm md:text-base font-medium font-gmarket">
        • 쿠폰 발급 가능 횟수는 5회 입니다.
      </p>
    </div>
  );
}
