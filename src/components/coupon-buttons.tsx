'use client';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { getRemainingChances, getTodayCoupons } from '@/utils/coupon.utils';

export default function DirectCouponListButton() {
  const [remainingChances, setRemainingChances] = useState<number>(5);
  const [todayCouponsCount, setTodayCouponsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const chances = getRemainingChances();
      const coupons = getTodayCoupons();
      setRemainingChances(chances);
      setTodayCouponsCount(coupons.length);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <>
      {todayCouponsCount !== 5 ? (
        <Link
          href="/slot-machine"
          className="w-full"
        >
          <Button
            variant="black"
            className="w-full"
          >
            쿠폰 받으러 가기
          </Button>
        </Link>
      ) : (
        <>
          <Button
            variant="disabled"
            disabled
            className="w-full"
          >
            쿠폰 받으러 가기
          </Button>
          <Link
            href="/coupon-list"
            className="w-full"
          >
            <Button
              variant="black"
              className="w-full"
            >
              오늘 뽑은 쿠폰 확인하기 ({todayCouponsCount}개)
            </Button>
          </Link>
        </>
      )}
    </>
  );
}
