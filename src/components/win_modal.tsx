import type { Coupon } from '@/types/coupon';
import { ADMIN_PHONE } from '@/constants/constant';

const WinModal = ({
  coupon,
  isOpen,
  onClose,
  hasMoreChances,
}: {
  coupon: Coupon | undefined;
  isOpen: boolean;
  onClose: () => void;
  hasMoreChances: boolean;
}) => {
  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            {coupon.amount.toLocaleString()}원 쿠폰 당첨!
          </h2>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="text-sm text-slate-600">쿠폰 일련번호</div>
            <div className="font-mono font-bold text-lg text-slate-800">
              {coupon.serialNumber}
            </div>
            <div className="text-sm text-slate-600 mt-4">관리자 연락처</div>
            <div className="font-bold text-lg text-slate-800">
              {ADMIN_PHONE}
            </div>
          </div>

          {hasMoreChances ? (
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors w-full"
            >
              다시하기
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors w-full"
            >
              게임 종료
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinModal;
