import { Coupon } from '@/types/coupon';

// 쿠폰 리스트 컴포넌트
const CouponList = ({ coupons }: { coupons: Coupon[] }) => {
  if (coupons.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-md">
      <h3 className="text-lg font-bold text-white mb-4 text-center">
        획득한 쿠폰 ({coupons.length}개)
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-md"
          >
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg text-yellow-300">
                {coupon.amount.toLocaleString()}원
              </div>
              <div className="text-sm text-white/70">
                {coupon.wonAt.toLocaleTimeString()}
              </div>
            </div>
            <div className="text-xs text-white/60 mt-1 font-mono">
              {coupon.serialNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponList;
