'use client';
import { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  getTodayCoupons,
  StoredCoupon,
  getRemainingChances,
} from '@/utils/coupon.utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';

export default function CouponListPage() {
  const [coupons, setCoupons] = useState<StoredCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingChances, setRemainingChances] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const loadCoupons = () => {
      const todayCoupons = getTodayCoupons();
      const chances = getRemainingChances();
      setCoupons(todayCoupons);
      setRemainingChances(chances);
      setLoading(false);
    };

    loadCoupons();
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg font-medium font-gmarket">
            쿠폰 목록을 불러오는 중...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 w-full px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-center">
          <h1 className="text-black text-3xl font-bold font-gmarket">
            오늘 뽑은 쿠폰
          </h1>
        </div>

        {/* 쿠폰 개수 표시 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
            <Gift className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium font-pretendard">
              총 {coupons.length}개의 쿠폰을 획득했습니다
            </span>
          </div>
        </div>

        {/* 쿠폰 목록 */}
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-medium font-gmarket mb-4">
              오늘 뽑은 쿠폰이 없습니다 <br />
              쿠폰 발급후 맛있는 고기를 드셔보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Link
                key={coupon.id}
                href={`/slot-machine/result?won=${coupon.amount}&serial=${coupon.serialNumber}`}
              >
                <div className="bg-white border-2 rounded-lg p-4 border-yellow-400 hover:shadow-md transition-all duration-200 active:scale-95">
                  <div className="flex items-center justify-between">
                    {/* 쿠폰 이미지 */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={`/asset/${coupon.amount}won.png`}
                          alt={`${coupon.amount}원 쿠폰`}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      </div>

                      {/* 쿠폰 정보 */}
                      <div className="flex-1">
                        <h3 className="text-black text-xl font-bold font-gmarket mb-1">
                          {coupon.amount.toLocaleString()}원 쿠폰
                        </h3>
                        <p className="text-gray-600 text-sm font-pretendard mb-1">
                          {coupon.serialNumber}
                        </p>
                        <p className="text-gray-400 text-xs font-pretendard">
                          {formatTime(coupon.wonAt)} 획득
                        </p>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="text-gray-400">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 하단 버튼들 */}
        <div className="flex flex-col gap-1 pt-4">
          {remainingChances > 0 && coupons.length < 5 ? (
            <Link href="/slot-machine">
              <Button variant="yellow">
                쿠폰 추가 발급하기 ({remainingChances}번 남음)
              </Button>
            </Link>
          ) : (
            <Button
              variant="disabled"
              disabled
            >
              내일 다시 도전해보세요!
            </Button>
          )}
          <Button
            variant="black"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            이전 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </Container>
  );
}
