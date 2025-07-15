'use client';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Container 제거 - admin layout에서 전체 화면 사용
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ArrowLeft, Trash2, Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  amount: number;
  serialNumber: string;
  createdAt: string;
  expiresAt: string;
  isUsed?: boolean;
}

// debounce 커스텀 훅
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CouponTable() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 통계 데이터를 위한 별도 state
  const [stats, setStats] = useState({
    totalCoupons: 0,
    usedCoupons: 0,
    unusedCoupons: 0,
    totalAmount: 0,
    usedAmount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // 300ms debounce 적용
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 로그인 상태 확인 함수
  const checkAuthStatus = () => {
    try {
      const adminLogin = sessionStorage.getItem('adminLogin');
      if (!adminLogin) {
        return false;
      }

      const loginData = JSON.parse(adminLogin);
      const currentTime = new Date().getTime();

      // 세션 만료 확인
      if (currentTime > loginData.expiryTime) {
        sessionStorage.removeItem('adminLogin');
        return false;
      }

      return loginData.isLoggedIn;
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      return false;
    }
  };

  // 로그아웃 함수
  const handleLogout = () => {
    sessionStorage.removeItem('adminLogin');
    router.push('/admin');
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    const isAuth = checkAuthStatus();
    if (!isAuth) {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // 주기적으로 세션 상태 확인 (30초마다)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const isAuth = checkAuthStatus();
      if (!isAuth) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/admin');
      }
    }, 30000); // 30초마다 확인

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  // 쿠폰 데이터 가져오기
  const fetchCoupons = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setCoupons(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('쿠폰 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('쿠폰 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 통계 데이터 가져오기
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/coupons/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.error('통계 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('통계 조회 중 오류:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    if (!isAuthenticated) return; // 인증되지 않으면 데이터 가져오지 않음

    fetchCoupons(currentPage);
    // 첫 페이지 로드시에만 통계 가져오기
    if (currentPage === 1) {
      fetchStats();
    }
  }, [currentPage, isAuthenticated]);

  // 초기 로드시 통계 가져오기
  useEffect(() => {
    if (!isAuthenticated) return; // 인증되지 않으면 데이터 가져오지 않음
    fetchStats();
  }, [isAuthenticated]);

  // 검색 필터링 (debounced search term 사용)
  const filteredCoupons = useMemo(() => {
    if (!debouncedSearchTerm) return coupons;

    return coupons.filter(
      (coupon) =>
        coupon.serialNumber
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        coupon.amount.toString().includes(debouncedSearchTerm)
    );
  }, [coupons, debouncedSearchTerm]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

  // 쿠폰 삭제
  const handleDeleteCoupon = async (id: string, serialNumber: string) => {
    if (!confirm(`쿠폰 ${serialNumber}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('쿠폰이 성공적으로 삭제되었습니다.');
        // 현재 페이지 새로고침 및 통계 업데이트
        fetchCoupons(currentPage);
        fetchStats();
      } else {
        alert(`삭제 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('쿠폰 삭제 중 오류:', error);
      alert('쿠폰 삭제 중 오류가 발생했습니다.');
    }
  };

  // 쿠폰 사용 상태 토글
  const handleToggleUsedStatus = async (
    id: string,
    currentStatus: boolean,
    serialNumber: string
  ) => {
    const newStatus = !currentStatus;
    const confirmMessage = newStatus
      ? `쿠폰 ${serialNumber}을(를) 사용 완료로 표시하시겠습니까?`
      : `쿠폰 ${serialNumber}을(를) 미사용으로 변경하시겠습니까?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isUsed: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // 현재 페이지 새로고침 및 통계 업데이트
        fetchCoupons(currentPage);
        fetchStats();
      } else {
        alert(`상태 변경 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('쿠폰 상태 변경 중 오류:', error);
      alert('쿠폰 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 전체 쿠폰 삭제
  // const handleDeleteAllCoupons = async () => {
  //   const totalCoupons = stats.totalCoupons; // 실제 전체 쿠폰 수 사용

  //   if (totalCoupons === 0) {
  //     alert('삭제할 쿠폰이 없습니다.');
  //     return;
  //   }

  //   const confirmMessage = `정말로 모든 쿠폰(${totalCoupons}개)을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;

  //   if (!confirm(confirmMessage)) {
  //     return;
  //   }

  //   // 한번 더 확인
  //   if (
  //     !confirm(
  //       '⚠️ 최종 확인: 모든 쿠폰 데이터가 영구히 삭제됩니다. 계속하시겠습니까?'
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch('/api/coupons?all=true', {
  //       method: 'DELETE',
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       alert(data.message);
  //       // 첫 페이지로 이동하고 데이터 및 통계 새로고침
  //       setCurrentPage(1);
  //       fetchCoupons(1);
  //       fetchStats(); // 통계도 새로고침
  //     } else {
  //       alert(`전체 삭제 실패: ${data.message}`);
  //     }
  //   } catch (error) {
  //     console.error('전체 쿠폰 삭제 중 오류:', error);
  //     alert('전체 쿠폰 삭제 중 오류가 발생했습니다.');
  //   }
  // };

  // 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 border-none w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-black font-pretendard">
                쿠폰 관리
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              로그아웃
            </Button>
          </div>

          {/* 검색창 */}
          <div className="flex items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="시리얼번호 또는 금액으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllCoupons}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 flex-shrink-0"
              title="모든 쿠폰 삭제"
            >
              <Trash2 className="w-4 h-4" />
              <span className="ml-1 text-xs">전체삭제</span>
            </Button> */}
          </div>

          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 font-pretendard">전체 쿠폰</p>
              <p className="text-xl font-bold text-black font-gmarket">
                {stats.totalCoupons}개
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 font-pretendard">사용 완료</p>
              <p className="text-xl font-bold text-green-600 font-gmarket">
                {stats.usedCoupons}개
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 font-pretendard">미사용</p>
              <p className="text-xl font-bold text-blue-600 font-gmarket">
                {stats.unusedCoupons}개
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 font-pretendard">
                총 발급 금액
              </p>
              <p className="text-xl font-bold text-black font-gmarket">
                {stats.totalAmount.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-white rounded-lg border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 font-pretendard">
                  데이터를 불러오는 중...
                </p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 font-pretendard">
                  {searchTerm ? '검색 결과가 없습니다.' : '쿠폰이 없습니다.'}
                </p>
              </div>
            ) : (
              <>
                {/* 데스크톱 테이블 */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-gmarket">쿠폰번호</TableHead>
                        <TableHead className="font-gmarket">금액</TableHead>
                        <TableHead className="font-gmarket">발급일</TableHead>
                        <TableHead className="font-gmarket">만료일</TableHead>
                        <TableHead className="font-gmarket w-20">
                          사용상태
                        </TableHead>
                        <TableHead className="font-gmarket w-20">
                          삭제
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.map((coupon) => (
                        <TableRow
                          key={coupon.id}
                          className={coupon.isUsed ? 'bg-gray-100' : ''}
                        >
                          <TableCell
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-500' : ''
                            }`}
                          >
                            {coupon.serialNumber}
                          </TableCell>
                          <TableCell
                            className={`font-bold font-gmarket ${
                              coupon.isUsed ? 'text-gray-500' : 'text-blue-600'
                            }`}
                          >
                            {formatAmount(coupon.amount)}
                          </TableCell>
                          <TableCell
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {formatDate(coupon.createdAt)}
                          </TableCell>
                          <TableCell
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {formatDate(coupon.expiresAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={coupon.isUsed ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleToggleUsedStatus(
                                  coupon.id,
                                  coupon.isUsed || false,
                                  coupon.serialNumber
                                )
                              }
                              className={
                                coupon.isUsed
                                  ? 'text-white bg-green-600 hover:bg-green-700'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteCoupon(
                                  coupon.id,
                                  coupon.serialNumber
                                )
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 모바일 카드 레이아웃 */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`border rounded-lg p-4 space-y-2 ${
                        coupon.isUsed ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-pretendard ${
                              coupon.isUsed ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            쿠폰번호
                          </p>
                          <p
                            className={`text-sm font-pretendard ${
                              coupon.isUsed ? 'text-gray-500' : ''
                            }`}
                          >
                            {coupon.serialNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold font-gmarket ${
                                coupon.isUsed
                                  ? 'text-gray-500'
                                  : 'text-blue-600'
                              }`}
                            >
                              {formatAmount(coupon.amount)}
                            </p>
                          </div>
                          <Button
                            variant={coupon.isUsed ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              handleToggleUsedStatus(
                                coupon.id,
                                coupon.isUsed || false,
                                coupon.serialNumber
                              )
                            }
                            className={`flex-shrink-0 ${
                              coupon.isUsed
                                ? 'text-white bg-green-600 hover:bg-green-700'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteCoupon(coupon.id, coupon.serialNumber)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            발급일
                          </p>
                          <p
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-500' : ''
                            }`}
                          >
                            {formatDate(coupon.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            만료일
                          </p>
                          <p
                            className={`font-pretendard ${
                              coupon.isUsed ? 'text-gray-500' : ''
                            }`}
                          >
                            {formatDate(coupon.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 flex-wrap">
              {/* 이전 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="mr-2"
              >
                이전
              </Button>

              {/* 페이지 번호들 */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxVisiblePages / 2)
                );
                let endPage = Math.min(
                  totalPages,
                  startPage + maxVisiblePages - 1
                );

                // 끝 페이지가 조정되었으면 시작 페이지도 조정
                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // 첫 페이지 추가 (필요한 경우)
                if (startPage > 1) {
                  pages.push(
                    <Button
                      key={1}
                      variant={1 === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span
                        key="dots1"
                        className="px-2 text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                }

                // 중간 페이지들
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Button>
                  );
                }

                // 마지막 페이지 추가 (필요한 경우)
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span
                        key="dots2"
                        className="px-2 text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <Button
                      key={totalPages}
                      variant={
                        totalPages === currentPage ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pages;
              })()}

              {/* 다음 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-2"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
