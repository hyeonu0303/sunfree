import { ADMIN_PHONE } from '@/constants/constant';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 shadow-lg mt-auto">
      <div className="max-w-md mx-auto px-6 py-6">
        {/* 메인 컨텐츠 */}
        <div className="space-y-4">
          {/* 로고 */}
          <div className="text-center">
            <Link
              href="/admin"
              className="hover:cursor-default"
            >
              <h2 className="text-2xl font-bold text-gray-800 font-dancing mb-2">
                SunFree
              </h2>
            </Link>
            <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto"></div>
          </div>

          {/* 회사 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-1 gap-2 text-center">
              <p className="text-xs text-gray-600 font-pretendard">
                <span className="font-semibold text-gray-800">대표자</span>{' '}
                김민호
              </p>
              <p className="text-xs text-gray-600 font-pretendard">
                <span className="font-semibold text-gray-800">업체명</span>{' '}
                썬프리트레이드
              </p>
              <p className="text-xs text-gray-600 font-pretendard leading-relaxed">
                <span className="font-semibold text-gray-800">주소</span>{' '}
                인천광역시 서구 새오개로 48번길 11
              </p>
            </div>
          </div>

          {/* 연락처 */}
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-2 text-center">
              <p className="text-xs text-gray-600 font-pretendard">
                <span className="font-semibold text-gray-800">핸드폰</span>
                <a
                  href={`tel:${ADMIN_PHONE}`}
                  className="ml-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  {ADMIN_PHONE}
                </a>
              </p>
              <p className="text-xs text-gray-600 font-pretendard">
                <span className="font-semibold text-gray-800">전화번호</span>
                <a
                  href="tel:032-577-0327"
                  className="ml-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  032-577-0327
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 하단 구분선과 저작권 */}
        <div className="border-t border-gray-200 mt-6 pt-4">
          <p className="text-xs text-gray-400 font-pretendard text-center">
            © 2024 썬프리트레이드. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
