'use client';

export default function CouponDisclaimer() {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col gap-4">
        {/* 사용방법 */}
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-gray-700 text-sm font-semibold font-pretendard">
            📋 사용방법
          </h3>
          <p className="text-gray-600 text-xs font-pretendard leading-relaxed">
            1. 이 화면을 캡처해서 저장하세요 <br />
            2. 아래 "쿠폰사용하기" 버튼을 눌러주세요 <br />
            3. 담당자에게 전화를 걸어 쿠폰 번호를 알려주세요
          </p>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-300"></div>

        {/* 주의사항 */}
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-gray-700 text-sm font-semibold font-pretendard">
            ⚠️ 주의사항
          </h3>
          <div className="flex flex-col gap-1">
            <p className="text-gray-600 text-xs font-pretendard">
              • 쿠폰은 유효기간 내에 사용해야 합니다.
            </p>
            <p className="text-gray-600 text-xs font-pretendard">
              • 사용된 쿠폰은 만료되며 재사용 불가능 합니다.
            </p>
            <p className="text-red-500 text-xs font-pretendard">
              • 일부 품목은 쿠폰 사용이 불가능할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
